# Acalanto Marketplace — Overview & Arquitetura (fonte da verdade)

## Projeto
**Supabase:** `hnsbstmzbidfehvycptl` (sa-east-1), sem prefixo de tabela  
**Stack:** Next.js 16.2.4 · TypeScript · Tailwind CSS v4 · Supabase Auth + RLS · Infinity Pay · Resend · Vercel  
**Repo:** github.com/bloodyu2/acalanto-tours · branch: main  
**URL prod:** https://acalanto-tours.vercel.app (futura: acalantotours.com.br)  
**WhatsApp:** `5524999627968`

## Verticais do Marketplace
1. **Passeios** (escunas) — produto principal, checkout online Infinity Pay
2. **Fotografia** — ensaios e fotos de passeios, booking via WhatsApp (UTM comissão)
3. **Hotelaria** — coming soon, formulário de interesse
4. **Serviços** — jeep, transfer, lancha privativa — coming soon

## Regras de Negócio

### Comissão
- **30%** venda orgânica (sem UTM do parceiro)
- **15%** quando cliente chegou via UTM próprio do parceiro: `utm_source=instagram&utm_medium=bio&utm_campaign=[slug-parceiro]`
- UTM salvo em `sessionStorage` + cookie HTTP 7 dias na chegada
- Lido em `/api/checkout` para calcular comissão

### Capacidade (Passeios)
- Acalanto controla **50%** da capacidade máxima de cada embarcação
- Ex: boat.capacity_max=80 → Acalanto pode vender até 40 vagas
- Admin ajusta por data em `/admin/capacidade`

### Pagamento — Infinity Pay
```
1. CartDrawer → /checkout (resumo)
2. POST /api/infinity-pay/create → payload base64url → redirect
3. Infinity Pay processa Pix (0% taxa)
4. Webhook POST /api/infinity-pay/webhook → status=paid → booking confirmado
5. Email confirmação → 2 dias depois: email NPS
```

### Repasse Mensal
- `total_pago × (1 - taxa_comissao)` para cada parceiro
- Parceiro vê em `/conta/parceiro/repasses`
- Admin marca pago em `/admin/repasses`

### NPS
- Enviado 2 dias após tour_date via Vercel Cron (01:00 UTC)
- Token HMAC-SHA256 válido 7 dias: `HMAC(review_hmac_secret, booking_id + expires_ts)`
- URL: `/pesquisa?t=[token]`

### Parceiros — Onboarding
- Todo parceiro que fechar tem direito a **ensaio fotográfico gratuito** (fotos + vídeo + drone)
- Destacar em `/seja-parceiro` e emails de onboarding

## Variáveis de Ambiente
```bash
NEXT_PUBLIC_SUPABASE_URL=https://hnsbstmzbidfehvycptl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_WHATSAPP_NUMBER=5524999627968
INFINITY_PAY_API_KEY=...
INFINITY_PAY_WEBHOOK_SECRET=...
NEXT_PUBLIC_INFINITY_PAY_REDIRECT_URL=https://pay.infinitypay.io
RESEND_API_KEY=...
RESEND_FROM_EMAIL=noreply@acalantotours.com.br
ADMIN_EMAIL=contato@acalantotours.com.br
INTERNAL_EMAIL_SECRET=...
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
NEXT_PUBLIC_SITE_URL=https://acalantotours.com.br
REVIEW_HMAC_SECRET=...
EVOLUCOES_PASSWORD=acalanto2026
CRON_SECRET=...
```

## Schema de Tabelas (existente + a adicionar)

### Existentes (001_init.sql)
- `profiles` — admin/parceiro auth
- `partners` — operadores, fotógrafos, guias
- `boats` — escunas
- `services` — lancha, foto, jeep, transfer
- `gallery` — fotos
- `reviews` — avaliações internas
- `testimonials` — depoimentos públicos
- `bookings` — reservas
- `contacts` — formulário de contato

### Novas (002_marketplace.sql — plano 01)
- `capacity_overrides` — sobrescrever capacidade por data
- `cart_items` — itens do carrinho (server-side opcional)
- `utm_events` — rastreamento de UTM
- `payments` — pagamentos Infinity Pay
- `photographer_packages` — pacotes de fotografia
- `partner_pages` — página pública do parceiro
- `nps_surveys` — pesquisas NPS
- `payouts` — repasses mensais
- `evolution_tasks` — kanban `/evolucoes`

## Estrutura de Rotas (a construir)

```
app/
  (marketplace)/
    page.tsx                    — homepage marketplace
    passeios/
      page.tsx                  — listagem de escunas
      [slug]/page.tsx           — detalhe + BookingWidget + CapacityBar
    fotografia/
      page.tsx                  — listagem fotógrafos/serviços
      [slug]/page.tsx           — portfolio + PackageSelector
    hotelaria/page.tsx          — coming soon
    servicos/page.tsx           — coming soon (redirect from /servicos atual)
    checkout/page.tsx           — resumo antes de redirecionar ao Infinity Pay
    checkout/sucesso/page.tsx   — confirmação pós-pagamento
    parceiros/[slug]/page.tsx   — página pública do parceiro
    seja-parceiro/page.tsx      — formulário candidatura
    pesquisa/page.tsx           — NPS survey
    conta/
      page.tsx                  — área do cliente (magic link)
      parceiro/
        page.tsx                — dashboard parceiro
        repasses/page.tsx       — histórico de repasses
    evolucoes/page.tsx          — kanban password-protected
  admin/
    ... (existente + novas páginas)
  api/
    infinity-pay/
      create/route.ts
      webhook/route.ts
    cart/route.ts
    utm/route.ts
    nps/route.ts
    cron/nightly/route.ts
```

## Parceiros Confirmados no Seed
**Embarcações:** Ilha Rasa IV, Ilha Rasa V (Bob Esponja), Tânia, Soberano, Cherry I (privativa)  
**Fotógrafos:** Juliane Liberato, Arthur, Magno, Kai  
**NÃO CADASTRAR:** "Resta 1" — exclusividade outra agência

## Dependências de Execução
```
01 (schema)  → PRIMEIRO — todos dependem
02 (design)  → antes de 03-06
07 (cart)    → após 04 e 05
09 (auth)    → antes de 10, 11
11 (admin)   → após 09
12 (email)   → após 07
13 (evolucoes) → qualquer momento após 01
```
