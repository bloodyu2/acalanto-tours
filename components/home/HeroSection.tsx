'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const trustItems = [
  {
    svg: null as React.ReactNode,
    number: '4',
    sub: 'passeios',
  },
  {
    svg: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
        <circle cx="12" cy="13" r="4"/>
      </svg>
    ),
    number: null as string | null,
    sub: 'fotografia',
  },
  {
    svg: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    number: null as string | null,
    sub: 'hospedagem',
  },
  {
    svg: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 17l1-4h16l1 4"/>
        <path d="M5 17l-1 4h16l-1-4"/>
        <path d="M7 13V9a5 5 0 0110 0v4"/>
      </svg>
    ),
    number: null as string | null,
    sub: 'serviços',
  },
]

function BoatOnWave() {
  const [tx, setTx] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const maxTx = typeof window !== 'undefined' ? window.innerWidth - 80 : 400
      setTx(Math.min(window.scrollY * 0.35, maxTx))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        bottom: '42px',
        left: 0,
        transform: `translateX(${tx}px)`,
        transition: 'transform 0.1s linear',
        zIndex: 1,
        pointerEvents: 'none',
      }}
    >
      <svg width="44" height="32" viewBox="0 0 44 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 20 Q22 28 40 20 L38 24 Q22 32 6 24 Z" fill="white" fillOpacity="0.9"/>
        <line x1="22" y1="4" x2="22" y2="20" stroke="white" strokeWidth="1.5" strokeOpacity="0.7"/>
        <path d="M22 5 L34 17 L22 18 Z" fill="white" fillOpacity="0.5"/>
        <path d="M22 5 L10 17 L22 18 Z" fill="white" fillOpacity="0.3"/>
      </svg>
    </div>
  )
}

export default function HeroSection() {
  return (
    <section className="hero-section" style={{ paddingTop: '3rem', paddingBottom: '6rem' }}>
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
            Passeios de escuna, fotografia profissional, hospedagem selecionada e serviços exclusivos: tudo num só lugar, com quem conhece Paraty de verdade.
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
            {trustItems.map(({ svg, number, sub }, i) => (
              <div key={sub} style={{
                flex: '1', minWidth: '80px',
                paddingRight: '1.5rem',
                paddingLeft: i === 0 ? 0 : '1.5rem',
                borderLeft: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.1)',
              }}>
                <div style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.625rem', fontWeight: 700, color: 'white', letterSpacing: '-0.03em' }}>
                  {number ?? svg}
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

      <BoatOnWave />
    </section>
  )
}
