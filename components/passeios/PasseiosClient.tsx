'use client'

import { useState } from 'react'
import Link from 'next/link'
import BoatSheet from '@/components/booking/BoatSheet'
import type { Boat } from '@/lib/types/database'

interface Props {
  boats: Boat[]
  unavailableMap: Record<string, string[]>
}

export default function PasseiosClient({ boats, unavailableMap }: Props) {
  const [activeBoat, setActiveBoat] = useState<Boat | null>(null)

  return (
    <>
      <div className="marketplace-grid">
        {boats.map(boat => (
          <BoatCard key={boat.id} boat={boat} onReservar={() => setActiveBoat(boat)} />
        ))}
      </div>

      {boats.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          <div style={{ marginBottom: '1rem', color: 'var(--ocean-mid)', display: 'flex', justifyContent: 'center' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 20a2 2 0 002 2h16a2 2 0 002-2"/>
              <path d="M4 20l4-12h8l4 12"/>
              <line x1="12" y1="2" x2="12" y2="8"/>
              <path d="M8 8h8"/>
            </svg>
          </div>
          <p style={{ fontFamily: 'var(--font-jakarta)' }}>Nenhum passeio disponível no momento. Volte em breve.</p>
        </div>
      )}

      <BoatSheet
        boat={activeBoat}
        unavailableDates={activeBoat ? (unavailableMap[activeBoat.id] ?? []) : []}
        onClose={() => setActiveBoat(null)}
      />
    </>
  )
}

function BoatCard({ boat, onReservar }: { boat: Boat; onReservar: () => void }) {
  const priceFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(boat.price_adult / 100)
  const departureLabel = boat.departure_time ? boat.departure_time.slice(0, 5).replace(':', 'h') : '10h30'

  return (
    <div className="card" style={{ overflow: 'hidden', background: 'white', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Cover — clicável para detalhes */}
      <Link href={`/passeios/${boat.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div style={{
          height: '210px',
          background: 'linear-gradient(135deg, var(--ocean-deep) 0%, var(--ocean-mid) 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {boat.cover_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={boat.cover_image} alt={boat.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 20a2 2 0 002 2h16a2 2 0 002-2"/>
                <path d="M4 20l4-12h8l4 12"/>
                <line x1="12" y1="2" x2="12" y2="8"/>
                <path d="M8 8h8"/>
              </svg>
            </div>
          )}
          <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem' }}>
            <span className="vertical-tag tag-passeios">Escuna</span>
          </div>
          <div style={{
            position: 'absolute', top: '0.75rem', right: '0.75rem',
            background: 'var(--sunset)', color: 'var(--ocean-deep)',
            fontWeight: 700, fontSize: '0.875rem',
            padding: '0.3rem 0.75rem', borderRadius: '999px',
            fontFamily: 'var(--font-mono)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}>
            {priceFormatted}
          </div>
        </div>
      </Link>

      {/* Content */}
      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Link href={`/passeios/${boat.slug}`} style={{ textDecoration: 'none' }}>
          <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--ocean-deep)', marginBottom: '0.25rem', letterSpacing: '-0.01em' }}>
            {boat.name}
          </h3>
          {boat.tagline && (
            <p style={{ fontSize: '0.875rem', color: 'var(--ocean-mid)', fontWeight: 600, marginBottom: '0.625rem', fontFamily: 'var(--font-jakarta)' }}>
              {boat.tagline}
            </p>
          )}
          {boat.description && (
            <p className="line-clamp-2" style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '0.875rem', fontFamily: 'var(--font-jakarta)' }}>
              {boat.description}
            </p>
          )}
        </Link>

        {/* Meta */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.875rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Saída {departureLabel}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {boat.duration_hours}h de passeio
          </span>
        </div>

        {/* Features */}
        {boat.features && boat.features.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
            {boat.features.slice(0, 3).map(f => (
              <span key={f} className="feature-badge">{f}</span>
            ))}
          </div>
        )}

        {/* CTA */}
        <div style={{
          marginTop: 'auto',
          paddingTop: '0.875rem', borderTop: '1px solid var(--border)',
          display: 'flex', gap: '0.625rem', alignItems: 'center',
        }}>
          <button
            onClick={onReservar}
            className="btn-primary"
            style={{ flex: 1, justifyContent: 'center', fontSize: '0.875rem', fontFamily: 'var(--font-jakarta)' }}
          >
            Reservar
          </button>
          <Link
            href={`/passeios/${boat.slug}`}
            style={{ fontSize: '0.8rem', color: 'var(--ocean-mid)', fontWeight: 600, textDecoration: 'none', padding: '0.5rem', whiteSpace: 'nowrap' }}
          >
            Ver detalhes →
          </Link>
        </div>
      </div>
    </div>
  )
}
