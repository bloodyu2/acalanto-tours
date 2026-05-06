import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import TourCard from '@/components/tours/TourCard'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Nossas Escunas | Passeios em Paraty',
  description: 'Escolha entre 4 escunas com personalidades únicas: gastronomia caiçara, familiar, premium com ofurô ou contemplativa. Passeios saindo de Paraty pela Costa Verde.',
}

export default async function EscunasPage() {
  const supabase = await createClient()
  const { data: boats } = await supabase
    .from('boats')
    .select('*')
    .eq('active', true)
    .order('display_order', { ascending: true })

  return (
    <div style={{ background: 'var(--sand-warm)', minHeight: '100vh' }}>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, var(--ocean-deep) 0%, var(--ocean-mid) 100%)',
        padding: '5rem 0 4rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Wave bottom */}
        <svg viewBox="0 0 1440 60" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%' }} preserveAspectRatio="none">
          <path d="M0,0 C360,60 1080,60 1440,0 L1440,60 L0,60 Z" fill="var(--sand-warm)" />
        </svg>

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <span className="section-tag" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
            Nossas Embarcações
          </span>
          <h1 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 700,
            color: 'white',
            margin: '1rem 0 1.25rem',
          }}>
            Escolha sua escuna
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.7 }}>
            Quatro embarcações, cada uma com personalidade única. Todas com saída do cais histórico de Paraty e roteiro por baías, ilhas e praias da Costa Verde.
          </p>
        </div>
      </div>

      {/* Boats grid */}
      <section style={{ padding: '4rem 0 5rem' }}>
        <div className="container">

          {boats && boats.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1.75rem',
            }}>
              {boats.map(boat => (
                <TourCard key={boat.id} boat={boat} />
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem 0' }}>
              Passeios em breve disponíveis.
            </p>
          )}

          {/* Pricing info */}
          <div style={{
            marginTop: '2.5rem',
            padding: '1.25rem 1.75rem',
            background: 'white',
            borderRadius: '1rem',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
            boxShadow: '0 2px 12px rgba(10,61,92,0.06)',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></span>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
              <strong style={{ color: 'var(--ocean-deep)', display: 'block', marginBottom: '0.25rem' }}>
                Política de preços
              </strong>
              Adultos pagam valor cheio por pessoa. Crianças de 6 a 10 anos pagam meia entrada.
              Crianças até 5 anos <strong style={{ color: 'var(--ocean-deep)' }}>não pagam</strong>.
              O pagamento é confirmado diretamente com nossa equipe pelo WhatsApp. Sem cobrança antecipada online.
            </div>
          </div>

          {/* FAQ teaser */}
          <div style={{
            marginTop: '1.25rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '1rem',
          }}>
            {[
              { icon: (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="3"/><line x1="12" y1="8" x2="12" y2="22"/><path d="M5 12H2a10 10 0 0020 0h-3"/></svg>), title: 'O que incluir?', text: 'Protetor solar, roupa de banho, dinheiro para bebidas e petiscos a bordo.' },
              { icon: (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.42 4.58a5.4 5.4 0 00-7.65 0l-.77.78-.77-.78a5.4 5.4 0 00-7.65 7.65l1.06 1.06L12 21.23l7.36-7.94 1.06-1.06a5.4 5.4 0 000-7.65z"/></svg>), title: 'Pode levar pet?', text: 'Sim! A Ilha Rasa V e a Tânia aceitam pets a bordo com guia e vacinação em dia.' },
              { icon: (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2"/><path d="M2 12c.6.5 1.2 1 2.5 1C7 13 7 11 9.5 11c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2"/><path d="M2 18c.6.5 1.2 1 2.5 1C7 19 7 17 9.5 17c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2"/></svg>), title: 'E se chover?', text: 'Em caso de chuva forte reagendamos sem custo. Chuva leve não cancela.' },
              { icon: (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>), title: 'Como reservar?', text: 'Clique no passeio, escolha data e quantidade de pessoas e envie pelo WhatsApp.' },
            ].map((item, i) => (
              <div key={i} style={{
                background: 'white',
                borderRadius: '0.875rem',
                padding: '1.25rem',
                border: '1px solid var(--border)',
              }}>
                <div style={{ marginBottom: '0.5rem', color: 'var(--ocean-mid)' }}>{item.icon}</div>
                <div style={{ fontWeight: 700, color: 'var(--ocean-deep)', fontSize: '0.9rem', marginBottom: '0.35rem' }}>{item.title}</div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{item.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
