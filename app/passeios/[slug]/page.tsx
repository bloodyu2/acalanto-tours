import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { ItineraryStop } from '@/lib/types/database'
import { FEATURE_LABELS, CANCELLATION_POLICY } from '@/lib/constants'
import BookingWidget from '@/components/booking/BookingWidget'
import GalleryLightbox from '@/components/ui/GalleryLightbox'

interface Props { params: Promise<{ slug: string }> }

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return { title: 'Passeio em Paraty | Acalanto' }
  const supabase = await createClient()
  const { data } = await supabase.from('boats').select('name,tagline').eq('slug', slug).single()
  if (!data) return { title: 'Passeio não encontrado' }
  return {
    title: `${data.name} | Passeio de Escuna em Paraty`,
    description: data.tagline ?? `Passeio de escuna ${data.name} em Paraty`,
  }
}

export default async function PasseioDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: boat } = await supabase
    .from('boats').select('*').eq('slug', slug).eq('active', true).single()
  if (!boat) notFound()

  const itinerary: ItineraryStop[] = Array.isArray(boat.itinerary) ? boat.itinerary as ItineraryStop[] : []

  // Dates where this boat is fully booked (sum of passengers >= capacity_max)
  const { data: photos } = await supabase
    .from('gallery')
    .select('id, url, alt_text')
    .eq('boat_id', boat.id)
    .order('display_order', { ascending: true })

  const { data: bookingCounts } = await supabase
    .from('bookings')
    .select('tour_date, adults, children, infants')
    .eq('boat_id', boat.id)
    .in('status', ['confirmed', 'whatsapp_initiated'])
    .gte('tour_date', new Date().toISOString().split('T')[0])

  const dateTotals: Record<string, number> = {}
  for (const b of bookingCounts ?? []) {
    if (!b.tour_date) continue
    dateTotals[b.tour_date] = (dateTotals[b.tour_date] ?? 0) + (b.adults ?? 0) + (b.children ?? 0) + ((b as any).infants ?? 0)
  }
  const soldOutDates = Object.entries(dateTotals)
    .filter(([, total]) => total >= boat.capacity_max)
    .map(([date]) => date)

  return (
    <>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, var(--ocean-deep) 0%, var(--ocean-mid) 100%)', padding: '4rem 0 3rem', position: 'relative' }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, lineHeight: 0 }}>
          <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '60px' }}>
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="white" />
          </svg>
        </div>
        <div className="container" style={{ position: 'relative' }}>
          <Link href="/passeios" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', textDecoration: 'none', display: 'block', marginBottom: '1rem' }}>
            ← Todos os passeios
          </Link>
          <span className="vertical-tag tag-passeios" style={{ marginBottom: '0.75rem', display: 'inline-flex' }}>Passeio de Escuna</span>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'white', marginBottom: '0.5rem' }}>
            {boat.name}
          </h1>
          {boat.tagline && <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.125rem' }}>{boat.tagline}</p>}
        </div>
      </section>

      {/* Photo gallery */}
      {photos && photos.length > 0 && (
        <section style={{ padding: '2rem 0 3rem', background: 'white' }}>
          <div className="container">
            <GalleryLightbox images={photos as { id: string; url: string; alt_text?: string | null }[]} title={boat.name} />
          </div>
        </section>
      )}

      <section style={{ padding: '4rem 0 5rem' }}>
        <div className="container">
          <div className="service-detail-grid">
            {/* Left - info */}
            <div>
              {boat.description && (
                <p style={{ fontSize: '1.0625rem', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '2rem' }}>
                  {boat.description}
                </p>
              )}

              {/* Quick stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {[
                  { label: 'Duração', value: `${boat.duration_hours}h` },
                  { label: 'Saída', value: boat.departure_time?.slice(0, 5) ?? '--' },
                  { label: 'Capacidade', value: `até ${boat.capacity_max}` },
                  { label: 'Adulto', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(boat.price_adult / 100) },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: 'var(--sand)', borderRadius: '10px', padding: '1rem', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)', marginBottom: '0.25rem' }}>{label}</div>
                    <div style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Features */}
              {boat.features && boat.features.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.125rem', color: 'var(--text-primary)', marginBottom: '0.875rem' }}>
                    Destaques deste passeio
                  </h3>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {boat.features.map(f => (
                      <span key={f} style={{ padding: '0.375rem 0.875rem', background: 'var(--sand)', border: '1px solid var(--border)', borderRadius: '9999px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        {FEATURE_LABELS[f] ?? f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Itinerary */}
              {itinerary.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.125rem', color: 'var(--text-primary)', marginBottom: '0.875rem' }}>
                    Roteiro
                  </h3>
                  <div style={{ position: 'relative', paddingLeft: '1.5rem' }}>
                    <div style={{ position: 'absolute', left: '6px', top: '8px', bottom: '8px', width: '2px', background: 'var(--border)' }} />
                    {itinerary.map((stop, i) => (
                      <div key={i} style={{ position: 'relative', marginBottom: '1rem', paddingLeft: '0.75rem' }}>
                        <div style={{ position: 'absolute', left: '-1.5rem', top: '4px', width: '14px', height: '14px', borderRadius: '50%', background: 'var(--ocean-mid)', border: '2px solid white' }} />
                        <div style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', fontWeight: 500 }}>{stop.stop}</div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{stop.minutes} minutos</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cancellation */}
              <div style={{ background: 'var(--sand)', borderRadius: '12px', padding: '1.25rem 1.5rem', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Cancelamento:</strong> {CANCELLATION_POLICY}
                </p>
              </div>
            </div>

            {/* Right - booking widget */}
            <div className="service-cta-sticky">
              <BookingWidget boat={boat} unavailableDates={soldOutDates} />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
