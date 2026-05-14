import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { PhotographerPackage, Partner } from '@/lib/types/database'
import PartnerCTA from '@/components/marketplace/PartnerCTA'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Fotografia no Passeio | Acalanto',
  description: 'Fotografos profissionais que embarcam junto na sua escuna e registram todos os momentos da experiencia. Fotos editadas entregues em 48h por link de download.',
}

type PackageWithPartner = PhotographerPackage & { partners: Pick<Partner, 'name'> | null }

export default async function FotografiaPage() {
  const supabase = await createClient()

  const { data: packages, error } = await supabase
    .from('photographer_packages')
    .select('*, partners(name)')
    .eq('active', true)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('[fotografia/page] Supabase error:', error)
  }

  const pkgs = (packages ?? []) as PackageWithPartner[]

  return (
    <div style={{ background: 'var(--sand-warm)', minHeight: '100vh' }}>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #92400e 0%, var(--vertical-fotografia) 60%, #fcd34d 100%)',
        padding: '5rem 0 4rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <svg viewBox="0 0 1440 60" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%' }} preserveAspectRatio="none">
          <path d="M0,0 C360,60 1080,60 1440,0 L1440,60 L0,60 Z" fill="var(--sand-warm)" />
        </svg>

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.3rem 1rem',
            borderRadius: '9999px',
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            fontSize: '0.8rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '1rem',
            border: '1px solid rgba(255,255,255,0.35)',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline',verticalAlign:'middle',marginRight:'0.3rem'}}><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg> Fotografia
          </span>
          <h1 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 700,
            color: 'white',
            margin: '0.75rem 0 1.25rem',
          }}>
            Fotografia no Passeio
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem', maxWidth: '640px', margin: '0 auto', lineHeight: 1.7 }}>
            O fotógrafo embarca junto na sua escuna e registra todos os momentos da experiência, das baías às praias. Fotos editadas entregues em 48h por link de download.
          </p>
        </div>
      </div>

      {/* Info banner */}
      <section style={{ padding: '2.5rem 0 0' }}>
        <div className="container">
          <div style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '1rem',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
          }}>
            <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', color: '#d97706' }}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0018 8 6 6 0 006 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 018.91 14"/></svg></span>
            <div>
              <p style={{ margin: 0, color: 'var(--text-primary)', lineHeight: 1.65, fontSize: '0.95rem' }}>
                <strong>Como funciona:</strong> O fotógrafo embarca junto com você na escuna e acompanha todo o passeio. As fotos são editadas profissionalmente e entregues em 48 horas por link de download privado. Você escolhe o pacote e combina os detalhes pelo WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Packages grid */}
      <section style={{ padding: '3rem 0 5rem' }}>
        <div className="container">
          {pkgs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
              <div style={{ marginBottom: '1rem', color: 'var(--ocean-mid)', display: 'flex', justifyContent: 'center' }}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg></div>
              <p style={{ fontSize: '1.1rem' }}>Nenhum pacote disponível no momento.</p>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Entre em contato pelo WhatsApp para mais informações.</p>
            </div>
          ) : (
            <div className="marketplace-grid">
              {pkgs.map(pkg => (
                <PhotographerPackageCard key={pkg.id} pkg={pkg} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section style={{ padding: '0 1.5rem 4rem' }}>
        <div className="container">
          <PartnerCTA
            question="Você é fotógrafo em Paraty?"
            subtitle="Junte-se ao coletivo Acalanto e ofereça seus pacotes pra clientes que já chegam reservando passeios."
            ctaLabel="Quero ser fotógrafo Acalanto"
          />
        </div>
      </section>

    </div>
  )
}

function PhotographerPackageCard({ pkg }: { pkg: PackageWithPartner }) {
  const firstThreeIncludes = pkg.includes?.slice(0, 3) ?? []

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: '1rem' }}>
      {/* Cover image */}
      <div style={{
        height: '200px',
        background: 'linear-gradient(135deg, #92400e 0%, var(--vertical-fotografia) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        {pkg.cover_image ? (
          <Image
            src={pkg.cover_image}
            alt={pkg.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            quality={85}
            style={{ objectFit: 'cover', color: 'transparent' }}
          />
        ) : (
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{color:'rgba(255,255,255,0.7)'}}><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
        )}
        <div style={{
          position: 'absolute',
          top: '0.75rem',
          left: '0.75rem',
        }}>
          <span className="vertical-tag tag-fotografia" style={{ fontSize: '0.7rem' }}>
            Fotografia
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {pkg.partners?.name && (
          <p style={{ margin: '0 0 0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {pkg.partners.name}
          </p>
        )}

        <h3 style={{
          margin: '0 0 0.5rem',
          fontFamily: 'var(--font-playfair)',
          fontSize: '1.2rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          lineHeight: 1.3,
        }}>
          {pkg.name}
        </h3>

        {pkg.duration_label && (
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Duração: {pkg.duration_label}
          </p>
        )}

        {firstThreeIncludes.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '1rem' }}>
            {firstThreeIncludes.map((item, idx) => (
              <span key={idx} style={{
                background: 'rgba(245, 158, 11, 0.12)',
                color: '#92400e',
                fontSize: '0.72rem',
                padding: '0.2rem 0.6rem',
                borderRadius: '9999px',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                fontWeight: 500,
              }}>
                {item}
              </span>
            ))}
          </div>
        )}

        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <span style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--ocean-deep)',
          }}>
            {pkg.price_label ?? 'Consultar'}
          </span>
          <Link
            href={`/fotografia/${pkg.slug}`}
            style={{
              background: 'var(--vertical-fotografia)',
              color: 'white',
              padding: '0.5rem 1.1rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 600,
              transition: 'opacity 0.2s',
            }}
          >
            Ver pacote
          </Link>
        </div>
      </div>
    </div>
  )
}
