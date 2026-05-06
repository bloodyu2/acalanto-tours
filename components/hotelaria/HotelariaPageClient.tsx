'use client'
import { useState } from 'react'
import Link from 'next/link'
import HotelSheet, { type SheetListing } from './HotelSheet'

const amenityLabels: Record<string, string> = {
  piscina: 'Piscina',
  estacionamento: 'Estacionamento',
  'café da manhã': 'Café da manhã',
  'wi-fi': 'Wi-Fi',
  'ar-condicionado': 'Ar-condicionado',
  'pet-friendly': 'Pet-friendly',
}

const hotelTypeLabel: Record<string, string> = {
  pousada: 'Pousada',
  hotel: 'Hotel',
  airbnb: 'Airbnb',
}

interface Props {
  listings: SheetListing[]
  checkin?: string
  checkout?: string
  guests?: string
}

export default function HotelariaPageClient({ listings, checkin, checkout, guests }: Props) {
  const [activeListing, setActiveListing] = useState<SheetListing | null>(null)
  const hasSearch = !!(checkin && checkout)

  if (listings.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1.5rem', color: 'var(--text-muted)' }}>
        <p style={{ fontSize: '1.0625rem', marginBottom: '1rem' }}>
          {hasSearch ? 'Nenhuma hospedagem disponível para esse período.' : 'Em breve, pousadas e hotéis parceiros aqui.'}
        </p>
        {hasSearch ? (
          <Link href="/hotelaria" style={{ color: 'var(--ocean-mid)', fontWeight: 600 }}>
            Ver todas as hospedagens
          </Link>
        ) : (
          <p style={{ fontSize: '0.875rem' }}>
            É dono de uma hospedagem?{' '}
            <Link href="/seja-parceiro" style={{ color: 'var(--ocean-mid)', fontWeight: 600 }}>
              Cadastre seu negócio
            </Link>
          </p>
        )}
      </div>
    )
  }

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {listings.map(listing => {
          const meta = listing.metadata
          const typeLabel = hotelTypeLabel[(meta.hotel_type as string) ?? ''] ?? ''
          const amenities = (meta.amenities as string[]) ?? []
          const fullHref = hasSearch
            ? `/hotelaria/${listing.slug}?checkin=${checkin}&checkout=${checkout}&guests=${guests ?? 2}`
            : `/hotelaria/${listing.slug}`

          return (
            <div
              key={listing.id}
              style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}
            >
              {/* Image — clicking opens full page */}
              <Link href={fullHref} style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{ height: '180px', background: 'linear-gradient(135deg, var(--ocean-mid), var(--sunset))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {listing.cover_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={listing.cover_image} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5">
                      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                      <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                  )}
                </div>
              </Link>

              <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.0625rem', lineHeight: 1.3 }}>{listing.title}</h3>
                  {typeLabel && (
                    <span style={{ fontSize: '0.7rem', background: 'var(--sand)', padding: '0.2rem 0.6rem', borderRadius: '999px', whiteSpace: 'nowrap', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {typeLabel}
                    </span>
                  )}
                </div>

                {listing.description && (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '0.875rem', flex: 1,
                    display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {listing.description}
                  </p>
                )}

                {amenities.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.875rem' }}>
                    {amenities.slice(0, 4).map((a: string) => (
                      <span key={a} style={{ fontSize: '0.7rem', background: '#e0f2fe', color: '#0369a1', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                        {amenityLabels[a.toLowerCase()] ?? a}
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', gap: '0.5rem' }}>
                  {listing.price_label && (
                    <span style={{ fontWeight: 700, color: 'var(--ocean-mid)', fontSize: '0.9rem' }}>{listing.price_label}</span>
                  )}
                  <div style={{ display: 'flex', gap: '0.625rem', marginLeft: 'auto' }}>
                    <button
                      type="button"
                      onClick={() => setActiveListing(listing)}
                      style={{
                        fontSize: '0.8rem', color: 'var(--ocean-mid)', fontWeight: 600,
                        background: 'none', border: 'none', cursor: 'pointer', padding: '0.375rem 0.5rem',
                      }}
                    >
                      Ver detalhes →
                    </button>
                    <Link
                      href={fullHref}
                      style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, textDecoration: 'none', padding: '0.375rem 0.5rem' }}
                    >
                      Página completa
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <HotelSheet listing={activeListing} onClose={() => setActiveListing(null)} />
    </>
  )
}
