'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import type { Staff, Service, WorkingHours } from '@/lib/types'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function emptyWH(staffId: string): WorkingHours[] {
  return Array.from({ length: 7 }, (_, i) => ({
    id: '', staff_id: staffId, day_of_week: i,
    start_time: '09:00', end_time: '18:00', is_working: i >= 1 && i <= 5,
  }))
}

export default function StaffPage() {
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [services,  setServices]  = useState<Service[]>([])
  const [loading,   setLoading]   = useState(true)
  const [editing,   setEditing]   = useState<Staff | null>(null)
  const [isNew,     setIsNew]     = useState(false)
  const [wh,        setWH]        = useState<WorkingHours[]>([])
  const [assigned,  setAssigned]  = useState<string[]>([])
  const [form,      setForm]      = useState({ name: '', email: '', bio: '', photo_url: '' })
  const [saving,    setSaving]    = useState(false)

  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const [{ data: s }, { data: sv }] = await Promise.all([
        supabase.from('staff').select('*').order('created_at'),
        supabase.from('services').select('*').order('name'),
      ])
      setStaffList(s || [])
      setServices(sv || [])
      setLoading(false)
    }
    load()
  }, [])

  async function openEdit(s: Staff) {
    setEditing(s); setIsNew(false)
    setForm({ name: s.name, email: s.email, bio: s.bio || '', photo_url: s.photo_url || '' })
    const [{ data: whData }, { data: ssData }] = await Promise.all([
      supabase.from('working_hours').select('*').eq('staff_id', s.id).order('day_of_week'),
      supabase.from('staff_services').select('service_id').eq('staff_id', s.id),
    ])
    setWH(whData?.length ? whData : emptyWH(s.id))
    setAssigned((ssData || []).map((r: any) => r.service_id))
  }

  function openNew() {
    setEditing(null); setIsNew(true)
    setForm({ name: '', email: '', bio: '', photo_url: '' })
    setWH(emptyWH('new'))
    setAssigned([])
  }

  async function save() {
    setSaving(true)
    let staffId = editing?.id

    if (isNew) {
      const { data, error } = await supabase.from('staff').insert({
        name: form.name, email: form.email, bio: form.bio || null, photo_url: form.photo_url || null,
      }).select().single()
      if (error) { alert(error.message); setSaving(false); return }
      staffId = data.id
      setStaffList(sl => [...sl, data])
    } else if (editing) {
      await supabase.from('staff').update({
        name: form.name, email: form.email, bio: form.bio || null, photo_url: form.photo_url || null,
      }).eq('id', editing.id)
      setStaffList(sl => sl.map(s => s.id === editing.id ? { ...s, ...form } : s))
    }

    if (!staffId) { setSaving(false); return }

    // Save working hours
    await supabase.from('working_hours').delete().eq('staff_id', staffId)
    await supabase.from('working_hours').insert(
      wh.map(w => ({ staff_id: staffId, day_of_week: w.day_of_week, start_time: w.start_time, end_time: w.end_time, is_working: w.is_working }))
    )

    // Save service assignments
    await supabase.from('staff_services').delete().eq('staff_id', staffId)
    if (assigned.length) {
      await supabase.from('staff_services').insert(assigned.map(svcId => ({ staff_id: staffId, service_id: svcId })))
    }

    setSaving(false)
    setEditing(null)
    setIsNew(false)
  }

  async function deleteStaff(id: string) {
    if (!confirm('Delete this staff member? All their bookings will be affected.')) return
    await supabase.from('staff').delete().eq('id', id)
    setStaffList(sl => sl.filter(s => s.id !== id))
    if (editing?.id === id) { setEditing(null); setIsNew(false) }
  }

  const showForm = isNew || !!editing

  return (
    <div style={{ display: 'grid', gridTemplateColumns: showForm ? '1fr 420px' : '1fr', gap: 24 }}>
      {/* Staff list */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 26, fontFamily: 'var(--font-heading-hy)', color: 'var(--primary)', marginBottom: 4 }}>Staff</h1>
            <p style={{ color: 'var(--text-light)', fontSize: 14 }}>Manage doctors and their schedules</p>
          </div>
          <button onClick={openNew} className="btn btn-primary" style={{ fontSize: 14, padding: '10px 20px' }}>+ Add Staff</button>
        </div>

        {loading ? <p style={{ color: 'var(--text-light)' }}>Loading…</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {staffList.map(s => (
              <div key={s.id} style={{
                background: 'white', borderRadius: 12, padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,.06)',
                border: editing?.id === s.id ? '2px solid var(--accent)' : '2px solid transparent',
                display: 'flex', alignItems: 'center', gap: 16,
              }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--section-bg)', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'var(--primary)', flexShrink: 0 }}>
                  {s.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary)' }}>{s.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-light)' }}>{s.email}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => openEdit(s)} style={{ background: 'var(--section-bg)', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: 'var(--primary)' }}>Edit</button>
                  <button onClick={() => deleteStaff(s.id)} style={{ background: '#fee2e2', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#dc2626' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit/Add panel */}
      {showForm && (
        <div style={{ background: 'white', borderRadius: 12, padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,.06)', height: 'fit-content', position: 'sticky', top: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)' }}>{isNew ? 'Add Staff' : 'Edit Staff'}</h2>
            <button onClick={() => { setEditing(null); setIsNew(false) }} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--text-light)' }}>×</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="form-group">
              <label>Full name</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={2} />
            </div>
            <div className="form-group">
              <label>Photo URL (optional)</label>
              <input type="url" value={form.photo_url} onChange={e => setForm(f => ({ ...f, photo_url: e.target.value }))} placeholder="https://..." />
            </div>

            {/* Working hours */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, marginTop: 4 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Working Hours</h3>
              {wh.map((w, i) => (
                <div key={w.day_of_week} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <input
                    type="checkbox" checked={w.is_working}
                    onChange={e => setWH(prev => prev.map((x, j) => j === i ? { ...x, is_working: e.target.checked } : x))}
                    style={{ accentColor: 'var(--accent)', width: 16, height: 16 }}
                  />
                  <span style={{ fontSize: 13, fontWeight: 600, width: 32 }}>{DAYS[w.day_of_week]}</span>
                  <input
                    type="time" value={w.start_time}
                    disabled={!w.is_working}
                    onChange={e => setWH(prev => prev.map((x, j) => j === i ? { ...x, start_time: e.target.value } : x))}
                    style={{ flex: 1, padding: '4px 6px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, background: w.is_working ? 'var(--bg)' : '#f5f5f5' }}
                  />
                  <span style={{ fontSize: 11, color: 'var(--text-light)' }}>–</span>
                  <input
                    type="time" value={w.end_time}
                    disabled={!w.is_working}
                    onChange={e => setWH(prev => prev.map((x, j) => j === i ? { ...x, end_time: e.target.value } : x))}
                    style={{ flex: 1, padding: '4px 6px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, background: w.is_working ? 'var(--bg)' : '#f5f5f5' }}
                  />
                </div>
              ))}
            </div>

            {/* Services */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Assigned Services</h3>
              {services.map(svc => (
                <label key={svc.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={assigned.includes(svc.id)}
                    onChange={e => setAssigned(a => e.target.checked ? [...a, svc.id] : a.filter(id => id !== svc.id))}
                    style={{ accentColor: 'var(--accent)', width: 16, height: 16 }}
                  />
                  <span style={{ fontSize: 14 }}>{svc.name}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-light)', marginLeft: 'auto' }}>{svc.duration_minutes} min</span>
                </label>
              ))}
            </div>

            <button onClick={save} className="btn btn-primary" style={{ justifyContent: 'center', marginTop: 8 }} disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
