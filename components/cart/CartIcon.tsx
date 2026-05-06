'use client'
import { useContext } from 'react'
import { CartContext } from './CartProvider'

export default function CartIcon() {
  const ctx = useContext(CartContext)
  const itemCount = ctx?.itemCount ?? 0
  const openCart = ctx?.openCart ?? (() => {})
  return (
    <button
      onClick={openCart}
      style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', color: 'var(--text-primary)' }}
      aria-label={`Carrinho${itemCount > 0 ? ` (${itemCount} item${itemCount > 1 ? 's' : ''})` : ''}`}
    >
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round"/>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
      {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
    </button>
  )
}
