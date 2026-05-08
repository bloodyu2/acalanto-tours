# Hospedagem — Quartos, Drawer de Reserva e Galeria Universal

## Objetivo

Transformar a experiência de hospedagem da Acalanto em um fluxo de reserva completo tipo Booking.com: o parceiro define N tipos de quarto ao cadastrar a propriedade; o visitante seleciona quarto, datas e hóspedes no drawer e adiciona ao carrinho → checkout ASAAS. A página completa é corrigida para mobile. A galeria é expandida para cobrir todos os tipos de produto.

---

## 1. Banco de Dados

### 1.1 `accommodation_rooms`

Nova tabela sub-entidade de `partner_listings`:

```sql
create table accommodation_rooms (
  id                       uuid primary key default gen_random_uuid(),
  listing_id               uuid not null references partner_listings(id) on delete cascade,
  name                     text not null,
  description              text,
  price_per_night_cents    integer not null,
  price_extra_guest_cents  integer not null default 0,
  max_guests               integer not null default 2,
  min_nights               integer not null default 1,
  amenities                text[] not null default '{}',
  cover_image              text,
  display_order            integer not null default 0,
  active                   boolean not null default true,
  created_at               timestamptz not null default now()
);

alter table accommodation_rooms enable row level security;
create policy "public read active rooms"
  on accommodation_rooms for select
  using (active = true);
```

### 1.2 `accommodation_availability` — coluna `room_id`

```sql
alter table accommodation_availability
  add column if not exists room_id uuid references accommodation_rooms(id) on delete cascade;
```

Semântica: `room_id IS NULL` → bloqueio de toda a propriedade. `room_id IS NOT NULL` → bloqueio de quarto específico.

### 1.3 `gallery` — cobertura universal

```sql
alter table gallery
  add column if not exists listing_id             uuid references partner_listings(id) on delete cascade,
  add column if not exists room_id                uuid references accommodation_rooms(id) on delete cascade,
  add column if not exists photographer_package_id uuid references photographer_packages(id) on delete cascade;
```

Cobertura por produto após a migration:

| Produto | Coluna na gallery |
|---------|------------------|
| Escuna / Barco | `boat_id` (já existe) |
| Serviço | `service_id` (já existe) |
| Hospedagem (propriedade) | `listing_id` (novo) |
| Hospedagem (quarto) | `room_id` (novo) |
| Pacote de fotografia | `photographer_package_id` (novo) |

---

## 2. Tipos TypeScript

### `lib/types/database.ts`

Adicionar `accommodation_rooms` com `Row`, `Insert`, `Update`. Atualizar `accommodation_availability.Row` com `room_id: string | null`. Atualizar `gallery.Row` com `listing_id`, `room_id`, `photographer_package_id` (todos `string | null`).

Novo alias: `export type AccommodationRoom = Database['public']['Tables']['accommodation_rooms']['Row']`

---

## 3. Wizard do Parceiro — Passo "Quartos"

### 3.1 WizardSteps dinâmico

`WizardSteps` passa a aceitar `{ steps: string[], current: number }` em vez do union fixo. Componente renderiza `steps.length` círculos dinamicamente.

Todos os tipos chamam com `steps={['Conta','Tipo','Dados','Anúncio','Pronto']}`.
Hospedagem chama com `steps={['Conta','Tipo','Dados','Anúncio','Quartos','Pronto']}`.

### 3.2 `tipo/page.tsx`

Ao escolher `hospedagem`, salva `onboarding_type = 'hospedagem'` em sessionStorage e navega para `/parceiros/cadastro/dados-fiscais` (sem mudança).

### 3.3 `anuncio/page.tsx` — hospedagem

Após submit do anúncio com `type === 'hospedagem'`, em vez de navegar para `/parceiros/cadastro/aguardando`, navega para `/parceiros/cadastro/quartos`.

Para outros tipos, continua indo para `/parceiros/cadastro/aguardando`.

### 3.4 `app/parceiros/cadastro/quartos/page.tsx` (novo)

Passo 5 para hospedagem. Estado local: `rooms: RoomDraft[]`.

```typescript
type RoomDraft = {
  name: string
  description: string
  price_per_night_cents: number
  price_extra_guest_cents: number
  max_guests: number
  min_nights: number
  amenities: string[]
}
```

**UI:**
- Lista de cards dos quartos já adicionados (nome + preço + botão remover)
- Botão "Adicionar quarto" → abre formulário inline (accordion) com campos:
  - Nome do quarto (text, obrigatório)
  - Descrição (textarea)
  - Preço por noite R$ (number input, em reais — convertido para cents no submit)
  - Preço extra por hóspede R$ (number input, default 0)
  - Máx hóspedes (number, min 1)
  - Mínimo de noites (number, min 1, default 1)
  - Comodidades (checkboxes): Ar-condicionado, Wi-Fi, TV, Frigobar, Banheira, Vista para o mar, Varanda, Cozinha, Piscina, Estacionamento
- Botão "Salvar quarto" fecha o formulário e adiciona à lista
- Mínimo 1 quarto para habilitar "Continuar"

**Submit:** insere todos os `RoomDraft` em `accommodation_rooms` via Supabase client com `listing_id` do sessionStorage. Navega para `/parceiros/cadastro/aguardando`.

---

## 4. HotelSheet — Drawer de Reserva

### 4.1 Arquivo: `components/hotelaria/HotelSheet.tsx`

Refatoração completa. Props:

```typescript
type HotelSheetProps = {
  listing: {
    id: string
    slug: string
    title: string
    cover_image: string | null
    description: string | null
    metadata: Record<string, unknown>
  }
  open: boolean
  onClose: () => void
}
```

### 4.2 Estados internos

```typescript
rooms: AccommodationRoom[]          // carregado no mount
loadingRooms: boolean
selectedRoom: AccommodationRoom | null
blockedDates: string[]              // recarregado ao mudar selectedRoom
checkIn: string                     // YYYY-MM-DD
checkOut: string                    // YYYY-MM-DD
guests: number
```

### 4.3 Layout do drawer (mobile-first, max-width 480px)

```
┌─────────────────────────────┐
│ [X]  Nome da Propriedade    │  ← header fixo
├─────────────────────────────┤
│ [cover image]               │
│                             │
│ ── Escolha o quarto ──      │
│ [Card Std] [Card Suíte] →   │  ← scroll horizontal
│                             │
│ ── Datas ──                 │
│ Check-in  [09/05/2026]      │
│ Check-out [11/05/2026]      │
│                             │
│ ── Hóspedes ──              │
│ [−] 2 [+]                   │
│                             │
│ ── Resumo ──                │
│ 2 noites × R$280 = R$560    │
│ (+ R$50 extra hóspede)      │
├─────────────────────────────┤
│ [Adicionar ao carrinho]     │  ← rodapé fixo
│ Ver página completa →       │
└─────────────────────────────┘
```

### 4.4 Lógica de disponibilidade

Ao selecionar um quarto, busca:
```sql
select date from accommodation_availability
where listing_id = $1 and (room_id = $2 or room_id is null)
  and status in ('blocked', 'booked')
```
Datas retornadas ficam desabilitadas no DatePickerCalendar.

### 4.5 Cart item

```typescript
addItem({
  id: `${listing.id}-${selectedRoom.id}-${checkIn}`,
  type: 'hospedagem',
  name: `${listing.title} — ${selectedRoom.name}`,
  date: checkIn,
  checkIn,
  checkOut,
  nights,
  guests,
  adults: guests,
  children: 0,
  priceAdultCents: 0,
  priceChildCents: 0,
  pricePerNightCents: selectedRoom.price_per_night_cents,
  accommodationListingId: listing.id,
})
```

---

## 5. Página Completa `/hotelaria/[slug]`

### 5.1 Layout responsivo

**Mobile (< 768px):** coluna única
```
Hero image (aspect 16/9)
Nome + badges
Sobre (descrição)
Galeria (grid 2 colunas)
── Quartos ──
  Card vertical por quarto:
    nome, preço/noite, máx hóspedes, comodidades
    [Reservar] → abre HotelSheet com quarto pré-selecionado
── Regras / Políticas ──
  (extraídas de metadata.policies se existir)
```

**Desktop (≥ 768px):** 2 colunas
```
Esquerda (60%): hero, sobre, galeria, quartos, regras
Direita (40%): AccommodationBookingWidget sticky (top: 90px)
```

### 5.2 Quarto pré-selecionado

Ao clicar "Reservar" num card de quarto da página completa, o drawer abre com `selectedRoom` já definido — o usuário vai direto para a seleção de datas.

### 5.3 `AccommodationBookingWidget`

Widget existente atualizado para aceitar `defaultRoomId?: string`. Quando passado, pula a seleção de quarto. Mantém o mesmo fluxo de cálculo e add-to-cart.

---

## 6. Galeria — Infraestrutura (sem UI de upload)

A migration adiciona as colunas `listing_id`, `room_id`, `photographer_package_id` à tabela `gallery`. Nenhuma UI de upload é construída agora — a infraestrutura fica pronta para a próxima rodada.

A função `getListingBySlug` em `lib/partner-listings.ts` é expandida para fazer join com `accommodation_rooms` e `gallery` (filtrada por `listing_id`).

---

## Arquivos Afetados

| Arquivo | Ação |
|---------|------|
| `supabase/migrations/013_accommodation_rooms.sql` | Criar — tabela rooms + colunas availability + gallery |
| `lib/types/database.ts` | Modificar — accommodation_rooms Row, gallery colunas, availability room_id |
| `components/hotelaria/HotelSheet.tsx` | Refatorar — drawer de booking completo |
| `components/hotelaria/HotelariaPageClient.tsx` | Modificar — passa props corretas para HotelSheet |
| `app/hotelaria/[slug]/page.tsx` | Modificar — layout responsivo, quartos, regras |
| `components/hotelaria/AccommodationBookingWidget.tsx` | Modificar — aceita defaultRoomId |
| `app/parceiros/cadastro/_components/WizardSteps.tsx` | Modificar — dinâmico (steps[], current) |
| `app/parceiros/cadastro/anuncio/page.tsx` | Modificar — hospedagem navega para /quartos |
| `app/parceiros/cadastro/quartos/page.tsx` | Criar — passo 5 hospedagem |
| `lib/partner-listings.ts` | Modificar — join rooms + gallery |
