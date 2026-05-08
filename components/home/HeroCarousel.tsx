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

export default function HeroCarousel({ slides }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

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
    }, 7000)
  }

  useEffect(() => {
    resetTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n])

  if (!slides.length) return null

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
      }}
      aria-label="Destaques de serviços"
    >
      {/* Slides */}
      {slides.map((slide, i) => (
        <div
          key={slide.href}
          style={{
            position: 'absolute',
            inset: 0,
            opacity: i === current ? 1 : 0,
            transition: 'opacity 1.2s ease-in-out',
            pointerEvents: 'none',
          }}
        >
          <Image
            src={slide.url}
            alt={slide.alt}
            fill
            priority={i === 0}
            sizes="100vw"
            style={{ objectFit: 'cover', objectPosition: 'center' }}
          />

          {/* gradient: dark bottom + left side to protect text legibility */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: [
              'linear-gradient(to top, rgba(10,61,92,0.9) 0%, rgba(10,61,92,0.55) 25%, rgba(10,61,92,0.15) 55%, transparent 100%)',
              'linear-gradient(to right, rgba(5,30,55,0.65) 0%, rgba(5,30,55,0.3) 40%, transparent 70%)',
            ].join(', '),
          }} />
        </div>
      ))}

      {/* nav dots */}
      {n > 1 && (
        <div style={{
          position: 'absolute',
          bottom: '3.75rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '0.5rem',
          zIndex: 2,
        }}>
          {slides.map((_, i) => (
            <button
              key={i}
              aria-label={`Slide ${i + 1}`}
              onClick={e => { e.preventDefault(); go(i) }}
              style={{
                width: i === current ? '1.75rem' : '0.45rem',
                height: '0.45rem',
                borderRadius: '999px',
                background: i === current ? 'var(--sunset)' : 'rgba(255,255,255,0.4)',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                transition: 'all 0.35s ease',
              }}
            />
          ))}
        </div>
      )}

      {/* prev / next arrows — visible on hover only via opacity */}
      {n > 1 && (
        <>
          <button
            aria-label="Slide anterior"
            onClick={() => go(current - 1)}
            style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              background: 'rgba(10,61,92,0.4)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '50%',
              width: '2.5rem',
              height: '2.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
              opacity: 0.7,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            aria-label="Próximo slide"
            onClick={() => go(current + 1)}
            style={{
              position: 'absolute',
              right: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              background: 'rgba(10,61,92,0.4)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '50%',
              width: '2.5rem',
              height: '2.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
              opacity: 0.7,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </>
      )}
    </div>
  )
}
