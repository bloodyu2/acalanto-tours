'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { Boat } from '@/lib/types/database'
import BoatSheet from './BoatSheet'
import { formatCents } from '@/lib/booking/pricing'
import { FEATURE_LABELS } from '@/lib/constants'

interface Props {
  boats: Boat[]
}

export default function EscunasPageClient({ boats }: Props) {
  const [activeBoat, setActiveBoat] = useState<Boat | null>(null)

  return (
    <>
      {boats.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.75rem' }}>
          {boats.map(boat => {
            const departureLabel = boat.departure_time
              ? boat.departure_time.slice(0, 5).replace(':', 'h')
              : '10h30'

            return (
              <div key={boat.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Image */}
                <div style={{ position: 'relative', height: '220px', background: 'linear-gradient(135deg, var(--ocean-mid) 0%, var(--ocean-light) 100%)', overflow: 'hidden', flexShrink: 0 }}>
                  {boat.cover_image ? (
                    <img src={boat.cover_image} alt={boat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5">
                        <path d="M3 17l1-4h16l1 4M4 9h16M8 9V6a4 4 0 018 0v3"/>
                        <path d="M2 21h20M6 17l-.5 4M18 17l.5 4"/>
                      </svg>
                    </div>
                  )}
                  <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'var(--sunset)', color: 'white', fontWeight: 700, fontSize: '0.9rem', padding: '0.35rem 0.75rem', borderRadius: '999px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                    {formatCents(boat.price_adult)} <span style={{ fontWeight: 400, fontSize: '0.75rem' }}>/adulto</span>
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', color: 'var(--ocean-deep)', marginBottom: '0.25rem' }}>
                    {boat.name}
                  </h3>
                  {boat.tagline && (
                    <p style={{ fontSize: '0.875rem', color: 'var(--ocean-mid)', fontWeight: 600, marginBottom: '0.625rem' }}>
                      {boat.tagline}
                    </p>
                  )}
                  {boat.description && (
                    <p className="line-clamp-2" style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '0.875rem', flex: 1 }}>
                      {boat.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '0.875rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>⏰ Saída {departureLabel}</span>
                    <span>⏱ {boat.duration_hours}h de passeio</span>
                  </div>

                  {boat.features && boat.features.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
                      {boat.features.slice(0, 4).map((f: string) => (
                        <span key={f} className="feature-badge">
                          {FEATURE_LABELS[f] || f}
                        </span>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setActiveBoat(boat)}
                      className="btn-primary"
                      style={{ flex: 1, justifyContent: 'center', fontSize: '0.875rem' }}
                    >
                      Reservar
                    </button>
                    <Link
                      href={`/escunas/${boat.slug}`}
                      style={{ fontSize: '0.8rem', color: 'var(--ocean-mid)', fontWeight: 600, textDecoration: 'none', padding: '0.5rem', whiteSpace: 'nowrap' }}
                    >
                      Ver mais →
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem 0' }}>
          Passeios em breve disponíveis.
        </p>
      )}

      <BoatSheet boat={activeBoat} onClose={() => setActiveBoat(null)} />
    </>
  )
}
