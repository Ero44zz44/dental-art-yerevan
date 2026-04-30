'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function AdminLogin() {
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (authError) {
      setError('Incorrect email or password. Please try again.')
      return
    }
    router.push('/admin/dashboard')
    router.refresh()
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--section-bg)',
      padding: '24px',
    }}>
      <div style={{
        background: 'var(--white)',
        borderRadius: 'var(--radius)',
        padding: '48px 40px',
        boxShadow: 'var(--shadow-md)',
        width: '100%',
        maxWidth: '400px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" style={{ color: 'var(--accent)' }}>
              <path d="M16 3C11 3 7 7 7 12c0 2.5.8 5.2 2.2 7.8L12 28h8l2.8-8.2C24.2 17.2 25 14.5 25 12c0-5-4-9-9-9z" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinejoin="round"/>
              <path d="M13 12c0-1.7 1.3-3 3-3s3 1.3 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            <span style={{ fontFamily: 'var(--font-brand)', fontSize: '20px', color: 'var(--primary)' }}>Dental Art</span>
          </div>
          <h1 style={{ fontSize: '22px', fontFamily: 'var(--font-heading-hy)', color: 'var(--primary)', marginBottom: 4 }}>Admin Panel</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-light)' }}>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email" type="email" autoComplete="email"
              value={email} onChange={e => setEmail(e.target.value)}
              required placeholder="admin@dental-art.am"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password" type="password" autoComplete="current-password"
              value={password} onChange={e => setPassword(e.target.value)}
              required placeholder="••••••••"
            />
          </div>

          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c',
              borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 14,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
