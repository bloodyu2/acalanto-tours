'use client'

import { useRef, useState } from 'react'

interface Props {
  name: string
  currentUrl?: string | null
  label?: string
}

export default function ImageUploader({ name, currentUrl, label = 'Imagem de capa' }: Props) {
  const [url, setUrl] = useState(currentUrl ?? '')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Erro no upload')
      setUrl(json.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro no upload')
    } finally {
      setUploading(false)
      // reset file input so the same file can be re-selected
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function handleRemove() {
    setUrl('')
    setError('')
  }

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>

      {/* Hidden input carries the URL into the Server Action form */}
      <input type="hidden" name={name} value={url} />

      {url ? (
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '0.5rem' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt="Preview"
            style={{
              width: '100%',
              maxWidth: '360px',
              height: '180px',
              objectFit: 'cover',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              display: 'block',
            }}
          />
          <button
            type="button"
            onClick={handleRemove}
            title="Remover imagem"
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              background: 'rgba(0,0,0,0.55)',
              border: 'none',
              borderRadius: '50%',
              color: 'white',
              width: '28px',
              height: '28px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      ) : null}

      <label
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          cursor: uploading ? 'wait' : 'pointer',
          background: uploading ? '#e5e7eb' : 'var(--sand, #F5EDD8)',
          color: 'var(--ocean-deep, #0A3D5C)',
          fontFamily: 'var(--font-jakarta)',
          fontWeight: 700,
          fontSize: '0.8125rem',
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          transition: 'background 0.15s',
          pointerEvents: uploading ? 'none' : 'auto',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        {uploading ? 'Enviando…' : url ? 'Trocar imagem' : 'Enviar imagem'}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={handleFile}
        />
      </label>

      {!url && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>
          JPG, PNG ou WebP · máx. 10 MB
        </div>
      )}

      {error && (
        <div style={{ fontSize: '0.8125rem', color: '#dc2626', marginTop: '0.375rem' }}>{error}</div>
      )}
    </div>
  )
}
