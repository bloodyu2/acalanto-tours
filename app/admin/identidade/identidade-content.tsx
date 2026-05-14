'use client'

import { useState } from 'react'

const COLORS = [
  { name: 'Ocean Deep',   hex: '#0A3D5C', usage: 'Cor principal, CTAs, headers' },
  { name: 'Ocean Mid',    hex: '#1A6B8A', usage: 'Hover, links, destaques' },
  { name: 'Sand Warm',    hex: '#F5EDD8', usage: 'Backgrounds, seções claras' },
  { name: 'Sunset Gold',  hex: '#F4A623', usage: 'Accent, badges, highlights' },
  { name: 'Text Primary', hex: '#1A1A2E', usage: 'Corpo de texto' },
  { name: 'Text Muted',   hex: '#6B7280', usage: 'Texto secundário' },
  { name: 'White',        hex: '#FFFFFF', usage: 'Fundos e textos sobre cor' },
  { name: 'Border',       hex: '#E5E7EB', usage: 'Bordas e divisores' },
]

const LOGOS = [
  { file: 'logo-completo-escuro.svg', label: 'Logo Completo — Fundo Escuro', bg: '#0A3D5C' },
  { file: 'logo-completo-claro.svg',  label: 'Logo Completo — Fundo Claro',  bg: '#F5EDD8' },
  { file: 'logo-icone.svg',           label: 'Ícone',                         bg: '#F5EDD8' },
  { file: 'logo-branco.svg',          label: 'Logo Branco',                   bg: '#0A3D5C' },
]

const VOICE = [
  { word: 'Autêntico',  desc: 'Paraty de verdade, sem filtro de agência' },
  { word: 'Acolhedor',  desc: 'Como um anfitrião que conhece cada cantinho' },
  { word: 'Confiável',  desc: 'Clareza em preços, prazos e combinados' },
  { word: 'Local',      desc: 'Parceiros locais, experiências únicas' },
]

const LIGHT_COLORS = new Set(['#F5EDD8', '#FFFFFF', '#E5E7EB', '#F4A623'])

function ColorSwatch({ name, hex, usage }: { name: string; hex: string; usage: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(hex).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }
  const isLight = LIGHT_COLORS.has(hex)
  return (
    <button
      onClick={copy}
      style={{ all: 'unset', display: 'flex', flexDirection: 'column', gap: 0, cursor: 'pointer', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E5E7EB', background: 'white', textAlign: 'left', width: '100%', boxSizing: 'border-box' }}
      title={`Copiar ${hex}`}
    >
      <div style={{ height: '72px', background: hex, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {copied && (
          <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '0.75rem', fontWeight: 700, color: isLight ? '#0A3D5C' : 'white', background: 'rgba(0,0,0,0.2)', padding: '0.25rem 0.625rem', borderRadius: '999px' }}>
            Copiado!
          </span>
        )}
      </div>
      <div style={{ padding: '0.75rem 1rem' }}>
        <div style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 700, fontSize: '0.875rem', color: '#1A1A2E', marginBottom: '0.125rem' }}>{name}</div>
        <div style={{ fontFamily: 'var(--font-jakarta)', fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.25rem' }}>{hex}</div>
        <div style={{ fontFamily: 'var(--font-jakarta)', fontSize: '0.75rem', color: '#6B7280', lineHeight: 1.4 }}>{usage}</div>
      </div>
    </button>
  )
}

export function IdentidadeContent() {
  const sectionTitle: React.CSSProperties = {
    fontFamily: 'var(--font-playfair)',
    fontSize: '1.375rem',
    color: '#1A1A2E',
    marginBottom: '1.25rem',
  }

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: '#1A1A2E', marginBottom: '0.5rem' }}>
          Identidade Visual
        </h1>
        <p style={{ color: '#6B7280', fontSize: '0.9375rem' }}>
          Referência de marca — cores, tipografia, logos e voz.
        </p>
      </div>

      {/* Cores */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={sectionTitle}>Cores</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
          {COLORS.map((c) => <ColorSwatch key={c.hex} {...c} />)}
        </div>
      </div>

      {/* Tipografia */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={sectionTitle}>Tipografia</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '1.5rem' }}>
            <div style={{ fontFamily: 'var(--font-jakarta)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6B7280', marginBottom: '0.75rem' }}>
              Display / Títulos
            </div>
            <div style={{ fontFamily: 'var(--font-playfair)', fontSize: '3rem', color: '#1A1A2E', lineHeight: 1, marginBottom: '1rem' }}>Aa</div>
            <div style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, fontSize: '1rem', color: '#1A1A2E', marginBottom: '0.75rem' }}>Playfair Display</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {([
                { size: '3rem',    label: '48 — Hero' },
                { size: '2rem',    label: '32 — Título' },
                { size: '1.5rem',  label: '24 — Subtítulo' },
                { size: '1.125rem',label: '18 — H3' },
              ] as const).map((t) => (
                <div key={t.label} style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                  <span style={{ fontFamily: 'var(--font-playfair)', fontSize: t.size, color: '#1A1A2E', lineHeight: 1 }}>A</span>
                  <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '0.75rem', color: '#6B7280' }}>{t.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '1.5rem' }}>
            <div style={{ fontFamily: 'var(--font-jakarta)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6B7280', marginBottom: '0.75rem' }}>
              Interface / Corpo
            </div>
            <div style={{ fontFamily: 'var(--font-jakarta)', fontSize: '3rem', color: '#1A1A2E', lineHeight: 1, marginBottom: '1rem' }}>Aa</div>
            <div style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 700, fontSize: '1rem', color: '#1A1A2E', marginBottom: '0.75rem' }}>Plus Jakarta Sans</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {([400, 500, 600, 700] as const).map((w) => (
                <div key={w} style={{ fontFamily: 'var(--font-jakarta)', fontWeight: w, fontSize: '0.9375rem', color: '#1A1A2E' }}>
                  {w} — {w === 400 ? 'Regular' : w === 500 ? 'Medium' : w === 600 ? 'SemiBold' : 'Bold'}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Logos */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={sectionTitle}>Logos</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {LOGOS.map(({ file, label, bg }) => (
            <div key={file} style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ height: '120px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/brand/${file}`} alt={label} style={{ maxWidth: '100%', maxHeight: '80px', objectFit: 'contain' }} />
              </div>
              <div style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '0.8125rem', color: '#1A1A2E', lineHeight: 1.3 }}>{label}</span>
                <a
                  href={`/brand/${file}`}
                  download
                  style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.3rem', fontFamily: 'var(--font-jakarta)', fontSize: '0.75rem', fontWeight: 700, color: '#0A3D5C', textDecoration: 'none', background: '#F5EDD8', padding: '0.3rem 0.625rem', borderRadius: '999px' }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Baixar
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Voz & Tom */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={sectionTitle}>Voz & Tom</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {VOICE.map(({ word, desc }) => (
            <div key={word} style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', color: '#0A3D5C', marginBottom: '0.5rem', fontWeight: 600 }}>{word}</div>
              <div style={{ fontFamily: 'var(--font-jakarta)', fontSize: '0.875rem', color: '#6B7280', lineHeight: 1.55 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
