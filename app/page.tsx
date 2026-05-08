export const dynamic = 'force-dynamic'

import Link from 'next/link'
import HeroSection from '@/components/home/HeroSection'
import VerticalsSection from '@/components/home/VerticalsSection'
import ToursSection from '@/components/home/ToursSection'
import ServicesSection from '@/components/home/ServicesSection'
import TestimonialsSection from '@/components/home/TestimonialsSection'
import { createClient } from '@/lib/supabase/server'
import type { HeroSlide } from '@/components/home/HeroCarousel'

export default async function HomePage() {
  const sb = await createClient()

  // Boats with cover_image or first gallery photo as fallback
  const { data: boats } = await sb
    .from('boats')
    .select('id, slug, name, tagline, price_adult, cover_image')
    .eq('active', true)
    .order('display_order', { ascending: true })

  const { data: galleryRows } = await sb
    .from('gallery')
    .select('boat_id, url')
    .not('boat_id', 'is', null)
    .order('display_order', { ascending: true })

  // Build first-gallery-photo lookup per boat
  const firstGallery: Record<string, string> = {}
  for (const g of galleryRows ?? []) {
    if (g.boat_id && !firstGallery[g.boat_id]) firstGallery[g.boat_id] = g.url
  }

  const heroSlides: HeroSlide[] = (boats ?? [])
    .map(b => {
      const photo = b.cover_image ?? firstGallery[b.id] ?? null
      if (!photo) return null
      const priceFormatted = b.price_adult
        ? `A partir de R$${(b.price_adult / 100).toFixed(0)}/adulto`
        : undefined
      return {
        url: photo,
        alt: `${b.name} — passeio em Paraty`,
        href: `/passeios/${b.slug}`,
        name: b.name,
        tagline: b.tagline ?? '',
        priceLabel: priceFormatted,
      } satisfies HeroSlide
    })
    .filter((s): s is HeroSlide => s !== null)

  return (
    <>
      <HeroSection slides={heroSlides} />
      <VerticalsSection />
      <ToursSection />
      <ServicesSection />
      <TestimonialsSection />

      {/* Fale Conosco CTA */}
      <section style={{ padding: '5rem 0', background: 'white', textAlign: 'center' }}>
        <div className="container">
          <span className="section-tag">Fale Conosco</span>
          <h2 className="section-title" style={{ maxWidth: '480px', margin: '0 auto 1rem' }}>
            Pronto para navegar?
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.0625rem', lineHeight: 1.65, maxWidth: '460px', margin: '0 auto 2.5rem' }}>
            Nossa equipe responde rapidamente pelo WhatsApp ou e-mail. Tire todas as suas dúvidas.
          </p>
          <Link href="/contato" className="btn-primary" style={{ fontSize: '1rem', padding: '0.875rem 2rem' }}>
            Entrar em contato
          </Link>
        </div>
      </section>
    </>
  )
}
