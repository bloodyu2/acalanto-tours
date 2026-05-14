import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getApprovedListings } from '@/lib/partner-listings'
import { createClient } from '@/lib/supabase/server'
import SearchBar from '@/components/hotelaria/SearchBar'
import HotelariaPageClient from '@/components/hotelaria/HotelariaPageClient'
import type { SheetListing } from '@/components/hotelaria/HotelSheet'
import PartnerCTA from '@/components/marketplace/PartnerCTA'

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
          {listings.length > 0 && (
            <HotelariaPageClient
              listings={sheetListings}
              checkin={sp.checkin}
              checkout={sp.checkout}
              guests={sp.guests}
            />
          )}

          {listings.length === 0 ? (
            <PartnerCTA
              variant="large"
              question="Sua pousada pode ser a primeira da plataforma Acalanto."
              subtitle="Estamos selecionando os melhores anfitriões em Paraty. Quem entrar agora pega o destaque inicial e a melhor faixa de comissão da plataforma."
              ctaLabel="Quero ser parceiro Acalanto"
            />
          ) : (
            <PartnerCTA
              question="Tem uma pousada ou hotel em Paraty?"
              subtitle="Junte-se à plataforma e receba reservas direto dos turistas que já chegam decididos sobre onde ficar."
              ctaLabel="Cadastre-se como parceiro"
            />
          )}
        </div>
      </section>
    </main>
  )
}
