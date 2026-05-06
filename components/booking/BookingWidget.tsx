'use client'

import { useState } from 'react'
import type { Boat } from '@/lib/types/database'
import { calculateTotal, formatCents } from '@/lib/booking/pricing'
import { CANCELLATION_POLICY, BOOKING_ADVANCE_MIN_DAYS } from '@/lib/constants'
import { useCart } from '@/components/cart/CartProvider'
import CapacityBar from './CapacityBar'
import DatePickerCalendar from '@/components/ui/DatePickerCalendar'

interface Props {
  boat: Boat
  unavailableDates?: string[]
}

function getMinDate() {
  const d = new Date()
  d.setDate(d.getDate() + BOOKING_ADVANCE_MIN_DAYS)
  return d.toISOString().split('T')[0]
}

function Counter({
  label,
  sublabel,
  value,
  onChange,
  min = 0,
  max = 99,
}: {
  label: string
  sublabel?: string
  value: number
  onChange: (n: number) => void
  min?: number
  max?: number
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
      <div>
        <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', margin: 0 }}>{label}</p>
        {sublabel && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.15rem 0 0' }}>{sublabel}</p>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          style={{
            width: '2.25rem', height: '2.25rem', borderRadius: '50%',
            border: '1.5px solid var(--border)', background: 'white',
            cursor: 'pointer', fontSize: '1.25rem', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-primary)',
          }}
        >-</button>
        <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--ocean-deep)', minWidth: '1.5rem', textAlign: 'center' }}>{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          style={{
            width: '2.25rem', height: '2.25rem', borderRadius: '50%',
            border: '1.5px solid var(--border)', background: 'var(--ocean-mid)',
            cursor: 'pointer', fontSize: '1.25rem', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: 'white',
          }}
        >+</button>
      </div>
    </div>
  )
}

export default function BookingWidget({ boat, unavailableDates = [] }: Props) {
  const { addItem, openCart } = useCart()
  const [date, setDate] = useState(getMinDate())
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)   // 6-10 anos: meia
  const [infants, setInfants] = useState(0)      // ate 5 anos: gratis, mas contam na lotacao
  const [name, setName] = useState('')

  const totalPassengers = adults + children + infants
  const total = calculateTotal(boat, { adults, children })

  const handleAddToCart = () => {
    if (!date) { alert('Selecione uma data para o passeio.'); return }
    if (adults < 1) { alert('Adicione pelo menos 1 adulto.'); return }
    addItem({
      id: `${boat.id}-${date}`,
      type: 'passeio',
      name: boat.name,
      date,
      adults,
      children,
      priceAdultCents: boat.price_adult,
      priceChildCents: boat.price_child,
      boatId: boat.id,
      utmCampaign: typeof window !== 'undefined'
        ? (() => { try { return sessionStorage.getItem('utm_campaign') } catch { return null } })()
        : null,
    })
    openCart()
  }

  return (
    <div className="booking-widget">
      <div style={{ marginBottom: '1.25rem' }}>
        <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '0.25rem' }}>
          a partir de
        </p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem' }}>
          <span style={{ fontFamily: 'var(--font-playfair)', fontSize: '2rem', fontWeight: 700, color: 'var(--ocean-deep)' }}>
            {formatCents(boat.price_adult)}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ adulto</span>
        </div>
      </div>

      {/* Visual calendar */}
      <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.625rem' }}>
          Data do Passeio
        </label>
        <DatePickerCalendar
          value={date}
          onChange={setDate}
          unavailableDates={unavailableDates}
          minDate={getMinDate()}
        />
      </div>

      {/* Capacity bar */}
      <CapacityBar boatId={boat.id} capacityMax={boat.capacity_max} selectedDate={date || null} />

      {/* Passengers */}
      <div style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
        <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>
          Passageiros
        </p>
        <Counter
          label="Adultos"
          sublabel="13 anos ou mais"
          value={adults}
          onChange={setAdults}
          min={1}
          max={boat.capacity_max}
        />
        <Counter
          label="Criancas"
          sublabel="6 a 12 anos — meia entrada"
          value={children}
          onChange={setChildren}
          min={0}
          max={boat.capacity_max}
        />
        <Counter
          label="Bebes"
          sublabel="Ate 5 anos — gratuito, conta na lotacao"
          value={infants}
          onChange={setInfants}
          min={0}
          max={boat.capacity_max}
        />
      </div>

      {/* Name (optional) */}
      <div className="form-group" style={{ marginTop: '0.75rem' }}>
        <label className="form-label">Seu Nome (opcional)</label>
        <input
          className="form-input"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Para personalizar a mensagem"
        />
      </div>

      {/* Total */}
      {totalPassengers > 0 && (
        <div style={{
          background: 'var(--sand)', borderRadius: '0.75rem', padding: '0.875rem 1.25rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          margin: '1rem 0',
        }}>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.1rem' }}>Total estimado</p>
            <p style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--ocean-deep)', fontFamily: 'var(--font-playfair)', margin: 0 }}>
              {formatCents(total)}
            </p>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'right', lineHeight: 1.6 }}>
            {adults > 0 && <div>{adults} adulto{adults !== 1 ? 's' : ''}</div>}
            {children > 0 && <div>{children} crianca{children !== 1 ? 's' : ''}</div>}
            {infants > 0 && <div>{infants} bebe{infants !== 1 ? 's' : ''} (gratis)</div>}
          </div>
        </div>
      )}

      {/* Primary CTA — online payment */}
      <button
        onClick={handleAddToCart}
        style={{
          width: '100%',
          padding: '1rem',
          background: 'var(--ocean-deep)',
          color: 'white',
          border: 'none',
          borderRadius: '0.875rem',
          fontSize: '1rem',
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          marginBottom: '0.625rem',
        }}
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round"/>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        Reservar e pagar online
      </button>

      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem', textAlign: 'center', lineHeight: 1.5 }}>
        Pix ou cartão via Infinity Pay. {CANCELLATION_POLICY}
      </p>
    </div>
  )
}
