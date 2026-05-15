import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google'
import ServiceWorkerRegister from '@/components/layout/ServiceWorkerRegister'
import CartProvider from '@/components/cart/CartProvider'
import PublicChrome from '@/components/layout/PublicChrome'
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
  name: 'Acalanto Turismo',
  description: 'Tudo para seu turismo em Paraty: passeios de escuna, fotografia profissional, hospedagem selecionada e serviços exclusivos.',
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://acalantotours.com.br'),
  title: {
    default: 'Acalanto Turismo | Turismo em Paraty',
    template: '%s | Acalanto Turismo',
  },
  description: 'Tudo para seu turismo em Paraty: passeios de escuna, fotografia profissional, hospedagem selecionada e serviços exclusivos.',
  keywords: ['turismo Paraty', 'escuna Paraty', 'passeio barco Paraty', 'fotografia Paraty', 'hospedagem Paraty', 'Paraty tours', 'Costa Verde'],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Acalanto Turismo',
    title: 'Acalanto Turismo | Turismo em Paraty',
    description: 'Passeios de escuna, fotografia profissional, hospedagem selecionada e serviços exclusivos em Paraty.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Acalanto Turismo | Turismo em Paraty' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Acalanto Turismo | Turismo em Paraty',
    description: 'Tudo para seu turismo em Paraty: escunas, fotografia, hospedagem e serviços.',
  },
  robots: { index: true, follow: true },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#0A3D5C',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`h-full ${playfair.variable} ${jakarta.variable}`}>
      <head>
        <link rel="icon" href="/icon-32.png" sizes="32x32" type="image/png" />
        <link rel="icon" href="/icon-16.png" sizes="16x16" type="image/png" />
        <link rel="apple-touch-icon" href="/icon-180.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icon-152.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/icon-120.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Acalanto" />
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
        {/* GA4 direct — G-TSTXTM5YBT */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-TSTXTM5YBT"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            analytics_storage: 'denied',
            wait_for_update: 2000
          });
          gtag('js', new Date());
          gtag('config', 'G-TSTXTM5YBT', { send_page_view: false });
        `}</Script>
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
          <PublicChrome>{children}</PublicChrome>
          <ServiceWorkerRegister />
        </CartProvider>
      </body>
    </html>
  )
}
