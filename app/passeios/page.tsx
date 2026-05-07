import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import PasseiosClient from '@/components/passeios/PasseiosClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Passeios de Escuna em Paraty',
  description: 'Escolha entre 4 escunas com personalidades únicas. Saídas diárias pelas ilhas e praias da Baía de Paraty.',
}

export default async function PasseiosPage() {
  const supabase = await createClient()

  const { data: boats, error } = await supabase
    .from('boats')
    .select('*')
    .eq('active', true)
    .order('display_order', { ascending: true })
  if (error) console.error('[passeios] supabase error:', error.message)

  // Pre-fetch unavailability for all boats
  const boatIds = (boats ?? []).map(b => b.id)
  let unavailableMap: Record<string, string[]> = {}
  if (boatIds.length > 0) {
    const { data: unavailRows } = await supabase
      .from('capacity_overrides')
      .select('boat_id, tour_date, capacity')
      .in('boat_id', boatIds)
    // Dates with capacity = 0 are fully unavailable
    if (unavailRows) {
      unavailableMap = unavailRows
        .filter(r => r.capacity === 0)
        .reduce((acc: Record<string, string[]>, r) => {
          if (!acc[r.boat_id]) acc[r.boat_id] = []
          acc[r.boat_id].push(r.tour_date)
          return acc
        }, {})
    }
  }

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

          <PasseiosClient boats={boats ?? []} unavailableMap={unavailableMap} />
        </div>
      </section>
    </>
  )
}
