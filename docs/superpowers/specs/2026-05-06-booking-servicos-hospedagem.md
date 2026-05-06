# Spec: Booking de Serviços + Hospedagem + Nome
**Data:** 2026-05-06  
**Status:** Aprovado

---

## 0. Nome — Acalanto Turismo

Substituir "Acalanto Tours" por "Acalanto Turismo" em todo texto público visível.  
URLs, slugs e IDs de projeto permanecem inalterados.

**Arquivos a alterar:** `app/layout.tsx`, `components/layout/Header.tsx`, `components/layout/Footer.tsx`, páginas que exibem o nome em texto (quem-somos, contato, homepage, passeios, metadata).

---

## 1. Booking de Serviços

### 1.1 Fluxo do visitante

1. `/servicos` → grid de serviços ativos
2. `/servicos/[slug]` → página do serviço com `ServiceBookingWidget` na lateral (sticky)
3. Widget: seletor de data + tamanho de grupo → "Adicionar ao carrinho"
4. Cart drawer existente → `/checkout` → InfinitePay → webhook
5. Sucesso: booking criado, data bloqueada em `service_availability`

### 1.2 Modelo de preço

| Tipo | Serviço | Cobrança |
|------|---------|----------|
| `per_person` | Passeio de Jeep, Transfer | preço × nº pessoas |
| `per_group` | Lancha Privativa | preço fixo, respeita `capacity_max` |

### 1.3 DB — alterações em `partner_listings`

```sql
ALTER TABLE partner_listings
  ADD COLUMN IF NOT EXISTS price_cents_per_person  integer,
  ADD COLUMN IF NOT EXISTS price_cents_group        integer,
  ADD COLUMN IF NOT EXISTS capacity_max             integer,
  ADD COLUMN IF NOT EXISTS pricing_type             text
    CHECK (pricing_type IN ('per_person','per_group'));
```

### 1.4 Nova tabela `service_availability`

```sql
CREATE TABLE IF NOT EXISTS service_availability (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id  uuid REFERENCES partner_listings(id) ON DELETE CASCADE NOT NULL,
  date        date NOT NULL,
  available   boolean NOT NULL DEFAULT true,
  created_at  timestamptz DEFAULT now(),
  UNIQUE (listing_id, date)
);
```

### 1.5 CartItem — extensão de tipo

```typescript
// lib/types/cart.ts — adicionar ao tipo CartItem:
serviceListingId?: string
pricingType?: 'per_person' | 'per_group'
groupSize?: number         // para per_group: número de pessoas no grupo
// priceAdultCents já existente cobre per_person (preço por pessoa)
// para per_group: priceAdultCents = price_cents_group, adults = groupSize
```

### 1.6 Componente ServiceBookingWidget

**Arquivo:** `components/booking/ServiceBookingWidget.tsx`

Props: `listing: PartnerListing` (com colunas novas)

Comportamento:
- Datepicker: só datas onde `service_availability.available = true` (ou sem registro = disponível por padrão)
- Se `per_person`: seletor de adultos (mín 1) + botão "Adicionar"
- Se `per_group`: seletor 1–`capacity_max` pessoas + preço fixo exibido + botão "Adicionar"
- Ao adicionar: `addItem()` com `type: 'servico'`

### 1.7 Atualização de `/servicos/[slug]/page.tsx`

- Buscar `partner_listings` pelo slug (em vez de `services`)
- Renderizar `ServiceBookingWidget` na coluna direita (sticky)
- Manter lista de highlights por slug

### 1.8 Partner dashboard — disponibilidade de serviços

**Rota:** `/conta/parceiro/anuncios/[id]/disponibilidade`

- Calendário mensal com botão de toggle por data (disponível / bloqueado)
- Toggle atualiza `service_availability` via Server Action
- Exibir próximas 3 reservas confirmadas (da tabela `bookings`)

### 1.9 Admin — campos de preço ao aprovar

Na página `/admin/parceiros`, ao aprovar anúncio de tipo `servico`:
- Campo: `pricing_type` (radio: por pessoa / por grupo)
- Campo: `price_cents_per_person` ou `price_cents_group`
- Campo: `capacity_max` (se per_group)

---

## 2. Booking de Hospedagem

### 2.1 Fluxo do visitante

1. `/hotelaria` — banner de busca: check-in / check-out / hóspedes
2. Grid filtra pousadas onde todas as noites do período estão disponíveis
3. `/hotelaria/[slug]` — calendário de disponibilidade + preço/noite + total
4. "Reservar" → cart com `type: 'hospedagem'` → checkout → InfinitePay → webhook
5. Webhook: cria booking + insere `status: 'booked'` em `accommodation_availability` para cada noite

### 2.2 DB — alterações em `partner_listings`

```sql
ALTER TABLE partner_listings
  ADD COLUMN IF NOT EXISTS price_cents_per_night    integer,
  ADD COLUMN IF NOT EXISTS price_cents_extra_guest  integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_guests               integer,
  ADD COLUMN IF NOT EXISTS min_nights               integer DEFAULT 1;
```

### 2.3 Nova tabela `accommodation_availability`

```sql
CREATE TABLE IF NOT EXISTS accommodation_availability (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id  uuid REFERENCES partner_listings(id) ON DELETE CASCADE NOT NULL,
  date        date NOT NULL,
  status      text NOT NULL DEFAULT 'available'
    CHECK (status IN ('available','blocked','booked')),
  source      text NOT NULL DEFAULT 'manual'
    CHECK (source IN ('manual','ical','acalanto')),
  created_at  timestamptz DEFAULT now(),
  UNIQUE (listing_id, date)
);
```

### 2.4 Nova tabela `ical_sources`

```sql
CREATE TABLE IF NOT EXISTS ical_sources (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id      uuid REFERENCES partner_listings(id) ON DELETE CASCADE NOT NULL,
  url             text NOT NULL,
  direction       text NOT NULL DEFAULT 'import'
    CHECK (direction IN ('import','export')),
  channel_type    text,   -- 'airbnb' | 'booking' | 'other' (prep para canal manager)
  channel_token   text,   -- reservado para API futura
  last_synced_at  timestamptz,
  sync_status     text DEFAULT 'pending'
    CHECK (sync_status IN ('pending','ok','error')),
  error_message   text,
  created_at      timestamptz DEFAULT now()
);
```

### 2.5 CartItem — tipo hospedagem

```typescript
// Adicionar ao tipo CartItem:
type: 'passeio' | 'fotografia' | 'servico' | 'hospedagem'

// Campos específicos para hospedagem:
accommodationListingId?: string
checkIn?: string    // YYYY-MM-DD
checkOut?: string   // YYYY-MM-DD
nights?: number
guests?: number
pricePerNightCents?: number
// totalCents = nights * pricePerNightCents + extras
```

### 2.6 Página `/hotelaria` — busca por datas

**Novo componente:** `components/hotelaria/SearchBar.tsx`
- Inputs: check-in, check-out, nº de hóspedes
- State salvo em URL params: `?checkin=2026-06-10&checkout=2026-06-12&guests=2`
- Grid filtra `partner_listings` que têm todas as noites disponíveis (sem `status: blocked|booked` em `accommodation_availability` para o período)

### 2.7 Página `/hotelaria/[slug]` — calendário + widget

**Novo componente:** `components/hotelaria/AccommodationBookingWidget.tsx`
- Exibe calendário do mês atual e próximo
- Datas bloqueadas/reservadas em cinza, disponíveis clicáveis
- Seleção de check-in → check-out
- Seletor de hóspedes (1–`max_guests`)
- Total calculado: noites × preço/noite
- Botão "Reservar" → `addItem()` com `type: 'hospedagem'`

### 2.8 iCal — importação

**Rota API:** `GET /api/ical/sync/[listingId]` (chamada manual ou cron)

Fluxo:
1. Buscar todos os `ical_sources` do listing com `direction: 'import'`
2. Fazer fetch da URL iCal
3. Parsear eventos (usar biblioteca `ical.js` ou parser próprio)
4. Para cada `VEVENT` no calendário: upsert em `accommodation_availability` com `status: 'blocked', source: 'ical'`
5. Atualizar `last_synced_at` e `sync_status`

**Sync automático:** cron via Vercel Cron Jobs a cada hora (`vercel.json`).

### 2.9 iCal — exportação

**Rota API:** `GET /api/ical/[slug].ics`

Gera feed iCal válido (RFC 5545) com:
- `VCALENDAR` + `PRODID` da Acalanto Turismo
- Um `VEVENT` para cada noite com `status: 'booked'` (reservas feitas na plataforma)
- Headers `Content-Type: text/calendar; charset=utf-8`

Parceiro copia a URL e cola no Airbnb/Booking.com como "calendário externo".

### 2.10 Partner dashboard — disponibilidade de hospedagem

**Rota:** `/conta/parceiro/anuncios/[id]/disponibilidade`

Abas:
1. **Calendário** — grid mensal, click para bloquear/liberar datas manualmente
2. **Sincronização** — lista de feeds iCal importados (adicionar URL, ver status de sync, botão "Sincronizar agora"), URL iCal de exportação para copiar
3. **Reservas** — lista de bookings confirmados com nome do hóspede, datas, total

### 2.11 Webhook InfinitePay — extensão para hospedagem/serviços

No webhook existente (`/api/infinity-pay/webhook`):
- Se `booking.vertical === 'hospedagem'`: upsert `accommodation_availability` (status: 'booked', source: 'acalanto') para cada noite
- Se `booking.vertical === 'servico'`: upsert `service_availability` (available: false) para a data

---

## 3. O que NÃO muda

- Cart Provider, CartDrawer, CartIcon — sem alteração
- InfinitePay create + webhook — só extensão mínima
- Tabelas `boats`, `bookings`, `payments` — sem alteração de schema
- Passeios e Fotografia — sem alteração

---

## 4. Ordem de implementação recomendada

1. Nome (Acalanto Turismo) — 10 min
2. Migrations DB (todas de uma vez)
3. Tipos CartItem + pricing utils
4. ServiceBookingWidget + integração em `/servicos/[slug]`
5. Partner dashboard — disponibilidade de serviços
6. Admin — campos de preço ao aprovar serviços
7. AccommodationBookingWidget + `/hotelaria/[slug]`
8. SearchBar + filtro em `/hotelaria`
9. iCal export (`/api/ical/[slug].ics`)
10. iCal import + sync cron
11. Partner dashboard — disponibilidade de hospedagem + iCal management
12. Webhook — extensão para bloquear datas ao pagar
