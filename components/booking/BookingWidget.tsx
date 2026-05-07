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
  card:         'bg-white rounded-[12px] border border-[#e2e0da] p-6 cursor-pointer transition-all duration-200 hover:border-[#C9A96E] hover:shadow-md flex flex-col gap-3',
  cardSelected: 'bg-white rounded-[12px] border-2 border-[#C9A96E] p-6 cursor-pointer transition-all duration-200 shadow-md flex flex-col gap-3',
  btn:          'inline-flex items-center justify-center gap-2 px-7 py-3 rounded-md font-semibold text-[15px] cursor-pointer transition-all duration-200 border-2 border-transparent min-h-[48px]',
  btnPrimary:   'bg-[#C9A96E] text-white hover:bg-[#a8854e] hover:-translate-y-0.5',
  btnOutline:   'border-[#e2e0da] text-[#1B3A4B] hover:border-[#C9A96E] hover:text-[#C9A96E]',
  input:        'w-full px-3 py-3 rounded-lg border border-[#e2e0da] bg-[#FAFAF7] text-[#1A1A1A] text-[15px] outline-none transition-all focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/20 font-[inherit]',
  label:        'block text-[13px] font-semibold text-[#1A1A1A] mb-1.5',
  stepHeading:  'text-[22px] font-bold text-[#1B3A4B] font-[--font-heading-hy] mb-1',
  stepSub:      'text-[14px] text-[#5a6475] mb-6',
}

export default function BookingWidget() {
  const { t, lang } = useTranslation()
  const b = t.booking
  const dateLocale = lang === 'hy' ? hyLocale : lang === 'ru' ? ruLocale : enUS

  const [step,      setStep]      = useState<Step>(1)
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

  function goNext(s: Step) { setErrors({}); setStep(s) }

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
      setStep(6)
    } catch {
      setErrors({ submit: b.errSubmit })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">

      {/* Progress bar */}
      {step < 6 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            {([1,2,3,4,5] as Step[]).map(s => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
                  step > s ? 'bg-[#C9A96E] text-white' :
                  step === s ? 'bg-[#1B3A4B] text-white' :
                  'bg-[#F0EFEB] text-[#5a6475]'
                }`}>{step > s ? '✓' : s}</div>
                {s < 5 && <div className={`h-0.5 flex-1 transition-all ${step > s ? 'bg-[#C9A96E]' : 'bg-[#e2e0da]'}`} />}
              </div>
            ))}
          </div>
          <div className="text-xs text-[#5a6475] font-medium">
            {b.progressLabels[step - 1]}
          </div>
        </div>
      )}

      {/* Step 1: Services */}
      {step === 1 && (
        <div>
          <h2 className={S.stepHeading}>{b.step1Heading}</h2>
          <p className={S.stepSub}>{b.step1Sub}</p>
          {services.length === 0 && <p className="text-[#5a6475]">{b.loading}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {services.map(svc => (
              <button
                key={svc.id}
                className={state.service?.id === svc.id ? S.cardSelected : S.card}
                onClick={() => { pick('service', svc); goNext(2) }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="w-11 h-11 bg-[rgba(201,169,110,.12)] rounded-[10px] flex items-center justify-center text-[#C9A96E] shrink-0">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2C8.5 2 6 5 6 8.5c0 1.7.5 3.5 1.4 5.3L9.5 21h5l2.1-7.2c.9-1.8 1.4-3.6 1.4-5.3C18 5 15.5 2 12 2z"/>
                    </svg>
                  </div>
                  <span className="text-[13px] font-bold text-[#C9A96E] bg-[rgba(201,169,110,.1)] px-2 py-0.5 rounded-md shrink-0">
                    {svc.duration_minutes} {b.minLabel}
                  </span>
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[#1B3A4B]">{b.svcNameMap[svc.name] ?? svc.name}</h3>
                  <p className="text-[13px] text-[#5a6475] mt-1 leading-relaxed">{b.svcDescMap[svc.name] ?? svc.description ?? ''}</p>
                </div>
                <div className="text-[15px] font-bold text-[#1B3A4B] mt-auto">
                  {svc.price.toLocaleString()} AMD
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Staff */}
      {step === 2 && (
        <div>
          <h2 className={S.stepHeading}>{b.step2Heading}</h2>
          <p className={S.stepSub}>{b.step2Sub}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {staffList.map(s => (
              <button
                key={s.id}
                className={state.staff?.id === s.id ? S.cardSelected : S.card}
                onClick={() => { pick('staff', s); goNext(3) }}
              >
                <div className="w-16 h-16 rounded-full bg-[#e8e4d9] border-2 border-[#C9A96E] flex items-center justify-center mx-auto shrink-0">
                  {s.photo_url ? (
                    <img src={s.photo_url} alt={s.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-[#1B3A4B] font-bold text-lg">
                      {s.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                    </span>
                  )}
                </div>
                <div className="text-center">
                  <h3 className="text-[16px] font-bold text-[#1B3A4B]">{s.name}</h3>
                </div>
              </button>
            ))}
          </div>
          <button className={`${S.btn} ${S.btnOutline}`} onClick={() => setStep(1)}>{b.back}</button>
        </div>
      )}

      {/* Step 3: Calendar */}
      {step === 3 && (
        <div>
          <h2 className={S.stepHeading}>{b.step3Heading}</h2>
          <p className={S.stepSub}>{b.step3Sub}</p>

          <div className="bg-white rounded-[12px] border border-[#e2e0da] p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <button
                className="w-9 h-9 rounded-full border border-[#e2e0da] flex items-center justify-center hover:border-[#C9A96E] hover:text-[#C9A96E] transition-all"
                onClick={() => setCalMonth(m => subMonths(m, 1))}
                disabled={isBefore(startOfMonth(subMonths(calMonth, 1)), startOfMonth(new Date()))}
              >‹</button>
              <span className="font-bold text-[#1B3A4B] text-[15px]">
                {format(calMonth, 'MMMM yyyy', { locale: dateLocale })}
              </span>
              <button
                className="w-9 h-9 rounded-full border border-[#e2e0da] flex items-center justify-center hover:border-[#C9A96E] hover:text-[#C9A96E] transition-all"
                onClick={() => setCalMonth(m => addMonths(m, 1))}
              >›</button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-1">
              {b.dayNames.map((d, i) => (
                <div key={i} className="text-center text-[11px] font-bold text-[#5a6475] py-1">{d}</div>
              ))}
            </div>

            {loading ? (
              <div className="text-center text-[#5a6475] py-8">{b.loading}</div>
            ) : (
              <CalendarGrid
                month={calMonth}
                availDays={availDays}
                selected={state.date}
                onSelect={date => { pick('date', date); pick('slot', null); setStep(4) }}
              />
            )}
          </div>

          <button className={`${S.btn} ${S.btnOutline}`} onClick={() => setStep(2)}>{b.back}</button>
        </div>
      )}

      {/* Step 4: Time slots */}
      {step === 4 && state.date && (
        <div>
          <h2 className={S.stepHeading}>{b.step4Heading}</h2>
          <p className={S.stepSub}>
            {format(state.date, 'EEEE, d MMMM yyyy', { locale: dateLocale })} — {b.svcNameMap[state.service?.name ?? ''] ?? state.service?.name}
          </p>

          {loading ? (
            <div className="text-center text-[#5a6475] py-8">{b.loading}</div>
          ) : slots.length === 0 && busySlots.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#5a6475] mb-4">{b.noSlots}</p>
              <button className={`${S.btn} ${S.btnOutline}`} onClick={() => setStep(3)}>{b.pickOther}</button>
            </div>
          ) : (
            <>
              {slots.length === 0 && busySlots.length > 0 && (
                <p className="text-[#5a6475] text-sm mb-4">{b.noSlots}</p>
              )}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-6">
                {[...slots, ...busySlots]
                  .sort((a, b) => a.localeCompare(b))
                  .map(slot => {
                    const isBusy = busySlots.includes(slot)
                    const isSelected = state.slot === slot
                    return (
                      <button
                        key={slot}
                        onClick={() => !isBusy && (pick('slot', slot), goNext(5))}
                        disabled={isBusy}
                        title={isBusy ? b.slotBusy : undefined}
                        className={`py-3 rounded-lg text-[15px] font-semibold border-2 transition-all relative ${
                          isBusy
                            ? 'bg-[#f5f4f0] text-[#c8c5bd] border-[#ebe9e3] cursor-not-allowed'
                            : isSelected
                            ? 'bg-[#C9A96E] text-white border-[#C9A96E]'
                            : 'bg-white text-[#1B3A4B] border-[#e2e0da] hover:border-[#C9A96E] hover:text-[#C9A96E]'
                        }`}
                      >
                        <span className={isBusy ? 'opacity-50' : ''}>{format(parseISO(slot), 'HH:mm')}</span>
                        {isBusy && (
                          <span className="block text-[10px] font-medium text-[#bbb] leading-none mt-0.5">🔒</span>
                        )}
                      </button>
                    )
                  })}
              </div>
              {slots.length > 0 && (
                <button className={`${S.btn} ${S.btnOutline}`} onClick={() => setStep(3)}>{b.back}</button>
              )}
              {slots.length === 0 && (
                <button className={`${S.btn} ${S.btnOutline}`} onClick={() => setStep(3)}>{b.pickOther}</button>
              )}
            </>
          )}
        </div>
      )}

      {/* Step 5: Customer details */}
      {step === 5 && (
        <div>
          <h2 className={S.stepHeading}>{b.step5Heading}</h2>
          <p className={S.stepSub}>
            {b.svcNameMap[state.service?.name ?? ''] ?? state.service?.name} · {state.staff?.name} ·{' '}
            {state.date && format(state.date, 'd MMM', { locale: dateLocale })} ·{' '}
            {state.slot && format(parseISO(state.slot), 'HH:mm')}
          </p>

          <div className="space-y-4 mb-6">
            <div>
              <label className={S.label}>{b.formName}</label>
              <input
                className={S.input}
                type="text" autoComplete="name"
                value={state.name}
                onChange={e => pick('name', e.target.value)}
                style={errors.name ? { borderColor: '#e05555' } : {}}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className={S.label}>{b.formPhone}</label>
              <input
                className={S.input}
                type="tel" autoComplete="tel"
                value={state.phone}
                onChange={e => pick('phone', e.target.value)}
                style={errors.phone ? { borderColor: '#e05555' } : {}}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className={S.label}>{b.formEmail}</label>
              <input
                className={S.input}
                type="email" autoComplete="email"
                value={state.email}
                onChange={e => pick('email', e.target.value)}
                style={errors.email ? { borderColor: '#e05555' } : {}}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className={S.label}>{b.formNotes}</label>
              <textarea
                className={`${S.input} resize-y min-h-[80px]`}
                value={state.notes}
                onChange={e => pick('notes', e.target.value)}
              />
            </div>
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
              {errors.submit}
            </div>
          )}

          <div className="flex gap-3">
            <button className={`${S.btn} ${S.btnOutline}`} onClick={() => setStep(4)}>{b.back}</button>
            <button
              className={`${S.btn} ${S.btnPrimary} flex-1`}
              onClick={submitBooking}
              disabled={loading}
            >
              {loading ? b.loading : b.submitBtn}
            </button>
          </div>
        </div>
      )}

      {/* Step 6: Success */}
      {step === 6 && (
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-[rgba(201,169,110,.12)] rounded-full flex items-center justify-center mx-auto mb-6">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h2 className="text-[26px] font-bold text-[#1B3A4B] mb-2">{b.successTitle}</h2>
          <p className="text-[#5a6475] mb-8">{b.successSub}</p>

          <div className="bg-[#F0EFEB] rounded-[12px] p-6 text-left mb-8 max-w-sm mx-auto">
            <div className="space-y-3">
              {[
                ...(bookingId ? [[b.summaryRef, `#${bookingId.slice(0, 8).toUpperCase()}`]] : []),
                [b.summaryService, b.svcNameMap[state.service?.name ?? ''] ?? state.service?.name],
                [b.summaryDoctor,  state.staff?.name],
                [b.summaryDate,    state.date ? format(state.date, 'd MMMM yyyy', { locale: dateLocale }) : ''],
                [b.summaryTime,    state.slot ? format(parseISO(state.slot), 'HH:mm') : ''],
                [b.summaryEmail,   state.email],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4">
                  <span className="text-[12px] font-bold text-[#C9A96E] uppercase tracking-wider">{label}</span>
                  <span className="text-[14px] font-semibold text-[#1B3A4B] text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            className={`${S.btn} ${S.btnOutline}`}
            onClick={() => { setState(INITIAL); setStep(1); setBookingId(null) }}
          >
            {b.bookAnother}
          </button>
        </div>
      )}
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

        return (
          <button
            key={i}
            onClick={() => isAvail && onSelect(date)}
            disabled={isPast || !isAvail}
            className={`aspect-square rounded-lg text-[14px] font-semibold transition-all ${
              isSel
                ? 'bg-[#C9A96E] text-white'
                : isPast || !isAvail
                ? 'text-[#c8c5bd] cursor-default'
                : 'text-[#1B3A4B] hover:bg-[rgba(201,169,110,.15)] hover:text-[#C9A96E]'
            }`}
          >
            {day}
          </button>
        )
      })}
    </div>
  )
}
