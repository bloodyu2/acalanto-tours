import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { getApprovedListings } from '@/lib/partner-listings'
import { createClient } from '@/lib/supabase/server'
import SearchBar from '@/components/hotelaria/SearchBar'
import HotelariaPageClient from '@/components/hotelaria/HotelariaPageClient'
import type { SheetListing } from '@/components/hotelaria/HotelSheet'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Hospedagem em Paraty — Acalanto Turismo',
  description: 'Encontre as melhores pousadas, hotéis e acomodações em Paraty, selecionadas pela Acalanto Turismo.',
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

  const sheetListings: SheetListing[] = listings.map(l => ({
    id: l.id,
    slug: l.slug,
    title: l.title,
    description: l.description ?? null,
    cover_image: l.cover_image ?? null,
    price_label: l.price_label ?? null,
    whatsapp_number: (l as unknown as { whatsapp_number?: string }).whatsapp_number ?? null,
    metadata: (l.metadata as Record<string, unknown>) ?? {},
  }))

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
          <HotelariaPageClient
            listings={sheetListings}
            checkin={sp.checkin}
            checkout={sp.checkout}
            guests={sp.guests}
          />

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
