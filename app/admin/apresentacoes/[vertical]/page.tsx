'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import escunas from '@/lib/apresentacoes/escunas'
import hospedagem from '@/lib/apresentacoes/hospedagem'
import fotografia from '@/lib/apresentacoes/fotografia'
import jeep from '@/lib/apresentacoes/jeep'
import type { Presentation, Slide } from '@/lib/apresentacoes/types'

export const dynamic = 'force-dynamic'

const PRESENTATIONS: Record<string, Presentation> = { escunas, hospedagem, fotografia, jeep }

// ─── Design tokens ────────────────────────────────────────────────
const GOLD = '#F4A623'
const FONT_DISPLAY = 'var(--font-playfair)'
const FONT_BODY = 'var(--font-jakarta)'

// ─── Animation helper ─────────────────────────────────────────────
function fu(delay: number): React.CSSProperties {
  return { animation: `fadeUp .55s ${delay}s both` }
}

// ─── Grain SVG (shared) ───────────────────────────────────────────
const GRAIN = (
  <svg
    aria-hidden="true"
    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2 }}
  >
    <filter id="atgrain">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#atgrain)" opacity="0.07" />
  </svg>
)

// ─── SlideWrap — consistent frame for every content slide ─────────
function SlideWrap({
  accent,
  slideNum,
  children,
}: {
  accent: string
  slideNum: string
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: accent,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 2rem',
        boxSizing: 'border-box',
        color: 'white',
      }}
    >
      {GRAIN}
      {/* Vignette */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 35%, transparent 40%, rgba(0,0,0,0.3) 100%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />
      {/* Ghost slide number */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          right: '-0.1em',
          bottom: '-0.2em',
          fontFamily: FONT_DISPLAY,
          fontStyle: 'italic',
          fontSize: 'clamp(10rem, 28vw, 20rem)',
          fontWeight: 700,
          lineHeight: 1,
          color: 'rgba(0,0,0,0.12)',
          userSelect: 'none',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        {slideNum}
      </div>
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 3, width: '100%', maxWidth: '640px' }}>
        {children}
      </div>
    </div>
  )
}

// ─── SlideLabel — tiny-caps section indicator ─────────────────────
function SlideLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: FONT_BODY,
        fontSize: '0.6875rem',
        fontWeight: 700,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: GOLD,
        marginBottom: '0.875rem',
        ...fu(0),
      }}
    >
      {children}
    </div>
  )
}

// ─── Hairline ─────────────────────────────────────────────────────
function Hairline() {
  return (
    <div
      style={{
        width: '2.5rem',
        height: '1px',
        background: GOLD,
        marginBottom: '1.5rem',
        ...fu(0.05),
      }}
    />
  )
}

// ─── STitle — italic Playfair heading ────────────────────────────
function STitle({ children, delay = 0.1 }: { children: React.ReactNode; delay?: number }) {
  return (
    <h2
      style={{
        fontFamily: FONT_DISPLAY,
        fontStyle: 'italic',
        fontSize: 'clamp(1.75rem, 4.5vw, 2.625rem)',
        fontWeight: 700,
        lineHeight: 1.15,
        margin: '0 0 2rem',
        color: 'white',
        ...fu(delay),
      }}
    >
      {children}
    </h2>
  )
}

// ─── Slide renderers ──────────────────────────────────────────────

function SlideCover({ p }: { p: Presentation }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: p.accentColor,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        boxSizing: 'border-box',
        color: 'white',
      }}
    >
      {GRAIN}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 20%, transparent 30%, rgba(0,0,0,0.35) 100%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />
      {/* Animated wave bottom */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          overflow: 'hidden',
          lineHeight: 0,
          zIndex: 1,
        }}
      >
        <svg
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          style={{ display: 'block', width: '100%', height: '100px' }}
        >
          <path d="M0,50 C400,100 1000,0 1440,50 L1440,100 L0,100 Z" fill="rgba(255,255,255,0.07)" />
          <path d="M0,65 C360,20 1080,90 1440,55 L1440,100 L0,100 Z" fill="rgba(255,255,255,0.04)" />
        </svg>
      </div>
      <div style={{ position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '640px' }}>
        {/* Brand imprint */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem', ...fu(0) }}>
          <svg width="28" height="32" viewBox="0 0 52 56" opacity={0.9}>
            <g transform="translate(2,2)">
              <path d="M5,48 Q18,26 24,4" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <line x1="24" y1="4" x2="26" y2="48" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M24,7 Q35,26 46,46 L26,46 Z" fill="rgba(255,255,255,0.8)" />
              <path d="M13,28 Q19,26 24,27" stroke="white" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            </g>
          </svg>
          <span
            style={{
              fontFamily: FONT_BODY,
              fontSize: '0.625rem',
              fontWeight: 700,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              opacity: 0.7,
            }}
          >
            Acalanto Turismo · Paraty
          </span>
        </div>
        {/* Gold hairline */}
        <div style={{ width: '3rem', height: '1px', background: GOLD, marginBottom: '2rem', ...fu(0.08) }} />
        <h1
          style={{
            fontFamily: FONT_DISPLAY,
            fontStyle: 'italic',
            fontSize: 'clamp(2.25rem, 7vw, 4rem)',
            fontWeight: 700,
            textAlign: 'center',
            lineHeight: 1.1,
            marginBottom: '1.25rem',
            ...fu(0.15),
          }}
        >
          {p.title}
        </h1>
        <p
          style={{
            fontFamily: FONT_BODY,
            fontSize: 'clamp(0.9375rem, 2vw, 1.125rem)',
            opacity: 0.78,
            textAlign: 'center',
            maxWidth: '480px',
            lineHeight: 1.6,
            ...fu(0.25),
          }}
        >
          {p.tagline}
        </p>
      </div>
    </div>
  )
}

function SlideWhoWeAre({ p }: { p: Presentation }) {
  const items = [
    { label: 'O que fazemos', text: 'Acalanto é o marketplace de turismo de Paraty — onde turistas de todo o Brasil encontram passeios, pousadas e experiências locais.' },
    { label: 'Onde estamos', text: 'No coração de Paraty, conectando visitantes a prestadores locais de confiança.' },
    { label: 'Por que existimos', text: 'Valorizar quem faz Paraty ser o destino que é — gerando renda real para os locais.' },
  ]
  return (
    <SlideWrap accent={p.accentColor} slideNum="02">
      <SlideLabel>A empresa</SlideLabel>
      <Hairline />
      <STitle>A Acalanto em 3 linhas.</STitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.375rem' }}>
        {items.map((item, i) => (
          <div
            key={item.label}
            style={{
              display: 'flex',
              gap: '1.25rem',
              alignItems: 'flex-start',
              ...fu(0.2 + i * 0.08),
            }}
          >
            <div
              style={{
                width: '3px',
                alignSelf: 'stretch',
                background: GOLD,
                borderRadius: '2px',
                flexShrink: 0,
                minHeight: '2rem',
              }}
            />
            <div>
              <div
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: GOLD,
                  marginBottom: '0.3rem',
                }}
              >
                {item.label}
              </div>
              <div style={{ fontFamily: FONT_BODY, fontSize: '0.9375rem', lineHeight: 1.6, opacity: 0.9 }}>
                {item.text}
              </div>
            </div>
          </div>
        ))}
      </div>
    </SlideWrap>
  )
}

function SlideHowItWorks({ p, middleStepLabel }: { p: Presentation; middleStepLabel: string }) {
  const steps = [
    { n: '01', label: 'Cliente reserva online' },
    { n: '02', label: middleStepLabel },
    { n: '03', label: 'Você recebe o repasse' },
  ]
  return (
    <SlideWrap accent={p.accentColor} slideNum="03">
      <SlideLabel>O processo</SlideLabel>
      <Hairline />
      <STitle>Como funciona.</STitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {steps.map((step, i) => (
          <div
            key={step.n}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1.75rem',
              ...fu(0.2 + i * 0.1),
            }}
          >
            <div
              style={{
                fontFamily: FONT_DISPLAY,
                fontStyle: 'italic',
                fontSize: '3.5rem',
                fontWeight: 700,
                color: GOLD,
                lineHeight: 1,
                flexShrink: 0,
                width: '4.5rem',
              }}
            >
              {step.n}
            </div>
            <div style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '1.5rem', paddingTop: '0.625rem' }}>
              <div style={{ fontFamily: FONT_BODY, fontSize: '1.0625rem', lineHeight: 1.5, opacity: 0.92 }}>
                {step.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </SlideWrap>
  )
}

function SlideAdvantages({ p, extras }: { p: Presentation; extras: string[] }) {
  const bullets = [
    'Sem taxa de adesão',
    'Você decide sua disponibilidade',
    'Suporte direto via WhatsApp',
    'Visibilidade para turistas do Brasil inteiro',
    ...extras,
  ]
  return (
    <SlideWrap accent={p.accentColor} slideNum="04">
      <SlideLabel>As vantagens</SlideLabel>
      <Hairline />
      <STitle>Por que se cadastrar?</STitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {bullets.map((b, i) => (
          <div
            key={b}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem',
              ...fu(0.18 + i * 0.07),
            }}
          >
            {/* Gold circle bullet */}
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                border: `1.5px solid ${GOLD}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '3px',
              }}
            >
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: GOLD }} />
            </div>
            <span style={{ fontFamily: FONT_BODY, fontSize: '0.9375rem', lineHeight: 1.55, opacity: 0.92 }}>{b}</span>
          </div>
        ))}
      </div>
    </SlideWrap>
  )
}

function SlidePlatform({ p }: { p: Presentation }) {
  const tiles = [
    { label: 'Dashboard de reservas' },
    { label: 'Calendário de disponibilidade' },
    { label: 'Histórico de repasses' },
    { label: 'Suporte e comunicação' },
  ]
  return (
    <SlideWrap accent={p.accentColor} slideNum="05">
      <SlideLabel>A plataforma</SlideLabel>
      <Hairline />
      <STitle>Sua área de parceiro.</STitle>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1px',
          border: '1px solid rgba(255,255,255,0.18)',
          borderRadius: '12px',
          overflow: 'hidden',
          ...fu(0.2),
        }}
      >
        {tiles.map((t, i) => (
          <div
            key={t.label}
            style={{
              padding: '1.25rem 1.125rem',
              background: 'rgba(255,255,255,0.07)',
              borderRight: i % 2 === 0 ? '1px solid rgba(255,255,255,0.18)' : 'none',
              borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.18)' : 'none',
            }}
          >
            <div
              style={{
                width: '1.5rem',
                height: '2px',
                background: GOLD,
                marginBottom: '0.75rem',
                borderRadius: '1px',
              }}
            />
            <div style={{ fontFamily: FONT_BODY, fontSize: '0.875rem', lineHeight: 1.45, opacity: 0.9 }}>
              {t.label}
            </div>
          </div>
        ))}
      </div>
    </SlideWrap>
  )
}

function SlideRepasses({ p }: { p: Presentation }) {
  return (
    <SlideWrap accent={p.accentColor} slideNum="06">
      <SlideLabel>Financeiro</SlideLabel>
      <Hairline />
      <div style={{ textAlign: 'center', ...fu(0.1) }}>
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontStyle: 'italic',
            fontSize: 'clamp(5rem, 18vw, 9rem)',
            fontWeight: 700,
            color: GOLD,
            lineHeight: 0.95,
            marginBottom: '1.25rem',
          }}
        >
          [A DEFINIR]%
        </div>
        <div
          style={{
            fontFamily: FONT_BODY,
            fontSize: '1rem',
            opacity: 0.8,
            lineHeight: 1.6,
            ...fu(0.2),
          }}
        >
          por reserva confirmada · prazo a definir · via PIX
        </div>
        <div
          style={{
            marginTop: '2rem',
            fontFamily: FONT_BODY,
            fontSize: '0.8125rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: GOLD,
            opacity: 0.7,
            ...fu(0.3),
          }}
        >
          Valores finais em breve
        </div>
      </div>
    </SlideWrap>
  )
}

function SlideAgreements({ p, extraItem }: { p: Presentation; extraItem?: string }) {
  const baseItems = [
    'Qualidade e pontualidade no serviço',
    'Fotos atualizadas do seu negócio',
    'Manter calendário de disponibilidade atualizado',
    'Responder clientes em até 2h',
  ]
  const items = extraItem ? [...baseItems.slice(0, 3), extraItem, baseItems[3]] : baseItems
  return (
    <SlideWrap accent={p.accentColor} slideNum="07">
      <SlideLabel>O combinado</SlideLabel>
      <Hairline />
      <STitle>O que pedimos.</STitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {items.map((item, i) => (
          <div
            key={item}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem',
              ...fu(0.18 + i * 0.07),
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                border: `1.5px solid ${GOLD}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '3px',
              }}
            >
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: GOLD }} />
            </div>
            <span style={{ fontFamily: FONT_BODY, fontSize: '0.9375rem', lineHeight: 1.55, opacity: 0.92 }}>{item}</span>
          </div>
        ))}
      </div>
    </SlideWrap>
  )
}

function SlideGuarantees({ p }: { p: Presentation }) {
  const items = [
    'Pagamento seguro antes do serviço',
    'Suporte dedicado para parceiros',
    'Visibilidade constante na plataforma',
    'Sem cobranças surpresa',
  ]
  return (
    <SlideWrap accent={p.accentColor} slideNum="08">
      <SlideLabel>As garantias</SlideLabel>
      <Hairline />
      <STitle>O que garantimos.</STitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {items.map((item, i) => (
          <div
            key={item}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem',
              ...fu(0.18 + i * 0.07),
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                border: `1.5px solid ${GOLD}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '3px',
              }}
            >
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: GOLD }} />
            </div>
            <span style={{ fontFamily: FONT_BODY, fontSize: '0.9375rem', lineHeight: 1.55, opacity: 0.92 }}>{item}</span>
          </div>
        ))}
      </div>
    </SlideWrap>
  )
}

function SlideCta({ p }: { p: Presentation }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: p.accentColor,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 2rem',
        boxSizing: 'border-box',
        color: 'white',
      }}
    >
      {GRAIN}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 30%, transparent 35%, rgba(0,0,0,0.28) 100%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '580px' }}>
        <div
          style={{
            fontFamily: FONT_BODY,
            fontSize: '0.6875rem',
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: GOLD,
            marginBottom: '1.25rem',
            ...fu(0),
          }}
        >
          Próximo passo
        </div>
        <div style={{ width: '2.5rem', height: '1px', background: GOLD, marginBottom: '2rem', ...fu(0.05) }} />
        <h2
          style={{
            fontFamily: FONT_DISPLAY,
            fontStyle: 'italic',
            fontSize: 'clamp(2.75rem, 8vw, 5rem)',
            fontWeight: 700,
            lineHeight: 1.05,
            textAlign: 'center',
            marginBottom: '0.75rem',
            ...fu(0.12),
          }}
        >
          Pronto?
        </h2>
        <p
          style={{
            fontFamily: FONT_BODY,
            fontSize: '1rem',
            opacity: 0.78,
            textAlign: 'center',
            marginBottom: '2.5rem',
            ...fu(0.2),
          }}
        >
          Gratuito. Sem burocracia.
        </p>
        <a
          href="https://acalantoturismo.com.br/parceiros/cadastro"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'white',
            color: p.accentColor,
            fontFamily: FONT_BODY,
            fontWeight: 700,
            fontSize: '0.875rem',
            padding: '0.875rem 2rem',
            borderRadius: '999px',
            textDecoration: 'none',
            marginBottom: '1.75rem',
            letterSpacing: '0.02em',
            ...fu(0.28),
          }}
        >
          acalantoturismo.com.br/parceiros
        </a>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            opacity: 0.75,
            ...fu(0.35),
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
          <span style={{ fontFamily: FONT_BODY, fontSize: '0.875rem' }}>(24) 99962-7968</span>
        </div>
      </div>
      {/* Logo watermark bottom */}
      <div style={{ position: 'absolute', bottom: '1.75rem', zIndex: 3, opacity: 0.3 }}>
        <svg width="36" height="41" viewBox="0 0 52 56">
          <g transform="translate(2,2)">
            <path d="M5,48 Q18,26 24,4" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <line x1="24" y1="4" x2="26" y2="48" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M24,7 Q35,26 46,46 L26,46 Z" fill="rgba(255,255,255,0.8)" />
            <path d="M13,28 Q19,26 24,27" stroke="white" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          </g>
        </svg>
      </div>
    </div>
  )
}

// ─── Slide dispatcher ─────────────────────────────────────────────
function SlideContent({ slide, p }: { slide: Slide; p: Presentation }) {
  if (slide.type === 'cover') return <SlideCover p={p} />
  if (slide.type === 'who-we-are') return <SlideWhoWeAre p={p} />
  if (slide.type === 'how-it-works') {
    const s = slide as Extract<Slide, { type: 'how-it-works' }>
    return <SlideHowItWorks p={p} middleStepLabel={s.middleStepLabel} />
  }
  if (slide.type === 'advantages') {
    const s = slide as Extract<Slide, { type: 'advantages' }>
    return <SlideAdvantages p={p} extras={s.extras} />
  }
  if (slide.type === 'platform') return <SlidePlatform p={p} />
  if (slide.type === 'repasses') return <SlideRepasses p={p} />
  if (slide.type === 'agreements') {
    const s = slide as Extract<Slide, { type: 'agreements' }>
    return <SlideAgreements p={p} extraItem={s.extraItem} />
  }
  if (slide.type === 'guarantees') return <SlideGuarantees p={p} />
  return <SlideCta p={p} />
}

// ─── Player ───────────────────────────────────────────────────────
export default function PresentationPlayer() {
  const params = useParams()
  const router = useRouter()
  const vertical = params.vertical as string
  const p = PRESENTATIONS[vertical]

  const [current, setCurrent] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [copied, setCopied] = useState(false)
  const pointerStartX = useRef<number | null>(null)

  useEffect(() => {
    if (!p) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') setCurrent((c) => Math.min(c + 1, p.slides.length - 1))
      if (e.key === 'ArrowLeft') setCurrent((c) => Math.max(c - 1, 0))
      if (e.key === 'Escape') setShowModal(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [p])

  if (!p) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p style={{ fontFamily: FONT_BODY, color: '#6B7280' }}>Vertical não encontrada.</p>
      </div>
    )
  }

  function handlePointerDown(e: React.PointerEvent) {
    pointerStartX.current = e.clientX
  }
  function handlePointerUp(e: React.PointerEvent) {
    if (pointerStartX.current === null) return
    const delta = e.clientX - pointerStartX.current
    if (delta < -50) setCurrent((c) => Math.min(c + 1, p.slides.length - 1))
    if (delta > 50) setCurrent((c) => Math.max(c - 1, 0))
    pointerStartX.current = null
  }
  function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  function downloadPdf() {
    setShowModal(false)
    setTimeout(() => window.print(), 100)
  }

  const prog = `${current + 1} / ${p.slides.length}`

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media print {
          .slide-player-ui { display: none !important; }
          .slide-page {
            page-break-after: always;
            position: relative !important;
            width: 100% !important;
            height: 100vh !important;
            opacity: 1 !important;
            pointer-events: auto !important;
          }
          body { margin: 0; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>

      <div
        style={{ position: 'fixed', inset: 0, zIndex: 9999, userSelect: 'none', touchAction: 'none', overflow: 'hidden' }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        {p.slides.map((slide, i) => (
          <div
            key={i}
            className="slide-page"
            style={{
              position: 'absolute',
              inset: 0,
              opacity: i === current ? 1 : 0,
              pointerEvents: i === current ? 'auto' : 'none',
              transition: 'opacity 0.35s ease',
            }}
          >
            <SlideContent slide={slide} p={p} />
          </div>
        ))}

        {/* ─── UI chrome ─── */}
        <div className="slide-player-ui">
          {/* Back */}
          <button
            onClick={() => router.push('/admin/apresentacoes')}
            style={{
              position: 'fixed',
              top: '1rem',
              left: '1rem',
              background: 'rgba(0,0,0,0.38)',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: '0.45rem 0.875rem',
              borderRadius: '999px',
              fontFamily: FONT_BODY,
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              backdropFilter: 'blur(6px)',
              zIndex: 10000,
              letterSpacing: '0.02em',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Apresentações
          </button>

          {/* Progress counter */}
          <div
            style={{
              position: 'fixed',
              top: '1.125rem',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.38)',
              color: 'rgba(255,255,255,0.85)',
              fontFamily: FONT_BODY,
              fontSize: '0.6875rem',
              letterSpacing: '0.12em',
              padding: '0.35rem 0.875rem',
              borderRadius: '999px',
              backdropFilter: 'blur(6px)',
              zIndex: 10000,
            }}
          >
            {prog}
          </div>

          {/* Segment indicators */}
          <div
            style={{
              position: 'fixed',
              bottom: '1.75rem',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '4px',
              zIndex: 10000,
            }}
          >
            {p.slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                style={{
                  width: i === current ? 28 : 16,
                  height: 3,
                  borderRadius: '2px',
                  background: i === current ? GOLD : 'rgba(255,255,255,0.35)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'width 0.22s ease, background 0.22s ease',
                }}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>

          {/* Prev / Next arrow buttons */}
          <button
            onClick={() => setCurrent((c) => Math.max(c - 1, 0))}
            disabled={current === 0}
            style={{
              position: 'fixed',
              left: '0.875rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.28)',
              border: 'none',
              color: 'white',
              cursor: current === 0 ? 'default' : 'pointer',
              padding: '0.75rem 0.5rem',
              borderRadius: '8px',
              backdropFilter: 'blur(4px)',
              zIndex: 10000,
              opacity: current === 0 ? 0.25 : 0.75,
              transition: 'opacity 0.2s',
              display: 'flex',
              alignItems: 'center',
            }}
            aria-label="Slide anterior"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={() => setCurrent((c) => Math.min(c + 1, p.slides.length - 1))}
            disabled={current === p.slides.length - 1}
            style={{
              position: 'fixed',
              right: '0.875rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.28)',
              border: 'none',
              color: 'white',
              cursor: current === p.slides.length - 1 ? 'default' : 'pointer',
              padding: '0.75rem 0.5rem',
              borderRadius: '8px',
              backdropFilter: 'blur(4px)',
              zIndex: 10000,
              opacity: current === p.slides.length - 1 ? 0.25 : 0.75,
              transition: 'opacity 0.2s',
              display: 'flex',
              alignItems: 'center',
            }}
            aria-label="Próximo slide"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Share button */}
          <button
            onClick={() => setShowModal(true)}
            style={{
              position: 'fixed',
              bottom: '1.375rem',
              right: '1.25rem',
              background: 'rgba(0,0,0,0.42)',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: '0.7rem',
              borderRadius: '50%',
              backdropFilter: 'blur(6px)',
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Compartilhar ou baixar PDF"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>
        </div>

        {/* ─── Share modal ─── */}
        {showModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.65)',
              zIndex: 10001,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)',
            }}
            onClick={() => setShowModal(false)}
          >
            <div
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '2rem',
                width: '90%',
                maxWidth: '300px',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.875rem',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: '1.25rem', margin: '0 0 0.25rem', color: '#1A1A2E' }}>
                Compartilhar
              </h3>
              <button
                onClick={copyLink}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.875rem 1rem',
                  cursor: 'pointer',
                  fontFamily: FONT_BODY,
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  color: '#1A1A2E',
                  transition: 'background 0.15s',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                </svg>
                {copied ? 'Copiado!' : 'Copiar link'}
              </button>
              <button
                onClick={downloadPdf}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.875rem 1rem',
                  cursor: 'pointer',
                  fontFamily: FONT_BODY,
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  color: '#1A1A2E',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Baixar PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
