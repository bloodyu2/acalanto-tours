'use client'
import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export type CartItem = {
  id: string
  type: 'passeio' | 'fotografia' | 'servico'
  name: string
  date: string // ISO date string
  adults: number
  children: number
  priceAdultCents: number
  priceChildCents: number
  boatId?: string
  photographerPackageId?: string
  utmCampaign?: string | null
}

type CartContextType = {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
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

export default function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

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

  const clearCart = useCallback(() => setItems([]), [])

  const totalCents = items.reduce((sum, item) => {
    return sum + item.priceAdultCents * item.adults + item.priceChildCents * item.children
  }, 0)

  const itemCount = items.length

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, clearCart,
      totalCents, itemCount,
      isOpen, openCart: () => setIsOpen(true), closeCart: () => setIsOpen(false),
    }}>
      {children}
    </CartContext.Provider>
  )
}
