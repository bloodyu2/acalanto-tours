'use client'

import Link from 'next/link'

export default function HeroSection() {
  return (
    <section className="hero-section" style={{ paddingTop: '3rem' }}>
      {/* Background pattern */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle at 25% 60%, rgba(42,157,191,0.3) 0%, transparent 50%), radial-gradient(circle at 75% 30%, rgba(244,166,35,0.15) 0%, transparent 50%)',
      }} />

      {/* Wave pattern */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        opacity: 0.08,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(255,255,255,0.5) 30px, rgba(255,255,255,0.5) 32px)',
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '680px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
            color: 'rgba(255,255,255,0.9)', fontSize: '0.8rem', fontWeight: 600,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            padding: '0.375rem 0.875rem', borderRadius: '999px',
            border: '1px solid rgba(255,255,255,0.2)',
            marginBottom: '1.5rem',
          }}>
            ⚓ Paraty, Rio de Janeiro
          </div>

          <h1 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            fontWeight: 700,
            color: 'white',
            lineHeight: 1.12,
            marginBottom: '1.25rem',
          }}>
            Navegue pelas <span className="text-gradient">águas paradisíacas</span>{' '}
            de Paraty
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: 'rgba(255,255,255,0.82)',
            lineHeight: 1.65,
            marginBottom: '2rem',
            maxWidth: '540px',
          }}>
            Passeios de escuna inesquecíveis pelas ilhas e praias da Costa Verde. Quatro embarcações, roteiros únicos e a hospitalidade caiçara que só a Acalanto oferece.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/#escunas" className="btn-primary" style={{ fontSize: '1rem', padding: '1rem 2rem' }}>
              Escolher Passeio
            </Link>
            <Link href="/quem-somos" className="btn-white" style={{ fontSize: '1rem', padding: '1rem 2rem' }}>
              Conheça a Acalanto
            </Link>
          </div>

          {/* Trust badges */}
          <div style={{ display: 'flex', gap: '2rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
            {[
              { icon: '⭐', text: '4 embarcações' },
              { icon: '🏖️', text: '+6 praias visitadas' },
              { icon: '🐾', text: 'Pet friendly' },
              { icon: '✅', text: 'Cancelamento grátis' },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', fontWeight: 500 }}>
                <span>{icon}</span> {text}
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
