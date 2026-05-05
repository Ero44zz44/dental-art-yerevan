'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BUSINESS } from '@/lib/config'
import { useTranslation } from '@/contexts/LanguageContext'

const SERVICE_IMAGES = [
  '/services/teeth-cleaning.png',
  '/services/teeth-whitening.png',
  '/services/implants.png',
  '/services/orthodontics.png',
  '/services/veneers.png',
  null, // replace with a photo when available
]

function ContactForm() {
  const { t } = useTranslation()
  const [submitted, setSubmitted] = useState(false)
  const [fields, setFields] = useState({ name: '', phone: '', email: '', service: '', message: '', consent: false })
  const [errors, setErrors] = useState<Record<string, boolean>>({})

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const newErrors: Record<string, boolean> = {}
    if (!fields.name.trim()) newErrors.name = true
    if (!fields.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) newErrors.email = true
    if (!fields.consent) newErrors.consent = true
    setErrors(newErrors)
    if (Object.keys(newErrors).length) return
    setSubmitted(true)
  }

  return (
    <div className="contact-form-wrap">
      {!submitted ? (
        <form id="contact-form" onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="f-name">{t.form.name}</label>
              <input
                type="text" id="f-name" name="name" placeholder={t.form.namePh}
                value={fields.name}
                onChange={e => setFields(f => ({ ...f, name: e.target.value }))}
                style={errors.name ? { borderColor: '#e05555' } : {}}
                required autoComplete="name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="f-phone">{t.form.phone}</label>
              <input
                type="tel" id="f-phone" name="phone" placeholder={t.form.phonePh}
                value={fields.phone}
                onChange={e => setFields(f => ({ ...f, phone: e.target.value }))}
                autoComplete="tel"
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="f-email">{t.form.email}</label>
            <input
              type="email" id="f-email" name="email" placeholder={t.form.emailPh}
              value={fields.email}
              onChange={e => setFields(f => ({ ...f, email: e.target.value }))}
              style={errors.email ? { borderColor: '#e05555' } : {}}
              required autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="f-service">{t.form.service}</label>
            <select id="f-service" name="service" value={fields.service} onChange={e => setFields(f => ({ ...f, service: e.target.value }))}>
              <option value="">{t.form.service}</option>
              {t.form.services.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="f-message">{t.form.message}</label>
            <textarea
              id="f-message" name="message" placeholder={t.form.messagePh} rows={4}
              value={fields.message}
              onChange={e => setFields(f => ({ ...f, message: e.target.value }))}
            />
          </div>
          <div
            className="consent-group"
            style={errors.consent ? { outline: '2px solid #e05555', outlineOffset: 4, borderRadius: 4 } : {}}
          >
            <input
              type="checkbox" id="f-consent" name="consent"
              checked={fields.consent}
              onChange={e => setFields(f => ({ ...f, consent: e.target.checked }))}
              required
            />
            <label htmlFor="f-consent">{t.form.consent}</label>
          </div>
          <button type="submit" className="btn btn-primary form-submit-btn">
            {t.form.submit}
          </button>
        </form>
      ) : (
        <div className="form-success show" aria-live="polite">
          <div className="success-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h3>{t.form.successTitle}</h3>
          <p>{t.form.successText}</p>
        </div>
      )}
    </div>
  )
}

export default function HomePage() {
  const { t } = useTranslation()
  const fadeRefs = useRef<HTMLElement[]>([])

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const els = fadeRefs.current

    if ('IntersectionObserver' in window && !prefersReduced) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible')
              observer.unobserve(entry.target)
            }
          })
        },
        { threshold: 0.1, rootMargin: '0px 0px -24px 0px' }
      )
      els.forEach((el, i) => {
        el.style.transitionDelay = `${(i % 3) * 0.08}s`
        observer.observe(el)
      })
      return () => observer.disconnect()
    } else {
      els.forEach(el => el.classList.add('visible'))
    }
  }, [])

  const addRef = (el: HTMLElement | null) => {
    if (el && !fadeRefs.current.includes(el)) fadeRefs.current.push(el)
  }

  return (
    <main>
      {/* ── HERO ─────────────────────────────────── */}
      <section id="hero">
        <div className="hero-deco-1" aria-hidden="true" />
        <div className="hero-deco-2" aria-hidden="true" />
        <div className="container">
          <div className="hero-layout">
            <div className="hero-content fade-in-up" ref={addRef}>
              <div className="hero-eyebrow">
                <div className="hero-eyebrow-line" />
                <span className="hero-eyebrow-text">Dental Art Yerevan</span>
              </div>
              <h1 className="hero-headline">{t.hero.headline}</h1>
              <p className="hero-sub">{t.hero.sub}</p>
              <div className="hero-ctas">
                <Link href="/book" className="btn btn-primary">{t.hero.cta}</Link>
                <Link href="/#services" className="btn btn-outline">{t.hero.ctaServices}</Link>
              </div>
              <div className="hero-stats" aria-hidden="true">
                <div className="hero-stat">
                  <span className="hero-stat-num">15+</span>
                  <span className="hero-stat-label">{t.hero.statYears}</span>
                </div>
                <div className="hero-stat-divider" />
                <div className="hero-stat">
                  <span className="hero-stat-num">3 000+</span>
                  <span className="hero-stat-label">{t.hero.statPatients}</span>
                </div>
                <div className="hero-stat-divider" />
                <div className="hero-stat">
                  <span className="hero-stat-num">6</span>
                  <span className="hero-stat-label">{t.hero.statServices}</span>
                </div>
              </div>
            </div>
            <div className="hero-image-wrap fade-in-up" ref={addRef}>
              <Image
                src="/hero-image.png"
                alt="Dental Art Yerevan — professional dental care"
                width={620}
                height={620}
                priority
                style={{ width: '100%', height: 'auto' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── INFO BAR ──────────────────────────────── */}
      <div className="info-bar">
        <div className="container">
          <div className="info-bar-grid">
            <div className="info-card fade-in-up" ref={addRef}>
              <div className="info-card-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 5.47 5.47l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <div className="info-card-text">
                <h4>{t.infoBar.callTitle}</h4>
                <p><a href={BUSINESS.phoneHref}>{BUSINESS.phone}</a></p>
                <p><a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a></p>
              </div>
            </div>

            <div className="info-card fade-in-up" ref={addRef}>
              <div className="info-card-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div className="info-card-text">
                <h4>{t.infoBar.hoursTitle}</h4>
                <p>{t.infoBar.weekdays}</p>
                <p>{t.infoBar.saturday}</p>
                <p>{t.infoBar.sunday}</p>
              </div>
            </div>

            <div className="info-card fade-in-up" ref={addRef}>
              <div className="info-card-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <div className="info-card-text">
                <h4>{t.infoBar.servicesTitle}</h4>
                <p>{t.infoBar.servicesSub}</p>
                <Link href="/#services">{t.infoBar.servicesLink}</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SERVICES ──────────────────────────────── */}
      <section id="services">
        <div className="container">
          <div className="section-header fade-in-up" ref={addRef}>
            <span className="section-label">{t.servicesSection.label}</span>
            <h2>{t.servicesSection.heading}</h2>
            <p>{t.servicesSection.sub}</p>
          </div>
          <div className="services-grid">
            {t.services.map((svc, i) => (
              <article className="service-card fade-in-up" key={i} ref={addRef}>
                <div className="service-card-image">
                  {SERVICE_IMAGES[i] ? (
                    <Image
                      src={SERVICE_IMAGES[i]!}
                      alt={svc.title}
                      fill
                      sizes="(max-width:768px) 100vw, (max-width:1024px) 50vw, 33vw"
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="service-card-image-placeholder">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="16"/>
                        <line x1="8" y1="12" x2="16" y2="12"/>
                      </svg>
                    </div>
                  )}
                </div>
                <div className="service-card-body">
                  <h3>{svc.title}</h3>
                  <p>{svc.desc}</p>
                  <Link href="/#contact" className="service-link">
                    {t.servicesSection.learnMore}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                      <polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ─────────────────────────────────── */}
      <section id="about">
        <div className="container">
          <div className="about-grid">
            <div className="about-image-wrap fade-in-up" ref={addRef}>
              <div className="doctor-placeholder">
                <span className="doctor-initials">ԱՀ</span>
              </div>
            </div>
            <div className="about-text fade-in-up" ref={addRef}>
              <span className="section-label">{t.about.label}</span>
              <h2>Dr. Armen Hakobyan</h2>
              <p className="doctor-title">{t.about.doctorTitle}</p>
              <p className="bio">{t.about.bio}</p>
              <blockquote className="about-quote">
                <p>{t.about.quote}</p>
              </blockquote>
              <Link href="/book" className="btn btn-primary">{t.about.cta}</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT ───────────────────────────────── */}
      <section id="contact">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-info fade-in-up" ref={addRef}>
              <span className="section-label">{t.contact.label}</span>
              <h2>{t.contact.heading}</h2>
              <p className="contact-sub">{t.contact.sub}</p>
              <div className="contact-details">
                <div className="contact-item">
                  <div className="contact-item-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div className="contact-item-text">
                    <p>{t.contact.addressLabel}</p>
                    <span>{BUSINESS.addressArm}</span>
                  </div>
                </div>
                <div className="contact-item">
                  <div className="contact-item-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 5.47 5.47l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  </div>
                  <div className="contact-item-text">
                    <p>{t.contact.callLabel}</p>
                    <a href={BUSINESS.phoneHref}>{BUSINESS.phone}</a>
                  </div>
                </div>
                <div className="contact-item">
                  <div className="contact-item-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <div className="contact-item-text">
                    <p>Email</p>
                    <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>
                  </div>
                </div>
              </div>
              <div className="map-wrap">
                <iframe
                  src={BUSINESS.mapSrc}
                  width="100%"
                  height="280"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Dental Art Yerevan location"
                />
              </div>
            </div>

            <ContactForm />
          </div>
        </div>
      </section>
    </main>
  )
}
