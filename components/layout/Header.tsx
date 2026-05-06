'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import CartIcon from '@/components/cart/CartIcon'

const nav = [
  { href: '/#escunas',  label: 'Escunas' },
  { href: '/servicos',  label: 'Serviços' },
  { href: '/galeria',   label: 'Galeria' },
  { href: '/quem-somos', label: 'Quem Somos' },
  { href: '/#contato',  label: 'Contato' },
]

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
        transition: 'background 0.3s, box-shadow 0.3s, backdrop-filter 0.3s',
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'saturate(180%) blur(14px)',
        boxShadow: scrolled ? '0 1px 0 rgba(0,0,0,0.1)' : '0 1px 0 rgba(0,0,0,0.06)',
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px' }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '1.375rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
          }}>
            Acalanto
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.68rem',
            fontWeight: 500,
            color: 'var(--ocean-mid)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            transition: 'color 0.3s',
          }}>
            Tours
          </span>
        </Link>

        {/* Desktop nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="hidden-mobile">
          {nav.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                padding: '0.5rem 0.875rem',
                borderRadius: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: 'var(--text-primary)',
                textDecoration: 'none',
                transition: 'color 0.2s, background 0.2s',
              }}
            >
              {label}
            </Link>
          ))}
          <CartIcon />
          <Link
            href="/#escunas"
            className="btn-primary"
            style={{ marginLeft: '0.75rem', padding: '0.625rem 1.25rem', fontSize: '0.875rem' }}
          >
            Reservar Agora
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="show-mobile"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            color: 'var(--text-primary)',
          }}
          aria-label="Menu"
        >
          {open ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div style={{
          background: 'white',
          borderTop: '1px solid var(--border)',
          padding: '1rem 1.5rem',
        }}>
          {nav.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              style={{
                display: 'block',
                padding: '0.75rem 0',
                color: 'var(--text-primary)',
                textDecoration: 'none',
                fontWeight: 500,
                borderBottom: '1px solid var(--border)',
              }}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/#escunas"
            className="btn-primary"
            onClick={() => setOpen(false)}
            style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}
          >
            Reservar Agora
          </Link>
        </div>
      )}

      <style jsx>{`
        @media (min-width: 768px) {
          .hidden-mobile { display: flex !important; }
          .show-mobile { display: none !important; }
        }
        @media (max-width: 767px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
      `}</style>
    </header>
  )
}
