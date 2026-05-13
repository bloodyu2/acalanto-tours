# CLAUDE.md — Acalanto Tours

> Carregado automaticamente em toda sessão Claude Code neste projeto.
> Path: `tours/acalanto-tours/`
> Deploy: https://acalanto-tours.vercel.app | Domínio futuro: acalanto.com
> Repo: https://github.com/bloodyu2/acalanto-tours

---

## IDENTIFICAÇÃO

- **Stack:** Next.js 16, TypeScript, Tailwind CSS v4, Supabase, Vercel
- **Supabase project:** `hnsbstmzbidfehvycptl` — projeto dedicado. NUNCA usar o consolidado `eeklaiqrbtfhnnalzgjn`.
- **Pagamentos:** ASAAS (PIX, boleto, cartão) com split automático por parceiro
- **Email:** SMTP (confirmação de reserva); roadmap: migrar para Resend
- **Domínio:** acalanto-tours.vercel.app (migrar para acalanto.com)

---

## RBAC — Admin Users

Tabela: `admin_users` (migration 017 — aplicar no SQL Editor do dashboard se não aplicado)

| Role | Acesso |
|------|--------|
| `super_admin` | Tudo, incluindo "Pagar parceiro" e gestão de usuários |
| `pdv` | PDV wizard, reservas |
| `tripulacao` | Visualizar reservas do dia |
| `fotografo` | Portal de fotos, galeria |

**Usuários de teste (senha: `Teste@123`):**
- `pdv-teste@acalanto.com` → role `pdv`
- `tripulacao-teste@acalanto.com` → role `tripulacao`
- `fotografo-teste@acalanto.com` → role `fotografo`

**Funções RBAC:**
- `lib/admin-auth.ts` → `getAdminUser` — server-only (usa `next/headers`)
- `lib/admin-roles.ts` → `ROLE_NAV`, `canAccessRoute` — client-safe
- `app/admin/layout.tsx` → Server Component; passa `role` e `userName` para `AdminLayoutClient`
- Sidebar filtra `navItems` por role
- `WelcomeModal`: carrossel por role no 1º login (key localStorage: `acalanto_welcome_v1_<role>`)

**Setup manual (doc completo: `docs/superpowers/specs/2026-05-10-admin-rbac-setup-steps.md`):**
1. Aplicar `supabase/migrations/017_admin_users.sql` no SQL Editor
2. Criar usuários no Authentication → Users
3. INSERT em `admin_users` mapeando UUIDs → roles
4. (Opcional) `SUPER_ADMIN_EMAILS` no Vercel para travar super_admin

---

## CONVENÇÕES CRÍTICAS DO BANCO

### commission_rate é INTEGER percentual

`bookings.commission_rate` armazena percentual como inteiro (0–100). Exemplo: `30` = Acalanto retém 30%, parceiro recebe 70%.

```
// CORRETO
partnerCents = total_cents * (100 - commission_rate) / 100

// ERRADO (trata como decimal — não usar)
partnerCents = total_cents * (1 - commission_rate)
```

> `app/admin/reservas/[id]/page.tsx` pode ter código legado com o cálculo errado — verificar antes de editar.

### Coluna de comissão nas embarcações

A coluna em `boats` é `commission_pct` (percentual para o parceiro), não `commission_rate`.

### payouts — agregado mensal

Tabela `payouts` registra repasses mensais por parceiro (`partner_id, period_month, gross_cents, commission_cents, net_cents`). Não rastreia por booking individual. Informações por booking ficam em `bookings.notes`.

---

## PAGAMENTOS — ASAAS

- Split automático na criação da cobrança: percentual do parceiro + 6% wallet Balaio (`ASAAS_BALAIO_WALLET_ID` no Vercel)
- PIX QR: buscado separadamente após criar cobrança (endpoint dedicado)
- Confirmação inline: PIX QR, boleto e cartão na mesma página sem redirect
- `createTransfer` em `lib/asaas/client.ts` para repasse manual ao parceiro
- Tipos: `AsaasTransferRequest`, `AsaasTransfer`

---

## BANNER / HERO

- Sem dots no carousel
- Ken Burns sutil nos slides
- Lightroom Adobe URLs suportadas (passthrough — sem otimização next/image)
- Até 4 fotos da galeria por barco (round-robin)
- Hero text sempre visível (contraste garantido)

**PR pendente:** branch `claude/banner-improvements` → `main`

---

## FEATURES IMPLEMENTADAS

### Booking
- CartDrawer global com CartProvider
- ASAAS: PIX, boleto e cartão; confirmação inline; webhook de confirmação
- Seletor de múltiplos horários de saída por barco/serviço
- Fotógrafo a bordo como addon (R$250) — gerenciado internamente pela Acalanto, sem picker no carrinho

### Admin
- `/admin/reservas` — tabela + `ReservaViewModal` com split de comissões, Sync ASAAS (bulk + individual), "Pagar parceiro" (super_admin only)
- `/admin/vendas` — PDV wizard multi-step: passeio → passageiros → cliente → pagamento PIX/cartão; gera reserva + cobrança ASAAS
- KPIs admin, calculadora de repasse
- Gallery management para serviços e fotografia

### Portal do Parceiro
- `/parceiros/dashboard` — KPIs: reservas do mês, receita, repasse pendente
- `/parceiros/dashboard/reservas` — listagem com breakdown de comissão
- `/parceiros/dashboard/financeiro` — histórico de repasses (`payouts`)
- `/parceiros/dashboard/disponibilidade` — calendário interativo para hospedagem (toggle available/blocked)
- `/parceiros/dashboard/perfil` — edição de `partners` + `partner_pages`
- Boat claiming flow: parceiros reivindicam embarcações
- API `/api/parceiros/availability` — upsert em `accommodation_availability`

### Fotografia
- Fotografia embarcada como pacote genérico `@fotografosdeparaty`
- Provider picker no CartDrawer para itens de fotografia
- Galeria com lightbox nas páginas de passeio/serviço
- RLS dedicado para fotógrafos

### Email
- Envio de confirmação de reserva via SMTP
- Roadmap: SMTP GoDaddy / migrar para Resend

---

## SCHEMA DO BANCO

Tabelas (sem prefixo — projeto dedicado `hnsbstmzbidfehvycptl`):

```
profiles, admin_users, partners, boats, services, gallery, reviews,
testimonials, bookings, contacts, payments, photographer_packages,
partner_pages, partner_listings, nps_surveys, payouts, evolution_tasks,
capacity_overrides, utm_events, service_availability,
accommodation_availability, ical_sources, pkg_availability
```

**Colunas críticas em `bookings`:**
`vertical, photographer_package_id, partner_id, utm_campaign, commission_rate, paid_at, service_id, accommodation_listing_id, payment_id, infants`

---

## RLS

- `is_admin()` — SECURITY DEFINER, verifica `profiles.role = 'admin'`
- `is_partner()` — idem para `role = 'partner'`
- Parceiros: ler/atualizar próprio row em `partners` (via `auth_user_id = auth.uid()`)
- Parceiros: ler/atualizar/inserir em `partner_pages` onde `partner_id` é deles
- Parceiros: ler próprios `bookings` e `payouts`

---

## NOTAS DE BUILD

- `next.config.ts` tem `typescript.ignoreBuildErrors: true` — dezenas de erros de inferência ruim do Supabase. Build deploya normalmente.
- **Separação obrigatória server vs client:** `lib/admin-auth.ts` (server-only, usa `next/headers`) NUNCA importado por Client Components. `lib/admin-roles.ts` é a versão client-safe.

---

## Migrações Supabase

Toda migration que criar uma tabela nova no schema `public` **deve** incluir grants explícitos. Sem isso o supabase-js retorna erro 42501 após outubro de 2026.

Template obrigatório:

```sql
-- Grant obrigatório: novas tabelas não são mais expostas automaticamente
grant select on public.<tabela> to anon;
grant select, insert, update, delete on public.<tabela> to authenticated;
grant all on public.<tabela> to service_role;
```

Ajuste os grants conforme necessidade (ex: tabelas internas podem não precisar de `anon`).
