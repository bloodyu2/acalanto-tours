import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Boat } from '@/lib/types/database'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Passeios de Escuna em Paraty',
  description: 'Escolha entre 4 escunas com personalidades únicas. Saídas diárias pelas ilhas e praias da Baía de Paraty.',
}

function BoatCard({ boat }: { boat: Boat }) {
  const priceFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(boat.price_adult / 100)
  const departureLabel = boat.departure_time ? boat.departure_time.slice(0, 5).replace(':', 'h') : '10h30'

  return (
    <Link href={`/passeios/${boat.slug}`} style={{ textDecoration: 'none' }}>
      <div className="card" style={{ overflow: 'hidden', background: 'white', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Cover */}
        <div style={{
          height: '210px',
          background: 'linear-gradient(135deg, var(--ocean-deep) 0%, var(--ocean-mid) 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {boat.cover_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={boat.cover_image} alt={boat.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 20a2 2 0 002 2h16a2 2 0 002-2"/>
                <path d="M4 20l4-12h8l4 12"/>
                <line x1="12" y1="2" x2="12" y2="8"/>
                <path d="M8 8h8"/>
              </svg>
            </div>
          )}
          {/* Badge vertical */}
          <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem' }}>
            <span className="vertical-tag tag-passeios">Escuna</span>
          </div>
          {/* Badge preço */}
          <div style={{
            position: 'absolute', top: '0.75rem', right: '0.75rem',
            background: 'var(--sunset)', color: 'var(--ocean-deep)',
            fontWeight: 700, fontSize: '0.875rem',
            padding: '0.3rem 0.75rem', borderRadius: '999px',
            fontFamily: 'var(--font-mono)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}>
            {priceFormatted}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0' }}>
          <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--ocean-deep)', marginBottom: '0.25rem', letterSpacing: '-0.01em' }}>
            {boat.name}
          </h3>
          {boat.tagline && (
            <p style={{ fontSize: '0.875rem', color: 'var(--ocean-mid)', fontWeight: 600, marginBottom: '0.625rem', fontFamily: 'var(--font-jakarta)' }}>
              {boat.tagline}
            </p>
          )}
          {boat.description && (
            <p className="line-clamp-2" style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '0.875rem', flex: 1, fontFamily: 'var(--font-jakarta)' }}>
              {boat.description}
            </p>
          )}

          {/* Meta */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.875rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Saída {departureLabel}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {boat.duration_hours}h de passeio
            </span>
          </div>

          {/* Features */}
          {boat.features && boat.features.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
              {boat.features.slice(0, 3).map(f => (
                <span key={f} className="feature-badge">{f}</span>
              ))}
            </div>
          )}

          {/* CTA */}
          <div style={{
            marginTop: 'auto',
            padding: '0.625rem 0', borderTop: '1px solid var(--border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>
                a partir de
              </div>
              <div style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ocean-deep)', letterSpacing: '-0.02em' }}>
                {priceFormatted}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-jakarta)' }}>por pessoa</div>
            </div>
            <span style={{
              background: 'var(--ocean-deep)', color: 'white',
              padding: '0.625rem 1.125rem', borderRadius: '10px',
              fontSize: '0.875rem', fontWeight: 700,
              fontFamily: 'var(--font-jakarta)',
            }}>
              Ver detalhes
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default async function PasseiosPage() {
  const supabase = await createClient()
  const { data: boats, error } = await supabase
    .from('boats')
    .select('*')
    .eq('active', true)
    .order('display_order', { ascending: true })
  if (error) console.error('[passeios] supabase error:', error.message)

  return (
    <>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(160deg, #051f30 0%, var(--ocean-deep) 60%, var(--ocean-mid) 100%)',
        padding: '4rem 0 3rem', position: 'relative',
      }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, lineHeight: 0 }}>
          <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '60px' }}>
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="white" />
          </svg>
        </div>
        <div className="container" style={{ position: 'relative' }}>
          <span className="vertical-tag tag-passeios" style={{ marginBottom: '1rem', display: 'inline-flex' }}>Passeios de Escuna</span>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.875rem, 5vw, 2.75rem)', color: 'white', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
            Escolha sua escuna
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.0625rem', maxWidth: '540px', lineHeight: 1.65, fontFamily: 'var(--font-jakarta)' }}>
            Quatro embarcações, quatro jeitos de conhecer a Baía de Paraty. Saídas diárias, grupos com até 50 pessoas.
          </p>
        </div>
      </section>

      {/* Listing */}
      <section style={{ padding: '4rem 0 5rem' }}>
        <div className="container">
          {/* Pricing note */}
          <div style={{
            background: 'var(--sand-warm)', borderRadius: '12px',
            padding: '1rem 1.5rem', marginBottom: '2.5rem',
            display: 'flex', alignItems: 'flex-start', gap: '0.875rem',
            borderLeft: '3px solid var(--ocean-mid)',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ocean-mid)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: '2px' }}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, fontFamily: 'var(--font-jakarta)' }}>
              <strong style={{ color: 'var(--ocean-deep)' }}>Tabela de preços:</strong>{' '}
              Adultos pagam valor cheio. Crianças de 6 a 12 anos pagam meia entrada. Crianças até 5 anos não pagam. Pagamento pelo WhatsApp ou online.
            </div>
          </div>

          <div className="marketplace-grid">
            {boats?.map(boat => <BoatCard key={boat.id} boat={boat} />)}
          </div>

          {(!boats || boats.length === 0) && (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
              <div style={{ marginBottom: '1rem', color: 'var(--ocean-mid)', display: 'flex', justifyContent: 'center' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 20a2 2 0 002 2h16a2 2 0 002-2"/>
                  <path d="M4 20l4-12h8l4 12"/>
                  <line x1="12" y1="2" x2="12" y2="8"/>
                  <path d="M8 8h8"/>
                </svg>
              </div>
              <p style={{ fontFamily: 'var(--font-jakarta)' }}>Nenhum passeio disponível no momento. Volte em breve.</p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
