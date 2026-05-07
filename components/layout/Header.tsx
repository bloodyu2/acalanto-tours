'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import CartIcon from '@/components/cart/CartIcon'

const nav = [
  { href: '/passeios',   label: 'Passeios' },
  { href: '/fotografia', label: 'Fotografia' },
  { href: '/hotelaria',  label: 'Hospedagem' },
  { href: '/servicos',   label: 'Serviços' },
  { href: '/blog',       label: 'Blog' },
]

// SVG do ícone A da Acalanto — versão para fundo claro
function AcalantoIcon({ size = 32 }: { size?: number }) {
  const h = size
  const w = size * 0.88
  return (
    <svg width={w} height={h} viewBox="0 0 120 136" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g transform="translate(60,68) rotate(-7) translate(-60,-68)">
        <path d="M13,124 Q42,71 64,13" stroke="#0A3D5C" strokeWidth="6" strokeLinecap="round" fill="none"/>
        <line x1="64" y1="13" x2="69" y2="124" stroke="#0A3D5C" strokeWidth="2.8" strokeLinecap="round"/>
        <path d="M64,19 Q92,65 122,120 L69,120 Z" fill="#F4A623"/>
        <path d="M35,75 Q49,70 64,72" stroke="#0A3D5C" strokeWidth="2.8" strokeLinecap="round" fill="none"/>
      </g>
    </svg>
  )
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        transition: 'background 0.3s, box-shadow 0.3s',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'saturate(180%) blur(14px)',
        WebkitBackdropFilter: 'saturate(180%) blur(14px)',
        boxShadow: scrolled
          ? '0 1px 0 rgba(10,61,92,0.12), 0 2px 8px rgba(10,61,92,0.06)'
          : '0 1px 0 rgba(10,61,92,0.07)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '68px',
          gap: '0.5rem',
        }}
      >
        {/* ── Logo ── */}
        <Link
          href="/"
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <AcalantoIcon size={34} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <span style={{
              fontFamily: 'var(--font-playfair)',
              fontStyle: 'italic',
              fontWeight: 500,
              fontSize: '1.25rem',
              color: 'var(--ocean-deep)',
              lineHeight: 1,
              letterSpacing: '-0.01em',
            }}>
              Acalanto
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '3px' }}>
              <div style={{ height: '1.5px', background: 'var(--ocean-mid)', borderRadius: '999px' }} />
              <div style={{ height: '1.5px', width: '75%', background: 'var(--sunset)', borderRadius: '999px' }} />
            </div>
            <span style={{
              fontFamily: 'var(--font-jakarta)',
              fontWeight: 700,
              fontSize: '0.55rem',
              color: 'var(--ocean-mid)',
              textTransform: 'uppercase',
              letterSpacing: '0.38em',
              marginTop: '3px',
              paddingLeft: '0.38em',
            }}>
              Turismo
            </span>
          </div>
        </Link>

        {/* ── Desktop nav ── */}
        <nav className="hidden-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.125rem', flex: 1, justifyContent: 'center' }}>
          {nav.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                padding: '0.5rem 0.875rem',
                borderRadius: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: 'var(--text-body)',
                textDecoration: 'none',
                transition: 'color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => {
                (e.target as HTMLElement).style.color = 'var(--ocean-mid)'
                ;(e.target as HTMLElement).style.background = 'var(--ocean-pale)'
              }}
              onMouseLeave={e => {
                (e.target as HTMLElement).style.color = 'var(--text-body)'
                ;(e.target as HTMLElement).style.background = 'transparent'
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* ── Desktop right ── */}
        <div
          className="hidden-mobile"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}
        >
          <CartIcon />
          <Link
            href="/reservar"
            className="btn-primary"
            style={{ marginLeft: '0.25rem', padding: '0.6rem 1.25rem', fontSize: '0.875rem', borderRadius: '10px' }}
          >
            Reservar
          </Link>
        </div>

        {/* ── Mobile right ── */}
        <div
          className="show-mobile"
          style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
        >
          <CartIcon />
          <button
            onClick={() => setOpen(!open)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '0.375rem', color: 'var(--ocean-deep)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          >
            {open ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile dropdown ── */}
      {open && (
        <div style={{
          background: 'white',
          borderTop: '1px solid var(--border)',
          padding: '0.75rem 1.5rem 1.25rem',
          boxShadow: '0 8px 24px rgba(10,61,92,0.1)',
        }}>
          {nav.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              style={{
                display: 'flex', alignItems: 'center',
                padding: '0.75rem 0',
                color: 'var(--text-primary)',
                textDecoration: 'none',
                fontWeight: 500,
                fontSize: '0.9375rem',
                borderBottom: '1px solid var(--border)',
                gap: '0.5rem',
              }}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/reservar"
            className="btn-primary"
            onClick={() => setOpen(false)}
            style={{ marginTop: '1rem', width: '100%', justifyContent: 'center', borderRadius: '12px' }}
          >
            Reservar agora
          </Link>
        </div>
      )}

      <style jsx>{`
        @media (min-width: 768px) {
          .hidden-mobile { display: flex !important; }
          .show-mobile   { display: none  !important; }
        }
        @media (max-width: 767px) {
          .hidden-mobile { display: none  !important; }
          .show-mobile   { display: flex  !important; }
        }
      `}</style>
    </header>
  )
}
