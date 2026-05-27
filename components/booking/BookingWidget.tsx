'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import type { Service, Staff } from '@/lib/types'
import { useTranslation } from '@/contexts/LanguageContext'
import {
  format, parseISO, getMonth, getYear, getDaysInMonth,
  startOfMonth, getDay, isSameDay, addMonths, subMonths,
  isBefore, startOfDay,
} from 'date-fns'
import { hy as hyLocale, ru as ruLocale, enUS } from 'date-fns/locale'

type Step = 1 | 2 | 3 | 4 | 5 | 6

interface BookingState {
  service:  Service | null
  staff:    Staff   | null
  date:     Date    | null
  slot:     string  | null
  name:     string
  phone:    string
  email:    string
  notes:    string
}

const INITIAL: BookingState = {
  service: null, staff: null, date: null, slot: null,
  name: '', phone: '', email: '', notes: '',
}

const S = {
  btn:        'inline-flex items-center justify-center gap-2 px-7 py-3 rounded-md font-semibold text-[15px] cursor-pointer transition-all duration-200 border-2 min-h-[48px]',
  btnPrimary: 'bg-[#C9A96E] text-white border-[#C9A96E] hover:bg-[#a8854e] hover:-translate-y-0.5',
  btnOutline: 'border-[#e2e0da] text-[#1B3A4B] hover:border-[#C9A96E] hover:text-[#C9A96E]',
  input:      'w-full px-3 py-3 rounded-lg border border-[#e2e0da] bg-[#FAFAF7] text-[#1A1A1A] text-[15px] outline-none transition-all focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/20 font-[inherit]',
  label:      'block text-[13px] font-semibold text-[#1A1A1A] mb-1.5',
}

export default function BookingWidget() {
  const { t, lang } = useTranslation()
  const b = t.booking
  const dateLocale = lang === 'hy' ? hyLocale : lang === 'ru' ? ruLocale : enUS

  const [step,      setStep]      = useState<Step>(1)
  const [dir,       setDir]       = useState<'fwd' | 'back'>('fwd')
  const [state,     setState]     = useState<BookingState>(INITIAL)
  const [services,  setServices]  = useState<Service[]>([])
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [slots,     setSlots]     = useState<string[]>([])
  const [busySlots, setBusySlots] = useState<string[]>([])
  const [availDays, setAvailDays] = useState<number[]>([])
  const [calMonth,  setCalMonth]  = useState<Date>(new Date())
  const [loading,   setLoading]   = useState(false)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [errors,    setErrors]    = useState<Record<string, string>>({})

  const supabase = createClient()

  useEffect(() => {
    supabase.from('services').select('*').order('price').then(({ data }) => {
      if (data) setServices(data)
    })
  }, [])

  useEffect(() => {
    if (!state.service) return
    supabase
      .from('staff_services')
      .select('staff_id, staff!inner(id, name, photo_url, email, bio, created_at)')
      .eq('service_id', state.service.id)
      .then(({ data }) => {
        if (data) setStaffList(data.map((row: any) => row.staff))
      })
  }, [state.service])

  const loadAvailDays = useCallback(async () => {
    if (!state.staff || !state.service) return
    setLoading(true)
    try {
      const res = await fetch(
        `/api/bookable-days?staffId=${state.staff.id}&serviceId=${state.service.id}&year=${getYear(calMonth)}&month=${getMonth(calMonth) + 1}`
      )
      const data = await res.json()
      setAvailDays(data.availableDays || [])
    } finally {
      setLoading(false)
    }
  }, [state.staff, state.service, calMonth])

  useEffect(() => {
    if (step === 3) loadAvailDays()
  }, [step, loadAvailDays])

  useEffect(() => {
    if (!state.date || !state.staff || !state.service) return
    setLoading(true)
    const dateStr = format(state.date, 'yyyy-MM-dd')
    fetch(`/api/available-slots?staffId=${state.staff.id}&serviceId=${state.service.id}&date=${dateStr}`)
      .then(r => r.json())
      .then(d => { setSlots(d.slots || []); setBusySlots(d.busySlots || []) })
      .finally(() => setLoading(false))
  }, [state.date])

  function pick<K extends keyof BookingState>(key: K, value: BookingState[K]) {
    setState(s => ({ ...s, [key]: value }))
  }

  function goNext(s: Step) { setDir('fwd'); setErrors({}); setStep(s) }
  function goBack(s: Step) { setDir('back'); setStep(s) }

  async function submitBooking() {
    const newErrors: Record<string, string> = {}
    if (!state.name.trim())  newErrors.name  = b.errName
    if (!state.phone.trim()) newErrors.phone = b.errPhone
    if (!state.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) newErrors.email = b.errEmail
    setErrors(newErrors)
    if (Object.keys(newErrors).length) return

    setLoading(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId:       state.staff!.id,
          serviceId:     state.service!.id,
          startTime:     state.slot,
          customerName:  state.name,
          customerPhone: state.phone,
          customerEmail: state.email,
          notes:         state.notes || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setErrors({ submit: data.error || b.errSubmit }); return }
      setBookingId(data.booking.id)
      setDir('fwd')
      setStep(6)
    } catch {
      setErrors({ submit: b.errSubmit })
    } finally {
      setLoading(false)
    }
  }

  const fillPct = step < 6 ? ((step - 1) / 4) * 100 : 100

  return (
    <div className="booking-widget">

      {/* ── Progress stepper ────────────────────── */}
      {step < 6 && (
        <div className="booking-stepper">
          <div className="booking-stepper-bar">
            <div className="booking-stepper-bar-fill" style={{ width: `${fillPct}%` }} />
          </div>
          <div className="booking-stepper-dots">
            {([1, 2, 3, 4, 5] as Step[]).map(s => (
              <div key={s} className={`booking-stepper-dot${step > s ? ' done' : step === s ? ' active' : ''}`}>
                <div className="booking-stepper-dot-circle">
                  {step > s ? (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : s}
                </div>
                <span className="booking-stepper-dot-label">{b.progressLabels[s - 1]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Selection chips ──────────────────────── */}
      {step > 1 && step < 6 && (
        <div className="booking-chips">
          {state.service && (
            <span className="booking-chip">
              {b.svcNameMap[state.service.name] ?? state.service.name}
            </span>
          )}
          {state.staff && <span className="booking-chip">{state.staff.name}</span>}
          {state.date  && <span className="booking-chip">{format(state.date, 'd MMM', { locale: dateLocale })}</span>}
          {state.slot  && <span className="booking-chip">{format(parseISO(state.slot), 'HH:mm')}</span>}
        </div>
      )}

      {/* ── Animated step wrapper ────────────────── */}
      <div key={step} className={`booking-step booking-step--${dir}`}>

        {/* Step 1 — Service selection */}
        {step === 1 && (
          <div>
            <h2 className="booking-step-heading">{b.step1Heading}</h2>
            <p className="booking-step-sub">{b.step1Sub}</p>
            {services.length === 0 && <p className="booking-loading">{b.loading}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {services.map(svc => (
                <button
                  key={svc.id}
                  className={`booking-svc-card${state.service?.id === svc.id ? ' selected' : ''}`}
                  onClick={() => { pick('service', svc); goNext(2) }}
                >
                  <div className="booking-svc-card-top">
                    <div className="booking-svc-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2C8.5 2 6 5 6 8.5c0 1.7.5 3.5 1.4 5.3L9.5 21h5l2.1-7.2c.9-1.8 1.4-3.6 1.4-5.3C18 5 15.5 2 12 2z"/>
                      </svg>
                    </div>
                    <span className="booking-svc-duration">{svc.duration_minutes} {b.minLabel}</span>
                  </div>
                  <h3 className="booking-svc-name">{b.svcNameMap[svc.name] ?? svc.name}</h3>
                  <p className="booking-svc-desc">{b.svcDescMap[svc.name] ?? svc.description ?? ''}</p>
                  <div className="booking-svc-price">{svc.price.toLocaleString()} AMD</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 — Doctor selection */}
        {step === 2 && (
          <div>
            <h2 className="booking-step-heading">{b.step2Heading}</h2>
            <p className="booking-step-sub">{b.step2Sub}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {staffList.map(s => (
                <button
                  key={s.id}
                  className={`booking-staff-card${state.staff?.id === s.id ? ' selected' : ''}`}
                  onClick={() => { pick('staff', s); goNext(3) }}
                >
                  <div className="booking-staff-avatar">
                    {s.photo_url ? (
                      <img src={s.photo_url} alt={s.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{s.name.split(' ').map(w => w[0]).slice(0, 2).join('')}</span>
                    )}
                  </div>
                  <h3 className="text-[16px] font-bold text-[#1B3A4B]">{s.name}</h3>
                </button>
              ))}
            </div>
            <button className={`${S.btn} ${S.btnOutline}`} onClick={() => goBack(1)}>{b.back}</button>
          </div>
        )}

        {/* Step 3 — Calendar */}
        {step === 3 && (
          <div>
            <h2 className="booking-step-heading">{b.step3Heading}</h2>
            <p className="booking-step-sub">{b.step3Sub}</p>
            <div className="booking-calendar">
              <div className="booking-calendar-nav">
                <button
                  className="booking-cal-nav-btn"
                  onClick={() => setCalMonth(m => subMonths(m, 1))}
                  disabled={isBefore(startOfMonth(subMonths(calMonth, 1)), startOfMonth(new Date()))}
                >‹</button>
                <span className="booking-cal-month">
                  {format(calMonth, 'MMMM yyyy', { locale: dateLocale })}
                </span>
                <button
                  className="booking-cal-nav-btn"
                  onClick={() => setCalMonth(m => addMonths(m, 1))}
                >›</button>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {b.dayNames.map((d, i) => (
                  <div key={i} className="text-center text-[11px] font-bold text-[#5a6475] py-1">{d}</div>
                ))}
              </div>
              {loading ? (
                <div className="booking-loading">{b.loading}</div>
              ) : (
                <CalendarGrid
                  month={calMonth}
                  availDays={availDays}
                  selected={state.date}
                  onSelect={date => { pick('date', date); pick('slot', null); goNext(4) }}
                />
              )}
            </div>
            <button className={`${S.btn} ${S.btnOutline}`} onClick={() => goBack(2)}>{b.back}</button>
          </div>
        )}

        {/* Step 4 — Time slots */}
        {step === 4 && state.date && (
          <div>
            <h2 className="booking-step-heading">{b.step4Heading}</h2>
            <p className="booking-step-sub">
              {format(state.date, 'EEEE, d MMMM yyyy', { locale: dateLocale })}
              {' — '}
              {b.svcNameMap[state.service?.name ?? ''] ?? state.service?.name}
            </p>
            {loading ? (
              <div className="booking-loading">{b.loading}</div>
            ) : slots.length === 0 && busySlots.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[#5a6475] mb-4">{b.noSlots}</p>
                <button className={`${S.btn} ${S.btnOutline}`} onClick={() => goBack(3)}>{b.pickOther}</button>
              </div>
            ) : (
              <>
                {slots.length === 0 && busySlots.length > 0 && (
                  <p className="text-[#5a6475] text-sm mb-4">{b.noSlots}</p>
                )}
                <div className="booking-slots">
                  {[...slots, ...busySlots]
                    .sort((a, bSlot) => a.localeCompare(bSlot))
                    .map(slot => {
                      const isBusy = busySlots.includes(slot)
                      const isSel  = state.slot === slot
                      return (
                        <button
                          key={slot}
                          onClick={() => !isBusy && (pick('slot', slot), goNext(5))}
                          disabled={isBusy}
                          className={`booking-slot${isBusy ? ' busy' : isSel ? ' selected' : ''}`}
                        >
                          {format(parseISO(slot), 'HH:mm')}
                          {isBusy && <span className="booking-slot-lock">🔒</span>}
                        </button>
                      )
                    })}
                </div>
                <button className={`${S.btn} ${S.btnOutline}`} onClick={() => goBack(3)}>{b.back}</button>
              </>
            )}
          </div>
        )}

        {/* Step 5 — Contact details */}
        {step === 5 && (
          <div>
            <h2 className="booking-step-heading">{b.step5Heading}</h2>
            <p className="booking-step-sub">
              {b.svcNameMap[state.service?.name ?? ''] ?? state.service?.name}
              {' · '}{state.staff?.name}
              {' · '}{state.date && format(state.date, 'd MMM', { locale: dateLocale })}
              {' · '}{state.slot && format(parseISO(state.slot), 'HH:mm')}
            </p>
            <div className="space-y-4 mb-6">
              <div>
                <label className={S.label}>{b.formName}</label>
                <input className={S.input} type="text" autoComplete="name"
                  value={state.name} onChange={e => pick('name', e.target.value)}
                  style={errors.name ? { borderColor: '#e05555' } : {}} />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className={S.label}>{b.formPhone}</label>
                <input className={S.input} type="tel" autoComplete="tel"
                  value={state.phone} onChange={e => pick('phone', e.target.value)}
                  style={errors.phone ? { borderColor: '#e05555' } : {}} />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className={S.label}>{b.formEmail}</label>
                <input className={S.input} type="email" autoComplete="email"
                  value={state.email} onChange={e => pick('email', e.target.value)}
                  style={errors.email ? { borderColor: '#e05555' } : {}} />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className={S.label}>{b.formNotes}</label>
                <textarea className={`${S.input} resize-y min-h-[80px]`}
                  value={state.notes} onChange={e => pick('notes', e.target.value)} />
              </div>
            </div>
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
                {errors.submit}
              </div>
            )}
            <div className="flex gap-3">
              <button className={`${S.btn} ${S.btnOutline}`} onClick={() => goBack(4)}>{b.back}</button>
              <button className={`${S.btn} ${S.btnPrimary} flex-1`} onClick={submitBooking} disabled={loading}>
                {loading ? b.loading : b.submitBtn}
              </button>
            </div>
          </div>
        )}

        {/* Step 6 — Success */}
        {step === 6 && (
          <div className="booking-success">
            <div className="booking-success-icon">
              <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle className="booking-success-circle" cx="26" cy="26" r="25" stroke="#C9A96E" strokeWidth="2"/>
                <polyline className="booking-success-check" points="14,27 22,35 38,18" stroke="#C9A96E" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="booking-success-title">{b.successTitle}</h2>
            <p className="booking-success-sub">{b.successSub}</p>
            <div className="booking-summary-card">
              {[
                ...(bookingId ? [[b.summaryRef, `#${bookingId.slice(0, 8).toUpperCase()}`]] : []),
                [b.summaryService, b.svcNameMap[state.service?.name ?? ''] ?? state.service?.name],
                [b.summaryDoctor,  state.staff?.name],
                [b.summaryDate,    state.date ? format(state.date, 'd MMMM yyyy', { locale: dateLocale }) : ''],
                [b.summaryTime,    state.slot ? format(parseISO(state.slot), 'HH:mm') : ''],
                [b.summaryEmail,   state.email],
              ].map(([label, value]) => (
                <div key={label} className="booking-summary-row">
                  <span className="booking-summary-label">{label}</span>
                  <span className="booking-summary-value">{value}</span>
                </div>
              ))}
            </div>
            <button
              className={`${S.btn} ${S.btnOutline}`}
              onClick={() => { setState(INITIAL); setDir('fwd'); setStep(1); setBookingId(null) }}
            >
              {b.bookAnother}
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

function CalendarGrid({
  month, availDays, selected, onSelect,
}: {
  month: Date
  availDays: number[]
  selected: Date | null
  onSelect: (d: Date) => void
}) {
  const year     = getYear(month)
  const monthIdx = getMonth(month)
  const total    = getDaysInMonth(month)
  const firstDow = getDay(startOfMonth(month))
  const today    = new Date()

  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: total }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className="grid grid-cols-7 gap-1">
      {cells.map((day, i) => {
        if (!day) return <div key={i} />
        const date    = new Date(year, monthIdx, day)
        const isPast  = isBefore(startOfDay(date), startOfDay(today))
        const isAvail = availDays.includes(day)
        const isSel   = selected ? isSameDay(date, selected) : false
        const isToday = isSameDay(date, today)

        return (
          <button
            key={i}
            onClick={() => isAvail && onSelect(date)}
            disabled={isPast || !isAvail}
            className={`booking-cal-day${isSel ? ' selected' : isPast || !isAvail ? ' disabled' : isToday ? ' today' : ' avail'}`}
          >
            {day}
          </button>
        )
      })}
    </div>
  )
}
