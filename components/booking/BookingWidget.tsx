'use client'

import { useState, useEffect } from 'react'
import type { Boat } from '@/lib/types/database'
import { calculateTotal, formatCents } from '@/lib/booking/pricing'
import { CANCELLATION_POLICY, BOOKING_ADVANCE_MIN_DAYS, BOAT_PHOTOGRAPHER_ADDON_CENTS } from '@/lib/constants'
import { useCart } from '@/components/cart/CartProvider'
import { createClient } from '@/lib/supabase/client'
import CapacityBar from './CapacityBar'
import DatePickerCalendar from '@/components/ui/DatePickerCalendar'
import { PaymentBadge, ALL_PAYMENT_BRANDS } from '@/components/payments/PaymentBadge'

type DepartureTime = { id: string; time: string; label: string | null }

interface Props {
  boat: Boat
  unavailableDates?: string[]
}

function getMinDate() {
  const d = new Date()
  d.setDate(d.getDate() + BOOKING_ADVANCE_MIN_DAYS)
  return d.toISOString().split('T')[0]
}

function fmtTime(t: string) { return t.slice(0, 5) }

function Counter({
  label, sublabel, value, onChange, min = 0, max = 99,
}: {
  label: string; sublabel?: string; value: number
  onChange: (n: number) => void; min?: number; max?: number
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0.75rem 0', borderBottom: '1px solid var(--border)',
    }}>
      <div>
        <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-jakarta)' }}>
          {label}
        </p>
        {sublabel && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.15rem 0 0', fontFamily: 'var(--font-jakarta)' }}>
            {sublabel}
          </p>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        <button
          type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}
          style={{
            width: '2.25rem', height: '2.25rem', borderRadius: '50%',
            border: '1.5px solid var(--border)', background: 'white',
            cursor: value <= min ? 'not-allowed' : 'pointer', fontSize: '1.25rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: value <= min ? 'var(--border)' : 'var(--text-primary)', transition: 'border-color 0.15s',
          }}
        >−</button>
        <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--ocean-deep)', minWidth: '1.5rem', textAlign: 'center', fontFamily: 'var(--font-playfair)' }}>
          {value}
        </span>
        <button
          type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}
          style={{
            width: '2.25rem', height: '2.25rem', borderRadius: '50%',
            border: '1.5px solid var(--ocean-mid)',
            background: value >= max ? 'var(--border)' : 'var(--ocean-mid)',
            cursor: value >= max ? 'not-allowed' : 'pointer', fontSize: '1.25rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', transition: 'background 0.15s',
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
  const [children, setChildren] = useState(0)
  const [infants, setInfants] = useState(0)
  const [name, setName] = useState('')
  const [photographerAddon, setPhotographerAddon] = useState(false)

  const [departureTimes, setDepartureTimes] = useState<DepartureTime[]>([])
  const [selectedTimeId, setSelectedTimeId] = useState<string | null>(null)

  useEffect(() => {
    const sb = createClient()
    sb.from('departure_times')
      .select('id, time, label')
      .eq('boat_id', boat.id)
      .eq('active', true)
      .order('display_order', { ascending: true })
      .then(({ data }) => {
        const list = (data as DepartureTime[]) ?? []
        setDepartureTimes(list)
        if (list.length > 0) setSelectedTimeId(list[0].id)
      })
  }, [boat.id])

  const selectedTime = departureTimes.find(t => t.id === selectedTimeId)
  const totalPassengers = adults + children + infants
  const total = calculateTotal(boat, { adults, children }) + (photographerAddon ? BOAT_PHOTOGRAPHER_ADDON_CENTS : 0)

  const handleAddToCart = () => {
    if (!date) { alert('Selecione uma data para o passeio.'); return }
    if (adults < 1) { alert('Adicione pelo menos 1 adulto.'); return }
    if (departureTimes.length > 0 && !selectedTimeId) { alert('Selecione um horário de saída.'); return }

    const timeLabel = selectedTime
      ? (selectedTime.label ? `${selectedTime.label} — ${fmtTime(selectedTime.time)}` : fmtTime(selectedTime.time))
      : undefined

    addItem({
      id: `${boat.id}-${date}-${selectedTimeId ?? 'default'}`,
      type: 'passeio',
      name: boat.name,
      date,
      adults,
      children,
      priceAdultCents: boat.price_adult,
      priceChildCents: boat.price_child,
      boatId: boat.id,
      departureTimeId: selectedTimeId ?? undefined,
      departureTimeLabel: timeLabel,
      utmCampaign: typeof window !== 'undefined'
        ? (() => { try { return sessionStorage.getItem('utm_campaign') } catch { return null } })()
        : null,
      boatPhotographerAddon: photographerAddon,
      boatPhotographerAddonCents: photographerAddon ? BOAT_PHOTOGRAPHER_ADDON_CENTS : 0,
    })
    openCart()
  }

  return (
    <div className="booking-widget">

      {/* Preço */}
      <div style={{ marginBottom: '1.25rem' }}>
        <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '0.25rem' }}>
          a partir de
        </p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem' }}>
          <span style={{ fontFamily: 'var(--font-playfair)', fontSize: '2.25rem', fontWeight: 700, color: 'var(--ocean-deep)', letterSpacing: '-0.02em' }}>
            {formatCents(boat.price_adult)}
          </span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontFamily: 'var(--font-jakarta)' }}>
            / adulto
          </span>
        </div>
      </div>

      {/* Calendário */}
      <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.625rem', fontFamily: 'var(--font-jakarta)' }}>
          Data do Passeio
        </label>
        <DatePickerCalendar value={date} onChange={setDate} unavailableDates={unavailableDates} minDate={getMinDate()} />
      </div>

      {/* Seletor de horário */}
      {departureTimes.length > 0 && (
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.625rem', fontFamily: 'var(--font-jakarta)' }}>
            Horário de Saída
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {departureTimes.map(t => {
              const active = t.id === selectedTimeId
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTimeId(t.id)}
                  style={{
                    padding: '0.45rem 1rem', borderRadius: '8px',
                    border: `2px solid ${active ? 'var(--ocean-deep)' : 'var(--border)'}`,
                    background: active ? 'var(--ocean-deep)' : 'white',
                    color: active ? 'white' : 'var(--text-primary)',
                    fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.9rem',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {fmtTime(t.time)}
                  {t.label && <span style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 400, fontSize: '0.75rem', marginLeft: '0.375rem', opacity: 0.8 }}>{t.label}</span>}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Barra de capacidade */}
      <CapacityBar
        boatId={boat.id}
        capacityMax={boat.capacity_max}
        selectedDate={date || null}
        departureTimeId={selectedTimeId ?? undefined}
      />

      {/* Passageiros */}
      <div style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem', fontFamily: 'var(--font-mono)' }}>
          Passageiros
        </p>
        <Counter label="Adultos" sublabel="13 anos ou mais" value={adults} onChange={setAdults} min={1} max={boat.capacity_max} />
        <Counter label="Crianças" sublabel="6 a 12 anos — meia entrada" value={children} onChange={setChildren} min={0} max={boat.capacity_max} />
        <Counter label="Bebês" sublabel="Até 5 anos — gratuito, conta na lotação" value={infants} onChange={setInfants} min={0} max={boat.capacity_max} />
      </div>

      {/* Fotógrafo a bordo */}
      <div
        onClick={() => setPhotographerAddon(v => !v)}
        style={{
          marginTop: '1rem',
          border: `2px solid ${photographerAddon ? 'var(--ocean-deep)' : 'var(--border)'}`,
          borderRadius: '0.875rem',
          padding: '0.875rem 1rem',
          cursor: 'pointer',
          background: photographerAddon ? 'rgba(10,61,92,0.04)' : 'white',
          transition: 'border-color 0.15s, background 0.15s',
          display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
        }}
      >
        <div style={{
          width: '2.25rem', height: '2.25rem', flexShrink: 0,
          borderRadius: '50%', background: photographerAddon ? 'var(--ocean-deep)' : 'var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.15s',
        }}>
          <svg width="16" height="16" fill="none" stroke="white" strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-jakarta)' }}>
              Fotógrafo a bordo
            </p>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--ocean-deep)', fontFamily: 'var(--font-playfair)' }}>
              +{formatCents(BOAT_PHOTOGRAPHER_ADDON_CENTS)}
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.25rem 0 0', fontFamily: 'var(--font-jakarta)', lineHeight: 1.5 }}>
            Registre o passeio com fotos profissionais. A Calanto confirmará o fotógrafo da Associação de Fotógrafos de Paraty em contato após a reserva.
          </p>
        </div>
        <div style={{
          width: '1.25rem', height: '1.25rem', flexShrink: 0, marginTop: '0.1rem',
          border: `2px solid ${photographerAddon ? 'var(--ocean-deep)' : 'var(--border)'}`,
          borderRadius: '4px', background: photographerAddon ? 'var(--ocean-deep)' : 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s',
        }}>
          {photographerAddon && (
            <svg width="10" height="10" fill="none" stroke="white" strokeWidth={2.5} viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          )}
        </div>
      </div>

      {/* Nome opcional */}
      <div className="form-group" style={{ marginTop: '0.875rem' }}>
        <label className="form-label">Seu nome <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(opcional)</span></label>
        <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Para personalizar a mensagem" />
      </div>

      {/* Total estimado */}
      {totalPassengers > 0 && (
        <div style={{
          background: 'var(--sand-warm)', borderRadius: '0.875rem',
          padding: '0.875rem 1.25rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          margin: '1rem 0',
        }}>
          <div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Total estimado
            </p>
            <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--ocean-deep)', fontFamily: 'var(--font-playfair)', margin: 0, letterSpacing: '-0.02em' }}>
              {formatCents(total)}
            </p>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'right', lineHeight: 1.7, fontFamily: 'var(--font-jakarta)' }}>
            {adults > 0 && <div>{adults} adulto{adults !== 1 ? 's' : ''}</div>}
            {children > 0 && <div>{children} criança{children !== 1 ? 's' : ''}</div>}
            {infants > 0 && <div>{infants} bebê{infants !== 1 ? 's' : ''} (grátis)</div>}
            {photographerAddon && <div>📷 Fotógrafo</div>}
          </div>
        </div>
      )}

      {/* CTA principal */}
      <button
        onClick={handleAddToCart}
        style={{
          width: '100%', padding: '1rem',
          background: 'var(--ocean-deep)', color: 'white',
          border: 'none', borderRadius: '0.875rem',
          fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
          marginBottom: '0.625rem', fontFamily: 'var(--font-jakarta)',
          transition: 'background 0.2s, transform 0.1s',
          boxShadow: '0 4px 16px rgba(10,61,92,0.25)',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--ocean-mid)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'var(--ocean-deep)')}
      >
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round"/>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        Reservar e pagar online
      </button>

      {/* Formas de pagamento */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
        <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          Pagamento seguro via ASAAS
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
          {ALL_PAYMENT_BRANDS.map(b => <PaymentBadge key={b} brand={b} size={24} />)}
        </div>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5, fontFamily: 'var(--font-jakarta)' }}>
          {CANCELLATION_POLICY}
        </p>
      </div>
    </div>
  )
}
