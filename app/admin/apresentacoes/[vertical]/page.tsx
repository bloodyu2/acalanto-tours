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

// ─── Slide renderers ──────────────────────────────────────────────

function SlideContent({ slide, p }: { slide: Slide; p: Presentation }) {
  const base: React.CSSProperties = {
    width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', padding: '2rem',
    background: p.accentColor, color: 'white', boxSizing: 'border-box',
    position: 'relative', overflow: 'hidden',
  }

  if (slide.type === 'cover') {
    return (
      <div style={base}>
        <svg width="60" height="68" viewBox="0 0 52 56" style={{ marginBottom: '2rem', opacity: 0.9 }}>
          <g transform="translate(2,2)">
            <path d="M5,48 Q18,26 24,4" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
            <line x1="24" y1="4" x2="26" y2="48" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
            <path d="M24,7 Q35,26 46,46 L26,46 Z" fill="rgba(255,255,255,0.7)"/>
            <path d="M13,28 Q19,26 24,27" stroke="white" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
          </g>
        </svg>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(2rem,6vw,3rem)', textAlign: 'center', marginBottom: '1rem', lineHeight: 1.15 }}>
          {p.title}
        </h1>
        <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: 'clamp(1rem,2.5vw,1.25rem)', opacity: 0.85, textAlign: 'center', maxWidth: '520px', lineHeight: 1.5 }}>
          {p.tagline}
        </p>
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', overflow: 'hidden', lineHeight: 0, opacity: 0.15 }}>
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '80px' }}>
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="white"/>
          </svg>
        </div>
      </div>
    )
  }

  if (slide.type === 'who-we-are') {
    const cards = [
      { title: 'Plataforma digital', text: 'Acalanto é o marketplace de turismo de Paraty — onde turistas de todo o Brasil encontram passeios, pousadas e experiências locais.' },
      { title: 'Paraty, RJ', text: 'Estamos no coração da cidade, conectando visitantes a prestadores locais de confiança há anos.' },
      { title: 'Nossa missão', text: 'Valorizar o turismo local, gerando renda para quem faz Paraty ser o destino que é.' },
    ]
    return (
      <div style={base}>
        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.5rem,4vw,2.25rem)', textAlign: 'center', marginBottom: '2rem' }}>
          Quem é a Acalanto?
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '600px' }}>
          {cards.map((c) => (
            <div key={c.title} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '1rem 1.25rem', backdropFilter: 'blur(4px)' }}>
              <div style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.375rem' }}>{c.title}</div>
              <div style={{ fontFamily: 'var(--font-jakarta)', fontSize: '0.875rem', opacity: 0.9, lineHeight: 1.55 }}>{c.text}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (slide.type === 'how-it-works') {
    const s = slide as Extract<Slide, { type: 'how-it-works' }>
    const steps = [
      { n: '1', label: 'Cliente reserva online' },
      { n: '2', label: s.middleStepLabel },
      { n: '3', label: 'Você recebe o repasse' },
    ]
    return (
      <div style={base}>
        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.5rem,4vw,2.25rem)', textAlign: 'center', marginBottom: '2.5rem' }}>
          Como funciona
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', maxWidth: '500px' }}>
          {steps.map((step) => (
            <div key={step.n} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', fontWeight: 700, flexShrink: 0 }}>
                {step.n}
              </div>
              <div style={{ fontFamily: 'var(--font-jakarta)', fontSize: '1rem', lineHeight: 1.4 }}>{step.label}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (slide.type === 'advantages') {
    const s = slide as Extract<Slide, { type: 'advantages' }>
    const bullets = [
      'Sem taxa de adesão',
      'Você decide sua disponibilidade',
      'Suporte direto via WhatsApp',
      'Visibilidade para turistas do Brasil inteiro',
      ...s.extras,
    ]
    return (
      <div style={base}>
        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.5rem,4vw,2.25rem)', textAlign: 'center', marginBottom: '2rem' }}>
          Por que se cadastrar?
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', width: '100%', maxWidth: '560px' }}>
          {bullets.map((b) => (
            <div key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '0.9375rem', lineHeight: 1.5 }}>{b}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (slide.type === 'platform') {
    const tiles = [
      { label: 'Dashboard de reservas', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
      { label: 'Calendário de disponibilidade', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
      { label: 'Histórico de repasses', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> },
      { label: 'Suporte e comunicação', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> },
    ]
    return (
      <div style={base}>
        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.5rem,4vw,2.25rem)', textAlign: 'center', marginBottom: '2rem' }}>
          Sua área de parceiro
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '100%', maxWidth: '520px' }}>
          {tiles.map((t) => (
            <div key={t.label} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.625rem', textAlign: 'center', backdropFilter: 'blur(4px)' }}>
              <div style={{ opacity: 0.9 }}>{t.icon}</div>
              <div style={{ fontFamily: 'var(--font-jakarta)', fontSize: '0.8125rem', lineHeight: 1.4 }}>{t.label}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (slide.type === 'repasses') {
    return (
      <div style={base}>
        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.5rem,4vw,2.25rem)', textAlign: 'center', marginBottom: '2rem' }}>
          Seus ganhos
        </h2>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(3rem,10vw,5rem)', fontWeight: 700, color: '#F4A623', lineHeight: 1 }}>
            [A DEFINIR]%
          </div>
          <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '1rem', opacity: 0.9, marginTop: '0.75rem' }}>
            Você recebe [A DEFINIR]% por reserva confirmada
          </p>
          <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '0.875rem', opacity: 0.75, marginTop: '0.5rem' }}>
            Prazo: [A DEFINIR] dias após o serviço · Via PIX
          </p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '8px', padding: '0.75rem 1.25rem', fontFamily: 'var(--font-jakarta)', fontSize: '0.8125rem', opacity: 0.8, textAlign: 'center' }}>
          Valores a confirmar — em breve
        </div>
      </div>
    )
  }

  if (slide.type === 'agreements') {
    const s = slide as Extract<Slide, { type: 'agreements' }>
    const baseItems = [
      'Qualidade e pontualidade no serviço',
      'Fotos atualizadas do seu negócio',
      'Manter calendário de disponibilidade atualizado',
      'Responder clientes em até 2h',
    ]
    const items = s.extraItem
      ? [...baseItems.slice(0, 3), s.extraItem, baseItems[3]]
      : baseItems
    return (
      <div style={base}>
        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.5rem,4vw,2.25rem)', textAlign: 'center', marginBottom: '2rem' }}>
          O que a Acalanto pede
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', width: '100%', maxWidth: '540px' }}>
          {items.map((item) => (
            <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '0.9375rem', lineHeight: 1.5 }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (slide.type === 'guarantees') {
    const items = [
      'Pagamento seguro antes do serviço',
      'Suporte dedicado para parceiros',
      'Visibilidade constante na plataforma',
      'Sem cobranças surpresa',
    ]
    return (
      <div style={base}>
        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.5rem,4vw,2.25rem)', textAlign: 'center', marginBottom: '2rem' }}>
          O que garantimos a você
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', width: '100%', maxWidth: '540px' }}>
          {items.map((item) => (
            <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <polyline points="9 12 11 14 15 10"/>
              </svg>
              <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '0.9375rem', lineHeight: 1.5 }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // cta
  return (
    <div style={base}>
      <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(2rem,6vw,3rem)', textAlign: 'center', marginBottom: '0.75rem' }}>
        Vamos começar?
      </h2>
      <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '1rem', opacity: 0.85, textAlign: 'center', marginBottom: '2.5rem' }}>
        Cadastro gratuito e sem compromisso
      </p>
      <a
        href="https://acalantoturismo.com.br/parceiros/cadastro"
        style={{ display: 'inline-block', background: 'white', color: p.accentColor, fontFamily: 'var(--font-jakarta)', fontWeight: 700, fontSize: '1rem', padding: '0.875rem 2rem', borderRadius: '999px', textDecoration: 'none', marginBottom: '1.5rem' }}
      >
        acalantoturismo.com.br/parceiros/cadastro
      </a>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.9 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
        <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '0.9375rem' }}>(24) 99962-7968</span>
      </div>
      <div style={{ position: 'absolute', bottom: '2rem', opacity: 0.6 }}>
        <svg width="44" height="50" viewBox="0 0 52 56">
          <g transform="translate(2,2)">
            <path d="M5,48 Q18,26 24,4" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
            <line x1="24" y1="4" x2="26" y2="48" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
            <path d="M24,7 Q35,26 46,46 L26,46 Z" fill="rgba(255,255,255,0.7)"/>
            <path d="M13,28 Q19,26 24,27" stroke="white" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
          </g>
        </svg>
      </div>
    </div>
  )
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
        <p style={{ fontFamily: 'var(--font-jakarta)', color: '#6B7280' }}>Vertical não encontrada.</p>
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

  return (
    <>
      <style>{`
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

      {/* Fullscreen container */}
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 9999, userSelect: 'none', touchAction: 'none', overflow: 'hidden' }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        {/* All slides rendered for print; only current visible on screen */}
        {p.slides.map((slide, i) => (
          <div
            key={i}
            className="slide-page"
            style={{
              position: 'absolute', inset: 0,
              opacity: i === current ? 1 : 0,
              pointerEvents: i === current ? 'auto' : 'none',
              transition: 'opacity 0.25s ease',
            }}
          >
            <SlideContent slide={slide} p={p} />
          </div>
        ))}

        {/* UI chrome */}
        <div className="slide-player-ui">
          {/* Back button */}
          <button
            onClick={() => router.push('/admin/apresentacoes')}
            style={{ position: 'fixed', top: '1rem', left: '1rem', background: 'rgba(0,0,0,0.35)', border: 'none', color: 'white', cursor: 'pointer', padding: '0.5rem 0.875rem', borderRadius: '999px', fontFamily: 'var(--font-jakarta)', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.375rem', backdropFilter: 'blur(4px)', zIndex: 10000 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Apresentações
          </button>

          {/* Progress */}
          <div style={{ position: 'fixed', top: '1.125rem', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.35)', color: 'white', fontFamily: 'var(--font-jakarta)', fontSize: '0.75rem', padding: '0.375rem 0.875rem', borderRadius: '999px', backdropFilter: 'blur(4px)', zIndex: 10000 }}>
            {current + 1} / {p.slides.length}
          </div>

          {/* Dot indicators */}
          <div style={{ position: 'fixed', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.5rem', zIndex: 10000 }}>
            {p.slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                style={{ width: i === current ? 24 : 8, height: 8, borderRadius: '999px', background: i === current ? 'white' : 'rgba(255,255,255,0.4)', border: 'none', cursor: 'pointer', padding: 0, transition: 'width 0.2s, background 0.2s' }}
              />
            ))}
          </div>

          {/* Share/PDF button */}
          <button
            onClick={() => setShowModal(true)}
            style={{ position: 'fixed', bottom: '2rem', right: '1.5rem', background: 'rgba(0,0,0,0.45)', border: 'none', color: 'white', cursor: 'pointer', padding: '0.75rem', borderRadius: '50%', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Compartilhar ou baixar PDF"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          </button>
        </div>

        {/* Share modal */}
        {showModal && (
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setShowModal(false)}
          >
            <div
              style={{ background: 'white', borderRadius: '16px', padding: '1.75rem', width: '90%', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.125rem', margin: 0 }}>Compartilhar</h3>
              <button
                onClick={copyLink}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f3f4f6', border: 'none', borderRadius: '10px', padding: '0.875rem 1rem', cursor: 'pointer', fontFamily: 'var(--font-jakarta)', fontSize: '0.9375rem', fontWeight: 600, color: '#1A1A2E' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
                </svg>
                {copied ? 'Copiado!' : 'Copiar link'}
              </button>
              <button
                onClick={downloadPdf}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f3f4f6', border: 'none', borderRadius: '10px', padding: '0.875rem 1rem', cursor: 'pointer', fontFamily: 'var(--font-jakarta)', fontSize: '0.9375rem', fontWeight: 600, color: '#1A1A2E' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
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
