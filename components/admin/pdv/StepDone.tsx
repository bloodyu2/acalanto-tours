// components/admin/pdv/StepDone.tsx
'use client'
import { useEffect, useState } from 'react'

interface Props {
  bookingId: string
  onNewSale: () => void
}

export default function StepDone({ bookingId, onNewSale }: Props) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [whatsappLink, setWhatsappLink] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/admin/pdv/${bookingId}/notify`, { method: 'POST' })
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error)
        setPdfUrl(d.pdfUrl)
        setWhatsappLink(d.whatsappLink)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [bookingId])

  return (
    <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', maxWidth: '560px', textAlign: 'center' }}>
      <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>✅</div>
      <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.5rem', color: 'var(--ocean-deep)', margin: '0 0 1rem' }}>
        Venda concluída!
      </h2>

      {loading && <p style={{ color: 'var(--text-muted)' }}>Gerando comprovante…</p>}
      {error && <p style={{ color: '#e53e3e' }}>Erro: {error}</p>}

      {pdfUrl && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ padding: '0.75rem', background: 'var(--ocean-mid)', color: 'white', borderRadius: '0.625rem', textDecoration: 'none', fontWeight: 600 }}
          >
            📄 Baixar comprovante (PDF)
          </a>
          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{ padding: '0.75rem', background: '#25D366', color: 'white', borderRadius: '0.625rem', textDecoration: 'none', fontWeight: 600 }}
            >
              💬 Enviar pelo WhatsApp
            </a>
          )}
        </div>
      )}

      <button
        onClick={onNewSale}
        style={{ marginTop: '1rem', width: '100%', padding: '0.75rem', background: 'white', border: '1.5px solid var(--ocean-mid)', borderRadius: '0.625rem', cursor: 'pointer', color: 'var(--ocean-deep)', fontWeight: 600 }}
      >
        + Nova venda
      </button>
    </div>
  )
}
