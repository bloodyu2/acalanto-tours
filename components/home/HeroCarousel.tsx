'use client'

import Image from 'next/image'
import Link from 'next/link'
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
        <Link
          key={slide.href}
          href={slide.href}
          aria-label={`Ver ${slide.name}`}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'block',
            opacity: i === current ? 1 : 0,
            transition: 'opacity 1.2s ease-in-out',
            pointerEvents: i === current ? 'auto' : 'none',
            cursor: 'pointer',
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
              'linear-gradient(to top, rgba(10,61,92,0.95) 0%, rgba(10,61,92,0.65) 28%, rgba(10,61,92,0.2) 60%, transparent 100%)',
              'linear-gradient(to right, rgba(5,30,55,0.72) 0%, rgba(5,30,55,0.4) 40%, transparent 70%)',
            ].join(', '),
          }} />

          {/* slide ad card — bottom left */}
          <div style={{
            position: 'absolute',
            bottom: '5.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: '680px',
            padding: '0 1.5rem',
            boxSizing: 'border-box',
          }}>
            <div style={{
              background: 'rgba(10,61,92,0.55)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(245,237,216,0.15)',
              borderRadius: '1rem',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}>
              <div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.62rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--sunset)',
                  marginBottom: '0.35rem',
                }}>
                  {slide.priceLabel ?? 'Ver passeio'}
                </div>
                <div style={{
                  fontFamily: 'var(--font-playfair)',
                  fontSize: 'clamp(1.2rem, 3vw, 1.6rem)',
                  fontWeight: 700,
                  color: 'white',
                  lineHeight: 1.1,
                  marginBottom: '0.3rem',
                }}>
                  {slide.name}
                </div>
                <div style={{
                  fontFamily: 'var(--font-jakarta)',
                  fontSize: '0.875rem',
                  color: 'rgba(255,255,255,0.7)',
                  lineHeight: 1.4,
                }}>
                  {slide.tagline}
                </div>
              </div>

              <div style={{
                flexShrink: 0,
                background: 'var(--sunset)',
                color: 'var(--ocean-deep)',
                fontFamily: 'var(--font-jakarta)',
                fontWeight: 700,
                fontSize: '0.8125rem',
                padding: '0.7rem 1.2rem',
                borderRadius: '0.5rem',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}>
                Reservar
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </Link>
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
