import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import WhatsAppFloat from '@/components/layout/WhatsAppFloat'
import CookieBanner from '@/components/layout/CookieBanner'
import ServiceWorkerRegister from '@/components/layout/ServiceWorkerRegister'
import CartProvider from '@/components/cart/CartProvider'
import CartDrawer from '@/components/cart/CartDrawer'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TouristAttraction',
  name: 'Acalanto Tours',
  description: 'Passeios de escuna em Paraty. Baías, ilhas e praias da Costa Verde.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://acalantotours.com.br',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Paraty',
    addressRegion: 'RJ',
    addressCountry: 'BR',
  },
  geo: { '@type': 'GeoCoordinates', latitude: -23.2197, longitude: -44.7142 },
  touristType: ['Turismo náutico', 'Passeio de barco', 'Turismo de natureza'],
  availableLanguage: ['Portuguese'],
}

export const metadata: Metadata = {
  title: {
    default: 'Acalanto Tours | Passeios de Escuna em Paraty',
    template: '%s | Acalanto Tours',
  },
  description: 'Passeios de escuna em Paraty. Quatro embarcações pelas baías e ilhas da Costa Verde. Reserve pelo WhatsApp.',
  keywords: ['escuna Paraty', 'passeio barco Paraty', 'turismo náutico Paraty', 'passeio de escuna', 'Paraty tours', 'Costa Verde'],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Acalanto Tours',
    title: 'Acalanto Tours | Passeios de Escuna em Paraty',
    description: 'Quatro escunas, saídas diárias pelas ilhas e praias da Costa Verde.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Acalanto Tours | Escunas em Paraty' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Acalanto Tours | Passeios de Escuna em Paraty',
    description: 'Quatro escunas, saídas diárias pelas ilhas e praias da Costa Verde.',
  },
  robots: { index: true, follow: true },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#92174d',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`h-full ${playfair.variable} ${jakarta.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* GTM Consent defaults (deny before consent) */}
        {GTM_ID && (
          <Script id="gtm-consent-defaults" strategy="beforeInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              analytics_storage: 'denied',
              ad_storage: 'denied',
              wait_for_update: 2000
            });
          `}</Script>
        )}
        {/* GTM */}
        {GTM_ID && (
          <Script id="gtm" strategy="afterInteractive">{`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_ID}');
          `}</Script>
        )}
      </head>
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-jakarta)' }}>
        {/* GTM noscript */}
        {GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0" width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}
        <CartProvider>
          <Header />
          <CartDrawer />
          <main style={{ flex: 1, paddingTop: '70px' }}>
            {children}
          </main>
          <Footer />
          <WhatsAppFloat />
          <CookieBanner />
          <ServiceWorkerRegister />
        </CartProvider>
      </body>
    </html>
  )
}
