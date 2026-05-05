import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

const serviceIcons: Record<string, string> = {
  'lancha-privativa': '🚤',
  'fotografia': '📸',
  'passeio-de-jeep': '🚙',
  'transfer': '🚐',
}

export default async function ServicesSection() {
  const supabase = await createClient()
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('active', true)
    .order('display_order', { ascending: true })

  return (
    <section style={{ padding: '5rem 0', background: 'var(--sand)' }}>
      {/* Top wave */}
      <div style={{ width: '100%', overflow: 'hidden', lineHeight: 0, marginTop: '-5rem', marginBottom: '0' }}>
        <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '60px' }}>
          <path d="M0,30 C360,0 1080,60 1440,30 L1440,0 L0,0 Z" fill="white" />
        </svg>
      </div>

      <div className="container" style={{ paddingTop: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="section-tag">Mais que escunas</span>
          <h2 className="section-title">Serviços exclusivos</h2>
          <p className="section-subtitle">
            Além das escunas, a Acalanto reúne os melhores serviços de Paraty num só lugar: lancha privativa, jeep, fotografia profissional e transfer.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {services?.map(svc => (
            <Link
              key={svc.id}
              href={`/servicos/${svc.slug}`}
              style={{ textDecoration: 'none' }}
            >
              <div className="card" style={{ padding: '1.75rem', height: '100%', background: 'white' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.875rem' }}>
                  {serviceIcons[svc.slug] || '⚓'}
                </div>
                <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.125rem', color: 'var(--ocean-deep)', marginBottom: '0.5rem' }}>
                  {svc.name}
                </h3>
                {svc.description && (
                  <p className="line-clamp-3" style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    {svc.description}
                  </p>
                )}
                <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--ocean-mid)', fontWeight: 600 }}>
                  {svc.price_label || 'Sob consulta'} →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
