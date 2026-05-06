import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Boat } from '@/lib/types/database'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Passeios de Escuna em Paraty',
  description: 'Escolha entre 4 escunas com personalidades unicas. Saidas diarias pelas ilhas e praias da Baia de Paraty.',
}

function BoatCard({ boat }: { boat: Boat }) {
  const priceFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(boat.price_adult / 100)

  return (
    <Link href={`/passeios/${boat.slug}`} style={{ textDecoration: 'none' }}>
      <div className="card" style={{ overflow: 'hidden', background: 'white', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Cover image */}
        <div style={{
          height: '200px',
          background: 'linear-gradient(135deg, var(--ocean-deep) 0%, var(--ocean-mid) 100%)',
          position: 'relative',
          display: 'flex', alignItems: 'flex-end',
        }}>
          {boat.cover_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={boat.cover_image} alt={boat.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>⛵</div>
          )}
          <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem' }}>
            <span className="vertical-tag tag-passeios">Escuna</span>
          </div>
          {boat.features?.slice(0, 2).map(f => (
            <span key={f} style={{
              position: 'relative', margin: '0 0.25rem 0.5rem',
              background: 'rgba(0,0,0,0.5)', color: 'white',
              borderRadius: '6px', padding: '0.2rem 0.5rem',
              fontSize: '0.6875rem', fontWeight: 600, backdropFilter: 'blur(4px)',
            }}>{f}</span>
          ))}
        </div>

        <div style={{ padding: '1.25rem 1.25rem 1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            {boat.name}
          </h3>
          {boat.tagline && (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
              {boat.tagline}
            </p>
          )}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              🕐 {boat.duration_hours}h de passeio
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              ⏰ Saida {boat.departure_time?.slice(0, 5)}
            </span>
          </div>
          <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)' }}>a partir de</div>
              <div style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                {priceFormatted}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>por pessoa</div>
            </div>
            <span style={{ background: 'var(--ocean-mid)', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 600 }}>
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
  const { data: boats } = await supabase
    .from('boats')
    .select('*')
    .eq('active', true)
    .order('display_order', { ascending: true })

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
          <span className="vertical-tag tag-passeios" style={{ marginBottom: '1rem', display: 'inline-flex' }}>Passeios de Escuna</span>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.875rem, 5vw, 2.75rem)', color: 'white', marginBottom: '0.75rem' }}>
            Escolha sua escuna
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.0625rem', maxWidth: '540px', lineHeight: 1.65 }}>
            Quatro embarcacoes, quatro jeitos de conhecer a Baia de Paraty. Saidas diarias, grupos com ate 50 pessoas.
          </p>
        </div>
      </section>

      {/* Listing */}
      <section style={{ padding: '4rem 0 5rem' }}>
        <div className="container">
          {/* Pricing info */}
          <div style={{ background: 'var(--sand)', borderRadius: '12px', padding: '1rem 1.5rem', marginBottom: '2.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.875rem', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '1.25rem' }}>ℹ️</span>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--text-primary)' }}>Tabela de precos:</strong>{' '}
              Adultos pagam valor cheio. Criancas de 6 a 10 anos pagam meia entrada. Criancas ate 5 anos nao pagam. Pagamento confirmado pelo WhatsApp ou online.
            </div>
          </div>

          <div className="marketplace-grid">
            {boats?.map(boat => <BoatCard key={boat.id} boat={boat} />)}
          </div>

          {(!boats || boats.length === 0) && (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⛵</div>
              <p>Nenhum passeio disponivel no momento. Volte em breve.</p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
