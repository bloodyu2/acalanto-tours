'use client'
import React, { useState } from 'react'
import BookingWidget from './BookingWidget'
import { useCart } from '@/components/cart/CartProvider'
import CapacityBar from './CapacityBar'
import type { Boat } from '@/lib/types/database'

interface Props { boat: Boat }

export default function BookingWidgetWrapper({ boat }: Props) {
  const { addItem, openCart } = useCart()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Reserve pelo carrinho:</span>
        </div>
        {/* Passenger count */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.875rem' }}>
          {([['Adultos', adults, setAdults], ['Criancas', children, setChildren]] as [string, number, React.Dispatch<React.SetStateAction<number>>][]).map(([label, val, setter]) => (
            <div key={label} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '0.375rem 0.625rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button onClick={() => setter(v => Math.max(0, v - 1))} style={{ width: '22px', height: '22px', borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--sand)', cursor: 'pointer', fontSize: '0.875rem', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</button>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, minWidth: '16px', textAlign: 'center' }}>{val}</span>
                <button onClick={() => setter(v => v + 1)} style={{ width: '22px', height: '22px', borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--sand)', cursor: 'pointer', fontSize: '0.875rem', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
              </div>
            </div>
          ))}
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
