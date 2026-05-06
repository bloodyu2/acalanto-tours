import type { Metadata } from 'next'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import CartProvider from '@/components/cart/CartProvider'
import CartDrawer from '@/components/cart/CartDrawer'
import UtmTracker from '@/components/utm/UtmTracker'

export const metadata: Metadata = {
  title: { template: '%s | Acalanto', default: 'Acalanto — Marketplace de Turismo em Paraty' },
}

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <UtmTracker />
      {children}
      <MobileBottomNav />
      <CartDrawer />
    </CartProvider>
  )
}
