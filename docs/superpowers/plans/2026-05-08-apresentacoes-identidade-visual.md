# Apresentações & Identidade Visual — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two admin sections — fullscreen swipeable pitch presentations per vertical (`/admin/apresentacoes`) and a brand identity reference page (`/admin/identidade`).

**Architecture:** All pure frontend — no API routes, no DB. Slide content lives in typed TypeScript data files (`lib/apresentacoes/*.ts`). The player page is a fullscreen `'use client'` component with pointer-based swipe, keyboard navigation, and `window.print()` PDF export. The identidade page is a server component with a `'use client'` color swatch for clipboard copy.

**Tech Stack:** Next.js 16 App Router, TypeScript, inline styles (no Tailwind), `var(--ocean-deep/mid/sand/sunset/font-playfair/font-jakarta)` CSS tokens, `window.print()` for PDF, zero external deps.

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `lib/apresentacoes/types.ts` | Slide + Presentation types |
| Create | `lib/apresentacoes/escunas.ts` | Escunas presentation data |
| Create | `lib/apresentacoes/hospedagem.ts` | Hospedagem presentation data |
| Create | `lib/apresentacoes/fotografia.ts` | Fotografia presentation data |
| Create | `lib/apresentacoes/jeep.ts` | Jeep presentation data |
| Create | `public/brand/logo-completo-escuro.svg` | Placeholder dark-bg logo |
| Create | `public/brand/logo-completo-claro.svg` | Placeholder light-bg logo |
| Create | `public/brand/logo-icone.svg` | Placeholder icon-only |
| Create | `public/brand/logo-branco.svg` | Placeholder all-white logo |
| Modify | `app/admin/layout.tsx` | Add 2 nav items + 2 icon components |
| Create | `app/admin/apresentacoes/page.tsx` | Vertical selection (4 cards) |
| Create | `app/admin/apresentacoes/[vertical]/page.tsx` | Fullscreen slide player |
| Create | `app/admin/identidade/page.tsx` | Brand identity reference page |

---

## Task 1: Types + Vertical Data Files

**Files:**
- Create: `lib/apresentacoes/types.ts`
- Create: `lib/apresentacoes/escunas.ts`
- Create: `lib/apresentacoes/hospedagem.ts`
- Create: `lib/apresentacoes/fotografia.ts`
- Create: `lib/apresentacoes/jeep.ts`

- [ ] **Step 1: Create `lib/apresentacoes/types.ts`**

```ts
// lib/apresentacoes/types.ts

export type SlideType =
  | 'cover'
  | 'who-we-are'
  | 'how-it-works'
  | 'advantages'
  | 'platform'
  | 'repasses'
  | 'agreements'
  | 'guarantees'
  | 'cta'

export type Slide =
  | { type: 'cover' }
  | { type: 'who-we-are' }
  | { type: 'how-it-works'; middleStepLabel: string }
  | { type: 'advantages'; extras: string[] }
  | { type: 'platform' }
  | { type: 'repasses' }
  | { type: 'agreements'; extraItem?: string }
  | { type: 'guarantees' }
  | { type: 'cta' }

export type Presentation = {
  vertical: string
  title: string
  tagline: string
  accentColor: string
  slides: Slide[]
}
```

- [ ] **Step 2: Create `lib/apresentacoes/escunas.ts`**

```ts
// lib/apresentacoes/escunas.ts
import type { Presentation } from './types'

const presentation: Presentation = {
  vertical: 'escunas',
  title: 'Escunas & Passeios',
  tagline: 'Leve turistas para os lugares mais bonitos de Paraty',
  accentColor: '#0A3D5C',
  slides: [
    { type: 'cover' },
    { type: 'who-we-are' },
    { type: 'how-it-works', middleStepLabel: 'Você executa o passeio' },
    { type: 'advantages', extras: ['Pagamento garantido antes do embarque', 'Licenças e rotas de navegação respeitadas'] },
    { type: 'platform' },
    { type: 'repasses' },
    { type: 'agreements', extraItem: 'Licenças de navegação em dia' },
    { type: 'guarantees' },
    { type: 'cta' },
  ],
}

export default presentation
```

- [ ] **Step 3: Create `lib/apresentacoes/hospedagem.ts`**

```ts
// lib/apresentacoes/hospedagem.ts
import type { Presentation } from './types'

const presentation: Presentation = {
  vertical: 'hospedagem',
  title: 'Hospedagem',
  tagline: 'Aumente sua ocupação com turistas que já chegam reservados',
  accentColor: '#F4A623',
  slides: [
    { type: 'cover' },
    { type: 'who-we-are' },
    { type: 'how-it-works', middleStepLabel: 'Você hospeda com qualidade' },
    { type: 'advantages', extras: ['Sincronização de calendário com Airbnb e Booking', 'Sem comissão de plataformas terceiras'] },
    { type: 'platform' },
    { type: 'repasses' },
    { type: 'agreements', extraItem: 'Check-in confirmado no dia anterior' },
    { type: 'guarantees' },
    { type: 'cta' },
  ],
}

export default presentation
```

- [ ] **Step 4: Create `lib/apresentacoes/fotografia.ts`**

```ts
// lib/apresentacoes/fotografia.ts
import type { Presentation } from './types'

const presentation: Presentation = {
  vertical: 'fotografia',
  title: 'Fotografia',
  tagline: 'Transforme momentos de viagem em memórias eternas',
  accentColor: '#7C3AED',
  slides: [
    { type: 'cover' },
    { type: 'who-we-are' },
    { type: 'how-it-works', middleStepLabel: 'Você realiza o ensaio' },
    { type: 'advantages', extras: ['Clientes já chegam com expectativas alinhadas', 'Entrega digital direto pelo app'] },
    { type: 'platform' },
    { type: 'repasses' },
    { type: 'agreements', extraItem: 'Portfolio atualizado na plataforma' },
    { type: 'guarantees' },
    { type: 'cta' },
  ],
}

export default presentation
```

- [ ] **Step 5: Create `lib/apresentacoes/jeep.ts`**

```ts
// lib/apresentacoes/jeep.ts
import type { Presentation } from './types'

const presentation: Presentation = {
  vertical: 'jeep',
  title: 'Jeep & Transfer',
  tagline: 'Conecte turistas ao interior de Paraty com segurança e conforto',
  accentColor: '#16A34A',
  slides: [
    { type: 'cover' },
    { type: 'who-we-are' },
    { type: 'how-it-works', middleStepLabel: 'Você realiza o traslado' },
    { type: 'advantages', extras: ['Roteiros para trilhas e cachoeiras', 'Veículo adaptado para estradas de terra'] },
    { type: 'platform' },
    { type: 'repasses' },
    { type: 'agreements', extraItem: 'Veículo em boas condições e documentado' },
    { type: 'guarantees' },
    { type: 'cta' },
  ],
}

export default presentation
```

- [ ] **Step 6: Verify TypeScript compiles**

```bash
cd acalanto-tours
npx tsc --noEmit 2>&1 | grep "lib/apresentacoes" || echo "No new TS errors in lib/apresentacoes"
```

Expected: `No new TS errors in lib/apresentacoes`

- [ ] **Step 7: Commit**

```bash
git add lib/apresentacoes/
git commit -m "feat: add apresentacoes types and vertical data"
```

---

## Task 2: Placeholder Logo SVGs

**Files:**
- Create: `public/brand/logo-completo-escuro.svg`
- Create: `public/brand/logo-completo-claro.svg`
- Create: `public/brand/logo-icone.svg`
- Create: `public/brand/logo-branco.svg`

These are placeholder SVGs using the Acalanto design system. They will be replaced when the client provides final assets.

- [ ] **Step 1: Create `public/brand/logo-completo-escuro.svg`** (white text, for dark backgrounds)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
  <!-- Icon: stylized A with wave -->
  <g transform="translate(4,4)">
    <path d="M5,48 Q18,26 24,4" stroke="#F5EDD8" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    <line x1="24" y1="4" x2="26" y2="48" stroke="#F5EDD8" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M24,7 Q35,26 46,46 L26,46 Z" fill="#F4A623"/>
    <path d="M13,28 Q19,26 24,27" stroke="#F5EDD8" stroke-width="1.2" stroke-linecap="round" fill="none"/>
  </g>
  <!-- Wordmark -->
  <text x="60" y="30" font-family="Georgia, serif" font-size="20" font-style="italic" fill="#F5EDD8" font-weight="500">Acalanto</text>
  <text x="61" y="46" font-family="Arial, sans-serif" font-size="7" fill="rgba(245,237,216,0.6)" letter-spacing="3" font-weight="700">TURISMO</text>
</svg>
```

- [ ] **Step 2: Create `public/brand/logo-completo-claro.svg`** (dark text, for light backgrounds)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
  <g transform="translate(4,4)">
    <path d="M5,48 Q18,26 24,4" stroke="#0A3D5C" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    <line x1="24" y1="4" x2="26" y2="48" stroke="#0A3D5C" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M24,7 Q35,26 46,46 L26,46 Z" fill="#F4A623"/>
    <path d="M13,28 Q19,26 24,27" stroke="#0A3D5C" stroke-width="1.2" stroke-linecap="round" fill="none"/>
  </g>
  <text x="60" y="30" font-family="Georgia, serif" font-size="20" font-style="italic" fill="#0A3D5C" font-weight="500">Acalanto</text>
  <text x="61" y="46" font-family="Arial, sans-serif" font-size="7" fill="rgba(10,61,92,0.6)" letter-spacing="3" font-weight="700">TURISMO</text>
</svg>
```

- [ ] **Step 3: Create `public/brand/logo-icone.svg`** (icon only)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 56" width="52" height="56">
  <g transform="translate(2,2)">
    <path d="M5,48 Q18,26 24,4" stroke="#0A3D5C" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    <line x1="24" y1="4" x2="26" y2="48" stroke="#0A3D5C" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M24,7 Q35,26 46,46 L26,46 Z" fill="#F4A623"/>
    <path d="M13,28 Q19,26 24,27" stroke="#0A3D5C" stroke-width="1.2" stroke-linecap="round" fill="none"/>
  </g>
</svg>
```

- [ ] **Step 4: Create `public/brand/logo-branco.svg`** (all white, for colored backgrounds)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
  <g transform="translate(4,4)">
    <path d="M5,48 Q18,26 24,4" stroke="white" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    <line x1="24" y1="4" x2="26" y2="48" stroke="white" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M24,7 Q35,26 46,46 L26,46 Z" fill="rgba(255,255,255,0.8)"/>
    <path d="M13,28 Q19,26 24,27" stroke="white" stroke-width="1.2" stroke-linecap="round" fill="none"/>
  </g>
  <text x="60" y="30" font-family="Georgia, serif" font-size="20" font-style="italic" fill="white" font-weight="500">Acalanto</text>
  <text x="61" y="46" font-family="Arial, sans-serif" font-size="7" fill="rgba(255,255,255,0.6)" letter-spacing="3" font-weight="700">TURISMO</text>
</svg>
```

- [ ] **Step 5: Commit**

```bash
git add public/brand/
git commit -m "feat: add placeholder brand logo SVGs"
```

---

## Task 3: Admin Navigation

**Files:**
- Modify: `app/admin/layout.tsx`

Add two new SVG icon components and two nav items.

- [ ] **Step 1: Add `SlidesIcon` and `PaletteIcon` components in `app/admin/layout.tsx`**

After the existing `BriefcaseIcon` component (around line 71), add:

```tsx
const SlidesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
)
const PaletteIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/>
    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>
    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 011.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
  </svg>
)
```

- [ ] **Step 2: Add nav items to `navItems` array in `app/admin/layout.tsx`**

After the `{ href: '/admin/roadmap', ... }` entry, add:

```tsx
{ href: '/admin/apresentacoes', label: 'Apresentações', icon: <SlidesIcon /> },
{ href: '/admin/identidade',    label: 'Identidade Visual', icon: <PaletteIcon /> },
```

- [ ] **Step 3: Verify dev server still compiles**

```bash
cd acalanto-tours
npm run dev 2>&1 | head -20
```

Expected: `✓ Ready` or similar (no compile error on layout.tsx)

- [ ] **Step 4: Commit**

```bash
git add app/admin/layout.tsx
git commit -m "feat: add Apresentacoes and Identidade Visual nav items"
```

---

## Task 4: Vertical Selection Screen

**Files:**
- Create: `app/admin/apresentacoes/page.tsx`

- [ ] **Step 1: Create `app/admin/apresentacoes/page.tsx`**

```tsx
// app/admin/apresentacoes/page.tsx
import Link from 'next/link'

const VERTICALS = [
  {
    vertical: 'escunas',
    label: 'Escunas & Passeios',
    tagline: 'Leve turistas para os lugares mais bonitos de Paraty',
    accentColor: '#0A3D5C',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 20h20M5 20V10l7-7 7 7v10"/><path d="M9 20v-5h6v5"/>
        <path d="M12 3v7"/>
      </svg>
    ),
  },
  {
    vertical: 'hospedagem',
    label: 'Hospedagem',
    tagline: 'Aumente sua ocupação com turistas já reservados',
    accentColor: '#F4A623',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    vertical: 'fotografia',
    label: 'Fotografia',
    tagline: 'Transforme momentos de viagem em memórias eternas',
    accentColor: '#7C3AED',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
        <circle cx="12" cy="13" r="4"/>
      </svg>
    ),
  },
  {
    vertical: 'jeep',
    label: 'Jeep & Transfer',
    tagline: 'Conecte turistas ao interior de Paraty',
    accentColor: '#16A34A',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/>
        <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
  },
]

export default function ApresentacoesPage() {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: '#1A1A2E', marginBottom: '0.5rem' }}>
          Apresentações
        </h1>
        <p style={{ color: '#6B7280', fontSize: '0.9375rem' }}>
          Apresentações de parceria para uso em campo — selecione o vertical para abrir.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '1.25rem',
      }}>
        {VERTICALS.map(({ vertical, label, tagline, accentColor, icon }) => (
          <Link
            key={vertical}
            href={`/admin/apresentacoes/${vertical}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              padding: '2rem 1.5rem',
              background: accentColor,
              borderRadius: '16px',
              textDecoration: 'none',
              color: 'white',
              minHeight: '200px',
              transition: 'transform 0.15s, box-shadow 0.15s',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            }}
          >
            {icon}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                {label}
              </div>
              <div style={{ fontSize: '0.8125rem', opacity: 0.8, lineHeight: 1.5 }}>
                {tagline}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/admin/apresentacoes/page.tsx
git commit -m "feat: add apresentacoes vertical selection screen"
```

---

## Task 5: Fullscreen Slide Player

**Files:**
- Create: `app/admin/apresentacoes/[vertical]/page.tsx`

This is the largest task. The player is a `'use client'` fullscreen component that hides admin chrome, supports touch swipe + keyboard navigation, and has a share/PDF modal.

- [ ] **Step 1: Create `app/admin/apresentacoes/[vertical]/page.tsx`**

```tsx
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

// ─── Slide renderers ─────────────────────────────────────────────

function SlideContent({ slide, p }: { slide: Slide; p: Presentation }) {
  const bg = p.accentColor
  const base: React.CSSProperties = {
    width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', padding: '2rem',
    background: bg, color: 'white', boxSizing: 'border-box',
  }

  if (slide.type === 'cover') {
    return (
      <div style={base}>
        {/* White logo placeholder */}
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
        {/* Wave decoration */}
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
    const steps = [
      { n: '1', label: 'Cliente reserva online' },
      { n: '2', label: (slide as Extract<Slide, { type: 'how-it-works' }>).middleStepLabel },
      { n: '3', label: 'Você recebe o repasse' },
    ]
    return (
      <div style={base}>
        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.5rem,4vw,2.25rem)', textAlign: 'center', marginBottom: '2.5rem' }}>
          Como funciona
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', maxWidth: '500px' }}>
          {steps.map((s) => (
            <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', fontWeight: 700, flexShrink: 0 }}>
                {s.n}
              </div>
              <div style={{ fontFamily: 'var(--font-jakarta)', fontSize: '1rem', lineHeight: 1.4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (slide.type === 'advantages') {
    const extras = (slide as Extract<Slide, { type: 'advantages' }>).extras
    const base_bullets = [
      'Sem taxa de adesão',
      'Você decide sua disponibilidade',
      'Suporte direto via WhatsApp',
      'Visibilidade para turistas do Brasil inteiro',
    ]
    const bullets = [...base_bullets, ...extras]
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
    const extra = (slide as Extract<Slide, { type: 'agreements' }>).extraItem
    const base_items = [
      'Qualidade e pontualidade no serviço',
      'Fotos atualizadas do seu negócio',
      'Manter calendário de disponibilidade atualizado',
      'Responder clientes em até 2h',
    ]
    const items = extra ? [...base_items.slice(0, 3), extra, base_items[3]] : base_items
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
      {/* Logo bottom */}
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
        <p>Vertical não encontrada.</p>
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
          .slide-page { page-break-after: always; position: relative !important; width: 100% !important; height: 100vh !important; }
          body { margin: 0; }
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      `}</style>

      {/* Fullscreen container */}
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 9999, userSelect: 'none', touchAction: 'none', overflow: 'hidden' }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        {/* Slides — all rendered for print, only current visible on screen */}
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

        {/* UI chrome — hidden on print */}
        <div className="slide-player-ui">
          {/* Back button */}
          <button
            onClick={() => router.push('/admin/apresentacoes')}
            style={{ position: 'fixed', top: '1rem', left: '1rem', background: 'rgba(0,0,0,0.35)', border: 'none', color: 'white', cursor: 'pointer', padding: '0.5rem 0.875rem', borderRadius: '999px', fontFamily: 'var(--font-jakarta)', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.375rem', backdropFilter: 'blur(4px)', zIndex: 10000 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Apresentações
          </button>

          {/* Progress label */}
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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
                {copied ? 'Copiado!' : 'Copiar link'}
              </button>
              <button
                onClick={downloadPdf}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f3f4f6', border: 'none', borderRadius: '10px', padding: '0.875rem 1rem', cursor: 'pointer', fontFamily: 'var(--font-jakarta)', fontSize: '0.9375rem', fontWeight: 600, color: '#1A1A2E' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Baixar PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/admin/apresentacoes/
git commit -m "feat: add fullscreen presentation player with swipe, keyboard, and PDF export"
```

---

## Task 6: Identidade Visual Page

**Files:**
- Create: `app/admin/identidade/page.tsx`

- [ ] **Step 1: Create `app/admin/identidade/page.tsx`**

```tsx
// app/admin/identidade/page.tsx
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

function ColorSwatch({ name, hex, usage }: { name: string; hex: string; usage: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(hex).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }
  const isLight = ['#F5EDD8','#FFFFFF','#E5E7EB','#F4A623'].includes(hex)
  return (
    <button
      onClick={copy}
      style={{ all: 'unset', display: 'flex', flexDirection: 'column', gap: 0, cursor: 'pointer', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E5E7EB', background: 'white', textAlign: 'left', width: '100%' }}
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

export default function IdentidadePage() {
  const sectionTitle: React.CSSProperties = {
    fontFamily: 'var(--font-playfair)',
    fontSize: '1.375rem',
    color: '#1A1A2E',
    marginBottom: '1.25rem',
  }
  const sectionWrap: React.CSSProperties = {
    marginBottom: '3rem',
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

      {/* ─── Cores ─── */}
      <div style={sectionWrap}>
        <h2 style={sectionTitle}>Cores</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
          {COLORS.map((c) => <ColorSwatch key={c.hex} {...c} />)}
        </div>
      </div>

      {/* ─── Tipografia ─── */}
      <div style={sectionWrap}>
        <h2 style={sectionTitle}>Tipografia</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '1.5rem' }}>
            <div style={{ fontFamily: 'var(--font-jakarta)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6B7280', marginBottom: '0.75rem' }}>
              Display / Títulos
            </div>
            <div style={{ fontFamily: 'var(--font-playfair)', fontSize: '3rem', color: '#1A1A2E', lineHeight: 1, marginBottom: '1rem' }}>Aa</div>
            <div style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, fontSize: '1rem', color: '#1A1A2E', marginBottom: '0.75rem' }}>Playfair Display</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {[{ size: '3rem', label: '48 — Hero' }, { size: '2rem', label: '32 — Título' }, { size: '1.5rem', label: '24 — Subtítulo' }, { size: '1.125rem', label: '18 — H3' }].map((t) => (
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
              {[{ weight: 400, label: '400 — Regular' }, { weight: 500, label: '500 — Medium' }, { weight: 600, label: '600 — SemiBold' }, { weight: 700, label: '700 — Bold' }].map((t) => (
                <div key={t.label} style={{ fontFamily: 'var(--font-jakarta)', fontWeight: t.weight, fontSize: '0.9375rem', color: '#1A1A2E' }}>
                  {t.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Logos ─── */}
      <div style={sectionWrap}>
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
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Baixar
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Voz & Tom ─── */}
      <div style={sectionWrap}>
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
```

- [ ] **Step 2: Commit**

```bash
git add app/admin/identidade/page.tsx
git commit -m "feat: add identidade visual brand reference page"
```

---

## Task 7: Deploy

- [ ] **Step 1: Run build check**

```bash
cd acalanto-tours
npm run build 2>&1 | tail -30
```

Expected: `✓ Compiled successfully` (pre-existing tsc type errors are expected and do not fail build)

- [ ] **Step 2: Push to main**

```bash
git push origin master
```

- [ ] **Step 3: Monitor Vercel deploy**

Spawn background agent to monitor the deploy until READY:
```
Agent(
  description: "Monitor Vercel deploy until READY",
  run_in_background: true,
  prompt: """
    Monitor deployment for acalanto-tours.
    1. Use list_deployments to find the latest deployment
    2. Poll status every 30s
    3. If READY: report success with deployment URL
    4. If ERROR: get build logs, report exact error messages
  """
)
```
