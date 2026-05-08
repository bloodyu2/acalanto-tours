'use client'
import { useEffect } from 'react'
import type { Boat } from '@/lib/types/database'
import BookingWidget from '@/components/booking/BookingWidget'
import { FEATURE_LABELS } from '@/lib/constants'
import { formatCents } from '@/lib/booking/pricing'

interface Props {
  boat: Boat | null
  onClose: () => void
}

export default function BoatSheet({ boat, onClose }: Props) {
  useEffect(() => {
    if (!boat) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [boat, onClose])

  if (!boat) return null

  const departureLabel = boat.departure_time
    ? boat.departure_time.slice(0, 5).replace(':', 'h')
    : '10h30'

  return (
    <>
      {/* Overlay */}
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40, backdropFilter: 'blur(2px)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={boat.name}
        style={{
          position: 'fixed', inset: '0 0 0 auto',
          width: '100%', maxWidth: '520px',
          background: 'white', zIndex: 50,
          display: 'flex', flexDirection: 'column',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.15)',
          overflowY: 'auto',
        }}
      >
        {/* Hero image */}
        <div style={{ height: '200px', background: 'linear-gradient(135deg, var(--ocean-mid), var(--sunset))', position: 'relative', flexShrink: 0 }}>
          {boat.cover_image && (
            <img src={boat.cover_image} alt={boat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }} />
          <button
            onClick={onClose}
            aria-label="Fechar"
            style={{ position: 'absolute', top: '1rem', right: '1rem', width: 36, height: 36, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', backdropFilter: 'blur(4px)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <div style={{ position: 'absolute', bottom: '1rem', left: '1.5rem', color: 'white' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.8, marginBottom: '0.25rem' }}>
              Passeio de Escuna
            </p>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.5rem', margin: 0 }}>
              {boat.name}
            </h2>
          </div>
          <div style={{ position: 'absolute', top: '1rem', left: '1.5rem', background: 'var(--sunset)', color: 'white', fontWeight: 700, fontSize: '0.875rem', padding: '0.3rem 0.75rem', borderRadius: '999px' }}>
            {formatCents(boat.price_adult)}/adulto
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', flex: 1 }}>
          {boat.tagline && (
            <p style={{ color: 'var(--ocean-mid)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem' }}>
              {boat.tagline}
            </p>
          )}
          {boat.description && (
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.75, fontSize: '0.9375rem', marginBottom: '1.25rem' }}>
              {boat.description}
            </p>
          )}

          {/* Meta */}
          <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Saída {departureLabel}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {boat.duration_hours}h de passeio
            </span>
            {boat.capacity_max && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                Até {boat.capacity_max} pessoas
              </span>
            )}
          </div>

          {/* Features */}
          {boat.features && boat.features.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '1.25rem' }}>
              {boat.features.map((f: string) => (
                <span key={f} className="feature-badge">
                  {FEATURE_LABELS[f] || f}
                </span>
              ))}
            </div>
          )}

          <BookingWidget boat={boat} />
        </div>
      </div>
    </>
  )
}
