import BookingWidget from '@/components/booking/BookingWidget'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Grantsvel Entdunutyun — Dental Art Yerevan',
  description: 'Grancek dzer arratchin entdunutyunə Dental Art Yerevan-um.',
}

export default function BookPage() {
  return (
    <main style={{ paddingTop: '80px', minHeight: '100vh', background: 'var(--section-bg)' }}>
      <div className="container" style={{ paddingTop: '60px', paddingBottom: '80px' }}>

        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="section-label">Zhamadrutyun</span>
          <h1 style={{
            fontSize: 'clamp(26px, 3vw, 38px)',
            color: 'var(--primary)',
            marginBottom: '10px',
            fontFamily: 'var(--font-heading-hy)',
            lineHeight: 1.25,
          }}>
            Grantsvel Entdunutyun
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--text-light)' }}>
            Lracrek mez masin dzez harchelov amssativer ev zham
          </p>
        </div>

        <div style={{
          background: 'var(--white)',
          borderRadius: 'var(--radius)',
          padding: '40px 36px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <BookingWidget />
        </div>

      </div>
    </main>
  )
}
