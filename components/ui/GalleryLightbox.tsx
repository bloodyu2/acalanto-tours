'use client'

import Image from 'next/image'
import { useEffect, useState, useCallback } from 'react'

interface GalleryImage {
  id: string
  url: string
  alt_text?: string | null
}

interface Props {
  images: GalleryImage[]
  title?: string
}

export default function GalleryLightbox({ images, title }: Props) {
  const [open, setOpen] = useState(false)
  const [idx, setIdx] = useState(0)
  const [failedIds, setFailedIds] = useState<Set<string>>(new Set())
  const markFailed = (id: string) => setFailedIds(prev => new Set(prev).add(id))

  const close = useCallback(() => setOpen(false), [])

  const prev = useCallback(() => setIdx(i => (i - 1 + images.length) % images.length), [images.length])
  const next = useCallback(() => setIdx(i => (i + 1) % images.length), [images.length])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, close, prev, next])

  if (!images.length) return null

  function openAt(i: number) {
    setIdx(i)
    setOpen(true)
  }

  return (
    <>
      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: '0.625rem',
      }}>
        {images.filter(img => !failedIds.has(img.id)).map((img, i) => (
          <button
            key={img.id}
            onClick={() => openAt(i)}
            aria-label={img.alt_text ?? `Foto ${i + 1}`}
            style={{
              position: 'relative',
              height: '130px',
              borderRadius: '0.625rem',
              overflow: 'hidden',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              background: 'var(--sand)',
              display: 'block',
            }}
          >
            <Image
              src={img.url}
              alt={img.alt_text ?? (title ? `${title} — foto ${i + 1}` : `Foto ${i + 1}`)}
              fill
              sizes="(max-width: 768px) 50vw, 200px"
              quality={75}
              style={{ objectFit: 'cover', transition: 'transform 0.25s ease' }}
              onMouseOver={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.05)' }}
              onMouseOut={e => { (e.currentTarget as HTMLImageElement).style.transform = '' }}
              onError={() => markFailed(img.id)}
            />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0)',
              transition: 'background 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
              onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.15)' }}
              onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ opacity: 0.8, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}>
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
              </svg>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox overlay */}
      {open && (
        <div
          onClick={close}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {/* Image container */}
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '88vh',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[idx].url}
              alt={images[idx].alt_text ?? `Foto ${idx + 1}`}
              style={{
                maxWidth: '90vw',
                maxHeight: '82vh',
                borderRadius: '0.75rem',
                objectFit: 'contain',
                display: 'block',
                boxShadow: '0 8px 48px rgba(0,0,0,0.6)',
              }}
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
            />

            {/* Counter */}
            <div style={{
              position: 'absolute', bottom: '-2.25rem', left: '50%',
              transform: 'translateX(-50%)',
              fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
              color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em',
              whiteSpace: 'nowrap',
            }}>
              {idx + 1} / {images.length}
              {images[idx].alt_text && (
                <span style={{ marginLeft: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                  {images[idx].alt_text}
                </span>
              )}
            </div>
          </div>

          {/* Close */}
          <button
            onClick={close}
            aria-label="Fechar galeria"
            style={{
              position: 'fixed', top: '1.25rem', right: '1.25rem',
              background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '50%', width: '2.5rem', height: '2.5rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'white',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          {/* Prev / Next */}
          {images.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); prev() }}
                aria-label="Foto anterior"
                style={{
                  position: 'fixed', left: '1rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '50%', width: '2.75rem', height: '2.75rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'white',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>
              <button
                onClick={e => { e.stopPropagation(); next() }}
                aria-label="Próxima foto"
                style={{
                  position: 'fixed', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '50%', width: '2.75rem', height: '2.75rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'white',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            </>
          )}
        </div>
      )}
    </>
  )
}
