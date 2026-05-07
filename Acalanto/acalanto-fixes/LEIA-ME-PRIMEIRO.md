# Acalanto — Correções de Design System
## Aplicar com Claude Code — 07.MAI.2026

Este pacote contém APENAS os arquivos que precisam ser substituídos no projeto `acalanto-tours`.
Cada arquivo aqui está corrigido e pronto para substituir o original.

---

## ⚡ COMO APLICAR

Para cada arquivo abaixo, substitua o arquivo existente no projeto pelo arquivo desta pasta.
A estrutura de pastas aqui espelha a estrutura do projeto.

---

## 📋 LISTA DE ARQUIVOS — O que foi corrigido

### 1. `app/globals.css`
**Substitui:** `app/globals.css`

**O que foi corrigido:**
- `text-gradient` agora usa areia→ouro→oceano (não mais ocean-deep→ocean-light)
- `form-input:focus` agora usa `--ocean-mid` com sombra oceânica (não mais cinza Airbnb)
- Adicionado `.btn-cta` (sunset gold, texto ocean-deep) — estava faltando
- `star-rating` cor corrigida para `#F4A623` (antes era `#FBBF24` Airbnb amber)
- `cart-badge-text` corrigido para `#0A2235` (contraste melhor sobre sunset gold)
- `.pill-nav-item:hover` agora usa `--ocean-mid` (antes usava `--text-primary`)
- `.mobile-bottom-nav-item` com `font-weight: 600` (antes 500)
- `booking-widget` com `border-radius: var(--radius-lg)` consistente
- `drawer-panel` com sombra ocean-based
- Removido comentário "Airbnb style" dos botões
- Documentação de cada token adicionada

---

### 2. `components/layout/Header.tsx`
**Substitui:** `components/layout/Header.tsx`

**O que foi corrigido:**
- Logo agora tem o **SVG do ícone A** (vela dourada + stroke areia) ao lado do nome
- "Acalanto" em Playfair Display italic 500 (não mais bold sem italic)
- Linhas wave azul + dourada abaixo do nome (parte da identidade visual)
- "TURISMO" em Jakarta 700 uppercase letter-spacing (endosso correto)
- Hover nos links de nav usa `--ocean-pale` como background (sutil, correto)
- Mobile: carrinho removido do dropdown (fica no header), CTA "Reservar agora"
- Border-radius dos botões alinhado com design system (10px e 8px)

---

### 3. `components/layout/Footer.tsx`
**Substitui:** `components/layout/Footer.tsx`

**O que foi corrigido:**
- Logo com SVG do ícone A versão escura (stroke `#F5EDD8`, vela `#F4A623`)
- "Acalanto" em Playfair italic com linhas wave abaixo
- Ícones sociais com fundo circular (Instagram: `rgba(255,255,255,0.08)`, WhatsApp: `#25D366`)
- Links com `font-family: var(--font-jakarta)` explícito
- Headings de coluna com `letter-spacing: 0.12em` (mais correto que 0.1em)
- Espaçamento do padding-top ajustado para `2.5rem`

---

### 4. `components/home/HeroSection.tsx`
**Substitui:** `components/home/HeroSection.tsx`

**O que foi corrigido:**
- **Removidos completamente** os radial-gradients com cores Airbnb wine/coral:
  `rgba(146,23,77,0.28)` e `rgba(224,11,65,0.14)` → substituídos por tons oceânicos
- Novos glows: `rgba(46,156,191,0.18)` e `rgba(26,107,138,0.22)` (ocean-light e ocean-mid)
- CTA "Ver Passeios" agora usa **sunset gold** (cor de destaque, não ocean-deep)
- `text-gradient` atualizado: areia → ouro → azul claro
- Ícone de "serviços" atualizado (era escuna, agora âncora — mais genérico)
- Boat SVG levemente maior (48px → 48px com proporções melhores)

---

### 5. `components/home/TestimonialsSection.tsx`
**Substitui:** `components/home/TestimonialsSection.tsx`

**O que foi corrigido:**
- Estrelas: cor corrigida de `#e00b41` (Airbnb vermelho) → SVGs com `fill="#F4A623"` (sunset gold)
- Wave superior agora referencia `var(--sand-warm)` (antes `var(--sand)` que poderia não existir)
- Adicionado avatar do autor com inicial + gradiente ocean-deep→ocean-light
- Cards com `display: flex; flex-direction: column` para empilhamento correto
- Texto com `font-family: var(--font-playfair)` no depoimento (itálico romântico)
- Autor com `font-family: var(--font-jakarta)` e `--font-mono` para cidade
- Section-tag estilizada com `--font-mono` e borda `rgba(244,166,35,0.3)`

---

### 6. `components/home/ToursSection.tsx`
**Substitui:** `components/home/ToursSection.tsx`

**O que foi corrigido:**
- Removido emoji `ℹ️` da pricing note (contra o design system — sem emojis em UI)
- Pricing note agora usa SVG de ícone info + borda esquerda `--ocean-mid`
- Background da pricing note: `var(--sand-warm)` (correto)
- Texto com acentos corretos ("Crianças", "até")

---

### 7. `components/tours/TourCard.tsx`
**Substitui:** `components/tours/TourCard.tsx`

**O que foi corrigido:**
- Badge de preço: background `var(--sunset)`, texto `var(--ocean-deep)` com `--font-mono`
- Gradiente do cover: adicionado `--ocean-light` no final (mais rico)
- Ícone de placeholder mais suave (`rgba(255,255,255,0.3)`)
- Meta row com ícones SVG de relógio (não emoji `⏰ ⏱`)
- `font-family` explícito em todos os elementos
- CTA com `border-radius: 10px` (alinhado com sistema)

---

### 8. `components/booking/BookingWidget.tsx`
**Substitui:** `components/booking/BookingWidget.tsx`

**O que foi corrigido:**
- **Textos com acentos corretos:** "Crianças", "Bebês", "Até 5 anos", "gratuito", "conta na lotação"
- Botões de counter com estado disabled visual (não mais sempre clicáveis)
- Preço do counter com `--font-playfair` (mais elegante que sans-serif)
- Total estimado com `--font-mono` para o label "Total estimado"
- Hover do CTA principal com transição para `--ocean-mid`
- Formas de pagamento reorganizadas com separador e título mono
- `font-family: var(--font-jakarta)` explícito em todos os textos

---

### 9. `app/passeios/page.tsx`
**Substitui:** `app/passeios/page.tsx`

**O que foi corrigido:**
- Textos com acentos: "embarcações", "Baía", "Saídas", "até", "não pagam"
- Hero com gradiente ocean corrigido (igual ao hero da home)
- Pricing note com ícone SVG (sem emoji)
- BoatCard inline com badge preço em `--sunset` + `--font-mono`
- Meta row com ícones SVG de relógio
- CTA "Ver detalhes" com `var(--ocean-deep)` background

---

## 🚀 COMANDO SUGERIDO PARA CLAUDE CODE

```
Preciso que você aplique as correções de design system. 
Substitua cada arquivo desta pasta pelo correspondente no projeto:

- acalanto-fixes/app/globals.css → app/globals.css
- acalanto-fixes/app/passeios/page.tsx → app/passeios/page.tsx  
- acalanto-fixes/components/layout/Header.tsx → components/layout/Header.tsx
- acalanto-fixes/components/layout/Footer.tsx → components/layout/Footer.tsx
- acalanto-fixes/components/home/HeroSection.tsx → components/home/HeroSection.tsx
- acalanto-fixes/components/home/TestimonialsSection.tsx → components/home/TestimonialsSection.tsx
- acalanto-fixes/components/home/ToursSection.tsx → components/home/ToursSection.tsx
- acalanto-fixes/components/tours/TourCard.tsx → components/tours/TourCard.tsx
- acalanto-fixes/components/booking/BookingWidget.tsx → components/booking/BookingWidget.tsx

Após substituir, rode `npm run build` para verificar que não há erros de TypeScript.
Se houver erros de tipo, corrija mantendo a lógica e o visual intactos.
```

---

## ✅ O QUE NÃO MUDAR

- `app/layout.tsx` — já está correto (meta tags, fontes, PWA)
- `components/cart/CartDrawer.tsx` — já está usando tokens corretos
- `components/cart/CartIcon.tsx` — não precisa de alteração
- `app/quem-somos/page.tsx` — já está bem formatado
- `app/contato/page.tsx` — já está correto
- Todo o código de `lib/` — não mexer

---

*Design System v1.0 · Balaio Digital · victor.lima@balaio.net · 07.MAI.2026*
