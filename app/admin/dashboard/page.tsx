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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 40 }}>
        {[
          { label: "Today",     value: loading ? '…' : todayBookings.length, color: '#1B3A4B' },
          { label: 'This week', value: loading ? '…' : weekCount,            color: '#C9A96E' },
          { label: 'Tomorrow',  value: loading ? '…' : tomorrowCount,        color: '#16a34a' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: 'white', borderRadius: 12, padding: '24px 28px', boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
            <p style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 8 }}>{label}</p>
            <p style={{ fontSize: 36, fontWeight: 700, color }}>{value}</p>
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
        )}
      </div>
    </div>
  )
}
