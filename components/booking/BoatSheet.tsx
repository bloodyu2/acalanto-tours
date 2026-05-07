'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import BookingWidget from './BookingWidget'
import type { Boat } from '@/lib/types/database'

interface Props {
  boat: Boat | null
  unavailableDates: string[]
  onClose: () => void
}

export default function BoatSheet({ boat, unavailableDates, onClose }: Props) {
  useEffect(() => {
    if (!boat) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [boat, onClose])

  if (!boat) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 40,
          background: 'rgba(10,61,92,0.55)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
          animation: 'fadeIn 0.2s ease',
        }}
      />

      {/* Sheet */}
      <div style={{
        position: 'fixed', right: 0, top: 0, bottom: 0, zIndex: 50,
        width: '100%', maxWidth: '480px',
        background: 'white',
        boxShadow: '-4px 0 32px rgba(10,61,92,0.18)',
        overflowY: 'auto',
        animation: 'slideInRight 0.25s ease',
      }}>
        {/* Header */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 1,
          background: 'white',
          borderBottom: '1px solid var(--border)',
          padding: '1rem 1.25rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '0.75rem',
        }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.125rem' }}>
              Reservar
            </p>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.125rem', color: 'var(--ocean-deep)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {boat.name}
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0 }}>
            <Link
              href={`/passeios/${boat.slug}`}
              onClick={onClose}
              style={{ fontSize: '0.8rem', color: 'var(--ocean-mid)', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}
            >
              Ver detalhes →
            </Link>
            <button
              onClick={onClose}
              aria-label="Fechar"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.375rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Booking widget */}
        <div style={{ padding: '1.25rem' }}>
          <BookingWidget boat={boat} unavailableDates={unavailableDates} />
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideInRight { from { transform: translateX(100%) } to { transform: translateX(0) } }
      `}</style>
    </>
  )
}
