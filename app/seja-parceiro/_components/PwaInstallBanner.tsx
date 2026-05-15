'use client'

import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PwaInstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    function onBeforeInstall(e: Event) {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', () => setInstalled(true))
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
    }
  }, [])

  if (installed || !prompt) return null

  async function handleInstall() {
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setPrompt(null)
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, var(--ocean-deep), var(--ocean-mid))',
      borderRadius: '1rem',
      padding: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1.25rem',
      color: 'white',
      marginTop: '2rem',
    }}>
      <div style={{ fontSize: '2.5rem' }}>📱</div>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 700, fontSize: '1.0625rem', marginBottom: '0.25rem' }}>
          Acesse pelo celular como um app
        </p>
        <p style={{ fontSize: '0.875rem', opacity: 0.85 }}>
          Adicione à sua tela inicial para acesso rápido às reservas e gestão.
        </p>
      </div>
      <button
        onClick={handleInstall}
        style={{
          background: 'white', color: 'var(--ocean-deep)',
          border: 'none', borderRadius: '0.625rem',
          padding: '0.625rem 1.25rem', fontWeight: 700,
          cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '0.875rem',
        }}
      >
        Instalar app
      </button>
    </div>
  )
}
