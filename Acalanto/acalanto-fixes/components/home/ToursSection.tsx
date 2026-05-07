import { createClient } from '@/lib/supabase/server'
import TourCard from '@/components/tours/TourCard'

export default async function ToursSection() {
  const supabase = await createClient()
  const { data: boats } = await supabase
    .from('boats')
    .select('*')
    .eq('active', true)
    .order('display_order', { ascending: true })

  return (
    <section id="escunas" style={{ padding: '5rem 0', background: 'white' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="section-tag">Nossas Escunas</span>
          <h2 className="section-title">Escolha seu passeio</h2>
          <p className="section-subtitle">
            Quatro embarcações, cada uma com personalidade única. Todas com saída do cais de Paraty e retorno garantido cheio de memórias.
          </p>
        </div>

        {boats && boats.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}>
            {boats.map(boat => (
              <TourCard key={boat.id} boat={boat} />
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-jakarta)' }}>
            Passeios em breve disponíveis.
          </p>
        )}

        {/* Pricing note — sem emoji, visual limpo */}
        <div style={{
          marginTop: '2rem',
          padding: '1rem 1.5rem',
          background: 'var(--sand-warm)',
          borderRadius: '0.75rem',
          borderLeft: '3px solid var(--ocean-mid)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.875rem',
          fontSize: '0.875rem',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-jakarta)',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ocean-mid)"
            strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: '1px' }}>
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>
            <strong style={{ color: 'var(--ocean-deep)' }}>Tabela de preços:</strong>{' '}
            Adultos — valor fixo por pessoa. Crianças de 6 a 12 anos — meia entrada. Crianças até 5 anos —{' '}
            <strong style={{ color: 'var(--ocean-deep)' }}>gratuito</strong>.
          </span>
        </div>
      </div>
    </section>
  )
}
