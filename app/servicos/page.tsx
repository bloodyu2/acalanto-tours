import type { Metadata } from 'next'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Serviços',
  description: 'Além das escunas: lancha privativa, fotografia profissional, passeio de jeep e transfer em Paraty.',
}

const icons: Record<string, string> = {
  'lancha-privativa': '🚤', 'fotografia': '📸', 'passeio-de-jeep': '🚙', 'transfer': '🚐',
}

export default async function ServicosPage() {
  const supabase = await createServerClient()
  const { data: services } = await supabase.from('services').select('*').eq('active', true).order('display_order')

  return (
    <>
      <section style={{ background: 'linear-gradient(135deg, var(--ocean-deep) 0%, var(--ocean-mid) 100%)', padding: '5rem 0 3rem', position: 'relative' }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, lineHeight: 0 }}>
          <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '60px' }}>
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="white" />
          </svg>
        </div>
        <div className="container" style={{ position: 'relative' }}>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'white', marginBottom: '0.5rem' }}>Serviços</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.125rem' }}>Complete seu itinerário em Paraty</p>
        </div>
      </section>

      <section style={{ padding: '4rem 0 5rem' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {services?.map(svc => (
              <Link key={svc.id} href={`/servicos/${svc.slug}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ padding: '2rem', height: '100%' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{icons[svc.slug] || '⚓'}</div>
                  <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', color: 'var(--ocean-deep)', marginBottom: '0.625rem' }}>{svc.name}</h2>
                  {svc.description && <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: '1rem' }}>{svc.description}</p>}
                  <p style={{ color: 'var(--ocean-mid)', fontWeight: 700, fontSize: '0.9375rem' }}>
                    {svc.price_label || 'Sob consulta'} →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
