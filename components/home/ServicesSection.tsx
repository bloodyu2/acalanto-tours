import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { ReactNode } from 'react'

const serviceIcons: Record<string, ReactNode> = {
  'lancha-privativa': (<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20a2 2 0 002 2h16a2 2 0 002-2"/><path d="M4 20l4-12h8l4 12"/><line x1="12" y1="2" x2="12" y2="8"/><path d="M8 8h8"/></svg>),
  'fotografia': (<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>),
  'passeio-de-jeep': (<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v9a2 2 0 01-2 2h-2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>),
  'transfer': (<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>),
}
const AnchorFallback = () => (<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="3"/><line x1="12" y1="8" x2="12" y2="22"/><path d="M5 12H2a10 10 0 0020 0h-3"/></svg>)

export default async function ServicesSection() {
  const supabase = await createClient()
  const { data: services } = await supabase
    .from('services')
    .select('id, slug, name, description, price_label, cover_image')
    .eq('active', true)
    .order('display_order', { ascending: true })

  // Fetch first gallery photo for services without cover_image
  const svcIds = (services ?? []).filter(s => !s.cover_image).map(s => s.id)
  const firstGallery: Record<string, string> = {}
  if (svcIds.length > 0) {
    const { data: galleryRows } = await supabase
      .from('gallery')
      .select('service_id, url')
      .in('service_id', svcIds)
      .order('display_order', { ascending: true })
    for (const g of galleryRows ?? []) {
      if (g.service_id && !firstGallery[g.service_id]) firstGallery[g.service_id] = g.url
    }
  }

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
          {services?.map(svc => {
            const photo = svc.cover_image ?? firstGallery[svc.id] ?? null
            return (
              <Link key={svc.id} href={`/servicos/${svc.slug}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ height: '100%', background: 'white', overflow: 'hidden', padding: 0 }}>
                  {/* Photo header */}
                  {photo ? (
                    <div style={{ position: 'relative', height: '160px', overflow: 'hidden', background: 'var(--sand)' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo}
                        alt={svc.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,61,92,0.5) 0%, transparent 60%)' }} />
                    </div>
                  ) : (
                    <div style={{ height: '120px', background: 'linear-gradient(135deg, var(--ocean-deep) 0%, var(--ocean-mid) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.7)' }}>
                      {serviceIcons[svc.slug] || <AnchorFallback />}
                    </div>
                  )}
                  {/* Content */}
                  <div style={{ padding: '1.25rem 1.5rem 1.5rem' }}>
                    {!photo && null}
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
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
