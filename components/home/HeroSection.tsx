'use client'

import Link from 'next/link'

export default function HeroSection() {
  return (
    <section className="hero-section" style={{ paddingTop: '3rem' }}>
      {/* Radial glow — wine undertones */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: 'radial-gradient(ellipse at 20% 70%, rgba(146,23,77,0.28) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(224,11,65,0.14) 0%, transparent 50%)',
        pointerEvents: 'none',
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '700px' }}>

          {/* Monospace location label */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            fontFamily: 'var(--font-mono)',
            color: 'rgba(255,255,255,0.55)', fontSize: '0.72rem', fontWeight: 500,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            marginBottom: '1.75rem',
          }}>
            <span style={{ display: 'inline-block', width: '20px', height: '1px', background: 'rgba(255,255,255,0.35)' }} />
            Paraty, Rio de Janeiro
          </div>

          <h1 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 'clamp(2.75rem, 6.5vw, 4.5rem)',
            fontWeight: 700,
            color: 'white',
            lineHeight: 1.02,
            letterSpacing: '-0.035em',
            marginBottom: '1.5rem',
          }}>
            Tudo para seu{' '}
            <span className="text-gradient">turismo em Paraty</span>
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 1.8vw, 1.175rem)',
            color: 'rgba(255,255,255,0.68)',
            lineHeight: 1.7,
            marginBottom: '2.25rem',
            maxWidth: '520px',
            fontWeight: 400,
          }}>
            Passeios de escuna, fotografia profissional, hospedagem selecionada e serviços exclusivos — tudo num só lugar, com quem conhece Paraty de verdade.
          </p>

          <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}>
            <Link href="/passeios" className="btn-primary" style={{ fontSize: '0.9375rem', padding: '0.9375rem 2rem' }}>
              Ver Passeios
            </Link>
            <Link href="/quem-somos" className="btn-white" style={{ fontSize: '0.9375rem', padding: '0.9375rem 2rem' }}>
              Conheça a Acalanto
            </Link>
          </div>

          {/* Trust row */}
          <div style={{
            display: 'flex', gap: '0', marginTop: '3rem', flexWrap: 'wrap',
            borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.75rem',
          }}>
            {[
              { label: '4', sub: 'passeios' },
              { label: '📸', sub: 'fotografia' },
              { label: '🏡', sub: 'hospedagem' },
              { label: '🚤', sub: 'serviços' },
            ].map(({ label, sub }, i) => (
              <div key={sub} style={{
                flex: '1', minWidth: '80px',
                paddingRight: '1.5rem',
                paddingLeft: i === 0 ? 0 : '1.5rem',
                borderLeft: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.1)',
              }}>
                <div style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.625rem', fontWeight: 700, color: 'white', letterSpacing: '-0.03em' }}>
                  {label}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '0.15rem' }}>
                  {sub}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Bottom wave */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, lineHeight: 0 }}>
        <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '80px' }}>
          <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z" fill="white" />
        </svg>
      </div>
    </section>
  )
}
