'use client'
import { useState } from 'react'
import Link from 'next/link'
import ServiceSheet, { type SheetService } from './ServiceSheet'
import type { ServiceProvider } from '@/lib/types/database'

const icons: Record<string, React.ReactNode> = {
  'lancha-privativa': (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20a2 2 0 002 2h16a2 2 0 002-2"/>
      <path d="M4 20l4-12h8l4 12"/>
      <line x1="12" y1="2" x2="12" y2="8"/>
      <path d="M8 8h8"/>
    </svg>
  ),
  'fotografia': (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  ),
  'passeio-de-jeep': (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v9a2 2 0 01-2 2h-2"/>
      <circle cx="7" cy="17" r="2"/>
      <circle cx="17" cy="17" r="2"/>
    </svg>
  ),
  'transfer': (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" rx="2"/>
      <path d="M16 8h4l3 3v5h-7V8z"/>
      <circle cx="5.5" cy="18.5" r="2.5"/>
      <circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  ),
}

const AnchorIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="3"/>
    <line x1="12" y1="8" x2="12" y2="22"/>
    <path d="M5 12H2a10 10 0 0020 0h-3"/>
  </svg>
)

interface Props {
  services: SheetService[]
  unavailableMap: Record<string, string[]>
  providersMap: Record<string, ServiceProvider[]>
}

export default function ServicosPageClient({ services, unavailableMap, providersMap }: Props) {
  const [activeService, setActiveService] = useState<SheetService | null>(null)

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {services.map(svc => (
          <div key={svc.id} className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div style={{ marginBottom: '1rem', color: 'var(--ocean-mid)' }}>
              {icons[svc.slug] ?? <AnchorIcon />}
            </div>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', color: 'var(--ocean-deep)', marginBottom: '0.625rem' }}>
              {svc.name}
            </h2>
            {svc.description && (
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: '1rem', flex: 1 }}>
                {svc.description}
              </p>
            )}
            <div style={{ display: 'flex', gap: '0.625rem', marginTop: 'auto', alignItems: 'center', flexWrap: 'wrap' }}>
              {svc.slug === 'fotografia' ? (
                <Link
                  href="/fotografia"
                  className="btn-primary"
                  style={{ flex: 1, justifyContent: 'center', fontSize: '0.875rem' }}
                >
                  Ver detalhes
                </Link>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveService(svc)}
                    className="btn-primary"
                    style={{ flex: 1, justifyContent: 'center', fontSize: '0.875rem' }}
                  >
                    {svc.pricing_type ? 'Reservar' : 'Solicitar'}
                  </button>
                  <Link
                    href={`/servicos/${svc.slug}`}
                    style={{ fontSize: '0.8rem', color: 'var(--ocean-mid)', fontWeight: 600, textDecoration: 'none', padding: '0.5rem' }}
                  >
                    Ver mais →
                  </Link>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <ServiceSheet
        service={activeService}
        unavailableMap={unavailableMap}
        providers={activeService ? (providersMap[activeService.id] ?? []) : []}
        onClose={() => setActiveService(null)}
      />
    </>
  )
}
