'use client'
import { useState } from 'react'
import { useCart } from '@/components/cart/CartProvider'

export type AccomListing = {
  id: string
  slug: string
  name: string
  price_cents_per_night: number | null
  price_cents_extra_guest: number | null
  max_guests: number | null
  min_nights: number | null
}

type BlockedDate = { date: string; status: string }

type Props = {
  listing: AccomListing
  blockedDates?: BlockedDate[]
  initialCheckIn?: string
  initialCheckOut?: string
  initialGuests?: number
}

function fmtCents(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function getTodayISO() {
  return new Date().toISOString().split('T')[0]
}

function addDays(iso: string, n: number) {
  const d = new Date(iso)
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

function diffDays(from: string, to: string) {
  return Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86400000)
}

function hasBlockedNight(checkIn: string, checkOut: string, blocked: BlockedDate[]) {
  const nights = diffDays(checkIn, checkOut)
  const blockedSet = new Set(blocked.filter(b => b.status !== 'available').map(b => b.date))
  for (let i = 0; i < nights; i++) {
    if (blockedSet.has(addDays(checkIn, i))) return true
  }
  return false
}

export default function AccommodationBookingWidget({
  listing,
  blockedDates = [],
  initialCheckIn,
  initialCheckOut,
  initialGuests,
}: Props) {
  const { addItem } = useCart()
  const tomorrow = addDays(getTodayISO(), 1)
  const dayAfter = addDays(getTodayISO(), 2)

  const [checkIn, setCheckIn] = useState(initialCheckIn ?? tomorrow)
  const [checkOut, setCheckOut] = useState(initialCheckOut ?? dayAfter)
  const [guests, setGuests] = useState(initialGuests ?? 2)

  const minNights = listing.min_nights ?? 1
  const maxGuests = listing.max_guests ?? 10
  const pricePerNight = listing.price_cents_per_night ?? 0
  const extraGuestPrice = listing.price_cents_extra_guest ?? 0
  const nights = Math.max(0, diffDays(checkIn, checkOut))

  const baseGuests = 2
  const extraGuests = Math.max(0, guests - baseGuests)
  const totalCents = nights * pricePerNight + nights * extraGuests * extraGuestPrice

  const hasConflict = nights > 0 && hasBlockedNight(checkIn, checkOut, blockedDates)
  const tooFewNights = nights > 0 && nights < minNights
  const canBook = nights >= minNights && !hasConflict && checkOut > checkIn

  function handleCheckInChange(val: string) {
    setCheckIn(val)
    if (val >= checkOut) setCheckOut(addDays(val, minNights))
  }

  function handleBook() {
    if (!canBook) return
    addItem({
      id: `${listing.id}-${checkIn}-${checkOut}`,
      type: 'hospedagem',
      name: listing.name,
      date: checkIn,
      adults: guests,
      children: 0,
      priceAdultCents: 0,
      priceChildCents: 0,
      accommodationListingId: listing.id,
      checkIn,
      checkOut,
      nights,
      guests,
      pricePerNightCents: pricePerNight,
    })
  }

  return (
    <div style={{
      background: 'white',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '2rem',
      boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      position: 'sticky',
      top: '90px',
    }}>
      {/* Price */}
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
          A partir de
        </p>
        <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
          {fmtCents(pricePerNight)}
          <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--text-muted)' }}>/noite</span>
        </p>
      </div>

      {/* Date range */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Check-in</label>
          <input
            type="date"
            value={checkIn}
            min={tomorrow}
            onChange={e => handleCheckInChange(e.target.value)}
            style={{ width: '100%', padding: '0.625rem 0.5rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem', boxSizing: 'border-box' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Check-out</label>
          <input
            type="date"
            value={checkOut}
            min={addDays(checkIn, minNights)}
            onChange={e => setCheckOut(e.target.value)}
            style={{ width: '100%', padding: '0.625rem 0.5rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* Guests */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Hóspedes
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => setGuests(g => Math.max(1, g - 1))}
            style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--border)', background: 'white', cursor: 'pointer', fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >−</button>
          <span style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', fontWeight: 700, minWidth: '2rem', textAlign: 'center' }}>{guests}</span>
          <button
            onClick={() => setGuests(g => Math.min(maxGuests, g + 1))}
            style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--border)', background: 'white', cursor: 'pointer', fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >+</button>
        </div>
      </div>

      {/* Validation messages */}
      {tooFewNights && (
        <p style={{ fontSize: '0.8125rem', color: '#ef4444', marginBottom: '0.75rem' }}>
          Mínimo de {minNights} noite{minNights > 1 ? 's' : ''}
        </p>
      )}
      {hasConflict && (
        <p style={{ fontSize: '0.8125rem', color: '#ef4444', marginBottom: '0.75rem' }}>
          Período com datas indisponíveis — escolha outras datas
        </p>
      )}

      {/* Price breakdown */}
      {canBook && (
        <div style={{ background: 'var(--sand)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            <span>{fmtCents(pricePerNight)} × {nights} noite{nights > 1 ? 's' : ''}</span>
            <span>{fmtCents(pricePerNight * nights)}</span>
          </div>
          {extraGuests > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              <span>+{extraGuests} hóspede extra × {nights} noite{nights > 1 ? 's' : ''}</span>
              <span>{fmtCents(extraGuestPrice * extraGuests * nights)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--ocean-deep)', paddingTop: '0.5rem', borderTop: '1px solid var(--border)', marginTop: '0.5rem' }}>
            <span>Total</span>
            <span>{fmtCents(totalCents)}</span>
          </div>
        </div>
      )}

      {/* CTA */}
      <button
        onClick={handleBook}
        disabled={!canBook}
        className="btn-primary"
        style={{
          width: '100%',
          justifyContent: 'center',
          fontSize: '1rem',
          opacity: !canBook ? 0.5 : 1,
          cursor: !canBook ? 'not-allowed' : 'pointer',
        }}
      >
        Reservar
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
        {['Pagamento via Pix', 'Confirmação por e-mail', 'Cancelamento gratuito 48h antes'].map(item => (
          <p key={item} style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--ocean-mid)', flexShrink: 0 }}>
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            {item}
          </p>
        ))}
      </div>
    </div>
  )
}
