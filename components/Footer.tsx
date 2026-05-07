'use client'

import Link from 'next/link'
import { BUSINESS } from '@/lib/config'
import { useTranslation } from '@/contexts/LanguageContext'

export default function Footer() {
  const { t } = useTranslation()

  const NAV = [
    { href: '/#hero',     label: t.nav.home },
    { href: '/#services', label: t.nav.services },
    { href: '/#about',    label: t.nav.about },
    { href: '/#contact',  label: t.nav.contact },
    { href: '/book',      label: t.header.book },
  ]

  return (
    <footer>
      <div className="container">
        <div className="footer-grid">

          <div className="footer-brand">
            <Link href="/" className="logo" aria-label="Dental Art Yerevan">
              <svg className="logo-icon" width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <path d="M16 3C11 3 7 7 7 12c0 2.5.8 5.2 2.2 7.8L12 28h8l2.8-8.2C24.2 17.2 25 14.5 25 12c0-5-4-9-9-9z" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinejoin="round"/>
                <path d="M13 12c0-1.7 1.3-3 3-3s3 1.3 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
              <span className="brand-name">Dental Art</span>
            </Link>
            <p className="footer-desc">{t.footer.desc}</p>
            <div className="footer-social">
              <a href={BUSINESS.social.facebook} aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              <a href={BUSINESS.social.instagram} aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h4>{t.footer.quickLinks}</h4>
            <ul className="footer-links-list">
              {NAV.map(({ href, label }) => (
                <li key={href}><Link href={href}>{label}</Link></li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4>{t.footer.contact}</h4>
            <ul className="footer-contact-list">
              <li className="footer-contact-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <span>{t.contact.address}</span>
              </li>
              <li className="footer-contact-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 5.47 5.47l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <a href={BUSINESS.phoneHref}>{BUSINESS.phone}</a>
              </li>
              <li className="footer-contact-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>
              </li>
            </ul>
          </div>

        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-inner">
            <span>© {new Date().getFullYear()} Dental Art Yerevan. {t.footer.copyright}</span>
            <span>Yerevan, Armenia</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
