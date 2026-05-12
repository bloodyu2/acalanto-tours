'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

export interface HeroSlide {
  url: string
  alt: string
  href: string
  name: string
  tagline: string
  priceLabel?: string
}

interface HeroCarouselProps {
  slides: HeroSlide[]
}

const SLIDE_INTERVAL_MS = 7000
const FADE_MS = 1400

export default function HeroCarousel({ slides }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [isHovered, setIsHovered] = useState(false)

  const n = slides.length

  function go(idx: number) {
    setCurrent((idx + n) % n)
    resetTimer()
  }

  function resetTimer() {
    if (timerRef.current) clearInterval(timerRef.current)
    if (n <= 1) return
    timerRef.current = setInterval(() => {
      setCurrent(i => (i + 1) % n)
    }, SLIDE_INTERVAL_MS)
  }

  useEffect(() => {
    resetTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n])

  if (!slides.length) return null

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        background: '#0a3d5c',
      }}
      aria-label="Destaques de serviços"
    >
      {/* Slides — subtle Ken Burns zoom on the active slide for cinematic motion */}
      {slides.map((slide, i) => {
        const isActive = i === current
        return (
          <div
            key={slide.url}
            style={{
              position: 'absolute',
              inset: 0,
              opacity: isActive ? 1 : 0,
              transition: `opacity ${FADE_MS}ms ease-in-out`,
              pointerEvents: 'none',
              willChange: 'opacity',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                transform: isActive ? 'scale(1.06)' : 'scale(1.0)',
                transition: `transform ${SLIDE_INTERVAL_MS + FADE_MS}ms ease-out`,
                willChange: 'transform',
              }}
            >
              <Image
                src={slide.url}
                alt={slide.alt}
                fill
                priority={i === 0}
                sizes="100vw"
                quality={90}
                style={{ objectFit: 'cover', objectPosition: 'center' }}
              />
            </div>

            {/* Stronger, more cinematic gradient for text legibility:
                - deeper darkening on the left (where copy lives)
                - smooth vertical fade at the bottom
                - light vignette on the top-right to add depth */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: [
                'linear-gradient(to top, rgba(8,40,62,0.92) 0%, rgba(8,40,62,0.55) 28%, rgba(8,40,62,0.15) 58%, transparent 100%)',
                'linear-gradient(to right, rgba(4,24,42,0.78) 0%, rgba(4,24,42,0.45) 35%, rgba(4,24,42,0.08) 65%, transparent 85%)',
                'radial-gradient(ellipse at 90% 10%, rgba(0,0,0,0.35) 0%, transparent 55%)',
              ].join(', '),
            }} />
          </div>
        )
      })}

      {/* prev / next arrows — larger hit target, fade-in on hover for cleaner aesthetic */}
      {n > 1 && (
        <>
          <button
            aria-label="Slide anterior"
            onClick={() => go(current - 1)}
            style={{
              position: 'absolute',
              left: 'clamp(0.75rem, 2vw, 1.5rem)',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              background: 'rgba(8,40,62,0.55)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: '50%',
              width: '2.75rem',
              height: '2.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
              opacity: isHovered ? 0.95 : 0,
              transition: 'opacity 0.3s ease, background 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(8,40,62,0.85)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(8,40,62,0.55)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            aria-label="Próximo slide"
            onClick={() => go(current + 1)}
            style={{
              position: 'absolute',
              right: 'clamp(0.75rem, 2vw, 1.5rem)',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              background: 'rgba(8,40,62,0.55)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: '50%',
              width: '2.75rem',
              height: '2.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
              opacity: isHovered ? 0.95 : 0,
              transition: 'opacity 0.3s ease, background 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(8,40,62,0.85)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(8,40,62,0.55)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </>
      )}
    </div>
  )
}
