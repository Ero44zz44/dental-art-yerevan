'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import type { Service } from '@/lib/types'

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading,  setLoading]  = useState(true)
  const [editing,  setEditing]  = useState<Service | null>(null)
  const [isNew,    setIsNew]    = useState(false)
  const [form,     setForm]     = useState({ name: '', duration_minutes: 30, price: 0, description: '' })
  const [saving,   setSaving]   = useState(false)

  const supabase = createClient()

  useEffect(() => {
    supabase.from('services').select('*').order('created_at').then(({ data }) => {
      setServices(data || [])
      setLoading(false)
    })
  }, [])

  function openEdit(s: Service) {
    setEditing(s); setIsNew(false)
    setForm({ name: s.name, duration_minutes: s.duration_minutes, price: s.price, description: s.description || '' })
  }

  function openNew() {
    setEditing(null); setIsNew(true)
    setForm({ name: '', duration_minutes: 30, price: 0, description: '' })
  }

  async function save() {
    setSaving(true)
    if (isNew) {
      const { data } = await supabase.from('services').insert(form).select().single()
      if (data) setServices(sv => [...sv, data])
    } else if (editing) {
      await supabase.from('services').update(form).eq('id', editing.id)
      setServices(sv => sv.map(s => s.id === editing.id ? { ...s, ...form } : s))
    }
    setSaving(false)
    setEditing(null); setIsNew(false)
  }

  async function deleteService(id: string) {
    if (!confirm('Delete this service?')) return
    await supabase.from('services').delete().eq('id', id)
    setServices(sv => sv.filter(s => s.id !== id))
    if (editing?.id === id) { setEditing(null); setIsNew(false) }
  }

  const showForm = isNew || !!editing

  return (
    <div style={{ display: 'grid', gridTemplateColumns: showForm ? '1fr 360px' : '1fr', gap: 24 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 26, fontFamily: 'var(--font-heading-hy)', color: 'var(--primary)', marginBottom: 4 }}>Services</h1>
            <p style={{ color: 'var(--text-light)', fontSize: 14 }}>Manage your service catalog</p>
          </div>
          <button onClick={openNew} className="btn btn-primary" style={{ fontSize: 14, padding: '10px 20px' }}>+ Add Service</button>
        </div>

        {loading ? <p style={{ color: 'var(--text-light)' }}>Loading…</p> : (
          <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,.06)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Service', 'Duration', 'Price', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {services.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #f0efeb', background: editing?.id === s.id ? 'rgba(201,169,110,.04)' : 'transparent' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary)' }}>{s.name}</div>
                      {s.description && <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 2 }}>{s.description}</div>}
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: 14 }}>
                      <span style={{ background: 'rgba(201,169,110,.1)', color: 'var(--accent)', padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>{s.duration_minutes} min</span>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: 15, fontWeight: 700, color: 'var(--primary)' }}>
                      {s.price.toLocaleString()} AMD
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => openEdit(s)} style={{ background: 'var(--section-bg)', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: 'var(--primary)' }}>Edit</button>
                        <button onClick={() => deleteService(s.id)} style={{ background: '#fee2e2', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#dc2626' }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div style={{ background: 'white', borderRadius: 12, padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,.06)', height: 'fit-content', position: 'sticky', top: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)' }}>{isNew ? 'Add Service' : 'Edit Service'}</h2>
            <button onClick={() => { setEditing(null); setIsNew(false) }} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--text-light)' }}>×</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label>Service name</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>Duration (min)</label>
                <input type="number" min="5" step="5" value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: Number(e.target.value) }))} required />
              </div>
              <div className="form-group">
                <label>Price (AMD)</label>
                <input type="number" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} required />
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
            </div>
            <button onClick={save} className="btn btn-primary" style={{ justifyContent: 'center' }} disabled={saving}>
              {saving ? 'Saving…' : 'Save Service'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
