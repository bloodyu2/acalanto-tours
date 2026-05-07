'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const trustItems = [
  { number: '4',  sub: 'passeios',   svg: null as React.ReactNode },
  { number: null, sub: 'fotografia', svg: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  )},
  { number: null, sub: 'hospedagem', svg: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )},
  { number: null, sub: 'serviços', svg: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="3"/>
      <line x1="12" y1="8" x2="12" y2="22"/>
      <path d="M5 12H2a10 10 0 0020 0h-3"/>
    </svg>
  )},
]

function BoatOnWave() {
  const [tx, setTx] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const maxTx = typeof window !== 'undefined' ? window.innerWidth - 80 : 400
      setTx(Math.min(window.scrollY * 1.5, maxTx))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute', bottom: '42px', left: 0,
        transform: `translateX(${tx}px)`,
        transition: 'transform 0.1s linear',
        zIndex: 1, pointerEvents: 'none',
      }}
    >
      <svg width="48" height="34" viewBox="0 0 48 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 22 Q24 30 44 22 L42 26 Q24 34 6 26 Z" fill="white" fillOpacity="0.85"/>
        <line x1="24" y1="4" x2="24" y2="22" stroke="white" strokeWidth="1.5" strokeOpacity="0.65"/>
        <path d="M24 5 L37 19 L24 20 Z" fill="white" fillOpacity="0.45"/>
        <path d="M24 5 L11 19 L24 20 Z" fill="white" fillOpacity="0.25"/>
      </svg>
    </div>
  )
}

export default function HeroSection() {
  return (
    <section className="hero-section" style={{ paddingTop: '3rem', paddingBottom: '6rem' }}>

      {/* Radial glow — tons oceânicos, sem vermelho/wine */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: [
          'radial-gradient(ellipse at 15% 75%, rgba(46,156,191,0.18) 0%, transparent 50%)',
          'radial-gradient(ellipse at 85% 20%, rgba(26,107,138,0.22) 0%, transparent 50%)',
          'radial-gradient(ellipse at 50% 110%, rgba(10,61,92,0.4) 0%, transparent 55%)',
        ].join(', '),
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '700px' }}>

          {/* Localização */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            fontFamily: 'var(--font-mono)',
            color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem',
            letterSpacing: '0.2em', textTransform: 'uppercase',
            marginBottom: '1.75rem',
          }}>
            <span style={{ display: 'inline-block', width: '20px', height: '1px', background: 'rgba(255,255,255,0.3)' }} />
            Paraty, Rio de Janeiro
          </div>

          {/* H1 */}
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
            <span style={{
              background: 'linear-gradient(135deg, #F5EDD8 0%, #F4A623 60%, #2E9CBF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              turismo em Paraty
            </span>
          </h1>

          {/* Subtítulo */}
          <p style={{
            fontSize: 'clamp(1rem, 1.8vw, 1.125rem)',
            color: 'rgba(255,255,255,0.65)',
            lineHeight: 1.7, marginBottom: '2.25rem',
            maxWidth: '520px', fontWeight: 400,
            fontFamily: 'var(--font-jakarta)',
          }}>
            Passeios de escuna, fotografia profissional, hospedagem selecionada e serviços exclusivos — tudo num só lugar, com quem conhece Paraty de verdade.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}>
            <Link href="/passeios" className="btn-primary" style={{
              fontSize: '0.9375rem', padding: '0.9375rem 2rem',
              background: 'var(--sunset)', color: 'var(--ocean-deep)',
              boxShadow: '0 4px 20px rgba(244,166,35,0.35)',
            }}>
              Ver Passeios
            </Link>
            <Link href="/quem-somos" className="btn-white" style={{
              fontSize: '0.9375rem', padding: '0.9375rem 2rem',
            }}>
              Conheça a Acalanto
            </Link>
          </div>

          {/* Trust row */}
          <div style={{
            display: 'flex', gap: '0', marginTop: '3rem', flexWrap: 'wrap', rowGap: '1rem',
            borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.75rem',
          }}>
            {trustItems.map(({ svg, number, sub }, i) => (
              <div key={sub} style={{
                flex: '1', minWidth: '70px',
                paddingRight: 'clamp(0.75rem, 2vw, 1.5rem)',
                paddingLeft: i === 0 ? 0 : 'clamp(0.75rem, 2vw, 1.5rem)',
                borderLeft: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.1)',
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
              }}>
                <div style={{
                  height: '28px',
                  display: 'flex', alignItems: 'center',
                  fontFamily: 'var(--font-playfair)',
                  fontSize: '1.625rem', fontWeight: 700, color: 'white',
                  letterSpacing: '-0.03em',
                }}>
                  {number ?? svg}
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                  color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em',
                  textTransform: 'uppercase', marginTop: '0.35rem',
                }}>
                  {sub}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Bottom wave */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, lineHeight: 0 }}>
        <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"
          style={{ display: 'block', width: '100%', height: '80px' }}>
          <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z" fill="white" />
        </svg>
      </div>

      <BoatOnWave />
    </section>
  )
}
