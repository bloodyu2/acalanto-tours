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
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            Passeios em breve disponíveis.
          </p>
        )}

        {/* Pricing note */}
        <div style={{
          marginTop: '2rem', padding: '1rem 1.5rem',
          background: 'var(--sand)', borderRadius: '0.75rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          fontSize: '0.875rem', color: 'var(--text-muted)',
        }}>
          <span style={{ fontSize: '1.25rem' }}>ℹ️</span>
          <span>
            <strong style={{ color: 'var(--ocean-deep)' }}>Tabela de preços:</strong>{' '}
            Adultos: valor fixo por pessoa. Crianças de 6 a 10 anos: meia entrada. Crianças até 5 anos: <strong>gratuito</strong>.
          </span>
        </div>
      </div>
    </section>
  )
}
