import BookingWidget from '@/components/booking/BookingWidget'
import { BUSINESS } from '@/lib/config'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Գրանցվել ընդունման — Dental Art Yerevan',
  description: 'Գրանցեք ձեր ընդունումը Dental Art Yerevan-ում: Առցանց, արագ և հեշտ:',
}

export default function BookPage() {
  return (
    <main className="book-page">

      {/* Dark hero header strip */}
      <div className="book-page-hero">
        <div className="container">
          <p className="book-page-eyebrow">Dental Art Yerevan</p>
          <h1 className="book-page-title">Գրանցվել ընդունման</h1>
          <div className="book-page-badges">
            <span className="book-page-badge">✓ 2 րոպե</span>
            <span className="book-page-badge">✓ Անմիջապես հաստատված</span>
            <span className="book-page-badge">✓ Անվճար չեղարկում</span>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="book-layout">

          {/* Main booking widget */}
          <div className="book-widget-wrap">
            <BookingWidget />
          </div>

          {/* Trust sidebar */}
          <aside className="book-aside">
            <div className="book-trust-card">
              <p className="book-trust-title">Ինչու՞ Dental Art</p>

              <div className="book-trust-item">
                <div className="book-trust-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <div className="book-trust-text">
                  <strong>15+ տարվա փորձ</strong>
                  Ավելի քան 3000 հաճախորդ
                </div>
              </div>

              <div className="book-trust-item">
                <div className="book-trust-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <div className="book-trust-text">
                  <strong>Աշխ. ժամեր</strong>
                  Երկ–Ուրբ: 09:00–19:00<br />
                  Շաբ: 10:00–15:00
                </div>
              </div>

              <div className="book-trust-item">
                <div className="book-trust-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 5.47 5.47l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </div>
                <div className="book-trust-text">
                  <strong>Կապ</strong>
                  <a href={BUSINESS.phoneHref} className="book-trust-phone">{BUSINESS.phone}</a>
                </div>
              </div>

              <div className="book-trust-divider" />

              <div className="book-trust-item">
                <div className="book-trust-icon book-trust-icon--shield">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <div className="book-trust-text">
                  <strong>Անվտանգ ամրագրում</strong>
                  Ձեր տվյալները պաշտպանված են
                </div>
              </div>
            </div>

            <div className="book-trust-card book-trust-card--accent">
              <p className="book-trust-accent-label">Շտապ օգնություն</p>
              <p className="book-trust-accent-text">Նույն օրվա ընդունման համար զանգահարեք</p>
              <a href={BUSINESS.phoneHref} className="book-call-btn">{BUSINESS.phone}</a>
            </div>
          </aside>

        </div>
      </div>
    </main>
  )
}
