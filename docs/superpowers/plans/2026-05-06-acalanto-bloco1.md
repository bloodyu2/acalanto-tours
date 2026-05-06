# Acalanto Tours — Bloco 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply 7 quick-fix items (mobile layout, emoji→SVG replacement, hero wave/boat, testimonials DB connection, legal pages, humanizer pass, footer emojis) without touching the marketplace/partner architecture.

**Architecture:** Direct file edits on existing components. No new DB tables except `testimonials` (Supabase migration). No new routes except `/privacidade`, `/termos`, `/cancelamento`.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS v4, Supabase (`hnsbstmzbidfehvycptl`), inline CSS via style props

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `app/globals.css` | Modify | Add `overflow-x: hidden` to html + body |
| `components/layout/Header.tsx` | Modify | Fix hamburger fixed positioning; add mobile Reservar button in dropdown |
| `components/home/HeroSection.tsx` | Modify | Replace 3 emojis with inline SVGs; add paddingBottom to hero; add animated boat |
| `components/home/TestimonialsSection.tsx` | Modify | Remove fallback array; hide section if empty |
| `components/layout/Footer.tsx` | Modify | Replace 4 emojis with SVGs; add legal links in bottom bar |
| `app/seja-parceiro/page.tsx` | Modify | Replace ✅ and 🎁 emojis with SVGs |
| `app/privacidade/page.tsx` | Create | Privacy policy page |
| `app/termos/page.tsx` | Create | Terms of use page |
| `app/cancelamento/page.tsx` | Create | Cancellation policy page |
| `supabase/migrations/003_testimonials.sql` | Create | Create testimonials table |

---

## Task 1: Mobile — overflow-x hidden

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Add overflow-x: hidden to html and body**

Edit `app/globals.css` — change the `html` rule and `body` block to include `overflow-x: hidden`:

```css
html { scroll-behavior: smooth; overflow-x: hidden; }

body {
  font-family: var(--font-jakarta);
  color: var(--text-primary);
  background: var(--background);
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}
```

Also add a rule for the hero wave container inside `.hero-section`. Find the existing `.hero-section` rule (line 218) and confirm `overflow: hidden` is already there. If it's missing add it.

The hero section already has `overflow: hidden` per the CSS — confirm:
```css
.hero-section {
  position: relative;
  min-height: 92vh;
  display: flex;
  align-items: center;
  background: linear-gradient(160deg, #111111 0%, #1a1a2e 55%, #2d0f20 100%);
  overflow: hidden;   /* ← already present, good */
}
```

- [ ] **Step 2: Verify no horizontal scroll**

Run the dev server (`npm run dev`) and open `http://localhost:3000` in a narrow viewport (375px). Confirm no horizontal scroll.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "fix(mobile): add overflow-x hidden to html and body"
```

---

## Task 2: Mobile — hamburger fixed positioning

**Files:**
- Modify: `components/layout/Header.tsx`

- [ ] **Step 1: Read current hamburger button styles**

The hamburger is inside the header `<div className="container">` row. The header itself is `position: fixed`. The hamburger button uses `className="show-mobile"` with no fixed positioning. Since the header is already fixed, the button scrolls with it — it doesn't lose position. The bug is that the mobile dropdown renders as a child of the fixed header, which is correct behavior. No positioning fix needed.

However, the Header is missing `overflow: visible` so the dropdown renders correctly. Verify the dropdown is visible below the header by checking on mobile viewport.

The real fix requested was to ensure the hamburger doesn't disappear on scroll. Since the header is already `position: fixed`, this should already work. If there's a z-index issue on the button, raise it.

Update the hamburger button style:

```tsx
<button
  onClick={() => setOpen(!open)}
  className="show-mobile"
  style={{
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem',
    color: 'var(--text-primary)',
    position: 'relative',
    zIndex: 60,
  }}
  aria-label="Menu"
>
```

- [ ] **Step 2: Add CartIcon to the mobile dropdown**

The desktop nav has `<CartIcon />` but the mobile dropdown doesn't. Add it to the mobile dropdown in `Header.tsx`:

After all nav links in the mobile dropdown, before the Reservar button, add:

```tsx
<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
  <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Carrinho</span>
  <CartIcon />
</div>
```

- [ ] **Step 3: Commit**

```bash
git add components/layout/Header.tsx
git commit -m "fix(mobile): hamburger z-index, add CartIcon to mobile dropdown"
```

---

## Task 3: Emojis → SVGs in HeroSection

**Files:**
- Modify: `components/home/HeroSection.tsx`

- [ ] **Step 1: Replace emoji trust-row array with SVG objects**

The trust row is at lines 68-88. Replace the array from:
```tsx
{ label: '4', sub: 'passeios' },
{ label: '📸', sub: 'fotografia' },
{ label: '🏡', sub: 'hospedagem' },
{ label: '🚤', sub: 'serviços' },
```

To:
```tsx
const trustItems = [
  {
    svg: null,
    number: '4',
    sub: 'passeios',
  },
  {
    svg: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
        <circle cx="12" cy="13" r="4"/>
      </svg>
    ),
    number: null,
    sub: 'fotografia',
  },
  {
    svg: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    number: null,
    sub: 'hospedagem',
  },
  {
    svg: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 17l1-4h16l1 4"/>
        <path d="M5 17l-1 4h16l-1-4"/>
        <path d="M7 13V9a5 5 0 0110 0v4"/>
      </svg>
    ),
    number: null,
    sub: 'serviços',
  },
]
```

And update the render to use `trustItems`:

```tsx
<div style={{
  display: 'flex', gap: '0', marginTop: '3rem', flexWrap: 'wrap',
  borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.75rem',
}}>
  {trustItems.map(({ svg, number, sub }, i) => (
    <div key={sub} style={{
      flex: '1', minWidth: '80px',
      paddingRight: '1.5rem',
      paddingLeft: i === 0 ? 0 : '1.5rem',
      borderLeft: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.1)',
    }}>
      <div style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.625rem', fontWeight: 700, color: 'white', letterSpacing: '-0.03em' }}>
        {number ?? svg}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '0.15rem' }}>
        {sub}
      </div>
    </div>
  ))}
</div>
```

- [ ] **Step 2: Fix hero wave — add paddingBottom**

The hero section div has `paddingTop: '3rem'` but no paddingBottom, causing content to hide behind the 80px wave on mobile. Change the section opening:

```tsx
<section className="hero-section" style={{ paddingTop: '3rem', paddingBottom: '6rem' }}>
```

- [ ] **Step 3: Add animated boat SVG on scroll**

Below the closing `</div>` of the container div (before the Bottom wave div), add:

```tsx
{/* Animated boat on scroll */}
<BoatOnWave />
```

And add the `BoatOnWave` component at the top of the file (after `'use client'`, before the default export). The file needs `'use client'` — add it if not present, plus `useEffect` and `useState` imports:

```tsx
'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

function BoatOnWave() {
  const [tx, setTx] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const maxTx = typeof window !== 'undefined' ? window.innerWidth - 80 : 400
      setTx(Math.min(window.scrollY * 0.35, maxTx))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        bottom: '42px',
        left: 0,
        transform: `translateX(${tx}px)`,
        transition: 'transform 0.1s linear',
        zIndex: 1,
        pointerEvents: 'none',
      }}
    >
      <svg width="44" height="32" viewBox="0 0 44 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Hull */}
        <path d="M4 20 Q22 28 40 20 L38 24 Q22 32 6 24 Z" fill="white" fillOpacity="0.9"/>
        {/* Mast */}
        <line x1="22" y1="4" x2="22" y2="20" stroke="white" strokeWidth="1.5" strokeOpacity="0.7"/>
        {/* Sail */}
        <path d="M22 5 L34 17 L22 18 Z" fill="white" fillOpacity="0.5"/>
        <path d="M22 5 L10 17 L22 18 Z" fill="white" fillOpacity="0.3"/>
      </svg>
    </div>
  )
}
```

- [ ] **Step 4: Verify visually**

Open `http://localhost:3000` and scroll — boat should move right. On mobile, text should not overlap the wave.

- [ ] **Step 5: Commit**

```bash
git add components/home/HeroSection.tsx
git commit -m "feat(hero): replace emojis with SVGs, fix paddingBottom, add animated boat on scroll"
```

---

## Task 4: Emojis → SVGs in Footer

**Files:**
- Modify: `components/layout/Footer.tsx`

- [ ] **Step 1: Replace ⛵ 📸 🏡 🚤 with inline SVGs**

In `Footer.tsx`, the four h4 headings use emoji literals. Replace them:

**⛵ Passeios** h4 — replace `⛵ Passeios` with:
```tsx
<h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.45)', marginBottom: '1rem', fontFamily: 'var(--font-jakarta)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 17l1-4h16l1 4"/><path d="M5 17l-1 4h16l-1-4"/><path d="M7 13V9a5 5 0 0110 0v4"/>
  </svg>
  Passeios
</h4>
```

**📸 Fotografia** h4 — replace with:
```tsx
<h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.45)', marginBottom: '1rem', fontFamily: 'var(--font-jakarta)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
  Fotografia
</h4>
```

**🏡 Hospedagem** h4 — replace with:
```tsx
<h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.45)', marginBottom: '0.75rem', marginTop: '1.5rem', fontFamily: 'var(--font-jakarta)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
  Hospedagem
</h4>
```

**🚤 Serviços** h4 — replace with:
```tsx
<h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.45)', marginBottom: '1rem', fontFamily: 'var(--font-jakarta)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 20h20"/><path d="M5 20V10.5a7.5 7.5 0 0115 0V20"/><path d="M12 3v5"/>
  </svg>
  Serviços
</h4>
```

- [ ] **Step 2: Add legal links to bottom bar**

Replace the current bottom bar `<div>` with:

```tsx
{/* Bottom bar */}
<div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.4)' }}>
  <span>© {new Date().getFullYear()} Acalanto Tours · Paraty, RJ · Todos os direitos reservados.</span>
  <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
    <Link href="/privacidade" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.8125rem' }}>
      Privacidade
    </Link>
    <Link href="/termos" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.8125rem' }}>
      Termos de Uso
    </Link>
    <Link href="/cancelamento" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.8125rem' }}>
      Cancelamento
    </Link>
    <a href="https://balaio.net" target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>
      Feito com ♥ pela Balaio Digital
    </a>
  </div>
</div>
```

- [ ] **Step 3: Remove "Em breve" note from hospedagem link**

Remove the italic "Em breve" link in the Hospedagem section:
```tsx
{/* Remove this: */}
<Link href="/hotelaria" style={{ display: 'block', color: 'rgba(255,255,255,0.45)', textDecoration: 'none', fontSize: '0.8rem', fontStyle: 'italic' }}>
  Em breve
</Link>
```

- [ ] **Step 4: Commit**

```bash
git add components/layout/Footer.tsx
git commit -m "feat(footer): replace emojis with SVGs, add legal links in bottom bar"
```

---

## Task 5: Emojis → SVGs in SejaParceiroPage

**Files:**
- Modify: `app/seja-parceiro/page.tsx`

- [ ] **Step 1: Read current file**

```bash
cat app/seja-parceiro/page.tsx
```

- [ ] **Step 2: Replace 🎁 with gift SVG**

Find where `🎁` is used (around line 109 per context). Replace it with:
```tsx
<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  <polyline points="20 12 20 22 4 22 4 12"/>
  <rect x="2" y="7" width="20" height="5"/>
  <line x1="12" y1="22" x2="12" y2="7"/>
  <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/>
  <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/>
</svg>
```

- [ ] **Step 3: Replace ✅ with check-circle SVG**

Find where `✅` is used (success state). Replace with:
```tsx
<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
  <polyline points="22 4 12 14.01 9 11.01"/>
</svg>
```

- [ ] **Step 4: Commit**

```bash
git add app/seja-parceiro/page.tsx
git commit -m "fix: replace emojis with SVGs in seja-parceiro page"
```

---

## Task 6: Testimonials — create table + remove fallback

**Files:**
- Create: `supabase/migrations/003_testimonials.sql`
- Modify: `components/home/TestimonialsSection.tsx`

- [ ] **Step 1: Create migration file**

Create `supabase/migrations/003_testimonials.sql`:

```sql
-- Create testimonials table if it does not exist
CREATE TABLE IF NOT EXISTS testimonials (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  author_name  text NOT NULL,
  author_city  text,
  content      text NOT NULL,
  rating       int NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  approved     boolean NOT NULL DEFAULT false,
  created_at   timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Allow public to read approved testimonials
CREATE POLICY "public_read_approved_testimonials"
  ON testimonials FOR SELECT
  USING (approved = true);

-- Allow authenticated admins full access
CREATE POLICY "admin_all_testimonials"
  ON testimonials FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.auth_user_id = auth.uid()
        AND profiles.role = 'admin'
    )
  );
```

- [ ] **Step 2: Apply migration via Supabase MCP**

Use the Supabase MCP to apply the migration to project `hnsbstmzbidfehvycptl`:

```
mcp__b851e17c-f234-4c2b-ab54-0d9230400bf7__apply_migration({
  project_id: "hnsbstmzbidfehvycptl",
  name: "003_testimonials",
  query: <contents of the migration above>
})
```

- [ ] **Step 3: Remove fallback from TestimonialsSection**

In `components/home/TestimonialsSection.tsx`, remove lines 3-7 (the `fallback` const) and change the component to hide the section when there are no testimonials:

Replace:
```tsx
const fallback = [
  { author_name: 'Família Rodrigues', ... },
  { author_name: 'Mariana Souza', ... },
  { author_name: 'João e Ana Lima', ... },
]

export default async function TestimonialsSection() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('testimonials')
    .select('*')
    .eq('approved', true)
    .order('created_at', { ascending: false })
    .limit(6)

  const testimonials = (data && data.length > 0) ? data : fallback
```

With:
```tsx
export default async function TestimonialsSection() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('testimonials')
    .select('*')
    .eq('approved', true)
    .order('created_at', { ascending: false })
    .limit(6)

  if (!data || data.length === 0) return null

  const testimonials = data
```

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/003_testimonials.sql components/home/TestimonialsSection.tsx
git commit -m "feat(testimonials): create DB table, remove hardcoded fallback, hide section when empty"
```

---

## Task 7: Legal pages

**Files:**
- Create: `app/privacidade/page.tsx`
- Create: `app/termos/page.tsx`
- Create: `app/cancelamento/page.tsx`

- [ ] **Step 1: Create privacy policy page**

Create `app/privacidade/page.tsx`:

```tsx
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Política de Privacidade — Acalanto Tours',
  description: 'Saiba como coletamos e usamos seus dados pessoais. Confira a política de privacidade da Acalanto Tours.',
}

export default function PrivacidadePage() {
  return (
    <main style={{ padding: '6rem 0 4rem', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '760px' }}>
        <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.375rem', marginBottom: '2rem' }}>
          ← Voltar para o início
        </Link>

        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: '0.5rem' }}>
          Política de Privacidade
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', fontSize: '0.875rem' }}>
          Última atualização: maio de 2026
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', lineHeight: 1.75, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>Quem somos</h2>
            <p>A Acalanto Tours é uma agência de turismo náutico localizada em Paraty, RJ. Operamos passeios de escuna, fotografia profissional e serviços exclusivos para visitantes da região.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>Dados que coletamos</h2>
            <p>Quando você faz uma reserva ou entra em contato conosco, podemos coletar:</p>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <li>Nome completo</li>
              <li>Endereço de e-mail</li>
              <li>Número de telefone/WhatsApp</li>
              <li>Dados da reserva (data, passeio escolhido, número de passageiros)</li>
              <li>Dados de navegação (cookies de análise, com seu consentimento)</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>Como usamos seus dados</h2>
            <p>Usamos suas informações exclusivamente para:</p>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <li>Confirmar e processar sua reserva</li>
              <li>Entrar em contato via WhatsApp ou e-mail sobre sua visita</li>
              <li>Enviar informações práticas (horários, ponto de encontro, o que levar)</li>
              <li>Melhorar nosso site e serviços (dados de analytics, de forma agregada e anônima)</li>
            </ul>
            <p style={{ marginTop: '0.75rem' }}>Não vendemos, alugamos nem compartilhamos seus dados pessoais com terceiros para fins comerciais.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>Cookies</h2>
            <p>Utilizamos cookies para análise de acesso (Google Analytics) e funcionamento básico do site. Ao acessar nosso site, você pode aceitar ou recusar cookies opcionais pelo banner de consentimento. Cookies essenciais para o funcionamento do site não podem ser recusados.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>Seus direitos (LGPD)</h2>
            <p>Conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018), você tem direito a:</p>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <li>Confirmar a existência de tratamento dos seus dados</li>
              <li>Acessar, corrigir ou excluir seus dados</li>
              <li>Revogar consentimento a qualquer momento</li>
              <li>Solicitar a portabilidade dos seus dados</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>Contato</h2>
            <p>Para exercer seus direitos ou tirar dúvidas sobre privacidade, entre em contato:</p>
            <p style={{ marginTop: '0.5rem' }}>WhatsApp: <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5524999627968'}`} style={{ color: 'var(--ocean-mid)' }}>Clique aqui</a></p>
          </section>
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Create terms of use page**

Create `app/termos/page.tsx`:

```tsx
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Termos de Uso — Acalanto Tours',
  description: 'Leia os termos e condições de uso da plataforma Acalanto Tours.',
}

export default function TermosPage() {
  return (
    <main style={{ padding: '6rem 0 4rem', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '760px' }}>
        <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.375rem', marginBottom: '2rem' }}>
          ← Voltar para o início
        </Link>

        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: '0.5rem' }}>
          Termos de Uso
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', fontSize: '0.875rem' }}>
          Última atualização: maio de 2026
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', lineHeight: 1.75, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>Aceitação dos termos</h2>
            <p>Ao realizar uma reserva ou usar qualquer serviço da Acalanto Tours, você concorda com estes termos. Se não concordar, por favor não realize reservas.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>Reservas e confirmação</h2>
            <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <li>A reserva é confirmada apenas após o pagamento integral ser processado.</li>
              <li>Após a confirmação, você receberá um comprovante com os detalhes do passeio.</li>
              <li>As informações prestadas no momento da reserva (nome, contato, número de passageiros) são de responsabilidade do cliente.</li>
              <li>Vagas são limitadas e a confirmação é por ordem de pagamento.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>Responsabilidades da Acalanto Tours</h2>
            <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <li>Garantir a realização do passeio conforme descrito, salvo impedimentos climáticos ou de força maior.</li>
              <li>Manter as embarcações em condições de segurança e com os equipamentos obrigatórios.</li>
              <li>Avisar os clientes com antecedência em caso de cancelamento por parte da empresa.</li>
              <li>Em caso de cancelamento pela Acalanto Tours, o cliente receberá reembolso integral ou crédito para nova data.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>Responsabilidades do cliente</h2>
            <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <li>Chegar no local e horário indicados. Atrasos podem impossibilitar o embarque sem direito a reembolso.</li>
              <li>Seguir as orientações da tripulação durante todo o passeio.</li>
              <li>Não trazer substâncias ilegais a bordo.</li>
              <li>Responsabilizar-se por danos causados à embarcação por descuido próprio.</li>
              <li>Menores de 18 anos devem estar acompanhados de responsável legal.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>Condições climáticas</h2>
            <p>Os passeios dependem de condições climáticas favoráveis. Em caso de mau tempo que comprometa a segurança, o passeio pode ser cancelado ou remarcado. Não haverá cobrança adicional na remarcação. Consulte nossa{' '}<Link href="/cancelamento" style={{ color: 'var(--ocean-mid)' }}>política de cancelamento</Link>.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>Propriedade intelectual</h2>
            <p>Todo o conteúdo deste site (textos, fotos, vídeos, marcas) é de propriedade da Acalanto Tours. A reprodução sem autorização prévia é proibida.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>Contato</h2>
            <p>Em caso de dúvidas sobre estes termos, fale conosco pelo{' '}
              <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5524999627968'}`} style={{ color: 'var(--ocean-mid)' }}>WhatsApp</a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Create cancellation policy page**

Create `app/cancelamento/page.tsx`:

```tsx
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Política de Cancelamento — Acalanto Tours',
  description: 'Saiba as condições para cancelamento e reembolso de reservas na Acalanto Tours.',
}

export default function CancelamentoPage() {
  const policies = [
    {
      prazo: 'Mais de 48h antes',
      reembolso: 'Reembolso integral',
      detalhe: 'Você recebe 100% do valor pago de volta.',
      color: '#059669',
    },
    {
      prazo: 'Entre 24h e 48h antes',
      reembolso: 'Reembolso de 50%',
      detalhe: 'Metade do valor é reembolsada. A outra metade cobre os custos de preparação do passeio.',
      color: '#D97706',
    },
    {
      prazo: 'Menos de 24h antes',
      reembolso: 'Sem reembolso',
      detalhe: 'Com menos de 24 horas de antecedência, não é possível reembolsar. Você pode tentar remarcar mediante disponibilidade.',
      color: '#DC2626',
    },
  ]

  return (
    <main style={{ padding: '6rem 0 4rem', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '760px' }}>
        <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.375rem', marginBottom: '2rem' }}>
          ← Voltar para o início
        </Link>

        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: '0.5rem' }}>
          Política de Cancelamento
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', fontSize: '0.875rem' }}>
          Última atualização: maio de 2026
        </p>

        <p style={{ marginBottom: '2rem', lineHeight: 1.75, fontSize: '0.9375rem' }}>
          Entendemos que imprevistos acontecem. Nossa política de cancelamento é baseada na antecedência com que o pedido é feito em relação à data do passeio.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
          {policies.map(({ prazo, reembolso, detalhe, color }) => (
            <div key={prazo} style={{ background: 'var(--sand)', border: `2px solid ${color}20`, borderLeft: `4px solid ${color}`, borderRadius: '12px', padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{prazo}</span>
                <span style={{ fontWeight: 700, color, fontSize: '0.9rem', background: `${color}18`, padding: '0.2rem 0.75rem', borderRadius: '999px' }}>{reembolso}</span>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{detalhe}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', lineHeight: 1.75, fontSize: '0.9375rem' }}>
          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>Como solicitar o cancelamento</h2>
            <p>Entre em contato diretamente pelo WhatsApp informando seu nome, data do passeio e número da reserva. Processamos o reembolso em até 7 dias úteis para pagamentos via cartão.</p>
            <p style={{ marginTop: '0.75rem' }}>
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5524999627968'}?text=Olá, gostaria de solicitar o cancelamento da minha reserva.`}
                style={{ color: 'var(--ocean-mid)', fontWeight: 600 }}
                target="_blank"
                rel="noreferrer"
              >
                Falar no WhatsApp
              </a>
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>Cancelamento por parte da Acalanto Tours</h2>
            <p>Em caso de cancelamento por mau tempo, problemas técnicos ou outro motivo de nossa responsabilidade, você receberá reembolso integral ou a opção de remarcar sem custo adicional.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>Remarcação</h2>
            <p>Se preferir remarcar em vez de cancelar, fazemos isso sem custo adicional com mais de 24h de antecedência, sujeito à disponibilidade de vagas na nova data escolhida.</p>
          </section>
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 4: Commit all legal pages**

```bash
git add app/privacidade/page.tsx app/termos/page.tsx app/cancelamento/page.tsx
git commit -m "feat(legal): add privacy policy, terms of use, cancellation policy pages"
```

---

## Task 8: Humanizer pass — remove em-dashes, humanize texts

**Files:**
- Modify: `components/home/HeroSection.tsx` (already converted to 'use client')
- Modify: `components/layout/Footer.tsx`
- Modify: `app/layout.tsx` (metadata)

- [ ] **Step 1: Fix HeroSection description text**

In `HeroSection.tsx`, change the paragraph (line ~51):

From:
```
Passeios de escuna, fotografia profissional, hospedagem selecionada e serviços exclusivos — tudo num só lugar, com quem conhece Paraty de verdade.
```
To:
```
Passeios de escuna, fotografia profissional, hospedagem selecionada e serviços exclusivos: tudo num só lugar, com quem conhece Paraty de verdade.
```

- [ ] **Step 2: Fix Footer brand description**

In `Footer.tsx`, change:
```
Tudo para seu turismo em Paraty: passeios de escuna, fotografia profissional, hospedagem selecionada e serviços exclusivos.
```
(already has colon — verify no em-dash is present, it's fine)

- [ ] **Step 3: Check layout.tsx metadata for em-dashes**

Read `app/layout.tsx` and find any ` — ` patterns. Replace with `: ` or `, ` as appropriate.

- [ ] **Step 4: Commit**

```bash
git add components/home/HeroSection.tsx app/layout.tsx
git commit -m "fix(text): remove em-dashes, humanize public-facing copy"
```

---

## Task 9: Final verification and push

- [ ] **Step 1: Run build check**

```bash
npm run build
```

Expected: no TypeScript errors, no build failures.

- [ ] **Step 2: Push to main**

```bash
git push origin master
```

- [ ] **Step 3: Monitor Vercel deploy**

Spawn background agent to monitor Vercel deployment for the acalanto-tours project until READY. Get the project ID from the Vercel MCP list_projects tool for the project name "acalanto-tours" or "tours".
