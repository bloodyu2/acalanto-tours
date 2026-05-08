import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getListingBySlug } from '@/lib/partner-listings'
import { createClient } from '@/lib/supabase/server'
import AccommodationBookingWidget from '@/components/hotelaria/AccommodationBookingWidget'
import CalendarSyncBar from '@/components/hotelaria/CalendarSyncBar'
import HotelPageClient from '@/components/hotelaria/HotelPageClient'
import type { AccommodationRoom } from '@/lib/types/database'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ checkin?: string; checkout?: string; guests?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const listing = await getListingBySlug(slug)
  if (!listing) return { title: 'Hospedagem não encontrada' }
  return {
    title: `${listing.title} — Acalanto Turismo`,
    description: listing.description ?? `Hospedagem em Paraty: ${listing.title}`,
  }
}

export default async function HotelariaSlugPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams
  const listing = await getListingBySlug(slug)
  if (!listing) notFound()

  const supabase = await createClient()

  // Fetch rooms
  const { data: roomRows } = await supabase
    .from('accommodation_rooms')
    .select('*')
    .eq('listing_id', listing.id)
    .eq('active', true)
    .order('display_order')
  const rooms: AccommodationRoom[] = (roomRows ?? []) as AccommodationRoom[]

  // Fetch property-level blocked dates (room_id IS NULL)
  const { data: blockedRows } = await supabase
    .from('accommodation_availability')
    .select('date, status')
    .eq('listing_id', listing.id)
    .is('room_id', null)
    .neq('status', 'available')

  // Legacy listing-level pricing (for properties without rooms)
  const { data: accomData } = await supabase
    .from('partner_listings')
    .select('price_cents_per_night, price_cents_extra_guest, max_guests, min_nights')
    .eq('id', listing.id)
    .single()

  const meta = listing.metadata as Record<string, unknown>
  const amenities = (meta.amenities as string[]) ?? []
  const hotelType = meta.hotel_type as string | undefined
  const policies = meta.policies as string | undefined
  const hotelTypeLabel: Record<string, string> = { pousada: 'Pousada', hotel: 'Hotel', airbnb: 'Airbnb' }

  const hasRooms = rooms.length > 0
  const hasLegacyPrice = !hasRooms && !!accomData?.price_cents_per_night

  const sheetListing = {
    id: listing.id,
    slug: listing.slug,
    title: listing.title,
    description: listing.description,
    cover_image: listing.cover_image,
    price_label: listing.price_label,
    whatsapp_number: (meta.whatsapp as string) ?? null,
    metadata: meta,
  }

  return (
    <main style={{ paddingTop: '5rem', minHeight: '80vh' }}>
      {/* Hero */}
      <div style={{ height: '280px', background: 'linear-gradient(135deg, var(--ocean-mid), var(--sunset))', position: 'relative', overflow: 'hidden' }}>
        {listing.cover_image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={listing.cover_image} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }} />
        <div style={{ position: 'absolute', bottom: '1.75rem', left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '900px', padding: '0 1.5rem' }}>
          <Link href="/hotelaria" style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.8125rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}>
            ← Hospedagem
          </Link>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', color: 'white', lineHeight: 1.15 }}>
            {listing.title}
          </h1>
          {hotelType && (
            <span style={{ display: 'inline-block', marginTop: '0.375rem', background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.625rem', borderRadius: '999px' }}>
              {hotelTypeLabel[hotelType] ?? hotelType}
            </span>
          )}
        </div>
      </div>

      {/* Content — responsive: single column when rooms present, 2-col for legacy */}
      <section style={{ padding: 'clamp(2rem, 5vw, 3.5rem) 1.25rem', background: 'var(--sand)' }}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: hasLegacyPrice ? 'minmax(0,1fr) minmax(0,320px)' : '1fr',
          gap: '2.5rem',
          alignItems: 'start',
        }}>
          {/* Left / main content */}
          <div>
            {listing.description && (
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>Sobre</h2>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.75, whiteSpace: 'pre-line' }}>{listing.description}</p>
              </div>
            )}

            {amenities.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>Comodidades</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem' }}>
                  {amenities.map((a: string) => (
                    <span key={a} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: 'white', border: '1px solid var(--border)', padding: '0.375rem 0.875rem', borderRadius: '999px', fontSize: '0.85rem' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--ocean-mid)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Room cards — client component */}
            {hasRooms && (
              <HotelPageClient listing={sheetListing} rooms={rooms} />
            )}

            {policies && (
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>Regras e políticas</h2>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.75, whiteSpace: 'pre-line' }}>{policies}</p>
              </div>
            )}

            <CalendarSyncBar slug={listing.slug} siteUrl={process.env.NEXT_PUBLIC_SITE_URL || 'https://acalantoturismo.com.br'} />

            <div style={{ marginTop: '1.25rem', padding: '1rem 1.25rem', background: 'white', border: '1px dashed var(--border)', borderRadius: '10px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Este é o seu negócio?{' '}
              <Link href={`/parceiros/cadastro?claim=${listing.slug}`} style={{ color: 'var(--ocean-mid)', fontWeight: 600 }}>
                Reivindique esta página
              </Link>
            </div>
          </div>

          {/* Right: legacy booking widget (only when no room-based pricing) */}
          {hasLegacyPrice && (
            <div>
              <AccommodationBookingWidget
                listing={{
                  id: listing.id,
                  slug: listing.slug,
                  name: listing.title,
                  price_cents_per_night: accomData!.price_cents_per_night ?? null,
                  price_cents_extra_guest: accomData!.price_cents_extra_guest ?? null,
                  max_guests: accomData!.max_guests ?? null,
                  min_nights: accomData!.min_nights ?? null,
                }}
                blockedDates={blockedRows ?? []}
                initialCheckIn={sp.checkin}
                initialCheckOut={sp.checkout}
                initialGuests={sp.guests ? parseInt(sp.guests) : undefined}
              />
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
