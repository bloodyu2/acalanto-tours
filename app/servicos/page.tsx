import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { ReactNode } from 'react'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Serviços',
  description: 'Além das escunas: lancha privativa, fotografia profissional, passeio de jeep e transfer em Paraty.',
}

const BoatSvg = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 20a2 2 0 002 2h16a2 2 0 002-2"/><path d="M4 20l4-12h8l4 12"/>
    <line x1="12" y1="2" x2="12" y2="8"/><path d="M8 8h8"/>
  </svg>
)
const CameraSvg = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
)
const JeepSvg = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v9a2 2 0 01-2 2h-2"/>
    <circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>
  </svg>
)
const VanSvg = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" rx="2"/>
    <path d="M16 8h4l3 3v5h-7V8z"/>
    <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
)
const AnchorSvg = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="3"/><line x1="12" y1="8" x2="12" y2="22"/>
    <path d="M5 12H2a10 10 0 0020 0h-3"/>
  </svg>
)

const icons: Record<string, ReactNode> = {
  'lancha-privativa': <BoatSvg />, 'fotografia': <CameraSvg />, 'passeio-de-jeep': <JeepSvg />, 'transfer': <VanSvg />,
}

export default async function ServicosPage() {
  const supabase = await createClient()
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
              <Link key={svc.id} href={svc.slug === 'fotografia' ? '/fotografia' : `/servicos/${svc.slug}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ padding: '2rem', height: '100%' }}>
                  <div style={{ marginBottom: '1rem', color: 'var(--ocean-mid)' }}>{icons[svc.slug] || <AnchorSvg />}</div>
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
