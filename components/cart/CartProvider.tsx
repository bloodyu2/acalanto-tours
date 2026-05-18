'use client'
import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { usePathname } from 'next/navigation'

const CART_KEY = 'acalanto_cart'

export type CartItem = {
  id: string
  type: 'passeio' | 'fotografia' | 'servico' | 'hospedagem'
  name: string
  date: string // ISO date string
  adults: number
  children: number
  infants?: number
  priceAdultCents: number
  priceChildCents: number
  boatId?: string
  photographerPackageId?: string
  providerName?: string
  providerId?: string
  utmCampaign?: string | null
  // Departure time fields (passeio + servico)
  departureTimeId?: string
  departureTimeLabel?: string // e.g. "10:30" or "Manhã — 10:30"
  // Serviço fields
  serviceId?: string
  pricingType?: 'per_person' | 'per_group'
  groupSize?: number
  // Hospedagem fields
  accommodationListingId?: string
  accommodationRoomId?: string
  checkIn?: string    // YYYY-MM-DD
  checkOut?: string   // YYYY-MM-DD
  nights?: number
  guests?: number
  pricePerNightCents?: number
  // Add-ons
  boatPhotographerAddon?: boolean
  boatPhotographerAddonCents?: number
}

type CartContextType = {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateItem: (id: string, patch: Partial<CartItem>) => void
  clearCart: () => void
  totalCents: number
  itemCount: number
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
}

export const CartContext = createContext<CartContextType | null>(null)

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

function itemTotal(item: CartItem): number {
  if (item.type === 'hospedagem') {
    return (item.pricePerNightCents ?? 0) * (item.nights ?? 1)
  }
  if (item.type === 'servico' && item.pricingType === 'per_group') {
    return item.priceAdultCents
  }
  let total = item.priceAdultCents * item.adults + item.priceChildCents * item.children
  if (item.boatPhotographerAddon) total += (item.boatPhotographerAddonCents ?? 0)
  return total
}

export default function CartProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const raw = localStorage.getItem(CART_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw) as CartItem[]
      // Ignore legacy items missing priceAdultCents
      return parsed.filter(i => typeof i.priceAdultCents === 'number')
    } catch { return [] }
  })
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items))
    } catch {}
  }, [items])

  // Auto-close cart on route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const addItem = useCallback((item: CartItem) => {
    setItems(prev => {
      const exists = prev.find(i => i.id === item.id)
      if (exists) return prev
      return [...prev, item]
    })
    setIsOpen(true)
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }, [])

  const updateItem = useCallback((id: string, patch: Partial<CartItem>) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i))
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    try { localStorage.removeItem(CART_KEY) } catch {}
  }, [])

  const totalCents = items.reduce((sum, item) => sum + itemTotal(item), 0)

  const itemCount = items.length

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateItem, clearCart,
      totalCents, itemCount,
      isOpen, openCart: () => setIsOpen(true), closeCart: () => setIsOpen(false),
    }}>
      {children}
    </CartContext.Provider>
  )
}
