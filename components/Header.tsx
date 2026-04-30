'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { BUSINESS } from '@/lib/config'
import { useTranslation } from '@/contexts/LanguageContext'
import type { Lang } from '@/lib/translations'

const LANGS: { code: Lang; label: string }[] = [
  { code: 'hy', label: 'ՀՅ' },
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
]

export default function Header() {
  const { t, lang, setLang } = useTranslation()
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const headerRef = useRef<HTMLElement>(null)

  const NAV = [
    { href: '/#hero',     label: t.nav.home },
    { href: '/#services', label: t.nav.services },
    { href: '/#about',    label: t.nav.about },
    { href: '/#contact',  label: t.nav.contact },
  ]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && menuOpen) setMenuOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [menuOpen])

  return (
    <>
      <header id="site-header" ref={headerRef} className={scrolled ? 'scrolled' : ''}>
        <div className="container header-inner">

          <Link href="/" className="logo" aria-label="Dental Art Yerevan">
            <svg className="logo-icon" width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <path d="M16 3C11 3 7 7 7 12c0 2.5.8 5.2 2.2 7.8L12 28h8l2.8-8.2C24.2 17.2 25 14.5 25 12c0-5-4-9-9-9z" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinejoin="round"/>
              <path d="M13 12c0-1.7 1.3-3 3-3s3 1.3 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            <span className="brand-name">Dental Art</span>
          </Link>

          <nav className="site-nav" aria-label="Primary navigation">
            <ul className="nav-list">
              {NAV.map(({ href, label }) => (
                <li key={href}><Link href={href}>{label}</Link></li>
              ))}
            </ul>
          </nav>

          <div className="header-right">
            {/* Language switcher */}
            <div className="lang-switcher" role="group" aria-label="Language">
              {LANGS.map(({ code, label }) => (
                <button
                  key={code}
                  onClick={() => setLang(code)}
                  className={`lang-btn${lang === code ? ' lang-btn--active' : ''}`}
                  aria-pressed={lang === code}
                >
                  {label}
                </button>
              ))}
            </div>

            <a className="header-phone" href={BUSINESS.phoneHref}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 5.47 5.47l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              {BUSINESS.phone}
            </a>
            <Link href="/book" className="btn btn-primary btn-book-header">
              {t.header.book}
            </Link>
          </div>

          <button
            className="hamburger"
            id="hamburger-btn"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen(true)}
          >
            <span /><span /><span />
          </button>
        </div>
      </header>

      <div
        className={`mobile-menu-overlay${menuOpen ? ' open' : ''}`}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        <button className="mobile-close" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* Mobile language switcher */}
        <div className="lang-switcher lang-switcher--mobile" role="group" aria-label="Language">
          {LANGS.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => setLang(code)}
              className={`lang-btn${lang === code ? ' lang-btn--active' : ''}`}
              aria-pressed={lang === code}
            >
              {label}
            </button>
          ))}
        </div>

        <nav>
          <ul className="nav-list">
            {NAV.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <Link href="/book" className="btn btn-primary mobile-nav-link" onClick={() => setMenuOpen(false)}>
          {t.header.book}
        </Link>
      </div>
    </>
  )
}
