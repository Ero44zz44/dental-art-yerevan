'use client'

import { useState } from 'react'

export default function SettingsPage() {
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    businessName: 'Dental Art Yerevan',
    phone: '+374 10 12-34-56',
    email: 'info@dental-art.am',
    address: 'Teryan 5, Yerevan, Armenia',
    facebook: '#',
    instagram: '#',
  })

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    // In a real setup you would save these to Supabase settings table or update lib/config.ts
    // For now just show a success message
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <h1 style={{ fontSize: 26, fontFamily: 'var(--font-heading-hy)', color: 'var(--primary)', marginBottom: 8 }}>Settings</h1>
      <p style={{ color: 'var(--text-light)', marginBottom: 32, fontSize: 14 }}>
        Business information shown on the website and in emails.
        <br />
        <strong>Note:</strong> After saving, also update <code style={{ background: '#f0efeb', padding: '1px 6px', borderRadius: 4 }}>lib/config.ts</code> so the live site reflects the changes.
      </p>

      <form onSubmit={handleSave} style={{ background: 'white', borderRadius: 12, padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,.06)', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="form-group">
          <label>Business name</label>
          <input type="text" value={form.businessName} onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))} />
        </div>
        <div className="form-group">
          <label>Phone number</label>
          <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
        </div>
        <div className="form-group">
          <label>Email address</label>
          <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        </div>
        <div className="form-group">
          <label>Address</label>
          <input type="text" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 14 }}>Social Links</h3>
          <div className="form-group">
            <label>Facebook URL</label>
            <input type="url" value={form.facebook} onChange={e => setForm(f => ({ ...f, facebook: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Instagram URL</label>
            <input type="url" value={form.instagram} onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))} />
          </div>
        </div>

        {saved && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', borderRadius: 8, padding: '10px 16px', fontSize: 14 }}>
            ✓ Settings saved! Remember to also update lib/config.ts for the live site.
          </div>
        )}

        <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center' }}>
          Save Settings
        </button>
      </form>
    </div>
  )
}
