# Apresentações & Identidade Visual — Design Spec

## Goal

Two new admin sections:
1. **Apresentações** (`/admin/apresentacoes`) — fullscreen swipeable pitch presentations, one per vertical, designed for mobile-first field use in Paraty. Shareable link + PDF export via browser print.
2. **Identidade Visual** (`/admin/identidade`) — brand identity reference page with color swatches, typography, logo downloads, and voice/tone principles.

---

## Scope

Two independent static pages inside the existing admin layout. No database, no API routes. Pure frontend.

---

## Navigation Changes

Add two items to `app/admin/layout.tsx` `navItems` array:

```ts
{ href: '/admin/apresentacoes', label: 'Apresentações', icon: <SlidesIcon /> }
{ href: '/admin/identidade',    label: 'Identidade Visual', icon: <PaletteIcon /> }
```

SVG icons defined inline in `layout.tsx` alongside existing icon components.

---

## Feature 1: Apresentações

### Route structure

```
app/admin/apresentacoes/
  page.tsx                    ← selection screen (4 cards)
  [vertical]/
    page.tsx                  ← fullscreen presentation player
```

Verticals: `escunas`, `hospedagem`, `fotografia`, `jeep`

### Slide data

```
lib/apresentacoes/
  escunas.ts
  hospedagem.ts
  fotografia.ts
  jeep.ts
  types.ts
```

Each file exports a `Presentation` object:

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

export type Slide = {
  type: SlideType
  // All content is typed per SlideType via discriminated union
}

export type Presentation = {
  vertical: string         // 'escunas' | 'hospedagem' | 'fotografia' | 'jeep'
  title: string            // display name
  tagline: string
  accentColor: string      // hex
  slides: Slide[]
}
```

### Selection screen (`/admin/apresentacoes/page.tsx`)

- 2×2 grid of cards on mobile, 4 columns on desktop
- Each card: colored background (accent), vertical icon, title, tagline
- Tap → navigate to `/admin/apresentacoes/[vertical]`
- Cards:

| Vertical | Accent | Label |
|----------|--------|-------|
| escunas | `#0A3D5C` (Ocean Deep) | Escunas & Passeios |
| hospedagem | `#F4A623` (Sunset Gold) | Hospedagem |
| fotografia | `#7C3AED` | Fotografia |
| jeep | `#16A34A` | Jeep & Transfer |

### Presentation player (`/admin/apresentacoes/[vertical]/page.tsx`)

**Layout:** `'use client'`, fullscreen (`position: fixed; inset: 0`), hides admin chrome. Uses `export const dynamic = 'force-dynamic'`.

**Navigation:**
- Mobile: touch swipe left/right (pointer events — `onPointerDown` / `onPointerUp` delta ≥ 50px)
- Desktop: left/right arrow keys
- Dot indicators centered at bottom
- Progress label top-center: `"3 / 9"`
- Back button top-left: `← Apresentações` navigates to `/admin/apresentacoes`

**Share/PDF button:** Fixed bottom-right, opens a small modal:
- **Copiar link** — copies `window.location.href` to clipboard
- **Baixar PDF** — calls `window.print()` (CSS handles pagination)

**`@media print` CSS:**
- Each slide = one printed page (`page-break-after: always`)
- Hide UI chrome (back button, dots, share button)
- Force backgrounds to print (`-webkit-print-color-adjust: exact; print-color-adjust: exact`)

### Slide templates (9 per presentation)

All slides: white text on colored background (accent color), Playfair Display for headlines, Jakarta Sans for body. Full viewport height.

**Slide 1 — Cover**
- Logo Acalanto (SVG inline, white version) centered top
- Large headline: vertical title
- Tagline below
- Subtle wave pattern or gradient overlay at bottom

**Slide 2 — Quem somos**
- Headline: "Quem é a Acalanto?"
- 3 short paragraphs in white cards on accent background
- Topics: plataforma digital, Paraty/RJ, missão de conectar turistas a prestadores locais

**Slide 3 — Como funciona**
- Headline: "Como funciona"
- 3 horizontal steps with number circles + icon + label:
  1. Cliente reserva online
  2. Você executa o serviço
  3. Você recebe o repasse

**Slide 4 — Vantagens**
- Headline: "Por que se cadastrar?"
- 4–5 bullets, each with SVG checkmark icon:
  - Sem taxa de adesão
  - Você decide sua disponibilidade
  - Suporte direto via WhatsApp
  - Visibilidade para turistas do Brasil inteiro
  - Pagamento garantido antes do serviço (vertical-specific where applicable)

**Slide 5 — A plataforma**
- Headline: "Sua área de parceiro"
- 4 feature tiles in 2×2 grid:
  - Dashboard de reservas
  - Calendário de disponibilidade
  - Histórico de repasses
  - Suporte e comunicação

**Slide 6 — Repasses**
- Headline: "Seus ganhos"
- Large centered percentage: `[A DEFINIR]%` (visually prominent, 4rem+, gold accent on dark bg or vice-versa)
- Below: "Você recebe [A DEFINIR]% por reserva confirmada"
- Sub-text: "Prazo: [A DEFINIR] dias após o serviço · Via PIX"
- Note in small text: "Valores a confirmar — em breve"

**Slide 7 — Combinados**
- Headline: "O que a Acalanto pede"
- 4 items with icon:
  - Qualidade e pontualidade no serviço
  - Fotos atualizadas do seu negócio
  - Manter calendário de disponibilidade atualizado
  - Responder clientes em até 2h (when applicable)

**Slide 8 — Garantias**
- Headline: "O que garantimos a você"
- 4 items with shield/checkmark icon:
  - Pagamento seguro antes do serviço
  - Suporte dedicado para parceiros
  - Visibilidade constante na plataforma
  - Sem cobranças surpresa

**Slide 9 — CTA**
- Headline: "Vamos começar?"
- Subtitle: "Cadastro gratuito e sem compromisso"
- Large button/link: `acalantoturismo.com.br/parceiros/cadastro`
- WhatsApp contact: `(24) 99962-7968`
- Acalanto logo bottom-center

### Vertical-specific content differences

Each `.ts` data file contains vertical-specific copy for:
- Tagline (cover slide)
- Vantagens bullets (slide 4) — 1–2 vertical-specific advantages
- Combinados items (slide 7) — e.g., escunas: "Licenças de navegação em dia"; hospedagem: "Check-in confirmado no dia anterior"; fotografia: "Portfolio atualizado"; jeep: "Veículo em boas condições"
- Slide 3 "como funciona" middle step label — vertical-specific action

---

## Feature 2: Identidade Visual

### Route

```
app/admin/identidade/page.tsx   ← static page, no client needed for core content
```

### Sections (scroll page, not slides)

**Section 1 — Cores**

8 color swatches in a responsive grid (2 cols mobile, 4 cols desktop):

| Name | Hex | Usage |
|------|-----|-------|
| Ocean Deep | `#0A3D5C` | Cor principal, CTAs, headers |
| Ocean Mid | `#1A6B8A` | Hover, links, destaques |
| Sand Warm | `#F5EDD8` | Backgrounds, seções claras |
| Sunset Gold | `#F4A623` | Accent, badges, highlights |
| Text Primary | `#1A1A2E` | Corpo de texto |
| Text Muted | `#6B7280` | Texto secundário |
| White | `#FFFFFF` | Fundos e textos sobre cor |
| Border | `#E5E7EB` | Bordas e divisores |

Each swatch card: colored square + name + hex. Click copies hex to clipboard with "Copiado!" toast.

**Section 2 — Tipografia**

Two type specimens side by side (stacked on mobile):
- **Playfair Display** — "Display / Títulos" — samples: Aa + sizes 48/32/24/18
- **Plus Jakarta Sans** — "Interface / Corpo" — samples: Aa + weights 400/500/600/700

**Section 3 — Logos**

Grid of logo variants for download. Files live in `public/brand/`:
- `logo-completo-escuro.svg` — logo + wordmark, dark background use
- `logo-completo-claro.svg` — logo + wordmark, light background use
- `logo-icone.svg` — icon only (anchor/wave mark)
- `logo-branco.svg` — all-white version

Each card: preview on appropriate bg + filename + "Baixar" button (`<a href download>`).

**Note:** If logo files don't exist yet, create placeholder SVGs with Acalanto wordmark using the design system typography.

**Section 4 — Voz & Tom**

4 principle cards in a 2-col grid:
- **Autêntico** — "Paraty de verdade, sem filtro de agência"
- **Acolhedor** — "Como um anfitrião que conhece cada cantinho"
- **Confiável** — "Clareza em preços, prazos e combinados"
- **Local** — "Parceiros locais, experiências únicas"

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `app/admin/layout.tsx` | Add Apresentações + Identidade Visual nav items + icons |
| Create | `lib/apresentacoes/types.ts` | Presentation + Slide types |
| Create | `lib/apresentacoes/escunas.ts` | Escunas presentation data |
| Create | `lib/apresentacoes/hospedagem.ts` | Hospedagem presentation data |
| Create | `lib/apresentacoes/fotografia.ts` | Fotografia presentation data |
| Create | `lib/apresentacoes/jeep.ts` | Jeep presentation data |
| Create | `app/admin/apresentacoes/page.tsx` | Vertical selection screen |
| Create | `app/admin/apresentacoes/[vertical]/page.tsx` | Fullscreen slide player |
| Create | `app/admin/identidade/page.tsx` | Brand identity reference page |
| Create | `public/brand/logo-completo-escuro.svg` | Logo placeholder |
| Create | `public/brand/logo-completo-claro.svg` | Logo placeholder |
| Create | `public/brand/logo-icone.svg` | Icon placeholder |
| Create | `public/brand/logo-branco.svg` | All-white logo placeholder |

---

## Design System Compliance

- All colors from CSS vars: `var(--ocean-deep)`, `var(--ocean-mid)`, `var(--sand)`, `var(--sunset)`
- Typography: `var(--font-playfair)` for display, `var(--font-jakarta)` for UI
- No Tailwind — inline styles matching existing admin pattern
- No external dependencies (no PDF lib, no carousel lib)
- SVG icons inline, no emoji

---

## Out of Scope

- Editing slide content from admin UI (content is in `.ts` files, edited by developers)
- Uploading brand assets via admin (files go directly to `public/brand/`)
- Analytics on presentation views
- Password-protecting individual presentations (admin auth already gates access)
