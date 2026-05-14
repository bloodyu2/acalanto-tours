'use client'

import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'
import Header from './Header'
import Footer from './Footer'
import WhatsAppFloat from './WhatsAppFloat'
import CookieBanner from './CookieBanner'
import PwaInstallBanner from './PwaInstallBanner'
import BackToTop from './BackToTop'
import CartDrawer from '@/components/cart/CartDrawer'

/**
 * Renders the public-facing site chrome (Header, Footer, Cart, WhatsApp, etc.).
 *
 * Hidden completely on `/admin/*` routes — the admin area has its own sidebar
 * + layout and does NOT want the public navbar/footer/cart on top.
 */
export default function PublicChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? ''
  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/')

  if (isAdmin) {
    // Admin: render children directly, no public chrome.
    return <main style={{ flex: 1, minHeight: '100vh' }}>{children}</main>
  }

  return (
    <>
      <Header />
      <CartDrawer />
      <main style={{ flex: 1, paddingTop: '70px' }}>{children}</main>
      <Footer />
      <WhatsAppFloat />
      <CookieBanner />
      <PwaInstallBanner />
      <BackToTop />
    </>
  )
}
