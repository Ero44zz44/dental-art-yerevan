'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import type { Booking, Staff, BlockedSlot, Service } from '@/lib/types'
import {
  format, startOfWeek, addDays, isSameDay, parseISO, addWeeks, subWeeks,
} from 'date-fns'

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8) // 8am–7pm

export default function CalendarPage() {
  const [weekStart,   setWeekStart]   = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [bookings,    setBookings]    = useState<Booking[]>([])
  const [blocked,     setBlocked]     = useState<BlockedSlot[]>([])
  const [staff,       setStaff]       = useState<Staff[]>([])
  const [services,    setServices]    = useState<Service[]>([])
  const [loading,     setLoading]     = useState(true)
  const [modal,       setModal]       = useState<null | 'booking' | 'block'>(null)
  const [selectedSlot, setSelSlot]    = useState<{ date: Date; hour: number } | null>(null)
  const [detailBooking, setDetailB]   = useState<Booking | null>(null)

  // Block form
  const [blockForm, setBlockForm] = useState({ staffId: '', date: '', startTime: '', endTime: '', reason: '' })
  // Manual booking form
  const [bookForm, setBookForm] = useState({ staffId: '', serviceId: '', date: '', time: '', name: '', phone: '', email: '', notes: '' })

  const supabase = createClient()

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

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontFamily: 'var(--font-heading-hy)', color: 'var(--primary)', marginBottom: 4 }}>Calendar</h1>
          <p style={{ color: 'var(--text-light)', fontSize: 14 }}>
            {format(weekStart, 'd MMM')} – {format(addDays(weekStart, 6), 'd MMM yyyy')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setWeekStart(w => subWeeks(w, 1))} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: 14 }}>← Prev</button>
          <button onClick={() => setWeekStart(w => addWeeks(w, 1))} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: 14 }}>Next →</button>
          <button onClick={() => setModal('block')} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 14 }}>🚫 Block Time</button>
          <button onClick={() => { setSelSlot(null); setModal('booking') }} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 14 }}>+ Add Booking</button>
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-light)' }}>Loading…</p>
      ) : (
        <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,.06)', overflow: 'auto' }}>
          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', borderBottom: '1px solid var(--border)' }}>
            <div />
            {weekDays.map(day => (
              <div key={day.toISOString()} style={{
                padding: '12px 8px', textAlign: 'center', fontSize: 13, fontWeight: 700,
                color: isSameDay(day, new Date()) ? 'var(--accent)' : 'var(--primary)',
                borderLeft: '1px solid var(--border)',
              }}>
                <div>{format(day, 'EEE')}</div>
                <div style={{ fontSize: 18, fontWeight: isSameDay(day, new Date()) ? 800 : 600 }}>{format(day, 'd')}</div>
              </div>
            ))}
          </div>

          {/* Hour rows */}
          {HOURS.map(hour => (
            <div key={hour} style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', borderBottom: '1px solid #f0efeb', minHeight: 64 }}>
              <div style={{ padding: '8px 8px 0', fontSize: 11, color: 'var(--text-light)', fontWeight: 600, textAlign: 'right' }}>
                {hour}:00
              </div>
              {weekDays.map(day => {
                const dayBookings = getBookingsForSlot(day, hour)
                const dayBlocks   = getBlocksForSlot(day, hour)
                return (
                  <div
                    key={day.toISOString()}
                    style={{ borderLeft: '1px solid var(--border)', padding: '4px', cursor: 'pointer', minHeight: 64 }}
                    onClick={() => {
                      setSelSlot({ date: day, hour })
                      setBookForm(f => ({ ...f, date: format(day, 'yyyy-MM-dd'), time: `${String(hour).padStart(2,'0')}:00` }))
                      setModal('booking')
                    }}
                  >
                    {dayBookings.map(b => (
                      <div
                        key={b.id}
                        onClick={e => { e.stopPropagation(); setDetailB(b) }}
                        style={{
                          background: 'rgba(27,58,75,.08)', borderLeft: '3px solid var(--primary)',
                          borderRadius: 4, padding: '3px 6px', fontSize: 11, marginBottom: 2, cursor: 'pointer',
                          color: 'var(--primary)',
                        }}
                      >
                        <div style={{ fontWeight: 700 }}>{format(new Date(b.start_time), 'HH:mm')} {(b as any).service?.name}</div>
                        <div style={{ opacity: .7 }}>{b.customer_name}</div>
                      </div>
                    ))}
                    {dayBlocks.map(bl => (
                      <div
                        key={bl.id}
                        style={{
                          background: 'rgba(220,38,38,.06)', borderLeft: '3px solid #dc2626',
                          borderRadius: 4, padding: '3px 6px', fontSize: 11, marginBottom: 2,
                          color: '#dc2626',
                        }}
                        title={bl.reason || 'Blocked'}
                      >
                        <div style={{ fontWeight: 700 }}>🚫 {format(new Date(bl.start_time), 'HH:mm')}–{format(new Date(bl.end_time), 'HH:mm')}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ opacity: .7 }}>{bl.reason || 'Blocked'}</span>
                          <button onClick={e => { e.stopPropagation(); deleteBlock(bl.id) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 13, padding: '0 2px', lineHeight: 1 }}>×</button>
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
                <td style={{ padding: '10px 0', fontSize: 12, fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', width: 100, letterSpacing: '.06em' }}>{k}</td>
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
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text-light)' }}>×</button>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)', marginBottom: 20 }}>{title}</h2>
        {children}
      </div>
    </div>
  )
}
