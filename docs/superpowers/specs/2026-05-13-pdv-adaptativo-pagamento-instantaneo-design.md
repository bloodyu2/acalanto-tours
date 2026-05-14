# PDV adaptativo + pagamento instantâneo — Design (2026-05-13)

## Objetivo

Transformar `/admin/vendas` em um ponto de venda real, com:

1. **Catálogo filtrado e priorizado por role** do vendedor, configurável pelo super_admin.
2. **Pagamento finalizado dentro do admin**: PIX por QR + cartão por iframe ASAAS Checkout. Sem redirect.
3. **Confirmação em tempo real** do pagamento via polling (3s) + botão manual de fallback após 30s.
4. **Entrega ao cliente automática**: e-mail com PDF de comprovante + link WhatsApp pré-formatado.
5. **RBAC nav fix**: Roadmap, Apresentações e Identidade Visual só aparecem para super_admin (auditar + endurecer com guards server-side).
6. **Ícones oficiais de método de pagamento** (PIX, Visa, Mastercard, Elo, Amex, Hipercard) em todo o site.
7. **Splits respeitados** em toda venda do PDV — `buildSplit()` de `lib/asaas/split.ts` aplicado para que a Balaio receba seus 6%.

## Fora de escopo

- Tap-to-Phone via NFC dentro do admin (Asaas Tap só existe no app Asaas oficial Android).
- Reabrir uma venda meio-paga via deep-link (poderia ser feito com rota dedicada `/admin/vendas/[bookingId]/pagamento`; deixamos para v2 se virar dor).
- Boleto bancário (não é método principal — fica para depois).
- Maquininha física (independente desta feature).

## Arquitetura — Visão geral

```
┌──────────────────────────────────────────────────────────────────────┐
│ app/admin/vendas/page.tsx  (Server Component)                       │
│   - guard: requer super_admin OR pdv OR tripulacao OR fotografo     │
│   - lê admin_role_permissions(role) → vertical[] permitidas         │
│   - lê catálogo (boats, photographer_packages, services) filtrado   │
│   - passa pra <PdvWizard>                                            │
└──────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────────┐
│ components/admin/pdv/PdvWizard.tsx  (Client)                        │
│   Step 0  ✦ Vertical (passeio / fotografia / serviço / hospedagem)  │
│   Step 1    Produto                                                 │
│   Step 2    Passageiros / datas / add-ons                           │
│   Step 3    Cliente (nome, e-mail, telefone, CPF opcional)          │
│   Step 4  ✦ Pagamento (abas PIX padrão | Cartão)                    │
│              ├ PIX:    QR + copy-paste                              │
│              └ Cartão: <iframe asaasCheckoutUrl>                    │
│           ◄─── usePaymentStatus(bookingId) (polling 3s)             │
│   Step 5  ✦ Sucesso (PDF download + WhatsApp link + Nova venda)     │
└──────────────────────────────────────────────────────────────────────┘
                                  │
                ┌─────────────────┼─────────────────┐
                ▼                 ▼                 ▼
       POST /api/admin/pdv  GET /api/admin/pdv/   POST /api/admin/pdv/
       (cria booking +      [id]/status            [id]/notify
        cobrança + split)   (polling)              (PDF + email + WA)
                │                 │                 │
                └─── ASAAS API ───┴──── webhook ────┘
                       ▼
                buildSplit() em lib/asaas/split.ts
                aplica: prestador + Balaio 6% + Acalanto resto
```

## Modelo de dados

### Nova tabela: `admin_role_permissions`

```sql
create table public.admin_role_permissions (
  role text not null,                          -- 'super_admin' | 'pdv' | 'tripulacao' | 'fotografo'
  vertical text not null,                      -- 'passeio' | 'fotografia' | 'servico' | 'hospedagem'
  enabled boolean not null default false,
  priority integer not null default 0,         -- ordem de exibição no Step 0; maior = mostra primeiro
  updated_at timestamptz not null default now(),
  primary key (role, vertical)
);

alter table public.admin_role_permissions enable row level security;
create policy "admin_role_perms_read" on public.admin_role_permissions
  for select using (true);
create policy "admin_role_perms_write_service_role" on public.admin_role_permissions
  for all using (false) with check (false);
-- Apenas o service_role (que bypassa RLS) escreve, via UI server-action.

-- Seed inicial (defaults sensatos)
insert into public.admin_role_permissions (role, vertical, enabled, priority) values
  ('super_admin', 'passeio',     true, 100),
  ('super_admin', 'fotografia',  true, 100),
  ('super_admin', 'servico',     true, 100),
  ('super_admin', 'hospedagem',  true, 100),
  ('pdv',         'passeio',     true, 100),
  ('pdv',         'fotografia',  true,  90),
  ('pdv',         'servico',     true,  80),
  ('pdv',         'hospedagem',  true,  70),
  ('tripulacao',  'passeio',     true, 100),   -- prioridade alta: é o que ele vende mais
  ('tripulacao',  'fotografia',  true,  80),   -- pode fazer upsell
  ('tripulacao',  'servico',    false,   0),
  ('tripulacao',  'hospedagem', false,   0),
  ('fotografo',   'fotografia',  true, 100),
  ('fotografo',   'passeio',     true,  70),
  ('fotografo',   'servico',    false,   0),
  ('fotografo',   'hospedagem', false,   0);
```

### Coluna nova em `bookings`

```sql
alter table public.bookings
  add column if not exists sold_by_user_id uuid references auth.users(id),
  add column if not exists sold_by_role text;
```

Toda venda originada do PDV grava o `auth.uid()` e o role do vendedor, separados do `notes` (para query analítica futura).

## Arquivos

### Novos

| Caminho | Função |
|---|---|
| `supabase/migrations/018_admin_role_permissions.sql` | tabela + seed |
| `supabase/migrations/019_bookings_sold_by.sql` | colunas `sold_by_user_id`, `sold_by_role` |
| `app/admin/configuracoes/page.tsx` | tela super_admin para ligar/desligar (role × vertical) + priorities |
| `app/api/admin/pdv/[id]/status/route.ts` | GET — retorna `payment_status` para polling (requer `getAdminUser()` — sem auth, não responde) |
| `app/api/admin/pdv/[id]/notify/route.ts` | POST — gera PDF, envia e-mail, retorna `pdfUrl` + `whatsappLink` |
| `components/admin/pdv/StepVertical.tsx` | Step 0 — escolha vertical filtrada por role |
| `components/admin/pdv/StepPayment.tsx` | Step 4 — abas PIX/Cartão + QR + iframe + status |
| `components/admin/pdv/StepDone.tsx` | Step 5 — sucesso + downloads + WhatsApp |
| `components/admin/pdv/usePaymentStatus.ts` | hook client (polling 3s, expõe `status`, `elapsedSec`, `canConfirmManually`) |
| `components/payments/PaymentBadge.tsx` | `<PaymentBadge brand="pix"|"visa"|...>` — SVG oficial inline |
| `lib/pdf/booking-receipt.ts` | gera PDF de comprovante (pdfkit ou @react-pdf/renderer) |
| `lib/whatsapp.ts` | builder para link `wa.me` com mensagem pré-formatada |
| `tests/pdv/qr-rendering.spec.ts` | snapshot test: PDV gera + renderiza `pix_qr_code` corretamente |
| `tests/pdv/role-filter.spec.ts` | unidade: filtro de catálogo por role × vertical |
| `tests/pdv/split-applied.spec.ts` | confirma que `buildSplit()` é chamado na criação da cobrança |

### Modificados

| Caminho | Motivo |
|---|---|
| `app/admin/vendas/page.tsx` | passar `enabledVerticals` e `priorities` para o wizard |
| `app/api/admin/pdv/route.ts` | **bug colateral**: passar `split: buildSplit(items)` na chamada `createCharge`; armazenar `sold_by_user_id`/`sold_by_role`; aceitar `vertical` no body |
| `components/admin/pdv/PdvWizard.tsx` | quebrar nos componentes Step* + adicionar Step 0 e Step 5 |
| `lib/admin-roles.ts` | manter `ROLE_NAV`, mas remover hardcode de verticais (vai pro DB agora) |
| `app/admin/_components/AdminLayoutClient.tsx` | **auditar** o filtro de `navItems` por `ROLE_NAV[role]`; corrigir se vazando |
| `app/admin/roadmap/page.tsx`, `app/admin/apresentacoes/page.tsx`, `app/admin/identidade/page.tsx` | guard server-side: `if (adminUser.role !== 'super_admin') redirect('/admin')` |
| `app/api/checkout/route.ts` | substituir badges custom por `<PaymentBadge>` na tela pública de checkout |
| `components/cart/CartDrawer.tsx` | idem |
| `components/photography/PhotographyBookingWidget.tsx`, `components/booking/ServiceBookingWidget.tsx` | idem |

## Detalhes por sub-sistema

### 1. RBAC nav fix (Roadmap / Apresentações / IDV)

A regra já existe em `lib/admin-roles.ts:ROLE_NAV` — `'/admin/roadmap'` está só na lista do `super_admin`. Hipótese para o sintoma reportado: o filtro no `AdminLayoutClient.tsx` não está sendo aplicado, OU o `role` chega `null` no client (existe fallback "mostra tudo" para evitar tela em branco no boot, e essa é a brecha provável).

**Ação:**

1. Auditar `AdminLayoutClient.tsx` linha por linha — confirmar que `navItems.filter(i => ROLE_NAV[role]?.includes(i.href))` está rodando antes do `.map()`.
2. **Remover o fallback "mostra tudo se role é null"**: se role for null, renderizar `navItems = []` (esconde a sidebar inteira). O server layout já redireciona para `/admin/login` quando não há sessão, então um null no client só acontece no boot — é mais aceitável uma sidebar vazia por meio segundo do que vazar itens privados.
3. Adicionar guard server-side em `app/admin/roadmap/page.tsx`, `apresentacoes/page.tsx`, `identidade/page.tsx` (e `app/admin/configuracoes/page.tsx`):
   ```ts
   const adminUser = await getAdminUser()
   if (!adminUser || adminUser.role !== 'super_admin') redirect('/admin')
   ```
4. Aplicar mesmo pattern para qualquer rota só-super_admin no futuro (ex: `/admin/configuracoes`).

### 2. Tabela `admin_role_permissions` + tela de config

`/admin/configuracoes` (novo, só super_admin):

```
┌─────────────────────────────────────────────────────────────┐
│ Permissões de venda por role                                 │
├─────────────────────────────────────────────────────────────┤
│                Passeio  Fotografia  Serviço  Hospedagem      │
│ super_admin     ☑(100)    ☑(100)    ☑(100)    ☑(100)         │
│ pdv             ☑(100)    ☑( 90)    ☑( 80)    ☑( 70)         │
│ tripulacao      ☑(100)    ☑( 80)    ☐         ☐              │
│ fotografo       ☑( 70)    ☑(100)    ☐         ☐              │
├─────────────────────────────────────────────────────────────┤
│  Checkbox = pode vender. Número = prioridade no Step 0.      │
│                                          [Salvar alterações] │
└─────────────────────────────────────────────────────────────┘
```

Server action upserta na tabela. RLS bloqueia escrita pelo client direto (só service_role).

### 3. Step 0 — escolha de vertical

`StepVertical.tsx` recebe `enabledVerticals: Array<{vertical, priority}>` ordenadas por priority desc. Renderiza 1-4 cards grandes (Passeio / Fotografia / Serviço / Hospedagem). Click define `vertical` no state do wizard e avança para Step 1.

Se o role só tem 1 vertical habilitada, Step 0 é **pulado automaticamente** (já entra no Step 1 com a vertical pré-selecionada).

### 4. PDV — pagamento

`StepPayment.tsx` renderiza tabs:

```
┌──────────────────────────────────────────────────────────────┐
│  [● PIX]   [○ Cartão]                                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│       ┌──────────────────────┐                              │
│       │                      │   Aponte a câmera do seu     │
│       │      [QR CODE PIX]   │   celular pra esse código    │
│       │      256x256 px      │                              │
│       │                      │   ou copie:                  │
│       └──────────────────────┘   [00020126...] [Copiar]      │
│                                                              │
│       Total: R$ 220,00                                       │
│                                                              │
│       ⏳ Aguardando pagamento ...     (00:12)                │
│                                                              │
│                                       [Já recebi]  (após 30s)│
│       ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔ │
│       Métodos: 🟪 PIX  💳 Visa Mastercard Elo Amex Hipercard │
└──────────────────────────────────────────────────────────────┘
```

Quando muda para tab "Cartão":

```
┌──────────────────────────────────────────────────────────────┐
│  [○ PIX]   [● Cartão]                                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   <iframe src={asaas.checkoutUrl}                            │
│           style={width:100%, height:480, border:0}>          │
│                                                              │
│       (campos de cartão renderizados pelo ASAAS)             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Polling:** `usePaymentStatus(bookingId)` faz `fetch /api/admin/pdv/[id]/status` a cada 3s. Para quando `payment_status === 'received'`. Expõe também `elapsedSec`; quando >= 30, mostra botão "Já recebi" que chama o mesmo endpoint mas com `?force=true` (apenas auditoria, não pula validação — o backend continua exigindo confirmação do ASAAS).

**Splits aplicados:** quando `POST /api/admin/pdv` cria a cobrança, monta `CartItemWithPartner[]` e chama `buildSplit(items)`. Passa o array `split` retornado na chamada `createCharge`. Isso garante que (i) prestador recebe `commissionPct%`, (ii) Balaio recebe 6% via `BALAIO_TOTAL_PCT`, (iii) Acalanto recebe o resto. **Hoje está faltando — é correção colateral confirmada.**

### 5. ASAAS Checkout iframe

A doc do ASAAS (https://docs.asaas.com/docs/checkout) expõe um endpoint `POST /v3/checkouts` que retorna um `checkoutUrl` embarcável em iframe. **A confirmação final desse endpoint + dos parâmetros aceitos será feita na fase de plan (writing-plans)** consultando a doc atualizada — se ele não suportar exatamente o que precisamos, fallback é a página hosted normal (`invoiceUrl`) embarcada em iframe.

O iframe é a primeira escolha porque mantém o operador no PDV. ASAAS notifica conclusão via webhook → nosso polling pega.

### 6. Pós-pagamento — PDF + e-mail + WhatsApp

`POST /api/admin/pdv/[id]/notify` é chamado pelo client quando `usePaymentStatus` detecta `received`. O endpoint:

1. Gera PDF (uso de `@react-pdf/renderer` server-side — já compatível com Next/edge ou Node runtime).
2. Faz upload do PDF para `images` (bucket Supabase) em `comprovantes/{bookingId}.pdf` com signed URL 30 dias.
3. Envia e-mail via Resend (verificar se já está configurado; senão, adicionar `RESEND_API_KEY` no Vercel).
4. Retorna `{ pdfUrl, whatsappLink }`.

`whatsappLink` é montado por `lib/whatsapp.ts`:

```
https://wa.me/{customer_phone}?text={encodedURIComponent(
  "✅ Sua reserva está confirmada!\n\n" +
  "🎫 Reserva: " + bookingId.slice(0,8) + "\n" +
  "⚓ " + boatName + "\n" +
  "📅 " + tourDate + "\n" +
  "👥 " + adults + " adulto(s)" + (children ? " + " + children + " criança(s)" : "") + "\n" +
  "💰 Total: " + formatCents(totalCents) + "\n\n" +
  "Comprovante: " + pdfUrl + "\n\n" +
  "Qualquer dúvida, fale com a gente!"
)}
```

### 7. `<PaymentBadge>` — ícones oficiais

Componente que renderiza SVG inline com tamanho consistente (32px altura padrão, prop `size`). SVGs baixados dos brand kits oficiais:

- **PIX**: https://www.bcb.gov.br/estabilidadefinanceira/spb (logo oficial do BCB)
- **Visa / Mastercard / Elo / Amex / Hipercard**: brand kits respectivos

Substituir TODOS os botões/badges custom em: PDV, CartDrawer público, PhotographyBookingWidget, ServiceBookingWidget, página `/conta` se houver, footer (se mostra "pagamos com..."). Inventário completo de substituições fica no plan.

## Testing

Critérios mínimos pra considerar a feature pronta:

1. **`tests/pdv/qr-rendering.spec.ts`**: cria booking PIX no PDV. Assert (a) `/api/admin/pdv` retorna `pix_qr_code` começando com `data:image/png;base64,` e payload base64 com `length > 1000` (PNG real, não 1×1 transparente); (b) `<img alt="QR code PIX">` está montado no DOM do Step 4 com `width >= 220px`; (c) botão "Copiar código PIX" copia `pix_copy_paste` válido (começa com `00020126`).
2. **`tests/pdv/role-filter.spec.ts`**: dado `admin_role_permissions` mock com `tripulacao: passeio enabled, fotografia disabled`, o catálogo do PDV NÃO inclui `photographer_packages`.
3. **`tests/pdv/split-applied.spec.ts`**: mock do client ASAAS — após `POST /api/admin/pdv`, a chamada `createCharge` foi feita com `split` contendo exatamente o partner walletId + Balaio walletId, com `BALAIO_TOTAL_PCT = 6`.
4. **Polling integration**: mock que muda `bookings.payment_status` de `pending` → `received` após 6s. Cliente detecta e dispara Step 5 sem botão manual.
5. **Fallback manual**: same mock mas server fica `pending` indefinidamente. Após 30s, botão "Já recebi" aparece e é clicável.

## Riscos / questões abertas (resolver na fase de plan)

1. **ASAAS Checkout iframe oficial existe e suporta nosso caso?** — preciso bater a doc atualizada em `https://docs.asaas.com/docs/checkout`. Se não, fallback é `invoiceUrl` em iframe (com header X-Frame-Options possivelmente restrito; testar).
2. **E-mail provider** — `RESEND_API_KEY` está no Vercel? Ou está usando outro provider? Plan vai confirmar.
3. **`@react-pdf/renderer` em Vercel Edge** — pode precisar do runtime Node clássico (`export const runtime = 'nodejs'`). Confirmar.
4. **PCI scope com iframe ASAAS Checkout** — se o iframe é mesmo do ASAAS, Acalanto fica em SAQ-A (mais leve, só HTTPS + CSP). Confirmar no contrato.
5. **Webhook ASAAS já mapeia o novo fluxo?** — o handler atual (`app/api/webhooks/asaas/route.ts`) precisa atualizar `bookings` corretamente para que o polling enxergue mudança. Auditar.

## Rollout

Sem feature flag — single deploy. Razões: usuários do PDV são internos, é fácil treinar. O rollback é `git revert`.

Ordem de implementação no plan (será detalhada pela writing-plans):

1. RBAC nav fix (rapidíssimo, libera escopo mental)
2. Migration 018 (admin_role_permissions) + Migration 019 (sold_by)
3. `<PaymentBadge>` (independente, pode entrar antes — melhora UX imediatamente)
4. `app/admin/configuracoes` (CRUD da tabela de permissões)
5. PDV Step 0 (vertical) + lógica de filtro
6. `POST /api/admin/pdv` reescrito (com `buildSplit` + sold_by + suporte a vertical)
7. PIX QR rendering no Step 4 + polling
8. ASAAS Checkout iframe pra cartão
9. PDF + e-mail + WhatsApp + Step 5
10. Testes (rolling em paralelo a cada step)
