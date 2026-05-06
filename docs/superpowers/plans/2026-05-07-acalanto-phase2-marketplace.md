# Acalanto — Phase 2: Marketplace Multi-Vertical

> **Para agentes:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` para executar este plano. Leia `docs/superpowers/plans/acalanto-marketplace/00-overview-e-arquitetura.md` como primeira ação antes de qualquer tarefa.

**Goal:** Transformar o site WhatsApp-first de Phase 1 (escunas de Paraty) em **Acalanto** — marketplace multi-vertical de turismo no modelo Airbnb/Booking, com verticais de Passeios, Fotografia, Hotelaria e Serviços, pagamento online via Infinity Pay, portal de parceiros, área de cliente, CRM completo e PWA instalável.

**Architecture:** Next.js 16 App Router, Supabase `hnsbstmzbidfehvycptl` (sa-east-1), Tailwind CSS v4, pagamento via **Infinity Pay** (JSON redirect, Pix 0% taxa), UTM attribution para comissão variável (30% vs 15%), Resend para emails transacionais, PWA com Service Worker.

**Tech Stack:** Next.js 16 · TypeScript · Tailwind CSS v4 · Supabase Auth + RLS · Infinity Pay · Resend · Vercel Cron · PWA Service Worker

---

## Estrutura dos Planos

Os planos detalhados estão em `docs/superpowers/plans/acalanto-marketplace/` e devem ser executados na ordem abaixo. **Cada plano é autossuficiente** — contém todo o código, comandos e contexto necessários para ser executado por um agente sem contexto externo.

| # | Arquivo | O que entrega |
|---|---------|---------------|
| 00 | `00-overview-e-arquitetura.md` | **LEIA PRIMEIRO** — fonte da verdade: regras de negócio, stack, parceiros, comissões, fluxos |
| 01 | `01-schema-supabase.md` | Schema completo (migrations 001–003), RLS policies, seed de parceiros e produtos |
| 02 | `02-design-system-e-layout.md` | Design tokens, globals.css, fonts, componentes base, layout groups, manifest PWA |
| 03 | `03-homepage-e-marketplace-nav.md` | Homepage, navegação por verticais, SearchBar, mobile bottom nav |
| 04 | `04-vertical-passeios.md` | `/passeios` listagem + `/passeios/[slug]` detalhe + BookingWidget + CapacityBar |
| 05 | `05-vertical-fotografia.md` | `/fotografia` listagem + `/fotografia/[slug]` portfolio + PackageSelector + UTM |
| 06 | `06-verticals-coming-soon.md` | `/hotelaria` + `/servicos` coming-soon com formulário de interesse |
| 07 | `07-cart-e-infinity-pay.md` | CartDrawer (inspirado em Garras+MK) + /checkout + Infinity Pay redirect + webhook |
| 08 | `08-paginas-parceiros-utm.md` | `/parceiros/[slug]` + UTM tracking + click analytics + `/seja-parceiro` form |
| 09 | `09-contas-e-auth.md` | Magic link auth + middleware + área `/conta` (cliente + parceiro) |
| 10 | `10-nps-e-avaliacoes.md` | `/pesquisa` NPS + token HMAC-SHA256 + moderação admin + StarRating integrado |
| 11 | `11-admin-crm.md` | CRM completo: KPIs, reservas, reviews, candidaturas, repasses, capacidade |
| 12 | `12-pwa-email-notificacoes.md` | Service Worker PWA + emails Resend (confirmação/NPS/repasse) + cron noturno |
| 13 | `13-evolucoes-dashboard.md` | `/evolucoes` kanban password-protected (Acalanto + Balaio) com seed de 30+ tarefas |

---

## Regras de Negócio Principais

### Comissão
- **30% Acalanto** — venda orgânica pelo site/marketing
- **15% Acalanto** — cliente chegou via UTM próprio do parceiro (`utm_source=instagram&utm_medium=bio&utm_campaign=[slug]`)
- Detecção automática: UTM armazenado em sessionStorage + cookie HTTP 7 dias → lido no checkout

### Capacidade (Passeios)
- Acalanto controla **50% da capacidade** de cada embarcação
- Exemplo: embarcação de 80 vagas → Acalanto pode vender até 40
- Admin pode ajustar a capacidade por data na tela `/admin/capacidade`

### Pagamento (Infinity Pay)
```
1. CartDrawer → /checkout (resumo)
2. /checkout → POST /api/infinity-pay/create → payload base64url → redirect
3. Infinity Pay processa (Pix 0% taxa)
4. Webhook POST /api/infinity-pay/webhook → status=paid → email confirmação
5. Booking status: pending → paid → email NPS 2 dias depois
```

### Repasse
- Calculado mensalmente: total_pago × (1 - taxa_parceiro)
- Parceiro vê histórico em `/conta/parceiro/repasses`
- Admin marca como pago em `/admin/repasses`

### Relatório Noturno
- Edge Function `supabase/functions/nightly-report` roda via Vercel Cron às 01:00 UTC
- Envia sumário do dia seguinte para email do parceiro de cada embarcação

---

## Variáveis de Ambiente

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://hnsbstmzbidfehvycptl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# WhatsApp
NEXT_PUBLIC_WHATSAPP_NUMBER=5524999627968

# Infinity Pay
INFINITY_PAY_API_KEY=...
INFINITY_PAY_WEBHOOK_SECRET=...
NEXT_PUBLIC_INFINITY_PAY_REDIRECT_URL=https://pay.infinitypay.io/...

# Email (Resend)
RESEND_API_KEY=...
RESEND_FROM_EMAIL=noreply@acalantotours.com.br
ADMIN_EMAIL=contato@acalantotours.com.br
INTERNAL_EMAIL_SECRET=...

# Analytics
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX

# Site
NEXT_PUBLIC_SITE_URL=https://acalantotours.com.br

# Auth interno
REVIEW_HMAC_SECRET=...   # HMAC-SHA256 para tokens NPS
EVOLUCOES_PASSWORD=acalanto2026
CRON_SECRET=...
```

---

## Como Executar

### Opção 1 — Subagent-Driven (recomendado)

```
1. Leia 00-overview-e-arquitetura.md completamente
2. Para cada plano 01→13:
   a. Dispatch implementer subagent com conteúdo completo do plano
   b. Dispatch spec reviewer subagent
   c. Dispatch code quality reviewer subagent
   d. Mark task complete
3. Ao final: superpowers:finishing-a-development-branch
```

### Opção 2 — Manual (Claude Code no terminal)

```bash
# No terminal, dentro de tours/acalanto-tours/:
# Executar cada plano em sequência, checkpoint após cada um:
# 01 → commit → 02 → commit → ... → 13 → commit → push
```

### Dependências críticas

```
01 (schema)  → todos os outros dependem dele — EXECUTAR PRIMEIRO
02 (design)  → 03, 04, 05, 06 dependem dos tokens e layout
07 (cart)    → 04 e 05 devem estar prontos (produtos no carrinho)
09 (auth)    → 10, 11 dependem da middleware e área /conta
11 (admin)   → usa createAdminClient() definido em 09
12 (email)   → webhook definido em 07 deve existir
13 (evolucoes) → independente, pode rodar a qualquer momento após 01
```

---

## Parceiros Confirmados no Seed

Ver `01-schema-supabase.md` Task "Seed" para o SQL completo. Resumo:

**Embarcações:** Ilha Rasa IV, Ilha Rasa V (Bob Esponja), Tânia, Soberano, Cherry I (privativa)  
**Fotógrafos:** Juliane Liberato, Arthur, Magno, Kai  
**⚠️ NÃO CADASTRAR:** "Resta 1" — exclusividade com outra agência, apenas divulgação GFP nas redes

---

## Diferencial de Onboarding para Parceiros

> **Todo parceiro que fechar com a plataforma tem direito a um ensaio fotográfico gratuito do seu negócio** — fotos + vídeo + drone. Deve aparecer com destaque em toda comunicação de `/seja-parceiro` e emails de onboarding.

---

## Fonte da Verdade

Para detalhes completos de qualquer decisão técnica ou de negócio, consulte:

```
tours/docs/superpowers/plans/acalanto-marketplace/00-overview-e-arquitetura.md
```

Este arquivo é o árbitro final de todas as decisões de arquitetura e negócio do marketplace Acalanto.
