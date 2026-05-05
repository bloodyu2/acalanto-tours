# Acalanto Tours — Design & Architecture Spec
**Data:** 2026-05-04  
**Versão:** 1.0  
**Status:** Draft — aguardando aprovação do cliente  
**Gerado por:** Balaio Digital (análise automatizada de XML + audit do site ao vivo)

---

## 1. Contexto e Objetivo

### 1.1 Quem é a Acalanto Tours
A **Acalanto Tours** é uma operadora de turismo náutico localizada em **Paraty, RJ**, especializada em passeios de escuna pela Baía de Paraty. Oferece também serviços de lancha privativa, fotografia e passeios de jeep.

**Diferenciais identificados:**
- Gastronomia de bordo com pescados frescos caiçaras
- Escunas com perfis distintos: familiar (Ilha Rasa V), premium (Tânia com ofurô), clássica (Ilha Rasa IV) e contemplativa (Soberano)
- Passeio pela Ilha do Mantimento (cenário de Crepúsculo)
- Pet friendly (Tânia e Ilha Rasa V)
- 5–5h30 de navegação por saída

**Contatos atuais (do XML):**
- Tel: 0800 601601
- Email: contato@centralof.com ⚠️ *verificar se é email definitivo ou placeholder*

### 1.2 Problema a Resolver
O site atual (`brisatours.com.br`) está em WordPress 6.9.4 com Elementor + WooCommerce Bookings e apresenta múltiplos problemas críticos. O objetivo é **migrar para uma stack própria** (sem WordPress), mais segura, performática e maintível pela Balaio.

### 1.3 Objetivo do Projeto
Construir um novo site para a Acalanto Tours com:
- Identidade visual premium para turismo náutico
- Catálogo completo de passeios e serviços
- Sistema de reservas (com ou sem pagamento online)
- Integração WhatsApp para fechamento de vendas
- Segurança adequada (sem superfície de ataque WordPress)
- Deploy via Vercel + Supabase (padrão Balaio)

---

## 2. Auditoria do Site Atual

### 2.1 Inventário de Páginas (WordPress Export)

| Página | Status | Conteúdo | Problema |
|--------|--------|----------|---------|
| Home | ✅ Publicada | Hero + 3 escunas + formulário | Funcional mas básica |
| Escunas | ✅ Publicada | 4 escunas com descrições | Layout longo, sem filtro |
| Passeios Privados | ✅ Publicada | Lista de escunas | Duplicata da anterior |
| Quem Somos | ⚠️ Vazia | Sem conteúdo | Página fantasma |
| Experiências | ⚠️ Vazia | Sem conteúdo | Página fantasma |
| Fotografias | ⚠️ Vazia | Sem conteúdo | Página fantasma |
| Serviços | ⚠️ Vazia | Sem conteúdo | Página fantasma |
| Passeios | ⚠️ Vazia | Sem conteúdo | Página fantasma |
| Booking | ⚠️ Vazia | Sem conteúdo | Página fantasma |
| Loja | WooCommerce | Shortcode | Padrão WooCommerce |
| Carrinho | WooCommerce | [woocommerce_cart] | Padrão WooCommerce |
| Checkout | WooCommerce | [woocommerce_checkout] | Padrão WooCommerce |
| Minha conta | WooCommerce | [woocommerce_my_account] | Padrão WooCommerce |

### 2.2 Inventário de Produtos (Escunas)

| Embarcação | Categoria | Preço/pessoa | Capacidade | Duração | Perfil |
|-----------|-----------|-------------|-----------|---------|--------|
| Ilha Rasa IV | Escunas | R$ 110,00 | 1–10 pax | 1 dia | Clássica, gastronomia, cultura |
| Ilha Rasa V | Escunas | R$ 110,00 | 1–10 pax | 1 dia | Familiar, kids, pet-friendly, escorregador |
| Tânia | Escunas | R$ 110,00 | 1–10 pax | 1 dia | Premium, ofurô, pet-friendly, novo |
| Soberano | Escunas | R$ 100,00 | 1–10 pax | 1 dia | Contemplativa, 40 min/parada |

**Tipos de passageiro (WooCommerce Bookings):** Adulto / Criança  
**Horários:** Ilha Rasa IV saída 11h; demais saída 10:30h–11h, retorno 16:30h

### 2.3 Roteiros Identificados

**Ilha Rasa IV:** Praia Conceição → Praia Lula → Praia da Santa Rita → Praia Vermelha (+ visual Ilha do Mantimento/Crepúsculo)

**Ilha Rasa V:** Ilha dos Cocos → Praia da Conceição → Aquário Natural → Praia da Lula

**Tânia (Premium):** Ilha dos Cocos → Praia da Lula → Lagoa Azul → Ilha Comprida → Praia Vermelha → Ilha do Mantimento

**Soberano:** Ilha dos Cocos → Praia da Lula → Lagoa Azul → Praia Vermelha → Ilha do Mantimento (4×40 min + visual)

### 2.4 Serviços Além das Escunas (footer do site atual)
- **Lancha Privativa** — passeios exclusivos
- **Fotografia** — serviço de ensaio/documentação
- **Jeep** — passeios terrestres

### 2.5 Problemas Críticos Identificados

**🔴 Segurança:**
- WordPress exposto com barra de admin visível (`/wp-admin` acessível)
- WooCommerce com usuário admin (`TheToursAdmVS`) com email genérico `eyewln82@gmail.com`
- Login de admin exposto via `/wp-login.php`
- Múltiplos plugins com histórico de vulnerabilidades (Elementor, WooCommerce Bookings)
- Ausência de autenticação de dois fatores no WordPress

**🔴 Funcionalidade:**
- **Calendar de reservas com todas as datas desabilitadas** — cliente não pode reservar (bug crítico de configuração do WooCommerce Bookings)
- Múltiplas páginas publicadas sem conteúdo (Quem Somos, Experiências, Fotografias, Serviços, Passeios)
- Menu de navegação com itens sem título ("None")

**🟠 Branding:**
- Logo exibe "BRISA STUDIO" em vez de "Acalanto Tours"
- Email no footer `contato@centralof.com` (parece placeholder — verificar com cliente)
- "Brisa Studio" aparece em rodapé e textos — marca inconsistente

**🟠 UX:**
- Fundo verde-musgo escuro nos textos das escunas → baixo contraste, dificulta leitura
- Cards de produtos sem imagem na listagem home (carrossel com setas mas sem galeria completa)
- Formulário de contato sem feedback visual de envio
- CTA "Central de Atendimento" sem link funcional definido
- WooCommerce cart icon no header → confuso para um site de turismo
- Ausência total de: avaliações, depoimentos, FAQ, galeria de fotos

**🟡 Performance:**
- Imagens em PNG não comprimidas (fotos de 1–2 MB cada em PNG)
- WordPress + Elementor + WooCommerce = muitos plugins = carregamento lento
- Sem lazy loading otimizado
- Sem CDN de imagens

---

## 3. Análise Competitiva — Paraty Tours

### 3.1 ParatyTours.com.br — Referência Principal

**Posicionamento:** Agência de turismo receptivo completo em Paraty e Costa Verde  
**Diferença para Brisa:** ParatyTours é generalista (transfers, pacotes, hospedagem, grupos). Brisa pode ser mais especializada em náutico/premium.

**O que o ParatyTours faz bem:**
- Top bar com telefones sempre visíveis
- Navegação por categorias: Transfers, Pacotes, Passeios, Embarcações, Hospedagem, Grupos e Eventos
- Hero com foto aérea da cidade histórica (contexto cultural forte)
- Filtro de passeios por tipo: Pelo Mar / Ecológico / Cultural / Aventura
- Cards de tour com imagem de fundo + título overlay + "Saiba Mais"
- Seção de promoções + calendário de eventos turísticos
- WhatsApp flutuante sempre visível
- Flag BR para multilíngue

**O que o Brisa pode fazer melhor:**
- Design mais premium e moderno (ParatyTours tem visual anos 2010)
- Booking mais intuitivo (ParatyTours usa formulário genérico)
- Foco especializado em escunas → autoridade no segmento
- Galeria de fotos profissional por embarcação
- SEO local mais agressivo ("escuna Paraty", "passeio de barco Paraty")

---

## 4. Stack Recomendada

### 4.1 Decisão de Stack

| Opção | Prós | Contras | Recomendação |
|-------|------|---------|-------------|
| Next.js 16 + Supabase | Padrão Balaio, SSR para SEO, Vercel deploy | Maior setup inicial | ✅ **RECOMENDADO** |
| Astro + Supabase | Ultra-rápido, SSG perfeito para conteúdo | Menos dinâmico para booking | ⚠️ Alternativa |
| React + Vite + Supabase | SPA simples | SEO ruim sem SSR | ❌ Não recomendado |
| WordPress (manter) | Já existe | Todos os problemas listados | ❌ Descartado |

**Stack definida:**
```
Framework:    Next.js 16 (App Router)
Linguagem:    TypeScript
Estilo:       Tailwind CSS v4
UI:           shadcn/ui (seletivo) + componentes próprios
Banco:        Supabase (projeto consolidado eeklaiqrbtfhnnalzgjn, schema acalanto_*)
Auth:         Supabase Auth (apenas admin)
Pagamentos:   Stripe (opcional, fase 2) | WhatsApp first (fase 1)
Deploy:       Vercel
Repo:         GitHub (bloodyu2/brisatours — a criar)
Imagens:      Supabase Storage ou Cloudinary
SEO:          Next.js metadata API + JSON-LD TouristAttraction schema
Analytics:    GTM + GA4 + Consent Mode v2
```

### 4.2 Supabase — Schema `acalanto_*`

Usar o projeto consolidado `eeklaiqrbtfhnnalzgjn` com prefixo `acalanto_`:

```sql
-- Embarcações/Produtos
acalanto_boats          -- escunas e outras embarcações
acalanto_services       -- serviços além de escunas (lancha, foto, jeep)
acalanto_tours          -- passeios (produto final = boat + roteiro)

-- Reservas
acalanto_bookings       -- reservas de passeios
acalanto_booking_slots  -- horários disponíveis por data

-- Conteúdo
acalanto_gallery        -- fotos por tour/embarcação
acalanto_testimonials   -- depoimentos (admin aprova)
acalanto_blog_posts     -- artigos (fase 2)

-- Admin
acalanto_profiles       -- admins (auth_user_id + role)
acalanto_contacts       -- formulários de contato
```

---

## 5. Arquitetura de Rotas

```
/ (Home)
  → Hero com CTA "Ver Passeios"
  → Seção "Nossas Escunas" (cards)
  → Seção "Outros Serviços" (lancha, foto, jeep)
  → Depoimentos
  → Newsletter / Contato rápido

/escunas
  → Grid de todas as escunas com filtros

/escunas/[slug]
  → Galeria de fotos
  → Descrição completa
  → Roteiro detalhado (mapa ou timeline)
  → Preço + tipo (adulto/criança)
  → Calendário de disponibilidade
  → CTA: WhatsApp (fase 1) | Checkout Stripe (fase 2)

/servicos
  → Lancha Privativa
  → Fotografia
  → Passeio de Jeep

/servicos/[slug]
  → Detalhe do serviço + CTA WhatsApp

/quem-somos
  → História da Brisa
  → Equipe
  → Certificações / Segurança náutica

/galeria
  → Fotos organizadas por embarcação/roteiro

/contato
  → Formulário → Supabase
  → Mapa (Google Maps embed)
  → Horários de atendimento

/admin (protegido — Supabase Auth)
  /admin/dashboard
  /admin/tours        → CRUD passeios/escunas
  /admin/bookings     → Ver/gerenciar reservas
  /admin/gallery      → Upload/gestão de fotos
  /admin/testimonials → Aprovar depoimentos
  /admin/contacts     → Mensagens do formulário

/auth/callback        → Supabase OAuth callback
```

---

## 6. Design System

### 6.1 Identidade Visual (Proposta)

**Conceito:** *Turismo náutico premium com autenticidade caiçara*  
Inspiração: águas esmeralda de Paraty, casario colonial branco, madeira de barco, brisa marinha.

**Paleta de Cores:**
```css
/* Primárias */
--ocean-deep:    #0A3D5C;   /* Azul oceano profundo — autoridade */
--ocean-mid:     #1A6B8A;   /* Azul médio — interativo */
--ocean-light:   #4DA8C7;   /* Azul claro — acento */
--sea-green:     #2E8B6A;   /* Verde mar — natureza */

/* Neutros */
--sand-warm:     #F5EDD8;   /* Areia quente — background */
--sand-light:    #FDFAF4;   /* Areia clara — cards */
--driftwood:     #8B7355;   /* Madeira — texto secundário */
--charcoal:      #1C1C1C;   /* Quase preto — texto principal */

/* Acento */
--sunset-gold:   #F4A623;   /* Dourado pôr do sol — CTA principal */
--sunset-warm:   #E8732A;   /* Laranja — CTA hover */
--coral-soft:    #F06B6B;   /* Coral — alertas/urgência */

/* Reserva */
--white:         #FFFFFF;
--fog:           #F0F4F7;   /* Fundo alternativo */
```

**Tipografia:**
```css
/* Display — títulos heroicos */
--font-display: 'Playfair Display', Georgia, serif;
/* Ex: "Aventure-se em Paraty" */

/* UI — corpo, labels, botões */
--font-sans: 'Plus Jakarta Sans', system-ui, sans-serif;
/* Ex: "R$ 110,00 por pessoa" */

/* Código/detalhes */
--font-mono: 'JetBrains Mono', monospace;
```

**Motivo de Design:**
- Ondas suaves como separadores de seção (SVG)
- Texturas sutis de areia no fundo
- Cartões com sombra elevada (shadow-ocean)
- Bordas com radius generoso (rounded-2xl)
- Imagens em aspect-ratio 4:3 (marinhas) e 1:1 (thumb)

### 6.2 Componentes Core

```
<NavBar>          — sticky, fundo frosted glass ao scroll
<HeroSection>     — fullscreen, vídeo ou foto, texto overlay
<TourCard>        — imagem + nome + preço + CTA + badge (pet-friendly, etc.)
<TourGallery>     — lightbox responsivo
<BookingWidget>   — seletor adulto/criança + calendário + CTA
<ItineraryMap>    — timeline visual do roteiro
<TestimonialSlider> — depoimentos com foto + nota
<WhatsAppFloat>   — botão flutuante canto inferior direito
<PriceCard>       — resumo preço com breakdown adulto/criança
<SectionWave>     — divisor SVG com ondas
<ContactForm>     — nome + tel + mensagem → Supabase
<AdminTable>      — tabela CRUD genérica para admin
```

---

## 7. Fluxo de Reserva

### 7.1 Fase 1 — WhatsApp First (MVP)

```
Tour Page
  → Usuário seleciona: escuna + data + adultos + crianças
  → Clica "Reservar via WhatsApp"
  → URL gerada: wa.me/55XXXXXXXXX?text=...
     (mensagem pré-preenchida com: escuna, data, qtd adulto, qtd criança, valor total)
  → WhatsApp abre com mensagem pronta
```

**Mensagem pré-preenchida (template):**
```
Olá! Gostaria de reservar:
🚢 Escuna: Ilha Rasa IV
📅 Data: 15 de junho de 2026
👤 Adultos: 2 | 👶 Crianças: 1
💰 Total estimado: R$ 330,00
```

### 7.2 Fase 2 — Checkout Online (Stripe)
- Integração Stripe Checkout
- Pagamento de sinal (50%) na reserva
- Confirmação por email (Resend)
- Página de confirmação com QR code

---

## 8. SEO & Marketing

### 8.1 Keywords Alvo
**Primárias:** escuna Paraty, passeio de barco Paraty, tour náutico Paraty  
**Secundárias:** Ilha Rasa Paraty, passeio Soberano Paraty, Baía de Paraty barco  
**Long-tail:** melhor escuna para família Paraty, escuna pet friendly Paraty, passeio com almoço a bordo Paraty

### 8.2 JSON-LD Schema
```json
{
  "@type": "TouristAttraction",
  "name": "Acalanto Tours",
  "description": "Passeios de escuna em Paraty e Ilha Grande",
  "address": { "@type": "PostalAddress", "addressLocality": "Paraty", "addressRegion": "RJ" },
  "priceRange": "R$100-R$110",
  "telephone": "0800 601601"
}
```

### 8.3 Open Graph
- OG image por escuna: foto + nome + preço
- Twitter card large image
- Canonical URLs

---

## 9. Segurança (engineering:saas-security)

### 9.1 Eliminados pela Migração
- ✅ Sem WordPress → sem `/wp-admin`, sem xmlrpc.php
- ✅ Sem WooCommerce → sem exposição de pedidos
- ✅ Sem Elementor → sem vulnerabilidades de plugin
- ✅ Sem PHP → sem injeção de código PHP

### 9.2 Implementar no Novo Site
```
CSP Headers:          Next.js headers() — strict Content-Security-Policy
Rate Limiting:        Vercel Edge Middleware — contato + booking
Input Validation:     Zod em todas as Server Actions e API routes
SQL Injection:        Supabase RLS + queries parametrizadas (nunca concatenar SQL)
Auth:                 Supabase Auth com email OTP apenas para admin
Env Vars:             Nunca expor SUPABASE_SERVICE_ROLE_KEY no cliente
CORS:                 API routes com origem whitelist
Image Upload (admin): Validar MIME type + tamanho no servidor
Form Spam:            hCaptcha no formulário de contato
HTTPS:                Forçado pelo Vercel (HSTS)
```

### 9.3 Supabase RLS
```sql
-- Público pode ler tours, boats, gallery, testimonials aprovados
-- Apenas service_role pode escrever bookings via API
-- Admin autenticado pode fazer CRUD completo
```

---

## 10. Plano de Migração de Conteúdo

### 10.1 Assets a Migrar do WordPress
- Fotos das escunas: `foto-prod-01..04.png`, `fotos-home.png`, `foto_gde.png`, `01..04.png`
- Logo: `LOGO_SQUARE_central.png`
- Converter todos PNGs → WebP (economia ~70% de tamanho)

### 10.2 Conteúdo a Criar (faltando no WordPress)
- [ ] Texto "Quem Somos" — história da empresa, equipe
- [ ] Fotos de equipe
- [ ] Depoimentos de clientes reais
- [ ] Fotos de passeios de Jeep
- [ ] Fotos de serviço de Fotografia
- [ ] Fotos de Lancha Privativa
- [ ] Política de cancelamento
- [ ] FAQ (cancelamento climático, o que levar, etc.)
- [ ] Número de WhatsApp definitivo (0800 não funciona no WhatsApp)
- [ ] Email definitivo (confirmar se contato@centralof.com é correto)

---

## 11. Estrutura de Arquivos (Next.js)

```
brisatours/
├── app/
│   ├── (site)/
│   │   ├── page.tsx                    ← Home
│   │   ├── layout.tsx                  ← Header + Footer
│   │   ├── escunas/
│   │   │   ├── page.tsx                ← Lista de escunas
│   │   │   └── [slug]/page.tsx         ← Detalhe + booking
│   │   ├── servicos/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── galeria/page.tsx
│   │   ├── quem-somos/page.tsx
│   │   └── contato/page.tsx
│   ├── admin/
│   │   ├── layout.tsx                  ← Auth guard
│   │   ├── page.tsx                    ← Dashboard
│   │   ├── tours/page.tsx
│   │   ├── bookings/page.tsx
│   │   ├── gallery/page.tsx
│   │   ├── testimonials/page.tsx
│   │   └── contacts/page.tsx
│   ├── api/
│   │   ├── bookings/route.ts           ← POST criar reserva
│   │   ├── contact/route.ts            ← POST formulário
│   │   └── auth/signout/route.ts
│   └── auth/callback/route.ts
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── WhatsAppFloat.tsx
│   ├── tours/
│   │   ├── TourCard.tsx
│   │   ├── TourGallery.tsx
│   │   ├── BookingWidget.tsx
│   │   └── ItineraryTimeline.tsx
│   ├── sections/
│   │   ├── HeroSection.tsx
│   │   ├── ToursGrid.tsx
│   │   ├── ServicesSection.tsx
│   │   └── TestimonialsSection.tsx
│   └── ui/                             ← shadcn/ui + custom
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── booking/
│   │   ├── whatsapp.ts                 ← Gerar URL WhatsApp
│   │   └── pricing.ts                  ← Calcular preços
│   └── constants.ts                    ← WhatsApp number, site URL
├── supabase/
│   └── migrations/
│       └── 001_acalanto_init.sql
└── public/
    ├── images/                          ← Assets estáticos
    └── manifest.json
```

---

## 12. Perguntas Abertas (para o cliente)

1. **Email definitivo:** `contato@centralof.com` é o email de contato ou placeholder do WP?
2. **WhatsApp:** Qual número de WhatsApp para as reservas? (0800 não funciona no WA)
3. **Branding:** Logo atual diz "BRISA STUDIO" — deve dizer "Acalanto Tours"? Há arquivo de logo corrigido?
4. **Domínio:** Manter `brisatours.com.br`? Transferir DNS para Vercel?
5. **Pagamento online:** Fase 1 só WhatsApp está OK? Stripe na fase 2?
6. **Disponibilidade de datas:** Como o cliente quer gerenciar quais datas estão disponíveis para cada escuna?
7. **Preço:** Adulto R$110, Criança = ? (valor não encontrado no XML)
8. **Idioma:** Site em PT-BR apenas ou adicionar EN para turismo internacional?
9. **Conteúdo Quem Somos:** Existe texto/fotos para essa página?
10. **Serviços:** Fotografia e Jeep ainda são oferecidos? Precisam de página própria?

---

## 13. Cronograma Sugerido

| Fase | Entrega | Prazo estimado |
|------|---------|----------------|
| **Fase 0** — Setup + design tokens | Repo, Supabase schema, paleta definida | 1 dia |
| **Fase 1** — MVP | Home + Escunas + BookingWidget (WhatsApp) | 3 dias |
| **Fase 2** — Conteúdo completo | Todos as páginas + Admin básico | 3 dias |
| **Fase 3** — Polimento | SEO, performance, analytics, testes | 2 dias |
| **Fase 4** — Deploy | DNS, SSL, Vercel prod | 1 dia |
| **Fase 5** — Stripe (opcional) | Checkout online | 3 dias |

**Total MVP → Live: ~10 dias úteis**

---

## 14. Skills Adicionais Identificadas

Além das skills já invocadas, para implementação completa serão úteis:

| Skill | Quando usar |
|-------|-------------|
| `engineering:system-design` | Desenhar schema Supabase + API routes |
| `saas-security` | Auditoria de segurança pré-deploy |
| `web-asset-generator` | Favicons, PWA icons, OG images |
| `marketing:seo-audit` | Auditoria SEO pós-deploy |
| `marketing:content-creation` | Textos para páginas vazias (Quem Somos, etc.) |
| `superpowers:writing-plans` | Plano de implementação fase a fase |
| `superpowers:subagent-driven-development` | Implementação paralela dos módulos |

---

*Documento gerado por Balaio Digital — revisão manual necessária antes de iniciar implementação.*
