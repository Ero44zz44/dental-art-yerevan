import BookingWidget from '@/components/booking/BookingWidget'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Գրանցվել ընդունման — Dental Art Yerevan',
  description: 'Գրանցեք ձեր ընդունումը Dental Art Yerevan-ում: Առցանց, արագ և հեշտ:',
}

export default function BookPage() {
  return (
    <main style={{ paddingTop: '80px', minHeight: '100vh', background: 'var(--section-bg)' }}>
      <div className="container" style={{ paddingTop: '60px', paddingBottom: '80px' }}>
        <BookingWidget />
      </div>
    </main>
  )
}
