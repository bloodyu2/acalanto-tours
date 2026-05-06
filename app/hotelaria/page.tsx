import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { getApprovedListings } from '@/lib/partner-listings'
import { createClient } from '@/lib/supabase/server'
import SearchBar from '@/components/hotelaria/SearchBar'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Hospedagem em Paraty — Acalanto Turismo',
  description: 'Encontre as melhores pousadas, hotéis e acomodações em Paraty, selecionadas pela Acalanto Turismo.',
}

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
  searchParams: Promise<{ checkin?: string; checkout?: string; guests?: string }>
}

export default async function HotelariaPage({ searchParams }: Props) {
  const sp = await searchParams
  const allListings = await getApprovedListings('hospedagem')

  let listings = allListings

  // Filter by availability if dates provided
  if (sp.checkin && sp.checkout && allListings.length > 0) {
    const supabase = await createClient()
    const { data: blocked } = await supabase
      .from('accommodation_availability')
      .select('listing_id')
      .neq('status', 'available')
      .gte('date', sp.checkin)
      .lt('date', sp.checkout)

    if (blocked && blocked.length > 0) {
      const blockedIds = new Set(blocked.map((r: { listing_id: string }) => r.listing_id))
      listings = allListings.filter(l => !blockedIds.has(l.id))
    }
  }

  const hasSearch = !!(sp.checkin && sp.checkout)

  return (
    <main style={{ paddingTop: '5rem', minHeight: '80vh' }}>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(160deg, #0A3D5C 0%, #1A6B8A 100%)',
        padding: 'clamp(3rem, 8vw, 5rem) 1.5rem clamp(2rem, 4vw, 3rem)',
        textAlign: 'center',
        color: 'white',
      }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <span style={{
            display: 'inline-block', background: 'rgba(255,255,255,0.15)',
            fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase',
            padding: '0.3rem 0.85rem', borderRadius: '999px', marginBottom: '1.25rem',
            fontFamily: 'var(--font-mono)',
          }}>Hospedagem</span>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '1rem', lineHeight: 1.1 }}>
            Onde ficar em Paraty
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.0625rem', lineHeight: 1.7 }}>
            Pousadas, hotéis e acomodações selecionados, próximos ao pier de embarque das escunas.
          </p>
        </div>
      </section>

      {/* Search bar */}
      <section style={{ padding: '1.5rem 1.5rem 0' }}>
        <div className="container">
          <Suspense fallback={null}>
            <SearchBar />
          </Suspense>
        </div>
      </section>

      {/* Listings */}
      <section style={{ padding: 'clamp(2rem, 4vw, 3rem) 1.5rem', background: 'var(--sand)' }}>
        <div className="container">
          {hasSearch && (
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              {listings.length} hospedagem{listings.length !== 1 ? 's' : ''} disponível{listings.length !== 1 ? 'veis' : ''} de <strong>{sp.checkin}</strong> a <strong>{sp.checkout}</strong>
              {' · '}
              <Link href="/hotelaria" style={{ color: 'var(--ocean-mid)', fontWeight: 600, textDecoration: 'none' }}>
                Limpar filtro
              </Link>
            </p>
          )}

          {listings.length === 0 ? (
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
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {listings.map(listing => {
                const meta = listing.metadata as Record<string, unknown>
                const typeLabel = hotelTypeLabel[(meta.hotel_type as string) ?? ''] ?? ''
                const amenities = (meta.amenities as string[]) ?? []
                const href = hasSearch
                  ? `/hotelaria/${listing.slug}?checkin=${sp.checkin}&checkout=${sp.checkout}&guests=${sp.guests ?? 2}`
                  : `/hotelaria/${listing.slug}`

                return (
                  <Link
                    key={listing.id}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column' }}
                  >
                    <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ height: '180px', background: 'linear-gradient(135deg, var(--ocean-mid), var(--sunset))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {listing.cover_image ? (
                          <img src={listing.cover_image} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                        ) : (
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5">
                            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                            <polyline points="9 22 9 12 15 12 15 22"/>
                          </svg>
                        )}
                      </div>

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

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                          {listing.price_label && (
                            <span style={{ fontWeight: 700, color: 'var(--ocean-mid)', fontSize: '0.9rem' }}>{listing.price_label}</span>
                          )}
                          <span style={{ fontSize: '0.8rem', color: 'var(--ocean-mid)', fontWeight: 600, marginLeft: 'auto' }}>
                            Ver detalhes →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          <div style={{ marginTop: '3rem', textAlign: 'center', padding: '2rem', background: 'white', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9375rem' }}>
              Tem uma pousada ou hotel em Paraty?
            </p>
            <Link href="/seja-parceiro" className="btn-primary" style={{ display: 'inline-flex', fontSize: '0.9rem', padding: '0.75rem 1.75rem' }}>
              Cadastre-se como parceiro
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
