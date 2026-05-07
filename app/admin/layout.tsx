'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const NAV_ICONS: Record<string, React.ReactNode> = {
  '/admin/dashboard': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
    </svg>
  ),
  '/admin/calendar': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  '/admin/staff': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  '/admin/services': (
    <svg width="16" height="16" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <path d="M16 3C11 3 7 7 7 12c0 2.5.8 5.2 2.2 7.8L12 28h8l2.8-8.2C24.2 17.2 25 14.5 25 12c0-5-4-9-9-9z"/>
      <path d="M13 12c0-1.7 1.3-3 3-3s3 1.3 3 3" strokeLinecap="round"/>
    </svg>
  ),
  '/admin/settings': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
}

const NAV = [
  { href: '/admin/dashboard', label: 'Dashboard'  },
  { href: '/admin/calendar',  label: 'Calendar'   },
  { href: '/admin/staff',     label: 'Staff'      },
  { href: '/admin/services',  label: 'Services'   },
  { href: '/admin/settings',  label: 'Settings'   },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()

  async function logout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f8f6' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220,
        background: 'var(--primary)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 100,
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid rgba(255,255,255,.1)' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'white', textDecoration: 'none' }}>
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" style={{ color: 'var(--accent)' }}>
              <path d="M16 3C11 3 7 7 7 12c0 2.5.8 5.2 2.2 7.8L12 28h8l2.8-8.2C24.2 17.2 25 14.5 25 12c0-5-4-9-9-9z" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinejoin="round"/>
              <path d="M13 12c0-1.7 1.3-3 3-3s3 1.3 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            <span style={{ fontFamily: 'var(--font-brand)', fontSize: 16 }}>Dental Art</span>
          </Link>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginTop: 4 }}>Admin Panel</p>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 12px' }}>
          {NAV.map(({ href, label }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 8,
                  marginBottom: 2,
                  fontSize: 14,
                  fontWeight: active ? 600 : 400,
                  color: active ? 'var(--accent)' : 'rgba(255,255,255,.75)',
                  background: active ? 'rgba(201,169,110,.12)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all .2s',
                }}
              >
                <span style={{ opacity: active ? 1 : 0.6, flexShrink: 0 }}>{NAV_ICONS[href]}</span>
                {label}
              </Link>
            )
          })}
        </nav>

        {/* View site + Logout */}
        <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,.1)' }}>
          <Link href="/" target="_blank" style={{
            display: 'block', padding: '8px 12px', fontSize: 13,
            color: 'rgba(255,255,255,.5)', textDecoration: 'none', borderRadius: 8,
            marginBottom: 4,
          }}>
            ↗ View site
          </Link>
          <button
            onClick={logout}
            style={{
              width: '100%', textAlign: 'left', padding: '8px 12px',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,.5)', fontSize: 13, borderRadius: 8,
            }}
          >
            ← Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: 220, flex: 1, padding: '32px 36px', minWidth: 0 }}>
        {children}
      </main>
    </div>
  )
}
