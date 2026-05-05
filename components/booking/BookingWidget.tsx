'use client'

import { useState } from 'react'
import type { Boat } from '@/lib/types/database'
import { calculateTotal, formatCents } from '@/lib/booking/pricing'
import { buildWhatsAppUrl } from '@/lib/booking/whatsapp'
import { CANCELLATION_POLICY, BOOKING_ADVANCE_MIN_DAYS, BOOKING_ADVANCE_MAX_DAYS } from '@/lib/constants'

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

export default function BookingWidget({ boat }: Props) {
  const [date, setDate] = useState('')
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [name, setName] = useState('')

  const total = calculateTotal(boat, { adults, children })
  const waUrl = date
    ? buildWhatsAppUrl(boat, date, { adults, children }, name)
    : '#'

  const handleWhatsApp = () => {
    if (!date) { alert('Por favor, selecione uma data.'); return }
    window.open(waUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="booking-widget">
      <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.375rem', color: 'var(--ocean-deep)', marginBottom: '0.25rem' }}>
        Reservar Agora
      </h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        Reserve pelo WhatsApp com resposta imediata
      </p>

      {/* Date */}
      <div className="form-group">
        <label className="form-label">
          📅 Data do Passeio *
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

      {/* Adults */}
      <div className="form-group">
        <label className="form-label">Adultos</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={() => setAdults(Math.max(1, adults - 1))}
            style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', border: '1.5px solid var(--border)', background: 'white', cursor: 'pointer', fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >−</button>
          <span style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--ocean-deep)', minWidth: '2rem', textAlign: 'center' }}>{adults}</span>
          <button
            type="button"
            onClick={() => setAdults(Math.min(boat.capacity_max, adults + 1))}
            style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', border: '1.5px solid var(--border)', background: 'white', cursor: 'pointer', fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >+</button>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{formatCents(boat.price_adult)} / pessoa</span>
        </div>
      </div>

      {/* Children */}
      <div className="form-group">
        <label className="form-label">
          Crianças
          <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '0.375rem' }}>
            (6–10 anos: meia entrada · até 5 anos: grátis)
          </span>
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={() => setChildren(Math.max(0, children - 1))}
            style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', border: '1.5px solid var(--border)', background: 'white', cursor: 'pointer', fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >−</button>
          <span style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--ocean-deep)', minWidth: '2rem', textAlign: 'center' }}>{children}</span>
          <button
            type="button"
            onClick={() => setChildren(children + 1)}
            style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', border: '1.5px solid var(--border)', background: 'white', cursor: 'pointer', fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >+</button>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{formatCents(boat.price_child)} / criança</span>
        </div>
      </div>

      {/* Name (optional) */}
      <div className="form-group">
        <label className="form-label">Seu Nome (opcional)</label>
        <input
          className="form-input"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Para personalizar a mensagem"
        />
      </div>

      {/* Total */}
      {(adults > 0 || children > 0) && (
        <div style={{
          background: 'var(--sand)', borderRadius: '0.75rem', padding: '1rem 1.25rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '1rem',
        }}>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>Total estimado</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--ocean-deep)', fontFamily: 'var(--font-playfair)' }}>
              {formatCents(total)}
            </p>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right' }}>
            <div>{adults} adulto{adults !== 1 ? 's' : ''}</div>
            {children > 0 && <div>{children} criança{children !== 1 ? 's' : ''}</div>}
          </div>
        </div>
      )}

      <button
        onClick={handleWhatsApp}
        className="btn-primary"
        style={{ width: '100%', justifyContent: 'center', fontSize: '1rem', padding: '1rem' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
        Reservar pelo WhatsApp
      </button>

      {/* Cancellation */}
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.875rem', textAlign: 'center', lineHeight: 1.5 }}>
        🛡️ {CANCELLATION_POLICY}
      </p>
    </div>
  )
}
