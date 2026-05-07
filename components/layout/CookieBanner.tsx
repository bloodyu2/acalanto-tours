'use client'

import { useState, useEffect } from 'react'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('acalanto_cookie_consent')
    if (!consent) setVisible(true)
  }, [])

  const accept = () => {
    localStorage.setItem('acalanto_cookie_consent', 'accepted')
    setVisible(false)
    if (typeof window !== 'undefined' && (window as Window & { gtag?: (...args: unknown[]) => void }).gtag) {
      (window as Window & { gtag?: (...args: unknown[]) => void }).gtag!('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'granted',
      })
    }
  }

  const decline = () => {
    localStorage.setItem('acalanto_cookie_consent', 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', bottom: '1.25rem', left: '1.25rem', right: '1.25rem',
      maxWidth: '520px', margin: '0 auto',
      background: 'var(--ocean-deep)', color: 'white',
      borderRadius: '1rem', padding: '1.25rem 1.5rem',
      boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
      zIndex: 200, fontSize: '0.875rem', lineHeight: 1.55,
    }}>
      <p style={{ marginBottom: '1rem' }}>
        Usamos cookies para melhorar sua experiência e analisar o tráfego do site.
        Ao aceitar, você concorda com nossa{' '}
        <a href="/privacidade" style={{ color: 'var(--sunset)', textDecoration: 'underline' }}>política de privacidade</a>.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button onClick={accept} className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.5rem 1.25rem' }}>
          Aceitar
        </button>
        <button onClick={decline} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer' }}>
          Recusar
        </button>
      </div>
    </div>
  )
}
