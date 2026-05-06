'use client'

import { useState } from 'react'
import type { Boat } from '@/lib/types/database'
import { calculateTotal, formatCents } from '@/lib/booking/pricing'
import { buildWhatsAppUrl } from '@/lib/booking/whatsapp'
import { CANCELLATION_POLICY, BOOKING_ADVANCE_MIN_DAYS, BOOKING_ADVANCE_MAX_DAYS } from '@/lib/constants'
import { useCart } from '@/components/cart/CartProvider'
import CapacityBar from './CapacityBar'

interface Props {
  boat: Boat
}

function getMinDate() {
  const d = new Date()
  d.setDate(d.getDate() + BOOKING_ADVANCE_MIN_DAYS)
  return d.toISOString().split('T')[0]
}

function getMaxDate() {
  const d = new Date()
  d.setDate(d.getDate() + BOOKING_ADVANCE_MAX_DAYS)
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

export default function BookingWidget({ boat }: Props) {
  const { addItem, openCart } = useCart()
  const [date, setDate] = useState('')
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)   // 6-10 anos: meia
  const [infants, setInfants] = useState(0)      // ate 5 anos: gratis, mas contam na lotacao
  const [name, setName] = useState('')

  const totalPassengers = adults + children + infants
  const total = calculateTotal(boat, { adults, children })
  const waUrl = date ? buildWhatsAppUrl(boat, date, { adults, children }, name) : '#'

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

  const handleWhatsApp = () => {
    if (!date) { alert('Selecione uma data para o passeio.'); return }
    window.open(waUrl, '_blank', 'noopener,noreferrer')
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

      {/* Date */}
      <div className="form-group">
        <label className="form-label">
          Data do Passeio *
        </label>
        <input
          type="date"
          className="form-input"
          value={date}
          min={getMinDate()}
          max={getMaxDate()}
          onChange={e => setDate(e.target.value)}
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

      {/* Secondary CTA — WhatsApp */}
      <button
        onClick={handleWhatsApp}
        style={{
          width: '100%',
          padding: '0.75rem',
          background: 'white',
          color: '#25D366',
          border: '1.5px solid #25D366',
          borderRadius: '0.875rem',
          fontSize: '0.9rem',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
        Perguntar no WhatsApp
      </button>

      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem', textAlign: 'center', lineHeight: 1.5 }}>
        Pix com 0% taxa via Infinity Pay. {CANCELLATION_POLICY}
      </p>
    </div>
  )
}
