import Link from 'next/link'
import type { ReactNode } from 'react'

const verticals: Array<{ href: string; icon: ReactNode; title: string; desc: string; color: string; tag: string; active: boolean }> = [
  {
    href: '/passeios',
    icon: (<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20a2 2 0 002 2h16a2 2 0 002-2"/><path d="M4 20l4-12h8l4 12"/><line x1="12" y1="2" x2="12" y2="8"/><path d="M8 8h8"/></svg>),
    title: 'Passeios de Escuna',
    desc: 'Saídas diárias pelas ilhas e praias da Baía de Paraty. Quatro embarcações, cada uma com personalidade própria.',
    color: 'var(--ocean-mid)',
    tag: 'A partir de R$100',
    active: true,
  },
  {
    href: '/fotografia',
    icon: (<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>),
    title: 'Fotografia',
    desc: 'Fotógrafos profissionais que embarcam junto e registram os melhores momentos do seu passeio.',
    color: '#8B5CF6',
    tag: 'A partir de R$250',
    active: true,
  },
  {
    href: '/hotelaria',
    icon: (<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>),
    title: 'Hotelaria',
    desc: 'Pousadas e hospedagens selecionadas próximas ao pier de embarque das escunas.',
    color: '#059669',
    tag: 'Ver hospedagens',
    active: true,
  },
  {
    href: '/servicos',
    icon: (<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v9a2 2 0 01-2 2h-2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>),
    title: 'Serviços',
    desc: 'Lancha privativa, passeio de jeep e transfer com motoristas experientes em Paraty.',
    color: '#D97706',
    tag: 'Ver serviços',
    active: true,
  },
]

export default function VerticalsSection() {
  return (
    <section style={{ padding: '3rem 0 4rem', background: 'white' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="section-tag">O que voce encontra aqui</span>
          <h2 className="section-title">Tudo para seu turismo em Paraty</h2>
          <p className="section-subtitle">
            A Acalanto reúne os melhores serviços de turismo de Paraty num único lugar.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
          {verticals.map(({ href, icon, title, desc, color, tag, active }) => (
            <Link key={href} href={href} style={{ textDecoration: 'none' }}>
              <div
                className="card"
                style={{
                  padding: '1.75rem',
                  height: '100%',
                  background: 'white',
                  opacity: active ? 1 : 0.7,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                  background: active ? color : 'var(--border)',
                }} />
                <div style={{ marginBottom: '0.75rem', color: active ? color : 'var(--text-muted)' }}>{icon}</div>
                <h3 style={{
                  fontFamily: 'var(--font-playfair)',
                  fontSize: '1.125rem',
                  color: 'var(--text-primary)',
                  marginBottom: '0.5rem',
                }}>
                  {title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1rem' }}>
                  {desc}
                </p>
                <span style={{
                  display: 'inline-block',
                  padding: '0.25rem 0.75rem',
                  background: active ? color : 'var(--sand)',
                  color: active ? 'white' : 'var(--text-muted)',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}>
                  {tag}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
