'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BUSINESS } from '@/lib/config'
import { useTranslation } from '@/contexts/LanguageContext'
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useReducedMotion,
  useInView,
} from 'framer-motion'

const SERVICE_IMAGES = [
  '/services/teeth-cleaning.png',
  '/services/teeth-whitening.png',
  '/services/implants.png',
  '/services/orthodontics.png',
  '/services/veneers.png',
  '/services/emergency.png',
]

/* ─── Shared variants ─────────────────────────────── */
const EASE_OUT = [0.16, 1, 0.3, 1] as [number, number, number, number]

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_OUT },
  },
}

const staggerGrid = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

/* ─── Animated headline: word-by-word stagger ─────── */
function AnimatedHeadline({ text, className }: { text: string; className: string }) {
  const shouldReduce = useReducedMotion()
  const words = text.split(' ')

  if (shouldReduce) return <h1 className={className}>{text}</h1>

  return (
    <motion.h1
      className={className}
      initial="hidden"
      animate="visible"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } } }}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          style={{ display: 'inline-block', marginRight: '0.28em' }}
          variants={{
            hidden: { opacity: 0, y: 44, rotateX: -20 },
            visible: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
          }}
        >
          {word}
        </motion.span>
      ))}
    </motion.h1>
  )
}

/* ─── Magnetic button wrapper ─────────────────────── */
function MagneticWrap({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 280, damping: 22 })
  const springY = useSpring(y, { stiffness: 280, damping: 22 })

  function onMove(e: React.MouseEvent) {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    x.set((e.clientX - r.left - r.width / 2) * 0.28)
    y.set((e.clientY - r.top - r.height / 2) * 0.28)
  }

  function onLeave() {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY, display: 'inline-block' }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </motion.div>
  )
}

/* ─── Service card with cursor spotlight ─────────── */
function SpotlightCard({ children }: { children: React.ReactNode }) {
  function onMove(e: React.MouseEvent<HTMLElement>) {
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - r.left}px`)
    el.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  return (
    <motion.article
      className="service-card"
      onMouseMove={onMove}
      variants={fadeUp}
    >
      {children}
    </motion.article>
  )
}

/* ─── Infinite testimonial marquee ───────────────── */
function TestimonialMarquee({ items }: { items: Array<{ text: string; name: string; role: string }> }) {
  const shouldReduce = useReducedMotion()
  const repeated = [...items, ...items, ...items, ...items]
  const half = repeated.slice(0, repeated.length / 2)
  const wrapRef = useRef<HTMLDivElement>(null)

  function pause() {
    wrapRef.current?.querySelectorAll<HTMLElement>('.testimonials-marquee-row').forEach(r => {
      r.style.animationPlayState = 'paused'
    })
  }
  function resume() {
    wrapRef.current?.querySelectorAll<HTMLElement>('.testimonials-marquee-row').forEach(r => {
      r.style.animationPlayState = 'running'
    })
  }

  function Card({ item }: { item: (typeof items)[number] }) {
    return (
      <article className="testimonial-card">
        <div className="testimonial-stars" aria-hidden="true">
          {[...Array(5)].map((_, s) => (
            <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
        </div>
        <p className="testimonial-text">{item.text}</p>
        <div className="testimonial-author">
          <div className="testimonial-avatar" aria-hidden="true">{item.name.charAt(0)}</div>
          <div>
            <p className="testimonial-name">{item.name}</p>
            <p className="testimonial-role">{item.role}</p>
          </div>
        </div>
      </article>
    )
  }

  if (shouldReduce) {
    return (
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {items.map((item, i) => <Card key={i} item={item} />)}
        </div>
      </div>
    )
  }

  return (
    <div
      ref={wrapRef}
      className="testimonials-marquee"
      aria-label="Patient testimonials"
      onTouchStart={pause}
      onTouchEnd={resume}
    >
      <div className="testimonials-marquee-row testimonials-marquee-row--left">
        {repeated.map((item, i) => <Card key={i} item={item} />)}
      </div>
      <div className="testimonials-marquee-row testimonials-marquee-row--right">
        {[...half.slice(2), ...half, ...half.slice(0, 2)].map((item, i) => <Card key={i} item={item} />)}
      </div>
    </div>
  )
}

/* ─── Contact form ────────────────────────────────── */
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
              <input type="text" id="f-name" name="name" placeholder={t.form.namePh}
                value={fields.name} onChange={e => setFields(f => ({ ...f, name: e.target.value }))}
                style={errors.name ? { borderColor: '#e05555' } : {}} required autoComplete="name" />
            </div>
            <div className="form-group">
              <label htmlFor="f-phone">{t.form.phone}</label>
              <input type="tel" id="f-phone" name="phone" placeholder={t.form.phonePh}
                value={fields.phone} onChange={e => setFields(f => ({ ...f, phone: e.target.value }))} autoComplete="tel" />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="f-email">{t.form.email}</label>
            <input type="email" id="f-email" name="email" placeholder={t.form.emailPh}
              value={fields.email} onChange={e => setFields(f => ({ ...f, email: e.target.value }))}
              style={errors.email ? { borderColor: '#e05555' } : {}} required autoComplete="email" />
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
            <textarea id="f-message" name="message" placeholder={t.form.messagePh} rows={4}
              value={fields.message} onChange={e => setFields(f => ({ ...f, message: e.target.value }))} />
          </div>
          <div className="consent-group" style={errors.consent ? { outline: '2px solid #e05555', outlineOffset: 4, borderRadius: 4 } : {}}>
            <input type="checkbox" id="f-consent" name="consent"
              checked={fields.consent} onChange={e => setFields(f => ({ ...f, consent: e.target.checked }))} required />
            <label htmlFor="f-consent">{t.form.consent}</label>
          </div>
          <button type="submit" className="btn btn-primary form-submit-btn">{t.form.submit}</button>
        </form>
      ) : (
        <div className="form-success show" aria-live="polite">
          <div className="success-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h3>{t.form.successTitle}</h3>
          <p>{t.form.successText}</p>
        </div>
      )}
    </div>
  )
}

/* ─── Animated stat number ────────────────────────── */
function StatNumber({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })
  const match = value.match(/^(\d+)(.*)$/)
  const end = match ? parseInt(match[1]!, 10) : 0
  const suffix = match ? (match[2] ?? '') : value

  const count = useMotionValue(0)
  const rounded = useTransform(count, v => Math.round(v))
  const spring = useSpring(count, { stiffness: 50, damping: 20 })
  const display = useTransform(spring, v => `${Math.round(v)}${suffix}`)

  if (isInView && count.get() === 0) {
    count.set(end)
  }

  if (!match) return <span className="why-card-num" ref={ref}>{value}</span>

  return (
    <motion.span className="why-card-num" ref={ref}>
      {display}
    </motion.span>
  )
}

/* ─── Main page ───────────────────────────────────── */
export default function HomePage() {
  const { t } = useTranslation()
  const shouldReduce = useReducedMotion()

  const heroRef = useRef<HTMLElement>(null)
  const aboutRef = useRef<HTMLElement>(null)

  /* One useScroll gives us both the page scrollY and the about-section progress */
  const { scrollYProgress: aboutScroll, scrollY: pageScrollY } = useScroll({
    target: aboutRef,
    offset: ['start end', 'end start'],
  })
  const imageParallax = useTransform(aboutScroll, [0, 1], shouldReduce ? [0, 0] : [-28, 28])

  /* Floating CTA — pure motion values, zero React re-renders on scroll */
  const floatOpacity = useTransform(pageScrollY, [400, 520], [0, 1])
  const floatY = useTransform(pageScrollY, [400, 520], [20, 0])
  const floatPointer = useTransform(pageScrollY, v => v > 480 ? 'auto' : 'none')

  const vp = { once: true, margin: '-20px' as const, amount: 0.1 as const }

  return (
    <main>
      {/* ── HERO ──────────────────────────────────── */}
      <section id="hero" ref={heroRef}>
        <video
          className="hero-video-bg"
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          preload="metadata"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        <div className="hero-deco-1" aria-hidden="true" />
        <div className="hero-deco-2" aria-hidden="true" />
        <div className="container">
          <div className="hero-layout">
            {/* Content */}
            <div className="hero-content">
              <motion.div
                className="hero-eyebrow"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="hero-eyebrow-line" />
                <span className="hero-eyebrow-text">Dental Art Yerevan</span>
              </motion.div>

              <AnimatedHeadline text={t.hero.headline} className="hero-headline" />

              <motion.p
                className="hero-sub"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45, ease: 'easeOut' }}
              >
                {t.hero.sub}
              </motion.p>

              <motion.div
                className="hero-ctas"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6, type: 'spring', stiffness: 300, damping: 24 }}
              >
                <MagneticWrap>
                  <Link href="/book" className="btn btn-primary">{t.hero.cta}</Link>
                </MagneticWrap>
                <MagneticWrap>
                  <Link href="/#services" className="btn btn-outline">{t.hero.ctaServices}</Link>
                </MagneticWrap>
              </motion.div>

              <motion.div
                className="hero-stats"
                aria-hidden="true"
                initial="hidden"
                animate="visible"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.75 } } }}
              >
                {[
                  { num: '15+', label: t.hero.statYears },
                  { num: '3 000+', label: t.hero.statPatients },
                  { num: '6', label: t.hero.statServices },
                ].map((stat, i) => (
                  <motion.div key={i} style={{ display: 'contents' }} variants={fadeUp}>
                    {i > 0 && <div className="hero-stat-divider" />}
                    <div className="hero-stat">
                      <span className="hero-stat-num">{stat.num}</span>
                      <span className="hero-stat-label">{stat.label}</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Hero image */}
            <motion.div
              className="hero-image-wrap"
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <Image
                src="/hero-image.png"
                alt="Dental Art Yerevan — professional dental care"
                width={1433}
                height={1920}
                priority
                quality={90}
                sizes="(max-width:768px) 100vw, (max-width:1280px) 55vw, 720px"
                style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── INFO BAR ──────────────────────────────── */}
      <motion.div
        className="info-bar"
        initial="hidden"
        whileInView="visible"
        viewport={vp}
        variants={staggerGrid}
      >
        <div className="container">
          <div className="info-bar-grid">
            {[
              {
                icon: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 5.47 5.47l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />,
                title: t.infoBar.callTitle,
                content: <><p><a href={BUSINESS.phoneHref}>{BUSINESS.phone}</a></p><p><a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a></p></>,
              },
              {
                icon: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
                title: t.infoBar.hoursTitle,
                content: <><p>{t.infoBar.weekdays}</p><p>{t.infoBar.saturday}</p><p>{t.infoBar.sunday}</p></>,
              },
              {
                icon: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
                title: t.infoBar.servicesTitle,
                content: <><p>{t.infoBar.servicesSub}</p><Link href="/#services">{t.infoBar.servicesLink}</Link></>,
              },
            ].map((card, i) => (
              <motion.div className="info-card" key={i} variants={fadeUp}>
                <div className="info-card-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {card.icon}
                  </svg>
                </div>
                <div className="info-card-text">
                  <h4>{card.title}</h4>
                  {card.content}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── WHY US ────────────────────────────────── */}
      <section id="why-us">
        <div className="container">
          <motion.div
            className="section-header"
            initial="hidden" whileInView="visible" viewport={vp}
            variants={fadeUp}
          >
            <span className="section-label">{t.whyUs.label}</span>
            <h2>{t.whyUs.heading}</h2>
          </motion.div>

          <motion.div
            className="why-grid"
            initial="hidden" whileInView="visible" viewport={vp}
            variants={staggerGrid}
          >
            {t.whyUs.items.map((item, i) => (
              <motion.div className="why-card" key={i} variants={fadeUp}>
                <StatNumber value={item.num} />
                <h3>{item.label}</h3>
                <p>{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── SERVICES ──────────────────────────────── */}
      <section id="services">
        <div className="container">
          <motion.div
            className="section-header section-header--left"
            initial="hidden" whileInView="visible" viewport={vp}
            variants={fadeUp}
          >
            <h2>{t.servicesSection.heading}</h2>
            <p>{t.servicesSection.sub}</p>
          </motion.div>

          <motion.div
            className="services-grid"
            initial="hidden" whileInView="visible" viewport={vp}
            variants={staggerGrid}
          >
            {t.services.map((svc, i) => (
              <SpotlightCard key={i}>
                <div className="service-card-image">
                  {SERVICE_IMAGES[i] ? (
                    <Image
                      src={SERVICE_IMAGES[i]!}
                      alt={svc.title}
                      fill
                      loading="lazy"
                      quality={90}
                      sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 420px"
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="service-card-image-placeholder">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
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
                      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                    </svg>
                  </Link>
                </div>
              </SpotlightCard>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── ABOUT ─────────────────────────────────── */}
      <section id="about" ref={aboutRef}>
        <div className="container">
          <div className="about-grid">
            <motion.div
              className="about-image-wrap"
              style={{ y: imageParallax }}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={vp}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <Image
                src="/doctor-armen.png"
                alt="Dr. Armen Hakobyan"
                width={1433}
                height={1920}
                quality={90}
                sizes="(max-width:768px) 100vw, (max-width:1280px) 50vw, 600px"
                style={{ width: '100%', height: 'auto', borderRadius: 'var(--radius)', display: 'block' }}
              />
            </motion.div>

            <motion.div
              className="about-text"
              initial="hidden" whileInView="visible" viewport={vp}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } } }}
            >
              <motion.h2 variants={fadeUp}>{t.about.doctorName}</motion.h2>
              <motion.p className="doctor-title" variants={fadeUp}>{t.about.doctorTitle}</motion.p>
              <motion.div className="about-credentials" variants={fadeUp}>
                <span className="about-credential-pill">15+ {t.hero.statYears}</span>
                <span className="about-credential-pill">3 000+ {t.hero.statPatients}</span>
                <span className="about-credential-pill">Yerevan, Armenia</span>
              </motion.div>
              <motion.p className="bio" variants={fadeUp}>{t.about.bio}</motion.p>
              <motion.blockquote className="about-quote" variants={fadeUp}>
                <p>{t.about.quote}</p>
              </motion.blockquote>
              <motion.div variants={fadeUp}>
                <MagneticWrap>
                  <Link href="/book" className="btn btn-primary">{t.about.cta}</Link>
                </MagneticWrap>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────── */}
      <section id="testimonials">
        <div className="container">
          <motion.div
            className="section-header"
            initial="hidden" whileInView="visible" viewport={vp}
            variants={fadeUp}
          >
            <span className="section-label">{t.testimonials.label}</span>
            <h2>{t.testimonials.heading}</h2>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={vp}
          transition={{ duration: 0.8 }}
        >
          <TestimonialMarquee items={t.testimonials.items} />
        </motion.div>
      </section>

      {/* ── CONTACT ───────────────────────────────── */}
      <section id="contact">
        <div className="container">
          <div className="contact-grid">
            <motion.div
              className="contact-info"
              initial="hidden" whileInView="visible" viewport={vp}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.09 } } }}
            >
              <motion.span className="section-label" variants={fadeUp}>{t.contact.label}</motion.span>
              <motion.h2 variants={fadeUp}>{t.contact.heading}</motion.h2>
              <motion.p className="contact-sub" variants={fadeUp}>{t.contact.sub}</motion.p>
              <motion.div className="contact-details" variants={fadeUp}>
                <div className="contact-item">
                  <div className="contact-item-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div className="contact-item-text">
                    <p>{t.contact.addressLabel}</p>
                    <span>{t.contact.address}</span>
                  </div>
                </div>
                <div className="contact-item">
                  <div className="contact-item-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 5.47 5.47l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
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
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <div className="contact-item-text">
                    <p>Email</p>
                    <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>
                  </div>
                </div>
              </motion.div>
              <motion.div className="map-wrap" variants={fadeUp}>
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
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={vp}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <ContactForm />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FLOATING MOBILE CTA ───────────────────── */}
      <motion.div
        className="floating-book-btn"
        style={{ opacity: floatOpacity, y: floatY, pointerEvents: floatPointer }}
        aria-hidden="true"
      >
        <Link href="/book" className="btn btn-primary">
          {t.header.book}
        </Link>
      </motion.div>
    </main>
  )
}
