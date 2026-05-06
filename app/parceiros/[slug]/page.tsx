import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('partner_pages')
    .select('headline, partners(name)')
    .eq('slug', slug)
    .eq('active', true)
    .maybeSingle()

  if (!data) return { title: 'Parceiro' }

  const partnerName = Array.isArray(data.partners)
    ? data.partners[0]?.name
    : (data.partners as { name: string } | null)?.name

  return {
    title: data.headline ?? partnerName ?? 'Parceiro',
    description: `Passeios de escuna em Paraty com ${partnerName ?? 'parceiro Acalanto'}.`,
  }
}

export default async function PartnerPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: page } = await supabase
    .from('partner_pages')
    .select('*, partners(name, type)')
    .eq('slug', slug)
    .eq('active', true)
    .maybeSingle()

  if (!page) notFound()

  const partner = Array.isArray(page.partners)
    ? page.partners[0]
    : (page.partners as { name: string; type: string } | null)

  const partnerName = partner?.name ?? slug
  const whatsappNumber = page.whatsapp_number ?? process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5524999627968'
  const whatsappMsg = encodeURIComponent(
    'Oi! Vi seu link e tenho interesse em um passeio de escuna em Paraty. Pode me ajudar?'
  )
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${whatsappMsg}`
  const passeiosHref = `/passeios?utm_source=instagram&utm_medium=bio&utm_campaign=${slug}`

  return (
    <main style={{ minHeight: '100vh', background: 'var(--sand, #F5EDD8)', fontFamily: 'var(--font-jakarta, sans-serif)' }}>
      {/* Hero */}
      <div style={{
        position: 'relative',
        height: '340px',
        background: page.cover_image
          ? undefined
          : 'linear-gradient(135deg, var(--ocean-deep, #0A3D5C) 0%, var(--ocean-mid, #1A6B8A) 100%)',
        display: 'flex',
        alignItems: 'flex-end',
        overflow: 'hidden',
      }}>
        {page.cover_image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={page.cover_image}
            alt={partnerName}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)',
        }} />
        <div className="container" style={{ position: 'relative', zIndex: 1, paddingBottom: '2rem' }}>
          <h1 style={{
            fontFamily: 'var(--font-playfair, serif)',
            fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
            color: '#fff',
            margin: 0,
            lineHeight: 1.2,
          }}>
            {partnerName}
          </h1>
          {page.headline && (
            <p style={{ color: 'rgba(255,255,255,0.9)', margin: '0.5rem 0 0', fontSize: '1.05rem' }}>
              {page.headline}
            </p>
          )}
        </div>
      </div>

      <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem', maxWidth: '680px' }}>
        {/* Bio */}
        {page.bio && (
          <section style={{ marginBottom: '2.5rem' }}>
            <p style={{
              color: 'var(--text-primary, #1a1a1a)',
              fontSize: '1.05rem',
              lineHeight: 1.75,
              whiteSpace: 'pre-wrap',
              margin: 0,
            }}>
              {page.bio}
            </p>
          </section>
        )}

        {/* CTA Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block',
              background: '#25D366',
              color: '#fff',
              textAlign: 'center',
              padding: '1rem 1.5rem',
              borderRadius: '12px',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '1rem',
              letterSpacing: '0.01em',
            }}
          >
            Falar no WhatsApp
          </a>

          <Link
            href={passeiosHref}
            style={{
              display: 'block',
              background: 'var(--ocean-deep, #0A3D5C)',
              color: '#fff',
              textAlign: 'center',
              padding: '1rem 1.5rem',
              borderRadius: '12px',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '1rem',
              letterSpacing: '0.01em',
            }}
          >
            Reservar passeio de escuna
          </Link>

          {page.instagram_url && (
            <a
              href={page.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                background: 'transparent',
                color: 'var(--ocean-deep, #0A3D5C)',
                textAlign: 'center',
                padding: '0.9rem 1.5rem',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                border: '2px solid var(--ocean-deep, #0A3D5C)',
              }}
            >
              Ver no Instagram
            </a>
          )}
        </div>

        {/* Footer note */}
        <p style={{
          color: 'var(--text-muted, #6b7280)',
          fontSize: '0.85rem',
          textAlign: 'center',
          margin: 0,
        }}>
          Reservas via Acalanto Turismo
        </p>
      </div>
    </main>
  )
}
