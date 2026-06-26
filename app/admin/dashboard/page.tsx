'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import type { Booking } from '@/lib/types'
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, addDays } from 'date-fns'

export default function DashboardPage() {
  const [todayBookings,  setTodayBookings]  = useState<Booking[]>([])
  const [weekCount,      setWeekCount]      = useState(0)
  const [tomorrowCount,  setTomorrowCount]  = useState(0)
  const [loading,        setLoading]        = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const today    = new Date()
      const tomorrow = addDays(today, 1)
      const todayStart    = startOfDay(today).toISOString()
      const todayEnd      = endOfDay(today).toISOString()
      const tomorrowStart = startOfDay(tomorrow).toISOString()
      const tomorrowEnd   = endOfDay(tomorrow).toISOString()
      const weekStart     = startOfWeek(today, { weekStartsOn: 1 }).toISOString()
      const weekEnd       = endOfWeek(today,   { weekStartsOn: 1 }).toISOString()

      const [{ data: todayData }, { count: wCount }, { count: tmCount }] = await Promise.all([
        supabase
          .from('bookings')
          .select('*, staff:staff_id(name), service:service_id(name, duration_minutes)')
          .gte('start_time', todayStart)
          .lte('start_time', todayEnd)
          .eq('status', 'confirmed')
          .order('start_time'),
        supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .gte('start_time', weekStart)
          .lte('start_time', weekEnd)
          .eq('status', 'confirmed'),
        supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .gte('start_time', tomorrowStart)
          .lte('start_time', tomorrowEnd)
          .eq('status', 'confirmed'),
      ])

      setTodayBookings((todayData as Booking[]) || [])
      setWeekCount(wCount || 0)
      setTomorrowCount(tmCount || 0)
      setLoading(false)
    }
    load()
  }, [])

  async function cancelBooking(id: string) {
    if (!confirm('Վերացնե՞լ ժամադրությունը?')) return
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id)
    setTodayBookings(bs => bs.filter(b => b.id !== id))
  }

  return (
    <div>
      <h1 style={{ fontSize: 26, fontFamily: 'var(--font-heading-hy)', color: 'var(--primary)', marginBottom: 8 }}>Dashboard</h1>
      <p style={{ color: 'var(--text-light)', marginBottom: 32 }}>{format(new Date(), 'EEEE, d MMMM yyyy')}</p>

      {/* Stat cards */}
      <div className="admin-stat-grid">
        {[
          {
            label: 'Today', value: loading ? '–' : todayBookings.length, color: 'var(--primary)',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
            accent: 'rgba(27,58,75,.08)',
          },
          {
            label: 'This week', value: loading ? '–' : weekCount, color: '#b8894a',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
            accent: 'rgba(201,169,110,.12)',
          },
          {
            label: 'Tomorrow', value: loading ? '–' : tomorrowCount, color: '#16a34a',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
            accent: 'rgba(22,163,74,.08)',
          },
        ].map(({ label, value, color, icon, accent }) => (
          <div key={label} style={{ background: 'white', borderRadius: 12, padding: '22px 24px', boxShadow: '0 2px 8px rgba(0,0,0,.06)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-light)', marginBottom: 10 }}>{label}</p>
              <p style={{ fontSize: 40, fontWeight: 700, color, lineHeight: 1 }}>{value}</p>
            </div>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: accent, color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {icon}
            </div>
          </div>
        ))}
      </div>

      {/* Today's bookings */}
      <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)' }}>Today&apos;s Appointments</h2>
        </div>

        {loading ? (
          <p style={{ padding: 24, color: 'var(--text-light)' }}>Loading…</p>
        ) : todayBookings.length === 0 ? (
          <p style={{ padding: 24, color: 'var(--text-light)' }}>No appointments today.</p>
        ) : (
          <>
            {/* Desktop table */}
            <div className="admin-table-desktop admin-table-wrap">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Time', 'Patient', 'Phone', 'Service', 'Doctor', 'Action'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {todayBookings.map(b => (
                    <tr key={b.id} style={{ borderBottom: '1px solid #f0efeb' }}>
                      <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 700, color: 'var(--primary)', whiteSpace: 'nowrap' }}>
                        {format(new Date(b.start_time), 'HH:mm')}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 14 }}>
                        <div style={{ fontWeight: 600 }}>{b.customer_name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-light)' }}>{b.customer_email}</div>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 14 }}>
                        <a href={`tel:${b.customer_phone}`} style={{ color: 'var(--primary)' }}>{b.customer_phone}</a>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 14 }}>
                        {(b as any).service?.name || '—'}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 14 }}>
                        {(b as any).staff?.name || '—'}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <button
                          onClick={() => cancelBooking(b.id)}
                          style={{ fontSize: 12, color: '#dc2626', border: 'none', cursor: 'pointer', fontWeight: 600, padding: '4px 8px', borderRadius: 6, background: '#fee2e2' }}
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="admin-booking-cards" style={{ padding: 16 }}>
              {todayBookings.map(b => (
                <div key={b.id} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)' }}>{format(new Date(b.start_time), 'HH:mm')}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{b.customer_name}</div>
                    </div>
                    <button
                      onClick={() => cancelBooking(b.id)}
                      style={{ fontSize: 12, color: '#dc2626', border: 'none', cursor: 'pointer', fontWeight: 600, padding: '6px 10px', borderRadius: 6, background: '#fee2e2', flexShrink: 0 }}
                    >
                      Cancel
                    </button>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-light)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <a href={`tel:${b.customer_phone}`} style={{ color: 'var(--primary)' }}>{b.customer_phone}</a>
                    <span>{(b as any).service?.name || '—'} · {(b as any).staff?.name || '—'}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
