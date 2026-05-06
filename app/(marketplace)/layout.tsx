import type { Metadata } from 'next'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import UtmTracker from '@/components/utm/UtmTracker'

export const metadata: Metadata = {
  title: { template: '%s | Acalanto', default: 'Acalanto — Marketplace de Turismo em Paraty' },
}

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <UtmTracker />
      {children}
      <MobileBottomNav />
    </>
  )
}
