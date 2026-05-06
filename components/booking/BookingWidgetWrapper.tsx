'use client'
import { useState } from 'react'
import BookingWidget from './BookingWidget'
import { useCart } from '@/components/cart/CartProvider'
import CapacityBar from './CapacityBar'
import type { Boat } from '@/lib/types/database'

interface Props { boat: Boat }

export default function BookingWidgetWrapper({ boat }: Props) {
  const { addItem, openCart } = useCart()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [adults] = useState(2)
  const [children] = useState(0)

  function handleAddToCart() {
    if (!selectedDate) return
    addItem({
      id: `${boat.id}-${selectedDate}`,
      type: 'passeio',
      name: boat.name,
      date: selectedDate,
      adults,
      children,
      priceAdultCents: boat.price_adult,
      priceChildCents: boat.price_child,
      boatId: boat.id,
      utmCampaign: typeof window !== 'undefined' ? sessionStorage.getItem('utm_campaign') : null,
    })
    openCart()
  }

  return (
    <div>
      <BookingWidget boat={boat} />

      {/* CapacityBar */}
      <CapacityBar boatId={boat.id} capacityMax={boat.capacity_max} selectedDate={selectedDate} />

      {/* Add to cart section */}
      <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Reserve diretamente pelo carrinho:</span>
        </div>
        <button
          onClick={handleAddToCart}
          style={{
            width: '100%',
            padding: '0.875rem',
            background: 'var(--ocean-mid)',
            color: 'white',
            border: 'none',
            borderRadius: '0.875rem',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}
        >
          🛒 Adicionar ao carrinho
        </button>
        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Pague online com Pix via Infinity Pay
        </p>
      </div>
    </div>
  )
}
