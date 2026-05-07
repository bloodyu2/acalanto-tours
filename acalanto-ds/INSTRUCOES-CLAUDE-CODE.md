# Acalanto Turismo — Instruções para Claude Code
## Design System v1.0 · 07.MAI.2026

Este pacote contém todos os assets visuais e o design system completo da Acalanto Turismo.
Aplique cada item conforme as instruções abaixo.

---

## 🚀 PRIORIDADE MÁXIMA — Fazer primeiro

### 1. Corrigir globals.css
O arquivo atual usa paleta Airbnb temporária. Substituir APENAS o bloco `:root` por:

```css
:root {
  /* Cores Primárias — Oceano */
  --ocean-deep:    #0A3D5C;  /* ERA: #1a1a2e */
  --ocean-mid:     #1A6B8A;  /* ERA: #92174d */
  --ocean-light:   #2E9CBF;  /* ERA: #c0245e */
  --ocean-pale:    #D6EEF5;

  /* Cores Areia */
  --sand-warm:     #F5EDD8;  /* ERA: #f7f7f7 */
  --sand-mid:      #E8D9B8;  /* ERA: #ebebeb */
  --sand-dark:     #C9B78A;

  /* Cores Destaque */
  --sunset:        #F4A623;  /* ERA: #e00b41 */
  --sunset-dark:   #D4891A;  /* ERA: #b80a35 */
  --sunset-coral:  #E8673A;

  /* Texto e bordas */
  --white:         #FFFFFF;
  --text-primary:  #0A3D5C;  /* ERA: #222222 */
  --text-body:     #374151;
  --text-muted:    #6B7280;  /* ERA: #717171 */
  --border:        #DDDDDD;
  --background:    #ffffff;
  --foreground:    #0A3D5C;

  /* Tipografia */
  --font-playfair: 'Playfair Display', Georgia, serif;
  --font-jakarta:  'Plus Jakarta Sans', system-ui, sans-serif;
  --font-mono:     'JetBrains Mono', ui-monospace, monospace;

  /* Espaçamento */
  --space-xs:  4px;
  --space-sm:  8px;
  --space-md:  16px;
  --space-lg:  24px;
  --space-xl:  32px;
  --space-2xl: 48px;
  --space-3xl: 64px;
  --space-4xl: 96px;

  /* Border Radius */
  --radius-sm:   6px;
  --radius-md:   12px;
  --radius-lg:   20px;
  --radius-xl:   32px;
  --radius-full: 9999px;

  /* Sombras (baseadas em ocean-deep, não preto) */
  --shadow-sm: 0 1px 3px rgba(10,61,92,.08), 0 1px 2px rgba(10,61,92,.04);
  --shadow-md: 0 4px 16px rgba(10,61,92,.12), 0 2px 6px rgba(10,61,92,.06);
  --shadow-lg: 0 8px 32px rgba(10,61,92,.16), 0 4px 12px rgba(10,61,92,.08);
  --shadow-xl: 0 20px 60px rgba(10,61,92,.20), 0 8px 24px rgba(10,61,92,.10);

  /* Verticais de negócio */
  --vertical-passeios:   #1A6B8A;
  --vertical-fotografia: #8B5CF6;
  --vertical-hotelaria:  #059669;
  --vertical-servicos:   #D97706;

  /* Status de reserva */
  --status-pending:   #F59E0B;
  --status-paid:      #10B981;
  --status-cancelled: #EF4444;
  --status-confirmed: #3B82F6;

  /* PWA */
  --theme-color: #0A3D5C;
  --bg-color:    #F5EDD8;
}
```

### 2. Copiar ícones PWA para public/
Copiar TODOS os arquivos de `assets/icons/` para `public/`:
- icon-512.png, icon-384.png, icon-192.png, icon-180.png
- icon-152.png, icon-120.png, icon-96.png, icon-72.png
- icon-48.png, icon-32.png, icon-16.png
- maskable-512.png

### 3. Substituir manifest.json
Copiar `assets/pwa/manifest.json` para `public/manifest.json` (substitui o atual vazio).

### 4. Atualizar app/layout.tsx — head tags
Adicionar/substituir as meta tags de ícone no `<head>`:

```tsx
<link rel="icon" href="/icon-32.png" sizes="32x32" type="image/png" />
<link rel="icon" href="/icon-16.png" sizes="16x16" type="image/png" />
<link rel="apple-touch-icon" href="/icon-180.png" />
<link rel="apple-touch-icon" sizes="152x152" href="/icon-152.png" />
<link rel="apple-touch-icon" sizes="120x120" href="/icon-120.png" />
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#0A3D5C" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="Acalanto" />
```

### 5. Open Graph — adicionar em layout.tsx
```tsx
export const metadata = {
  // ... metadata existente ...
  openGraph: {
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.jpg'],
  },
}
```
Copiar `assets/social/og-image.jpg` para `public/og-image.jpg`.

---

## 📁 TODOS OS ASSETS — O que é cada um e onde usar

### assets/logos/

| Arquivo | Dimensões | Onde usar |
|---------|-----------|-----------|
| `logo-horizontal-light.png` | 800×240px | Header do site (fundo branco/claro) |
| `logo-horizontal-sand.png` | 800×240px | Header sobre fundo areia (#F5EDD8) |
| `logo-horizontal-dark.png` | 800×240px | Footer, headers escuros, e-mail header |
| `logo-horizontal-mono.png` | 800×240px | Bordado, gravura, documentos impressos 1 cor |
| `logo-email-header.png` | 400×120px | Header de e-mail transacional (Resend) |
| `logo-stacked-light.png` | 480×480px | Splash screen PWA, posts quadrados, uso decorativo |
| `logo-stacked-dark.png` | 480×480px | Splash screen dark, backgrounds escuros |
| `icon-512-dark.png` | 512×512px | Ícone isolado com fundo ocean-deep — redes sociais, avatar |
| `icon-512-light.png` | 512×512px | Ícone isolado com fundo areia |
| `icon-512-white.png` | 512×512px | Ícone isolado com fundo branco (sem bordas arredondadas) |
| `icon-512-mono.png` | 512×512px | Ícone monocromático — documentos, carimbo |

**Como usar no Header (components/layout/Header.tsx):**
Substituir o texto atual por um `<img>` ou recriar o SVG do logo.
O logo SVG do ícone está definido inline no design system. Para o header, use a versão SVG
inline (não PNG) para melhor qualidade — o SVG está disponível no slide 03 do design system.

### assets/icons/ — PWA & App Icons

| Arquivo | Tamanho | Uso |
|---------|---------|-----|
| `icon-512.png` | 512×512 | PWA manifest `"purpose": "any"`, Play Store, App Store |
| `icon-384.png` | 384×384 | PWA Android manifest |
| `icon-192.png` | 192×192 | PWA manifest `"purpose": "any"`, Android home screen |
| `icon-180.png` | 180×180 | `<link rel="apple-touch-icon">` — iPhone/iPad atual |
| `icon-152.png` | 152×152 | Apple Touch Icon — iPad legado |
| `icon-120.png` | 120×120 | Apple Touch Icon — iPhone legado |
| `icon-96.png` | 96×96 | Android launcher HDPI |
| `icon-72.png` | 72×72 | Android launcher legacy |
| `icon-48.png` | 48×48 | Android MDPI |
| `icon-32.png` | 32×32 | `<link rel="icon" sizes="32x32">` — aba do browser Retina |
| `icon-16.png` | 16×16 | `<link rel="icon" sizes="16x16">` — aba do browser padrão |
| `maskable-512.png` | 512×512 | PWA manifest `"purpose": "maskable"` — Android adaptive icon |
| `icon-light-512.png` | 512×512 | Variante fundo areia — para contextos claros |
| `icon-light-192.png` | 192×192 | Variante fundo areia PWA |
| `icon-light-96.png` | 96×96 | Variante fundo areia pequeno |
| `icon-white-512.png` | 512×512 | Variante fundo branco sem arredondamento |
| `icon-white-192.png` | 192×192 | Variante fundo branco PWA |

**Todos vão para `public/` no projeto Next.js.**

### assets/social/

| Arquivo | Dimensões | Onde usar |
|---------|-----------|-----------|
| `og-image.jpg` | 1200×630px | Open Graph (`og:image`) — aparece quando link é compartilhado no WhatsApp, LinkedIn, Facebook, iMessage. Copiar para `public/og-image.jpg` |
| `instagram-post.jpg` | 1080×1080px | Template base para posts no Instagram. Editar no Canva antes de postar |
| `instagram-story.jpg` | 1080×1920px | Template base para stories. Editar no Canva antes de postar |
| `whatsapp-status.jpg` | 750×1334px | Status do WhatsApp Business / imagem de apresentação |
| `email-banner.jpg` | 600×200px | Banner no topo do e-mail marketing (Resend/templates) |
| `facebook-cover.jpg` | 820×312px | Foto de capa da página do Facebook |

### assets/brand/

| Arquivo | Dimensões | Onde usar |
|---------|-----------|-----------|
| `paleta-cores.jpg` | 1200×800px | Referência interna, apresentações, briefings para designers |
| `guia-tipografia.jpg` | 1200×800px | Referência interna de tipografia |

### assets/pwa/

| Arquivo | Onde usar |
|---------|-----------|
| `manifest.json` | Copiar para `public/manifest.json` — substitui o atual (que tem icons:[]) |

---

## 🎨 SISTEMA DE CORES — Referência rápida

```
Ocean Deep  #0A3D5C  → Header, footer, botão primário, logo sobre claro
Ocean Mid   #1A6B8A  → Links, hover, tag Passeios, nav ativa, endosso logo
Ocean Light #2E9CBF  → Ícones suaves, progress bar, acentos
Ocean Pale  #D6EEF5  → Backgrounds suaves, highlights
Sand Warm   #F5EDD8  → Background de seção alternada, booking widget bg
Sand Mid    #E8D9B8  → Bordas internas, divisores
Sunset Gold #F4A623  → CTA destaque, badge preço, wave dourada, stripe e-mail
Sunset Coral #E8673A → Alertas, erros, proibições — usar com moderação
```

**Regra:** Nunca usar o mesmo fundo em seções adjacentes.
Ritmo correto: Hero (escuro) → Tours (branco/paper) → Services (sand-warm) → Testimonials (branco) → Footer (escuro)

---

## 📝 TIPOGRAFIA — Regras de uso

```
Playfair Display italic 500  → Nome "Acalanto" no logo
Playfair Display 700         → H1, H2, H3, H4 do site, nome das escunas, preço em destaque
Plus Jakarta Sans 700        → Botões, CTAs, nav, endosso "TURISMO" no logo
Plus Jakarta Sans 400-600    → Corpo de texto, labels, badges, footer
JetBrains Mono 400-500       → Preços (R$ 110), horários (10h30), datas, IDs, overlines
```

**Google Fonts import (adicionar no layout.tsx se não estiver):**
```
Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600
Plus+Jakarta+Sans:wght@300;400;500;600;700;800
JetBrains+Mono:wght@400;500
```

---

## 🔘 BOTÕES — Classes e estilos

```css
/* Botão primário — ocean-deep */
.btn-primary {
  background: #0A3D5C; color: white;
  font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700;
  padding: 14px 28px; border-radius: 14px; border: none;
  box-shadow: 0 4px 16px rgba(10,61,92,0.25);
}
.btn-primary:hover { background: #1A6B8A; transform: translateY(-1px); }

/* Botão CTA — sunset-gold */
.btn-cta {
  background: #F4A623; color: #0A2235;
  font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700;
  padding: 14px 28px; border-radius: 14px; border: none;
}

/* Botão outline */
.btn-outline {
  background: transparent; color: #0A3D5C;
  border: 1.5px solid rgba(10,61,92,0.25);
  padding: 13px 27px; border-radius: 14px;
}

/* Botão WhatsApp */
.btn-whatsapp { background: #25D366; color: white; }
```

---

## 🗂️ COMPONENTS — O que atualizar

### Header (components/layout/Header.tsx)
- Substituir `<span>Acalanto</span>` por SVG inline do logo
- O SVG do ícone A está definido no design system — slides 03 e 05
- Cor do logo: versão claro (Ocean Deep + Gold) sobre header branco
- Após scroll: frosted-glass `background: rgba(255,255,255,0.92); backdrop-filter: saturate(180%) blur(14px);`

### Footer (components/layout/Footer.tsx)
- Adicionar SVG do logo versão escura (Sand Warm + Gold) no brand block
- Background: `#0A3D5C` (já correto)

### TourCard (components/tours/TourCard.tsx)
- Price badge: `background: #F4A623` (era --sunset que virou #e00b41)
- Cover gradient: `linear-gradient(135deg, #1A6B8A, #2E9CBF)` (já correto)
- Hover: `box-shadow: var(--shadow-md); transform: translateY(-4px)`

### BookingWidget (components/booking/BookingWidget.tsx)
- Preço display: `font-family: var(--font-playfair); font-size: 2rem; color: #0A3D5C`
- Total box bg: `#F5EDD8` (era --sand que virou #f7f7f7)
- CTA button: `background: #0A3D5C`

---

## 📱 PWA — Checklist completo

- [ ] Copiar todos os 17 arquivos de `assets/icons/` para `public/`
- [ ] Copiar `og-image.jpg` para `public/og-image.jpg`
- [ ] Substituir `public/manifest.json` pelo arquivo de `assets/pwa/manifest.json`
- [ ] Adicionar meta tags em `app/layout.tsx` (ver seção Prioridade Máxima acima)
- [ ] Verificar que `public/sw.js` existe e está funcional
- [ ] Testar instalação: Chrome DevTools → Application → Manifest

---

## 🤖 PROMPT BASE para futuras sessões com IA

Copiar e colar no início de qualquer sessão de design com Claude:

```
Você está trabalhando no site da Acalanto Turismo, empresa de passeios de escuna em Paraty, RJ.

PALETA: Ocean Deep #0A3D5C · Ocean Mid #1A6B8A · Ocean Light #2E9CBF · Sand Warm #F5EDD8 · Sunset Gold #F4A623

FONTES: Playfair Display (H1-H4, nome de escunas, preços) + Plus Jakarta Sans (botões, nav, body) + JetBrains Mono (preços, horários, datas, overlines)

BOTÕES: border-radius 14px, btn-primary = ocean-deep, btn-cta = sunset-gold, WhatsApp = #25D366

CARDS: border-radius 12px, border 1px #DDDDDD, hover translateY(-4px) + shadow-md

SOMBRAS: baseadas em rgba(10,61,92,...) — nunca rgba(0,0,0,...)

TOM: caloroso, náutico, autêntico. NUNCA corporativo.
Copy OK: "Paraty vista de dentro d'água", "Suba a bordo, esqueça a pressa"
Copy PROIBIDA: "experiência única imperdível", "serviços premium de turismo"

VERTICAIS: passeios=#1A6B8A · fotografia=#8B5CF6 · hotelaria=#059669 · serviços=#D97706
```

---

*Design System v1.0 · Balaio Digital · victor.lima@balaio.net · 07.MAI.2026*
