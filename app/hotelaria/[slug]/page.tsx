import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getListingBySlug } from '@/lib/partner-listings'
import { createClient } from '@/lib/supabase/server'
import AccommodationBookingWidget from '@/components/hotelaria/AccommodationBookingWidget'

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

  // Fetch blocked/booked dates
  const supabase = await createClient()
  const { data: blockedRows } = await supabase
    .from('accommodation_availability')
    .select('date, status')
    .eq('listing_id', listing.id)
    .neq('status', 'available')

  // Fetch extra accommodation columns (added via migration)
  const { data: accomData } = await supabase
    .from('partner_listings')
    .select('price_cents_per_night, price_cents_extra_guest, max_guests, min_nights')
    .eq('id', listing.id)
    .single()

  const meta = listing.metadata as Record<string, unknown>
  const whatsapp = meta.whatsapp as string | undefined
  const amenities = (meta.amenities as string[]) ?? []
  const hotelType = meta.hotel_type as string | undefined

  const hotelTypeLabel: Record<string, string> = { pousada: 'Pousada', hotel: 'Hotel', airbnb: 'Airbnb' }

  const hasBookingPrice = !!accomData?.price_cents_per_night

  return (
    <main style={{ paddingTop: '5rem', minHeight: '80vh' }}>
      {/* Hero image */}
      <div style={{ height: '320px', background: 'linear-gradient(135deg, var(--ocean-mid), var(--sunset))', position: 'relative', overflow: 'hidden' }}>
        {listing.cover_image && (
          <img src={listing.cover_image} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }}/>
        <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '900px', padding: '0 1.5rem' }}>
          <Link href="/hotelaria" style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.8125rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.75rem' }}>
            ← Hospedagem
          </Link>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: 'white', lineHeight: 1.1 }}>
            {listing.title}
          </h1>
          {hotelType && (
            <span style={{ display: 'inline-block', marginTop: '0.5rem', background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.75rem', borderRadius: '999px' }}>
              {hotelTypeLabel[hotelType] ?? hotelType}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <section style={{ padding: 'clamp(2.5rem, 6vw, 4rem) 1.5rem', background: 'var(--sand)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr minmax(0, 340px)', gap: '2.5rem', alignItems: 'start' }}>

          {/* Left: details */}
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

            {/* Claim CTA */}
            <div style={{ marginTop: '3rem', padding: '1rem 1.25rem', background: 'white', border: '1px dashed var(--border)', borderRadius: '10px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Este é o seu negócio?{' '}
              <Link href={`/parceiros/cadastro?claim=${listing.slug}`} style={{ color: 'var(--ocean-mid)', fontWeight: 600 }}>
                Reivindique esta página
              </Link>
            </div>
          </div>

          {/* Right: booking widget or WhatsApp fallback */}
          <div>
            {hasBookingPrice ? (
              <AccommodationBookingWidget
                listing={{
                  id: listing.id,
                  slug: listing.slug,
                  name: listing.title,
                  price_cents_per_night: accomData.price_cents_per_night ?? null,
                  price_cents_extra_guest: accomData.price_cents_extra_guest ?? null,
                  max_guests: accomData.max_guests ?? null,
                  min_nights: accomData.min_nights ?? null,
                }}
                blockedDates={blockedRows ?? []}
                initialCheckIn={sp.checkin}
                initialCheckOut={sp.checkout}
                initialGuests={sp.guests ? parseInt(sp.guests) : undefined}
              />
            ) : (
              <div style={{ background: 'white', borderRadius: '16px', padding: '1.75rem', border: '1px solid var(--border)', position: 'sticky', top: '6rem' }}>
                {listing.price_label && (
                  <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.375rem', fontWeight: 700, color: 'var(--ocean-deep)', marginBottom: '1.25rem' }}>
                    {listing.price_label}
                  </p>
                )}
                {whatsapp ? (
                  <a
                    href={`https://wa.me/${whatsapp}?text=Olá! Vi sua hospedagem no site da Acalanto Turismo e gostaria de saber a disponibilidade.`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem', textDecoration: 'none', width: '100%' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    Falar pelo WhatsApp
                  </a>
                ) : (
                  <a
                    href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5524999627968'}?text=Olá! Tenho interesse na hospedagem "${listing.title}" que vi no site da Acalanto Turismo.`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem', textDecoration: 'none', width: '100%' }}
                  >
                    Consultar disponibilidade
                  </a>
                )}
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.875rem', lineHeight: 1.5 }}>
                  Parceiro verificado pela Acalanto Turismo
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
