import Link from 'next/link'
import type { Boat } from '@/lib/types/database'
import { formatCents } from '@/lib/booking/pricing'
import { FEATURE_LABELS } from '@/lib/constants'

interface Props {
  boat: Boat
}

export default function TourCard({ boat }: Props) {
  const departureLabel = boat.departure_time
    ? boat.departure_time.slice(0, 5).replace(':', 'h')
    : '10h30'
  const durationLabel = `${boat.duration_hours}h de passeio`

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Cover */}
      <div style={{
        position: 'relative',
        height: '220px',
        background: 'linear-gradient(135deg, var(--ocean-deep) 0%, var(--ocean-mid) 60%, var(--ocean-light) 100%)',
        overflow: 'hidden',
      }}>
        {boat.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={boat.cover_image}
            alt={boat.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 20a2 2 0 002 2h16a2 2 0 002-2"/>
              <path d="M4 20l4-12h8l4 12"/>
              <line x1="12" y1="2" x2="12" y2="8"/>
              <path d="M8 8h8"/>
            </svg>
          </div>
        )}
        {/* Preço */}
        <div style={{
          position: 'absolute', top: '0.75rem', right: '0.75rem',
          background: 'var(--sunset)',
          color: 'var(--ocean-deep)',
          fontWeight: 700, fontSize: '0.875rem',
          padding: '0.3rem 0.75rem', borderRadius: '999px',
          fontFamily: 'var(--font-mono)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
        }}>
          {formatCents(boat.price_adult)}{' '}
          <span style={{ fontWeight: 400, fontSize: '0.7rem' }}>/adulto</span>
        </div>
      </div>

      {/* Conteúdo */}
      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '1.25rem', fontWeight: 700,
          color: 'var(--ocean-deep)', marginBottom: '0.25rem',
          letterSpacing: '-0.01em',
        }}>
          {boat.name}
        </h3>

        {boat.tagline && (
          <p style={{
            fontSize: '0.875rem', color: 'var(--ocean-mid)',
            fontWeight: 600, marginBottom: '0.625rem',
            fontFamily: 'var(--font-jakarta)',
          }}>
            {boat.tagline}
          </p>
        )}

        {boat.description && (
          <p className="line-clamp-2" style={{
            fontSize: '0.875rem', color: 'var(--text-muted)',
            lineHeight: 1.6, marginBottom: '0.875rem', flex: 1,
            fontFamily: 'var(--font-jakarta)',
          }}>
            {boat.description}
          </p>
        )}

        {/* Meta */}
        <div style={{
          display: 'flex', gap: '1rem', marginBottom: '0.875rem',
          fontSize: '0.78rem', color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Saída {departureLabel}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {durationLabel}
          </span>
        </div>

        {/* Features */}
        {boat.features && boat.features.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
            {boat.features.slice(0, 4).map(f => (
              <span key={f} className="feature-badge">
                {FEATURE_LABELS[f] || f}
              </span>
            ))}
          </div>
        )}

        <Link
          href={`/passeios/${boat.slug}`}
          className="btn-primary"
          style={{ justifyContent: 'center', fontSize: '0.875rem', borderRadius: '10px' }}
        >
          Ver Passeio e Reservar
        </Link>
      </div>
    </div>
  )
}
