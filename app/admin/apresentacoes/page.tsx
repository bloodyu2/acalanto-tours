import Link from 'next/link'
import { requireSuperAdmin } from '@/lib/admin-auth'

export default async function ApresentacoesPage() {
  await requireSuperAdmin()
  return <ApresentacoesContent />
}

function ApresentacoesContent() {
  const VERTICALS = [
  {
    vertical: 'escunas',
    label: 'Escunas & Passeios',
    tagline: 'Leve turistas para os lugares mais bonitos de Paraty',
    accentColor: '#0A3D5C',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 17l1-5h16l1 5H3z"/>
        <path d="M12 3v9"/>
        <path d="M8 9l4-6 4 6"/>
        <path d="M2 20h20"/>
      </svg>
    ),
  },
  {
    vertical: 'hospedagem',
    label: 'Hospedagem',
    tagline: 'Aumente sua ocupação com turistas já reservados',
    accentColor: '#F4A623',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    vertical: 'fotografia',
    label: 'Fotografia',
    tagline: 'Transforme momentos de viagem em memórias eternas',
    accentColor: '#7C3AED',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
        <circle cx="12" cy="13" r="4"/>
      </svg>
    ),
  },
  {
    vertical: 'jeep',
    label: 'Jeep & Transfer',
    tagline: 'Conecte turistas ao interior de Paraty',
    accentColor: '#16A34A',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="2"/>
        <path d="M16 8h4l3 5v3h-7V8z"/>
        <circle cx="5.5" cy="18.5" r="2.5"/>
        <circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
  },
]

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: '#1A1A2E', marginBottom: '0.5rem' }}>
          Apresentações
        </h1>
        <p style={{ color: '#6B7280', fontSize: '0.9375rem' }}>
          Apresentações de parceria para uso em campo — selecione o vertical para abrir.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '1.25rem',
      }}>
        {VERTICALS.map(({ vertical, label, tagline, accentColor, icon }) => (
          <Link
            key={vertical}
            href={`/admin/apresentacoes/${vertical}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              padding: '2rem 1.5rem',
              background: accentColor,
              borderRadius: '16px',
              textDecoration: 'none',
              color: 'white',
              minHeight: '200px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            }}
          >
            {icon}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                {label}
              </div>
              <div style={{ fontSize: '0.8125rem', opacity: 0.8, lineHeight: 1.5, fontFamily: 'var(--font-jakarta)' }}>
                {tagline}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
