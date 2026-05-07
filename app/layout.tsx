import type { Metadata } from 'next'
import './globals.css'
import SiteShell from '@/components/SiteShell'
import Providers from '@/components/Providers'

export const metadata: Metadata = {
  title: 'Dental Art Yerevan — Ատամնաբուժական Կլինիկա',
  description: 'Ժամանակակից ատամնաբուժական կամք Երևանի սրտում։ Modern dental care in the heart of Yerevan.',
  openGraph: {
    title: 'Dental Art Yerevan',
    description: 'Modern dental care in the heart of Yerevan.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hy">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Noto+Sans+Armenian:wght@400;500;600;700&family=Noto+Serif+Armenian:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          <SiteShell>
            {children}
          </SiteShell>
        </Providers>
      </body>
    </html>
  )
}
