'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import type { Booking, Staff, BlockedSlot, Service } from '@/lib/types'
import {
  format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks,
} from 'date-fns'

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8) // 8am–7pm
const ROW_H = 72 // px per hour row

export default function CalendarPage() {
  const [weekStart,    setWeekStart]   = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [bookings,     setBookings]    = useState<Booking[]>([])
  const [blocked,      setBlocked]     = useState<BlockedSlot[]>([])
  const [staff,        setStaff]       = useState<Staff[]>([])
  const [services,     setServices]    = useState<Service[]>([])
  const [loading,      setLoading]     = useState(true)
  const [modal,        setModal]       = useState<null | 'booking' | 'block'>(null)
  const [selectedSlot, setSelSlot]     = useState<{ date: Date; hour: number } | null>(null)
  const [detailBooking, setDetailB]    = useState<Booking | null>(null)
  const [now,          setNow]         = useState(new Date())

  const [blockForm, setBlockForm] = useState({ staffId: '', date: '', startTime: '', endTime: '', reason: '' })
  const [bookForm,  setBookForm]  = useState({ staffId: '', serviceId: '', date: '', time: '', name: '', phone: '', email: '', notes: '' })

  const supabase = createClient()

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(tick)
  }, [])

  useEffect(() => {
    async function load() {
      setLoading(true)
      const weekEnd = addDays(weekStart, 6)
      const [{ data: bData }, { data: blData }, { data: stData }, { data: svData }] = await Promise.all([
        supabase.from('bookings').select('*, staff:staff_id(name), service:service_id(name, duration_minutes)')
          .gte('start_time', weekStart.toISOString())
          .lte('end_time',   weekEnd.toISOString())
          .order('start_time'),
        supabase.from('blocked_slots').select('*, staff:staff_id(name)')
          .gte('start_time', weekStart.toISOString())
          .lte('end_time',   weekEnd.toISOString()),
        supabase.from('staff').select('*').order('name'),
        supabase.from('services').select('*').order('name'),
      ])
      setBookings((bData as Booking[]) || [])
      setBlocked((blData as BlockedSlot[]) || [])
      setStaff(stData || [])
      setServices(svData || [])
      setLoading(false)
    }
    load()
  }, [weekStart])

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  function getBookingsForSlot(day: Date, hour: number) {
    return bookings.filter(b => {
      const s = new Date(b.start_time)
      return isSameDay(s, day) && s.getHours() === hour
    })
  }

  function getBlocksForSlot(day: Date, hour: number) {
    return blocked.filter(bl => {
      const s = new Date(bl.start_time)
      return isSameDay(s, day) && s.getHours() === hour
    })
  }

  async function cancelBooking(id: string) {
    if (!confirm('Cancel this booking?')) return
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id)
    setBookings(bs => bs.filter(b => b.id !== id))
    setDetailB(null)
  }

  async function deleteBlock(id: string) {
    if (!confirm('Remove this block?')) return
    await supabase.from('blocked_slots').delete().eq('id', id)
    setBlocked(bs => bs.filter(b => b.id !== id))
  }

  async function submitBlock(e: React.FormEvent) {
    e.preventDefault()
    const startISO = new Date(`${blockForm.date}T${blockForm.startTime}`).toISOString()
    const endISO   = new Date(`${blockForm.date}T${blockForm.endTime}`).toISOString()
    const { data } = await supabase.from('blocked_slots').insert({
      staff_id:   blockForm.staffId,
      start_time: startISO,
      end_time:   endISO,
      reason:     blockForm.reason || null,
    }).select('*, staff:staff_id(name)').single()
    if (data) setBlocked(bs => [...bs, data as BlockedSlot])
    setModal(null)
    setBlockForm({ staffId: '', date: '', startTime: '', endTime: '', reason: '' })
  }

  async function submitManualBooking(e: React.FormEvent) {
    e.preventDefault()
    const svc = services.find(s => s.id === bookForm.serviceId)
    if (!svc) return
    const start = new Date(`${bookForm.date}T${bookForm.time}`)
    const end   = new Date(start.getTime() + svc.duration_minutes * 60000)
    const { data } = await supabase.from('bookings').insert({
      staff_id: bookForm.staffId, service_id: bookForm.serviceId,
      customer_name: bookForm.name, customer_phone: bookForm.phone,
      customer_email: bookForm.email, notes: bookForm.notes || null,
      start_time: start.toISOString(), end_time: end.toISOString(), status: 'confirmed',
    }).select('*, staff:staff_id(name), service:service_id(name, duration_minutes)').single()
    if (data) setBookings(bs => [...bs, data as Booking])
    setModal(null)
    setBookForm({ staffId: '', serviceId: '', date: '', time: '', name: '', phone: '', email: '', notes: '' })
  }

  const isCurrentWeek = weekDays.some(d => isSameDay(d, now))

  return (
    <div>
      <style>{`
        .cal-cell { }
        .cal-add-btn {
          position: absolute; top: 4px; right: 4px;
          width: 22px; height: 22px; border-radius: 4px;
          border: 1px solid var(--border); background: var(--section-bg);
          color: var(--text-light); font-size: 16px; line-height: 1;
          cursor: pointer; opacity: 0; transition: opacity .15s, background .15s;
          display: flex; align-items: center; justify-content: center; padding: 0;
        }
        .cal-cell:hover .cal-add-btn { opacity: 1; }
        .cal-add-btn:hover { background: var(--accent); color: white; border-color: var(--accent); }
        .cal-nav-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 16px; font-size: 13px; font-weight: 600;
          border: 1.5px solid #d4d0c8; background: white;
          color: var(--primary); border-radius: 8px;
          cursor: pointer; transition: border-color .15s, background .15s, color .15s;
          font-family: var(--font-body-hy);
        }
        .cal-nav-btn:hover { border-color: var(--primary); background: var(--primary); color: white; }
        .cal-today-btn {
          display: inline-flex; align-items: center;
          padding: 8px 14px; font-size: 13px; font-weight: 600;
          border: 1.5px solid #d4d0c8; background: white;
          color: var(--text-light); border-radius: 8px;
          cursor: pointer; transition: border-color .15s, background .15s, color .15s;
          font-family: var(--font-body-hy);
        }
        .cal-today-btn:hover { border-color: var(--accent); color: var(--accent); }
        .cal-today-btn.active { border-color: var(--accent); color: var(--accent); font-weight: 700; }
        .time-line {
          position: absolute; left: 0; right: 0;
          height: 2px; background: #dc2626; z-index: 10; pointer-events: none;
        }
        .time-line::before {
          content: ''; position: absolute; left: -4px; top: -4px;
          width: 10px; height: 10px; border-radius: 50%; background: #dc2626;
        }
        .cal-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
        .cal-toolbar-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
        .cal-grid-row { display: grid; grid-template-columns: 56px repeat(7, 1fr); }
        @media (max-width: 900px) {
          .cal-grid-row { min-width: 700px; }
        }
      `}</style>

      {/* Header */}
      <div className="cal-toolbar">
        <div>
          <h1 style={{ fontSize: 26, fontFamily: 'var(--font-heading-hy)', color: 'var(--primary)', marginBottom: 4 }}>Calendar</h1>
          <p style={{ color: 'var(--text-light)', fontSize: 14 }}>
            {format(weekStart, 'd MMM')} – {format(addDays(weekStart, 6), 'd MMM yyyy')}
          </p>
        </div>
        <div className="cal-toolbar-actions">
          <button onClick={() => setWeekStart(w => subWeeks(w, 1))} className="cal-nav-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            Prev
          </button>
          <button
            onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
            className={`cal-today-btn${isCurrentWeek ? ' active' : ''}`}
          >
            Today
          </button>
          <button onClick={() => setWeekStart(w => addWeeks(w, 1))} className="cal-nav-btn">
            Next
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          <div style={{ width: 1, height: 28, background: '#e0ddd6', margin: '0 4px' }} />
          <button onClick={() => setModal('block')} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 13, minHeight: 'unset' }}>Block Time</button>
          <button onClick={() => { setSelSlot(null); setModal('booking') }} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 13, minHeight: 'unset' }}>+ Add Booking</button>
        </div>
      </div>

      {loading ? (
        <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,.06)', padding: '48px 24px', textAlign: 'center', color: 'var(--text-light)', fontSize: 14 }}>
          Loading calendar…
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,.06)', overflow: 'auto' }}>
          {/* Day headers */}
          <div className="cal-grid-row" style={{ borderBottom: '2px solid var(--border)', position: 'sticky', top: 0, background: 'white', zIndex: 20 }}>
            <div />
            {weekDays.map(day => {
              const isToday   = isSameDay(day, now)
              const isWeekend = [0, 6].includes(day.getDay())
              return (
                <div key={day.toISOString()} style={{
                  padding: '12px 8px', textAlign: 'center',
                  borderLeft: '1px solid var(--border)',
                  background: isToday ? 'rgba(201,169,110,.07)' : isWeekend ? '#faf9f7' : 'white',
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: isToday ? 'var(--accent)' : 'var(--text-light)', marginBottom: 4 }}>
                    {format(day, 'EEE')}
                  </div>
                  <div style={{
                    fontSize: 20, fontWeight: 700,
                    color: isToday ? 'white' : isWeekend ? '#aaa' : 'var(--primary)',
                    background: isToday ? 'var(--accent)' : 'transparent',
                    width: 32, height: 32, borderRadius: '50%',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {format(day, 'd')}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Hour rows */}
          {HOURS.map(hour => (
            <div key={hour} className="cal-grid-row" style={{ borderBottom: '1px solid #f0efeb', minHeight: ROW_H }}>
              <div style={{ padding: '8px 8px 0', fontSize: 11, color: '#bbb', fontWeight: 600, textAlign: 'right', lineHeight: 1 }}>
                {hour}:00
              </div>
              {weekDays.map(day => {
                const dayBookings = getBookingsForSlot(day, hour)
                const dayBlocks   = getBlocksForSlot(day, hour)
                const isToday     = isSameDay(day, now)
                const isWeekend   = [0, 6].includes(day.getDay())
                const showTimeLine = isToday && now.getHours() === hour

                return (
                  <div
                    key={day.toISOString()}
                    className="cal-cell"
                    style={{
                      borderLeft: '1px solid var(--border)',
                      padding: '4px',
                      minHeight: ROW_H,
                      position: 'relative',
                      background: isToday ? 'rgba(201,169,110,.03)' : isWeekend ? '#faf9f7' : 'white',
                    }}
                  >
                    {showTimeLine && (
                      <div className="time-line" style={{ top: `${(now.getMinutes() / 60) * 100}%` }} />
                    )}
                    <button
                      className="cal-add-btn"
                      onClick={() => {
                        setSelSlot({ date: day, hour })
                        setBookForm(f => ({ ...f, date: format(day, 'yyyy-MM-dd'), time: `${String(hour).padStart(2,'0')}:00` }))
                        setModal('booking')
                      }}
                      title="Add booking"
                    >+</button>
                    {dayBookings.map(b => (
                      <div
                        key={b.id}
                        onClick={e => { e.stopPropagation(); setDetailB(b) }}
                        style={{
                          background: 'rgba(27,58,75,.07)',
                          borderLeft: '3px solid var(--primary)',
                          borderRadius: 5,
                          padding: '4px 7px',
                          fontSize: 11,
                          marginBottom: 3,
                          cursor: 'pointer',
                          color: 'var(--primary)',
                          transition: 'background .15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(27,58,75,.14)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(27,58,75,.07)')}
                      >
                        <div style={{ fontWeight: 700, fontSize: 11 }}>
                          {format(new Date(b.start_time), 'HH:mm')}
                          <span style={{ fontWeight: 400, opacity: .7, marginLeft: 4 }}>{(b as any).service?.name}</span>
                        </div>
                        <div style={{ fontWeight: 600, marginTop: 1 }}>{b.customer_name}</div>
                      </div>
                    ))}
                    {dayBlocks.map(bl => (
                      <div
                        key={bl.id}
                        style={{
                          background: 'rgba(220,38,38,.06)',
                          borderLeft: '3px solid #dc2626',
                          borderRadius: 5,
                          padding: '4px 7px',
                          fontSize: 11,
                          marginBottom: 3,
                          color: '#dc2626',
                        }}
                        title={bl.reason || 'Blocked'}
                      >
                        <div style={{ fontWeight: 700 }}>{format(new Date(bl.start_time), 'HH:mm')}–{format(new Date(bl.end_time), 'HH:mm')}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 1 }}>
                          <span style={{ opacity: .7 }}>{bl.reason || 'Blocked'}</span>
                          <button onClick={e => { e.stopPropagation(); deleteBlock(bl.id) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 14, padding: '0 2px', lineHeight: 1, fontWeight: 700 }}>×</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}

      {/* Booking detail modal */}
      {detailBooking && (
        <Modal title="Appointment Details" onClose={() => setDetailB(null)}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            {[
              ['Patient',  detailBooking.customer_name],
              ['Phone',    detailBooking.customer_phone],
              ['Email',    detailBooking.customer_email],
              ['Service',  (detailBooking as any).service?.name],
              ['Doctor',   (detailBooking as any).staff?.name],
              ['Time',     format(new Date(detailBooking.start_time), 'HH:mm') + ' – ' + format(new Date(detailBooking.end_time), 'HH:mm')],
              ['Date',     format(new Date(detailBooking.start_time), 'EEEE, d MMMM yyyy')],
              ...(detailBooking.notes ? [['Notes', detailBooking.notes]] : []),
            ].map(([k, v]) => (
              <tr key={k} style={{ borderBottom: '1px solid #f0efeb' }}>
                <td style={{ padding: '10px 0', fontSize: 11, fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', width: 90, letterSpacing: '.06em' }}>{k}</td>
                <td style={{ padding: '10px 0', fontSize: 14, fontWeight: 600, color: 'var(--primary)' }}>{v}</td>
              </tr>
            ))}
          </table>
          <button
            onClick={() => cancelBooking(detailBooking.id)}
            style={{ marginTop: 20, background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
          >
            Cancel Appointment
          </button>
        </Modal>
      )}

      {/* Block time modal */}
      {modal === 'block' && (
        <Modal title="Block Time" onClose={() => setModal(null)}>
          <form onSubmit={submitBlock} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label>Doctor</label>
              <select value={blockForm.staffId} onChange={e => setBlockForm(f => ({ ...f, staffId: e.target.value }))} required>
                <option value="">Select doctor</option>
                {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={blockForm.date} onChange={e => setBlockForm(f => ({ ...f, date: e.target.value }))} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>Start time</label>
                <input type="time" value={blockForm.startTime} onChange={e => setBlockForm(f => ({ ...f, startTime: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>End time</label>
                <input type="time" value={blockForm.endTime} onChange={e => setBlockForm(f => ({ ...f, endTime: e.target.value }))} required />
              </div>
            </div>
            <div className="form-group">
              <label>Reason (optional)</label>
              <input type="text" value={blockForm.reason} onChange={e => setBlockForm(f => ({ ...f, reason: e.target.value }))} placeholder="e.g. Lunch break, Personal" />
            </div>
            <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center' }}>Block Time</button>
          </form>
        </Modal>
      )}

      {/* Manual booking modal */}
      {modal === 'booking' && (
        <Modal title="Add Manual Booking" onClose={() => setModal(null)}>
          <form onSubmit={submitManualBooking} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label>Doctor</label>
              <select value={bookForm.staffId} onChange={e => setBookForm(f => ({ ...f, staffId: e.target.value }))} required>
                <option value="">Select doctor</option>
                {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Service</label>
              <select value={bookForm.serviceId} onChange={e => setBookForm(f => ({ ...f, serviceId: e.target.value }))} required>
                <option value="">Select service</option>
                {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>Date</label>
                <input type="date" value={bookForm.date} onChange={e => setBookForm(f => ({ ...f, date: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Time</label>
                <input type="time" value={bookForm.time} onChange={e => setBookForm(f => ({ ...f, time: e.target.value }))} required />
              </div>
            </div>
            <div className="form-group">
              <label>Patient name</label>
              <input type="text" value={bookForm.name} onChange={e => setBookForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="tel" value={bookForm.phone} onChange={e => setBookForm(f => ({ ...f, phone: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={bookForm.email} onChange={e => setBookForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Notes (optional)</label>
              <textarea value={bookForm.notes} onChange={e => setBookForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center' }}>Add Booking</button>
          </form>
        </Modal>
      )}
    </div>
  )
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'white', borderRadius: 12, padding: '28px 32px', maxWidth: 500, width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--text-light)', lineHeight: 1 }}>×</button>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)', marginBottom: 20 }}>{title}</h2>
        {children}
      </div>
    </div>
  )
}
