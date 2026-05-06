import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import BookingWidget from '@/components/booking/BookingWidget'
import { formatCents } from '@/lib/booking/pricing'
import { FEATURE_LABELS } from '@/lib/constants'

// Force dynamic rendering — Supabase env vars may not be present at build time
export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { title: 'Passeio de Escuna em Paraty | Acalanto Turismo' }
  }
  const supabase = await createClient()
  const { data } = await supabase.from('boats').select('name,tagline,description').eq('slug', slug).single()
  if (!data) return { title: 'Passeio não encontrado' }
  return {
    title: `${data.name} | Passeio de Escuna em Paraty`,
    description: data.description || data.tagline || `Passeio ${data.name} em Paraty`,
  }
}

export default async function TourPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: boat } = await supabase.from('boats').select('*').eq('slug', slug).eq('active', true).single()
  if (!boat) notFound()

  const { data: gallery } = await supabase.from('gallery').select('*').eq('boat_id', boat.id).order('display_order')

  const departure = boat.departure_time?.slice(0, 5).replace(':', 'h') || '10h30'
  const itinerary: Array<{ stop: string; minutes: number }> = Array.isArray(boat.itinerary) ? boat.itinerary : []

  return (
    <>
      {/* Hero */}
      <section style={{
        position: 'relative', minHeight: '55vh',
        background: `linear-gradient(135deg, var(--ocean-deep) 0%, var(--ocean-mid) 100%)`,
        display: 'flex', alignItems: 'flex-end',
        overflow: 'hidden',
      }}>
        {boat.cover_image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={boat.cover_image} alt={boat.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }} />
        )}

        {/* Bottom wave */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, lineHeight: 0 }}>
          <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '60px' }}>
            <path d="M0,40 C360,60 1080,20 1440,40 L1440,60 L0,60 Z" fill="white" />
          </svg>
        </div>

        <div className="container" style={{ position: 'relative', paddingBottom: '4rem' }}>
          <Link href="/#escunas" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', textDecoration: 'none', marginBottom: '1.25rem' }}>
            ← Todas as escunas
          </Link>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'white', marginBottom: '0.5rem' }}>
            {boat.name}
          </h1>
          {boat.tagline && (
            <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.82)', fontWeight: 600 }}>
              {boat.tagline}
            </p>
          )}
        </div>
      </section>

      {/* Main content */}
      <section style={{ padding: '3rem 0 5rem' }}>
        <div className="container">
          <div className="tour-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '3rem', alignItems: 'start' }}>
            {/* Left: details */}
            <div>
              {/* Quick info */}
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', padding: '1.25rem', background: 'var(--sand)', borderRadius: '1rem', marginBottom: '2rem' }}>
                {[
                  { icon: (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>), label: 'Saída', value: departure },
                  { icon: (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>), label: 'Duração', value: `${boat.duration_hours}h` },
                  { icon: (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>), label: 'Capacidade', value: `até ${boat.capacity_max} pax` },
                  { icon: (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>), label: 'A partir de', value: formatCents(boat.price_adult) },
                ].map(({ icon, label, value }) => (
                  <div key={label} style={{ textAlign: 'center', flex: '1 1 100px' }}>
                    <div style={{ marginBottom: '0.25rem', color: 'var(--ocean-mid)', display: 'flex', justifyContent: 'center' }}>{icon}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                    <div style={{ fontWeight: 700, color: 'var(--ocean-deep)', fontSize: '0.9375rem' }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Description */}
              {boat.description && (
                <div style={{ marginBottom: '2rem' }}>
                  <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.5rem', color: 'var(--ocean-deep)', marginBottom: '0.75rem' }}>
                    Sobre este passeio
                  </h2>
                  <p style={{ fontSize: '1.0625rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                    {boat.description}
                  </p>
                </div>
              )}

              {/* Features */}
              {boat.features && boat.features.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.5rem', color: 'var(--ocean-deep)', marginBottom: '1rem' }}>
                    Características
                  </h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {boat.features.map(f => (
                      <span key={f} style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                        background: 'rgba(26,107,138,0.1)', color: 'var(--ocean-mid)',
                        padding: '0.5rem 1rem', borderRadius: '0.625rem', fontWeight: 600, fontSize: '0.9rem',
                      }}>
                        {FEATURE_LABELS[f] || f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Itinerary */}
              {itinerary.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.5rem', color: 'var(--ocean-deep)', marginBottom: '1rem' }}>
                    Roteiro
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                    {itinerary.map((stop, i) => (
                      <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        {/* Timeline dot */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                          <div style={{ width: '1rem', height: '1rem', borderRadius: '50%', background: 'var(--ocean-mid)', border: '3px solid white', boxShadow: '0 0 0 2px var(--ocean-mid)' }} />
                          {i < itinerary.length - 1 && (
                            <div style={{ width: '2px', height: '2.5rem', background: 'var(--border)', margin: '0.25rem 0' }} />
                          )}
                        </div>
                        <div style={{ paddingBottom: '1.25rem' }}>
                          <p style={{ fontWeight: 700, color: 'var(--ocean-deep)', marginBottom: '0.125rem' }}>{stop.stop}</p>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{stop.minutes} minutos</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing info */}
              <div style={{ background: 'var(--sand)', borderRadius: '1rem', padding: '1.5rem', marginBottom: '2rem' }}>
                <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', color: 'var(--ocean-deep)', marginBottom: '1rem' }}>
                  Tabela de preços
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    { label: 'Adulto', price: formatCents(boat.price_adult), desc: 'Por pessoa' },
                    { label: `Criança (6–${boat.child_half_until_age} anos)`, price: formatCents(boat.price_child), desc: 'Meia entrada' },
                    { label: `Criança (até ${boat.child_free_until_age} anos)`, price: 'Grátis', desc: 'Não paga' },
                  ].map(({ label, price, desc }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.625rem', borderBottom: '1px solid var(--sand-dark)' }}>
                      <div>
                        <p style={{ fontWeight: 600, color: 'var(--ocean-deep)', fontSize: '0.9375rem' }}>{label}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{desc}</p>
                      </div>
                      <p style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--sunset)' }}>{price}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gallery */}
              {gallery && gallery.length > 0 && (
                <div>
                  <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.5rem', color: 'var(--ocean-deep)', marginBottom: '1rem' }}>
                    Galeria
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.625rem' }}>
                    {gallery.map(img => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={img.id} src={img.url} alt={img.alt_text || boat.name} style={{ width: '100%', height: '130px', objectFit: 'cover', borderRadius: '0.625rem' }} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: booking widget */}
            <div className="tour-detail-sticky" style={{ position: 'sticky', top: '90px' }}>
              <BookingWidget boat={boat} />
            </div>
          </div>
        </div>
      </section>

    </>
  )
}
