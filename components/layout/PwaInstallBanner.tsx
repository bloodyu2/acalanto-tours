'use client'

import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [show, setShow] = useState(false)
  const [isIos, setIsIos] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Don't show if already installed or previously dismissed
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true
    ) return

    const alreadyDismissed = localStorage.getItem('pwa-banner-dismissed')
    if (alreadyDismissed) return

    // iOS detection
    const ua = navigator.userAgent
    const isIosDevice = /iphone|ipad|ipod/i.test(ua) && !/crios/i.test(ua) && !/fxios/i.test(ua)
    if (isIosDevice) {
      setIsIos(true)
      setShow(true)
      return
    }

    // Android/Chrome beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setShow(false)
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShow(false)
    setDismissed(true)
    localStorage.setItem('pwa-banner-dismissed', '1')
  }

  if (!show || dismissed) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        width: 'calc(100% - 2rem)',
        maxWidth: '420px',
        background: '#0A3D5C',
        color: 'white',
        borderRadius: '16px',
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.875rem',
        boxShadow: '0 8px 32px rgba(10,61,92,0.35)',
        animation: 'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)',
      }}
    >
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(24px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      {/* Icon */}
      <img
        src="/icon-192.png"
        alt="Acalanto"
        width={48}
        height={48}
        style={{ borderRadius: '10px', flexShrink: 0 }}
      />

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.1rem' }}>
          Instalar Acalanto
        </div>
        {isIos ? (
          <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.45 }}>
            Toque em{' '}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline', verticalAlign: 'middle' }}>
              <path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z"/>
            </svg>
            {' '}depois &quot;Adicionar à Tela de Início&quot;
          </div>
        ) : (
          <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.8)' }}>
            Acesso rápido · funciona offline
          </div>
        )}
      </div>

      {/* Actions */}
      {!isIos && (
        <button
          onClick={handleInstall}
          style={{
            background: '#F4A623',
            color: '#0A2235',
            border: 'none',
            borderRadius: '10px',
            padding: '0.5rem 1rem',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            flexShrink: 0,
            fontFamily: 'inherit',
          }}
        >
          Instalar
        </button>
      )}

      {/* Dismiss */}
      <button
        onClick={handleDismiss}
        aria-label="Fechar"
        style={{
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.7)',
          cursor: 'pointer',
          padding: '0.25rem',
          flexShrink: 0,
          lineHeight: 0,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  )
}
