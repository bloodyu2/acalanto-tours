import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { PhotographerPackage, PartnerPage, Partner } from '@/lib/types/database'
import PhotographyBookingWidget from '@/components/photography/PhotographyBookingWidget'
import type { PhotographyPackageForWidget } from '@/components/photography/PhotographyBookingWidget'
import GalleryLightbox from '@/components/ui/GalleryLightbox'

export const dynamic = 'force-dynamic'

// UTM attribution: when a client arrives via /parceiros/[slug] or via the photographer's
// Instagram bio link (?utm_source=instagram&utm_medium=bio&utm_campaign=[slug]),
// the UTM is stored in sessionStorage by the utm tracker (Plan 08).
// At checkout, /api/infinity-pay/create reads utm_campaign from the booking
// and applies 15% commission instead of 30%.

type PackageWithPartner = PhotographerPackage & { partners: Pick<Partner, 'name' | 'id'> | null }

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('photographer_packages')
    .select('name, description')
    .eq('slug', slug)
    .eq('active', true)
    .single()

  if (!data) return { title: 'Pacote não encontrado | Acalanto' }

  return {
    title: `${data.name} | Fotografia | Acalanto`,
    description: data.description ?? `Pacote de fotografia profissional para passeio de escuna em Paraty. Fotos editadas entregues em 48h.`,
  }
}

export default async function FotografiaDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: pkg, error: pkgError } = await supabase
    .from('photographer_packages')
    .select('*, partners(name, id)')
    .eq('slug', slug)
    .eq('active', true)
    .single()

  if (pkgError) {
    console.error('[fotografia/[slug]] Supabase error:', pkgError)
  }

  if (!pkg) {
    notFound()
  }

  const typedPkg = pkg as PackageWithPartner

  // Fetch unavailable dates for this photography package
  const { data: unavailRows } = await supabase
    .from('service_availability')
    .select('date')
    .eq('service_id', typedPkg.id)
    .eq('available', false)
  const unavailableDates = (unavailRows ?? []).map((r: { date: string }) => r.date)

  // Fetch this photographer's portfolio (gallery rows linked by photographer_package_id)
  const { data: galleryRows } = await supabase
    .from('gallery')
    .select('id, url, alt_text, display_order')
    .eq('photographer_package_id', typedPkg.id)
    .order('display_order', { ascending: true })
  const portfolio = (galleryRows ?? []) as { id: string; url: string; alt_text: string | null; display_order: number | null }[]

  const pkgForWidget: PhotographyPackageForWidget = {
    id: typedPkg.id,
    slug: typedPkg.slug,
    name: typedPkg.name,
    price_cents: (typedPkg as unknown as { price_cents?: number | null }).price_cents ?? null,
    price_label: typedPkg.price_label ?? null,
    duration_label: typedPkg.duration_label ?? null,
    includes: typedPkg.includes ?? [],
  }

  // Fetch partner page if partner exists
  let partnerPage: PartnerPage | null = null
  if (typedPkg.partners?.id) {
    const { data: pp, error: ppError } = await supabase
      .from('partner_pages')
      .select('*')
      .eq('partner_id', typedPkg.partners.id)
      .eq('active', true)
      .single()

    if (ppError && ppError.code !== 'PGRST116') {
      console.error('[fotografia/[slug]] partner_pages error:', ppError)
    }
    partnerPage = pp ?? null
  }

  return (
    <div style={{ background: 'var(--sand-warm)', minHeight: '100vh' }}>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #92400e 0%, var(--vertical-fotografia) 60%, #fcd34d 100%)',
        padding: '5rem 0 4rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <svg viewBox="0 0 1440 60" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%' }} preserveAspectRatio="none">
          <path d="M0,0 C360,60 1080,60 1440,0 L1440,60 L0,60 Z" fill="var(--sand-warm)" />
        </svg>

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <Link
            href="/fotografia"
            style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginBottom: '1.25rem' }}
          >
            ← Todos os pacotes
          </Link>

          {typedPkg.partners?.name && (
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.5rem' }}>
              {typedPkg.partners.name}
            </p>
          )}

          <h1 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 'clamp(1.8rem, 4vw, 3rem)',
            fontWeight: 700,
            color: 'white',
            margin: '0 0 0.75rem',
          }}>
            {typedPkg.name}
          </h1>

          <p style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'white',
          }}>
            {typedPkg.price_label ?? 'Consultar preco'}
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="container" style={{ padding: '3rem 1rem 5rem' }}>
        <div className="service-detail-grid">

          {/* Left: Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '1rem',
            }}>
              {[
                { label: 'Duração', value: typedPkg.duration_label ?? 'Todo o passeio' },
                { label: 'Preço', value: typedPkg.price_label ?? 'Consultar' },
                { label: 'Entrega', value: '48 horas' },
                { label: 'Fotos', value: 'Editadas' },
              ].map(stat => (
                <div key={stat.label} className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
                  <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                    {stat.label}
                  </p>
                  <p style={{ margin: 0, fontFamily: 'var(--font-playfair)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Includes */}
            {typedPkg.includes && typedPkg.includes.length > 0 && (
              <div className="card" style={{ padding: '1.75rem' }}>
                <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1.25rem', color: 'var(--text-primary)' }}>
                  O que está incluso
                </h2>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {typedPkg.includes.map((item, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <span style={{ color: 'var(--vertical-fotografia)', fontWeight: 700, fontSize: '1rem', flexShrink: 0, marginTop: '0.05rem' }}>✓</span>
                      <span style={{ color: 'var(--text-primary)', lineHeight: 1.5 }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Description */}
            {typedPkg.description && (
              <div className="card" style={{ padding: '1.75rem' }}>
                <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1rem', color: 'var(--text-primary)' }}>
                  Sobre o pacote
                </h2>
                <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.75 }}>
                  {typedPkg.description}
                </p>
              </div>
            )}

            {/* Portfolio — gallery linked to this photographer_package_id */}
            {portfolio.length > 0 && (
              <div className="card" style={{ padding: '1.75rem' }}>
                <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1rem', color: 'var(--text-primary)' }}>
                  Portfolio
                </h2>
                <p style={{ margin: '0 0 1.25rem', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  Algumas fotos do trabalho{typedPkg.partners?.name ? ` da ${typedPkg.partners.name}` : ''}.
                </p>
                <GalleryLightbox images={portfolio} title={typedPkg.name} />
              </div>
            )}

            {/* Photographer info */}
            {partnerPage?.bio ? (
              <div className="card" style={{ padding: '1.75rem' }}>
                <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1rem', color: 'var(--text-primary)' }}>
                  Sobre o fotógrafo
                </h2>
                {partnerPage.cover_image && (
                  <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', marginBottom: '1rem' }}>
                    <Image
                      src={partnerPage.cover_image}
                      alt={typedPkg.partners?.name ?? 'Fotografo'}
                      fill
                      sizes="80px"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                )}
                <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.75 }}>
                  {partnerPage.bio}
                </p>
                {partnerPage.instagram_url && (
                  <a
                    href={partnerPage.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginTop: '1rem',
                      color: 'var(--ocean-mid)',
                      textDecoration: 'none',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                    {' '}Ver portfolio no Instagram
                  </a>
                )}
              </div>
            ) : (
              <div className="card" style={{ padding: '1.75rem' }}>
                <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1rem', color: 'var(--text-primary)' }}>
                  Quem fotografa
                </h2>
                <p style={{ margin: '0 0 1rem', color: 'var(--text-muted)', lineHeight: 1.75 }}>
                  Este pacote é realizado pelos <strong>Fotógrafos de Paraty</strong> — um coletivo de fotógrafos profissionais especializados em passeios náuticos na baía de Paraty. Um fotógrafo embarca junto com você e registra toda a experiência.
                </p>
                <a
                  href="https://www.instagram.com/fotografosdeparaty"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--ocean-mid)',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                  @fotografosdeparaty no Instagram
                </a>
              </div>
            )}

            {/* How delivery works */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1rem', color: 'var(--text-primary)' }}>
                Como funciona a entrega
              </h2>
              <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem', counterReset: 'steps' }}>
                {[
                  'Um fotógrafo profissional embarca junto com você na escuna no dia do passeio.',
                  'Durante todo o passeio, os melhores momentos são registrados — das baías às praias.',
                  'As fotos são editadas profissionalmente após o passeio.',
                  'Você recebe um link privado de download em até 48 horas.',
                ].map((step, idx) => (
                  <li key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <span style={{
                      background: 'var(--vertical-fotografia)',
                      color: 'white',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      flexShrink: 0,
                    }}>
                      {idx + 1}
                    </span>
                    <span style={{ color: 'var(--text-muted)', lineHeight: 1.6, paddingTop: '0.15rem' }}>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

          </div>

          {/* Right: Booking widget */}
          <div>
            <PhotographyBookingWidget pkg={pkgForWidget} unavailableDates={unavailableDates} />
            {partnerPage?.instagram_url && (
              <a
                href={partnerPage.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  marginTop: '1rem', color: 'var(--text-muted)', textDecoration: 'none',
                  fontSize: '0.875rem', fontWeight: 500, padding: '0.625rem',
                  border: '1px solid var(--border)', borderRadius: '0.625rem', background: 'white',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                {' '}Ver portfolio no Instagram
              </a>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
