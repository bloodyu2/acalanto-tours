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
          key={slide.url}
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

      {/* Carrossel auto-rotativo (7s/slide). Setas e dots foram removidos a pedido
          do cliente — slides avançam apenas pelo timer interno. */}
    </div>
  )
}
