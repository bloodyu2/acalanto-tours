'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

interface GalleryImage {
  id: string
  url: string
  alt_text: string | null
  display_order: number
}

type EntityField = 'boat_id' | 'service_id' | 'photographer_package_id'

interface Props {
  entityField: EntityField
  entityId: string
  initialImages: GalleryImage[]
  label?: string
}

export default function GalleryManager({ entityField, entityId, initialImages, label = 'Galeria de fotos' }: Props) {
  const [images, setImages] = useState<GalleryImage[]>(initialImages)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    setError('')

    try {
      const supabase = createClient()
      const nextOrder = images.length > 0 ? Math.max(...images.map(i => i.display_order)) + 1 : 0

      const uploaded: GalleryImage[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const form = new FormData()
        form.append('file', file)

        const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error ?? 'Erro no upload')

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error: dbErr } = await (supabase.from('gallery') as any).insert({
          [entityField]: entityId,
          url: json.url,
          alt_text: null,
          display_order: nextOrder + i,
        }).select().single()

        if (dbErr) throw new Error(dbErr.message)
        uploaded.push(data as GalleryImage)
      }

      setImages(prev => [...prev, ...uploaded])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar fotos')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function handleDelete(img: GalleryImage) {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: dbErr } = await (supabase.from('gallery') as any).delete().eq('id', img.id)
    if (dbErr) { setError(dbErr.message); return }
    setImages(prev => prev.filter(i => i.id !== img.id))
  }

  async function handleAltChange(id: string, alt_text: string) {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('gallery') as any).update({ alt_text }).eq('id', id)
    setImages(prev => prev.map(i => i.id === id ? { ...i, alt_text } : i))
  }

  return (
    <div style={{ marginTop: '0.5rem' }}>
      <label className="form-label" style={{ display: 'block', marginBottom: '0.75rem' }}>
        {label}
      </label>

      {images.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: '0.75rem',
          marginBottom: '0.875rem',
        }}>
          {images.map(img => (
            <div key={img.id} style={{
              position: 'relative',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid var(--border)',
              background: '#f7f9fc',
            }}>
              <div style={{ position: 'relative', width: '100%', height: '90px' }}>
                <Image
                  src={img.url}
                  alt={img.alt_text ?? ''}
                  fill
                  sizes="140px"
                  quality={60}
                  style={{ objectFit: 'cover', display: 'block', color: 'transparent' }}
                />
              </div>
              <div style={{ padding: '0.375rem 0.5rem' }}>
                <input
                  type="text"
                  placeholder="Alt text"
                  defaultValue={img.alt_text ?? ''}
                  onBlur={e => handleAltChange(img.id, e.target.value)}
                  style={{ width: '100%', fontSize: '0.7rem', border: 'none', background: 'transparent', color: 'var(--text-muted)', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <button
                type="button"
                onClick={() => handleDelete(img)}
                title="Remover foto"
                style={{
                  position: 'absolute', top: '5px', right: '5px',
                  background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: '50%',
                  color: 'white', width: '24px', height: '24px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          padding: '1.5rem', border: '1px dashed var(--border)', borderRadius: '10px',
          textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: '0.875rem',
        }}>
          Nenhuma foto na galeria
        </div>
      )}

      <label style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
        cursor: uploading ? 'wait' : 'pointer',
        background: uploading ? '#e5e7eb' : 'var(--sand, #F5EDD8)',
        color: 'var(--ocean-deep, #0A3D5C)',
        fontFamily: 'var(--font-jakarta)', fontWeight: 700, fontSize: '0.8125rem',
        padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)',
        pointerEvents: uploading ? 'none' : 'auto',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        {uploading ? 'Enviando…' : '+ Adicionar fotos'}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          style={{ display: 'none' }}
          onChange={handleFiles}
        />
      </label>

      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>
        JPG, PNG ou WebP · máx. 10 MB por foto · múltiplas fotos permitidas
      </div>

      {error && <div style={{ fontSize: '0.8125rem', color: '#dc2626', marginTop: '0.5rem' }}>{error}</div>}
    </div>
  )
}
