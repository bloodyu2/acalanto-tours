import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Galeria',
  description: 'Fotos dos passeios de escuna em Paraty. Baías, ilhas, praias e muito azul.',
}

export default async function GaleriaPage() {
  const supabase = await createClient()
  const { data: gallery } = await supabase
    .from('gallery')
    .select('*, boats(name), services(name)')
    .order('display_order')

  return (
    <>
      <section style={{ background: 'linear-gradient(135deg, var(--ocean-deep) 0%, var(--ocean-mid) 100%)', padding: '5rem 0 3rem', position: 'relative' }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, lineHeight: 0 }}>
          <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '60px' }}>
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="white" />
          </svg>
        </div>
        <div className="container" style={{ position: 'relative' }}>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'white', marginBottom: '0.5rem' }}>Galeria</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.125rem' }}>Imagens dos nossos passeios em Paraty</p>
        </div>
      </section>

      <section style={{ padding: '4rem 0 5rem' }}>
        <div className="container">
          {gallery && gallery.length > 0 ? (
            <div style={{ columns: '3 280px', gap: '0.75rem' }}>
              {gallery.map(img => (
                <div key={img.id} style={{ breakInside: 'avoid', marginBottom: '0.75rem', borderRadius: '0.75rem', overflow: 'hidden' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.alt_text || 'Passeio Acalanto Tours'} style={{ width: '100%', display: 'block' }} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '5rem 0' }}>
              <div style={{ marginBottom: '1rem', color: 'var(--ocean-mid)', display: 'flex', justifyContent: 'center' }}><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2"/><path d="M2 12c.6.5 1.2 1 2.5 1C7 13 7 11 9.5 11c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2"/><path d="M2 18c.6.5 1.2 1 2.5 1C7 19 7 17 9.5 17c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2"/></svg></div>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>Fotos em breve disponíveis.</p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
