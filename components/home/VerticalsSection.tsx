import Link from 'next/link'

const verticals = [
  {
    href: '/passeios',
    emoji: '⛵',
    title: 'Passeios de Escuna',
    desc: 'Saídas diárias pelas ilhas e praias da Baía de Paraty. Quatro embarcações, cada uma com personalidade própria.',
    color: 'var(--ocean-mid)',
    tag: 'A partir de R$100',
    active: true,
  },
  {
    href: '/fotografia',
    emoji: '📸',
    title: 'Fotografia',
    desc: 'Fotógrafos profissionais que embarcam junto e registram os melhores momentos do seu passeio.',
    color: '#8B5CF6',
    tag: 'A partir de R$250',
    active: true,
  },
  {
    href: '/hotelaria',
    emoji: '🏡',
    title: 'Hotelaria',
    desc: 'Pousadas e hospedagens cuidadosamente selecionadas em Paraty. Em breve.',
    color: '#059669',
    tag: 'Em breve',
    active: false,
  },
  {
    href: '/servicos',
    emoji: '🚤',
    title: 'Serviços',
    desc: 'Lancha privativa, passeio de jeep, transfer e guias locais. Em breve.',
    color: '#D97706',
    tag: 'Em breve',
    active: false,
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {verticals.map(({ href, emoji, title, desc, color, tag, active }) => (
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
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{emoji}</div>
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
