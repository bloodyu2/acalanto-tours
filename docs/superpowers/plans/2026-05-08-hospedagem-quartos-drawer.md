# Hospedagem — Quartos, Drawer de Reserva e Disponibilidade Automática

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar tipos de quarto por hospedagem, transformar o HotelSheet em drawer de booking completo (room → datas → hóspedes → carrinho → ASAAS), corrigir a página completa para mobile, e bloquear automaticamente a disponibilidade quando um pagamento é confirmado.

**Architecture:** `accommodation_rooms` é sub-tabela de `partner_listings`. O wizard ganha um passo "Quartos" exclusivo para hospedagem. `HotelSheet` busca quartos via Supabase client e gerencia todo o fluxo de reserva. O webhook ASAAS bloqueia as datas em `accommodation_availability` ao receber `PAYMENT_CONFIRMED`. A galeria recebe colunas para todos os tipos de produto.

**Tech Stack:** Next.js 16 App Router, Supabase (admin client + anon client), TypeScript, existing drawer pattern (HotelSheet), existing cart pattern (CartProvider/useCart), ASAAS webhook

---

## File Structure

| Arquivo | Ação | Responsabilidade |
|---------|------|-----------------|
| `supabase/migrations/013_accommodation_rooms.sql` | Criar | Tabela rooms, room_id em availability, colunas gallery, accommodation_room_id + check_out em bookings |
| `lib/types/database.ts` | Modificar | Tipos para accommodation_rooms, gallery atualizado, bookings atualizado |
| `components/cart/CartProvider.tsx` | Modificar | Adicionar `accommodationRoomId` ao CartItem |
| `app/api/checkout/route.ts` | Modificar | Schema + booking insert com accommodationRoomId e check_out |
| `app/parceiros/cadastro/_components/WizardSteps.tsx` | Modificar | Aceitar `steps?: string[]` opcional |
| `app/parceiros/cadastro/anuncio/page.tsx` | Modificar | Navegar para /quartos quando type === 'hospedagem' |
| `app/parceiros/cadastro/quartos/page.tsx` | Criar | Passo 5: formulário de tipos de quarto |
| `components/hotelaria/HotelSheet.tsx` | Refatorar | Drawer de booking completo: quartos + datas + hóspedes + carrinho |
| `components/hotelaria/HotelPageClient.tsx` | Criar | Client wrapper para full page: room cards + HotelSheet |
| `app/hotelaria/[slug]/page.tsx` | Modificar | Layout responsivo, busca rooms, renderiza HotelPageClient |
| `app/api/webhooks/asaas/route.ts` | Modificar | Bloquear datas em accommodation_availability ao confirmar pagamento |

---

## Task 1: Migration 013 — tabelas e colunas

**Files:**
- Create: `supabase/migrations/013_accommodation_rooms.sql`

- [ ] **Step 1: Criar arquivo de migration**

```sql
-- supabase/migrations/013_accommodation_rooms.sql

-- 1. Tabela de tipos de quarto
create table if not exists accommodation_rooms (
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

-- 2. accommodation_availability: adicionar room_id
alter table accommodation_availability
  add column if not exists room_id uuid references accommodation_rooms(id) on delete cascade;

-- Índices únicos parciais para upsert correto
create unique index if not exists availability_listing_date_no_room_idx
  on accommodation_availability (listing_id, date) where room_id is null;

create unique index if not exists availability_room_date_idx
  on accommodation_availability (room_id, date) where room_id is not null;

-- 3. gallery: suporte a todos os produtos
alter table gallery
  add column if not exists listing_id              uuid references partner_listings(id) on delete cascade,
  add column if not exists room_id                 uuid references accommodation_rooms(id) on delete cascade,
  add column if not exists photographer_package_id uuid references photographer_packages(id) on delete cascade;

-- 4. bookings: campos de hospedagem
alter table bookings
  add column if not exists accommodation_room_id uuid references accommodation_rooms(id),
  add column if not exists check_out             text;
```

- [ ] **Step 2: Aplicar no Supabase via MCP**

Usar `apply_migration` no projeto `hnsbstmzbidfehvycptl`.

- [ ] **Step 3: Verificar**

```sql
select column_name from information_schema.columns
where table_name = 'accommodation_rooms' order by ordinal_position;
-- Deve retornar: id, listing_id, name, description, price_per_night_cents,
-- price_extra_guest_cents, max_guests, min_nights, amenities, cover_image,
-- display_order, active, created_at
```

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/013_accommodation_rooms.sql
git commit -m "feat(db): accommodation_rooms, gallery universal, booking check_out"
```

---

## Task 2: Tipos TypeScript

**Files:**
- Modify: `lib/types/database.ts`

- [ ] **Step 1: Adicionar `accommodation_rooms` e atualizar tipos existentes em `lib/types/database.ts`**

Localizar o bloco `accommodation_availability:` e adicionar `room_id`:

```typescript
      accommodation_availability: {
        Row: {
          id: string
          listing_id: string
          date: string
          status: 'available' | 'blocked' | 'booked'
          source: 'manual' | 'ical' | 'acalanto'
          room_id: string | null   // NOVO
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['accommodation_availability']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['accommodation_availability']['Insert']>
      }
```

Localizar o bloco `gallery:` e adicionar três colunas:

```typescript
      gallery: {
        Row: {
          id: string
          boat_id: string | null
          service_id: string | null
          listing_id: string | null              // NOVO
          room_id: string | null                 // NOVO
          photographer_package_id: string | null // NOVO
          url: string
          alt_text: string | null
          display_order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['gallery']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['gallery']['Insert']>
      }
```

Localizar o bloco `bookings:` e adicionar duas colunas após `pix_copy_paste`:

```typescript
          accommodation_room_id: string | null  // NOVO
          check_out:             string | null  // NOVO
```

Adicionar **após** o bloco `reviews:` (antes de `testimonials:`):

```typescript
      accommodation_rooms: {
        Row: {
          id: string
          listing_id: string
          name: string
          description: string | null
          price_per_night_cents: number
          price_extra_guest_cents: number
          max_guests: number
          min_nights: number
          amenities: string[]
          cover_image: string | null
          display_order: number
          active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['accommodation_rooms']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['accommodation_rooms']['Insert']>
      }
```

Adicionar alias no final do arquivo (após `export type RoadmapTask`):

```typescript
export type AccommodationRoom = Database['public']['Tables']['accommodation_rooms']['Row']
```

- [ ] **Step 2: Commit**

```bash
git add lib/types/database.ts
git commit -m "feat(types): accommodation_rooms, gallery universal, booking check_out"
```

---

## Task 3: Cart + Checkout — accommodationRoomId e check_out

**Files:**
- Modify: `components/cart/CartProvider.tsx`
- Modify: `app/api/checkout/route.ts`

- [ ] **Step 1: Adicionar `accommodationRoomId` ao CartItem em `components/cart/CartProvider.tsx`**

Localizar o bloco `export type CartItem = {` e adicionar após `accommodationListingId?`:

```typescript
  accommodationRoomId?: string
```

- [ ] **Step 2: Atualizar schema em `app/api/checkout/route.ts`**

No array `items`, localizar a linha `accommodationListingId: z.string().optional(),` e adicionar após:

```typescript
    accommodationRoomId:        z.string().optional(),
```

- [ ] **Step 3: Salvar accommodation_room_id e check_out no booking insert**

No mesmo arquivo, localizar o objeto `bookingPayload` (linha ~123). Após a linha `pix_copy_paste: charge.pixQrCode?.payload ?? null,` adicionar:

```typescript
      accommodation_room_id:    primaryItem.accommodationRoomId ?? null,
      check_out:                primaryItem.checkOut ?? null,
```

- [ ] **Step 4: Commit**

```bash
git add components/cart/CartProvider.tsx app/api/checkout/route.ts
git commit -m "feat(checkout): save accommodationRoomId and check_out to booking"
```

---

## Task 4: WizardSteps dinâmico + passo Quartos

**Files:**
- Modify: `app/parceiros/cadastro/_components/WizardSteps.tsx`
- Modify: `app/parceiros/cadastro/anuncio/page.tsx`
- Create: `app/parceiros/cadastro/quartos/page.tsx`

- [ ] **Step 1: Atualizar `WizardSteps.tsx` — aceitar `steps` opcional**

Substituir o conteúdo completo:

```typescript
const DEFAULT_STEPS = ['Conta', 'Tipo', 'Dados', 'Anúncio', 'Pronto']

export function WizardSteps({ current, steps = DEFAULT_STEPS }: { current: number; steps?: string[] }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: '2.5rem' }}>
      {steps.map((label, i) => {
        const n = i + 1
        const done = n < current
        const active = n === current
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', flex: n < steps.length ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '2.5rem' }}>
              <div style={{
                width: '2rem', height: '2rem', borderRadius: '50%',
                background: done ? 'var(--ocean-mid)' : active ? 'var(--sunset)' : 'var(--border)',
                color: (done || active) ? 'white' : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: 700,
                transition: 'background 0.2s',
              }}>
                {done ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                ) : n}
              </div>
              <span style={{ fontSize: '0.6rem', color: active ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: active ? 600 : 400, marginTop: '0.25rem', whiteSpace: 'nowrap' }}>
                {label}
              </span>
            </div>
            {n < steps.length && (
              <div style={{ flex: 1, height: '2px', background: done ? 'var(--ocean-mid)' : 'var(--border)', margin: '0 0.5rem', marginBottom: '1.25rem' }}/>
            )}
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Atualizar `anuncio/page.tsx` — navegar para /quartos quando hospedagem**

Localizar o bloco `router.push('/parceiros/cadastro/aguardando')` dentro de `handleSubmit` e substituir por:

```typescript
    if (type === 'hospedagem') {
      router.push('/parceiros/cadastro/quartos')
    } else {
      router.push('/parceiros/cadastro/aguardando')
    }
```

Também atualizar o `WizardSteps` no JSX para mostrar 6 passos quando hospedagem:

```typescript
<WizardSteps
  current={4}
  steps={type === 'hospedagem'
    ? ['Conta', 'Tipo', 'Dados', 'Anúncio', 'Quartos', 'Pronto']
    : undefined}
/>
```

- [ ] **Step 3: Criar `app/parceiros/cadastro/quartos/page.tsx`**

```typescript
'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { WizardSteps } from '../_components/WizardSteps'

const HOSPEDAGEM_STEPS = ['Conta', 'Tipo', 'Dados', 'Anúncio', 'Quartos', 'Pronto']

const AMENITY_OPTIONS = [
  'Ar-condicionado', 'Wi-Fi', 'TV', 'Frigobar', 'Banheira',
  'Vista para o mar', 'Varanda', 'Cozinha', 'Piscina', 'Estacionamento',
]

type RoomDraft = {
  name: string
  description: string
  priceReais: string
  extraGuestReais: string
  maxGuests: string
  minNights: string
  amenities: string[]
}

const emptyRoom = (): RoomDraft => ({
  name: '', description: '', priceReais: '', extraGuestReais: '0',
  maxGuests: '2', minNights: '1', amenities: [],
})

export default function QuartosPage() {
  const router = useRouter()
  const [partnerId, setPartnerId] = useState<string | null>(null)
  const [listingId, setListingId] = useState<string | null>(null)
  const [rooms, setRooms] = useState<RoomDraft[]>([])
  const [editing, setEditing] = useState<RoomDraft | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const pid = sessionStorage.getItem('onboarding_partner_id')
    const lid = sessionStorage.getItem('onboarding_listing_id')
    if (!pid) { router.push('/parceiros/cadastro'); return }
    setPartnerId(pid)
    setListingId(lid)
  }, [router])

  function toggleAmenity(room: RoomDraft, a: string): RoomDraft {
    return {
      ...room,
      amenities: room.amenities.includes(a)
        ? room.amenities.filter(x => x !== a)
        : [...room.amenities, a],
    }
  }

  function saveRoom() {
    if (!editing) return
    if (!editing.name || !editing.priceReais) { setError('Nome e preço são obrigatórios.'); return }
    setRooms(prev => [...prev, editing])
    setEditing(null)
    setError('')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!listingId) { setError('ID do anúncio não encontrado. Volte e tente novamente.'); return }
    if (rooms.length === 0) { setError('Adicione ao menos um tipo de quarto.'); return }
    setLoading(true)
    setError('')

    const supabase = createClient()
    const inserts = rooms.map((r, i) => ({
      listing_id:              listingId,
      name:                    r.name,
      description:             r.description || null,
      price_per_night_cents:   Math.round(parseFloat(r.priceReais.replace(',', '.')) * 100),
      price_extra_guest_cents: Math.round(parseFloat(r.extraGuestReais.replace(',', '.')) * 100),
      max_guests:              parseInt(r.maxGuests) || 2,
      min_nights:              parseInt(r.minNights) || 1,
      amenities:               r.amenities,
      display_order:           i,
    }))

    const { error: insertError } = await supabase
      .from('accommodation_rooms')
      .insert(inserts)

    if (insertError) {
      setError('Erro ao salvar quartos. Tente novamente.')
      setLoading(false)
      return
    }

    router.push('/parceiros/cadastro/aguardando')
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.75rem 1rem',
    border: '1px solid var(--border)', borderRadius: '8px',
    fontSize: '0.9375rem', fontFamily: 'inherit',
    outline: 'none', background: 'white', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem',
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--sand)', padding: '5rem 1.5rem 2rem' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/" style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', textDecoration: 'none' }}>
            Acalanto Turismo
          </Link>
        </div>

        <div style={{ background: 'white', borderRadius: '20px', padding: '2.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
          <WizardSteps current={5} steps={HOSPEDAGEM_STEPS} />
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Tipos de quarto</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            Adicione cada tipo de acomodação que você oferece com preço e capacidade.
          </p>

          {/* Room cards list */}
          {rooms.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {rooms.map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--sand)', borderRadius: '10px', padding: '0.875rem 1rem' }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.15rem' }}>{r.name}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      R${r.priceReais}/noite · máx {r.maxGuests} hóspedes
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRooms(prev => prev.filter((_, j) => j !== i))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: '0.375rem' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Inline room form */}
          {editing ? (
            <div style={{ border: '1.5px solid var(--ocean-mid)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1rem', margin: 0 }}>Novo quarto</h3>
              <div>
                <label style={labelStyle}>Nome do quarto *</label>
                <input type="text" value={editing.name} onChange={e => setEditing(p => p && ({ ...p, name: e.target.value }))} placeholder="Ex: Quarto Standard" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Descrição</label>
                <textarea value={editing.description} onChange={e => setEditing(p => p && ({ ...p, description: e.target.value }))} rows={2} placeholder="Cama de casal, banheiro privativo..." style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>Preço/noite R$ *</label>
                  <input type="number" step="0.01" min="0" value={editing.priceReais} onChange={e => setEditing(p => p && ({ ...p, priceReais: e.target.value }))} placeholder="280.00" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Extra/hóspede R$</label>
                  <input type="number" step="0.01" min="0" value={editing.extraGuestReais} onChange={e => setEditing(p => p && ({ ...p, extraGuestReais: e.target.value }))} placeholder="0" style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>Máx hóspedes</label>
                  <input type="number" min="1" value={editing.maxGuests} onChange={e => setEditing(p => p && ({ ...p, maxGuests: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Mín noites</label>
                  <input type="number" min="1" value={editing.minNights} onChange={e => setEditing(p => p && ({ ...p, minNights: e.target.value }))} style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Comodidades</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.375rem' }}>
                  {AMENITY_OPTIONS.map(a => (
                    <button key={a} type="button" onClick={() => setEditing(p => p && toggleAmenity(p, a))}
                      style={{ padding: '0.3rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', cursor: 'pointer',
                        border: `1.5px solid ${editing.amenities.includes(a) ? 'var(--ocean-mid)' : 'var(--border)'}`,
                        background: editing.amenities.includes(a) ? 'var(--ocean-mid)' : 'white',
                        color: editing.amenities.includes(a) ? 'white' : 'var(--text-primary)',
                      }}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              {error && <p style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</p>}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" onClick={saveRoom} className="btn-primary" style={{ flex: 1, padding: '0.875rem', fontSize: '0.9375rem' }}>
                  Salvar quarto
                </button>
                <button type="button" onClick={() => { setEditing(null); setError('') }} style={{ padding: '0.875rem 1rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'white', cursor: 'pointer' }}>
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEditing(emptyRoom())}
              style={{ width: '100%', padding: '0.875rem', border: '1.5px dashed var(--border)', borderRadius: '10px', background: 'none', cursor: 'pointer', fontSize: '0.9375rem', color: 'var(--ocean-mid)', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Adicionar quarto
            </button>
          )}

          <form onSubmit={handleSubmit}>
            {error && !editing && (
              <p style={{ color: '#dc2626', fontSize: '0.875rem', background: '#fef2f2', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || rooms.length === 0}
              style={{ width: '100%', padding: '1rem', fontSize: '1rem', opacity: (loading || rooms.length === 0) ? 0.6 : 1, cursor: (loading || rooms.length === 0) ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Enviando...' : `Continuar com ${rooms.length} quarto${rooms.length !== 1 ? 's' : ''}`}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
```

**Importante:** o `listingId` é obtido de `sessionStorage.getItem('onboarding_listing_id')`. Verificar se a página `anuncio/page.tsx` já salva o `listing_id` após inserir o anúncio. Se não salva, adicionar em `anuncio/page.tsx` após o insert do anúncio:
```typescript
// Após inserir o anúncio e obter o id da hospedagem:
const { data: listingData } = await supabase.from('partner_listings').select('id').eq('partner_id', partnerId).eq('type', 'hospedagem').order('created_at', { ascending: false }).limit(1).single()
if (listingData) sessionStorage.setItem('onboarding_listing_id', listingData.id)
```

- [ ] **Step 4: Commit**

```bash
git add app/parceiros/cadastro/_components/WizardSteps.tsx \
        app/parceiros/cadastro/anuncio/page.tsx \
        app/parceiros/cadastro/quartos/page.tsx
git commit -m "feat(wizard): quartos step for hospedagem, dynamic WizardSteps"
```

---

## Task 5: HotelSheet — drawer de booking completo

**Files:**
- Modify: `components/hotelaria/HotelSheet.tsx` (refactor completo)

- [ ] **Step 1: Substituir o conteúdo completo de `components/hotelaria/HotelSheet.tsx`**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useCart } from '@/components/cart/CartProvider'
import type { AccommodationRoom } from '@/lib/types/database'

export type SheetListing = {
  id: string
  slug: string
  title: string
  description: string | null
  cover_image: string | null
  price_label: string | null
  whatsapp_number: string | null
  metadata: Record<string, unknown>
}

function fmtCents(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function getTodayISO() { return new Date().toISOString().split('T')[0] }

function addDays(iso: string, n: number) {
  const d = new Date(iso)
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

function diffDays(from: string, to: string) {
  return Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86400000)
}

interface Props {
  listing: SheetListing | null
  onClose: () => void
  defaultRoom?: AccommodationRoom | null
  prefetchedRooms?: AccommodationRoom[]
}

export default function HotelSheet({ listing, onClose, defaultRoom, prefetchedRooms }: Props) {
  const { addItem, openCart } = useCart()
  const tomorrow = addDays(getTodayISO(), 1)
  const dayAfter = addDays(getTodayISO(), 2)

  const [rooms, setRooms] = useState<AccommodationRoom[]>(prefetchedRooms ?? [])
  const [loadingRooms, setLoadingRooms] = useState(!prefetchedRooms || prefetchedRooms.length === 0)
  const [selectedRoom, setSelectedRoom] = useState<AccommodationRoom | null>(defaultRoom ?? null)
  const [blockedDates, setBlockedDates] = useState<string[]>([])
  const [checkIn, setCheckIn] = useState(tomorrow)
  const [checkOut, setCheckOut] = useState(dayAfter)
  const [guests, setGuests] = useState(2)

  // Fetch rooms when listing opens (unless prefetched)
  useEffect(() => {
    if (!listing) return
    if (prefetchedRooms && prefetchedRooms.length > 0) {
      setRooms(prefetchedRooms)
      setLoadingRooms(false)
      return
    }
    setLoadingRooms(true)
    const supabase = createClient()
    supabase
      .from('accommodation_rooms')
      .select('*')
      .eq('listing_id', listing.id)
      .eq('active', true)
      .order('display_order')
      .then(({ data }) => {
        setRooms(data ?? [])
        setLoadingRooms(false)
      })
  }, [listing?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Pre-select defaultRoom when provided
  useEffect(() => {
    if (defaultRoom) setSelectedRoom(defaultRoom)
  }, [defaultRoom?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch blocked dates when room selected
  useEffect(() => {
    if (!selectedRoom || !listing) return
    const supabase = createClient()
    supabase
      .from('accommodation_availability')
      .select('date')
      .eq('listing_id', listing.id)
      .or(`room_id.eq.${selectedRoom.id},room_id.is.null`)
      .neq('status', 'available')
      .then(({ data }) => setBlockedDates((data ?? []).map(r => r.date)))
  }, [selectedRoom?.id, listing?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ESC + body scroll lock
  useEffect(() => {
    if (!listing) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [listing, onClose])

  if (!listing) return null

  const minNights = selectedRoom?.min_nights ?? 1
  const maxGuests = selectedRoom?.max_guests ?? 10
  const pricePerNight = selectedRoom?.price_per_night_cents ?? 0
  const extraGuestPrice = selectedRoom?.price_extra_guest_cents ?? 0
  const nights = Math.max(0, diffDays(checkIn, checkOut))
  const extraGuests = Math.max(0, guests - 2)
  const totalCents = nights * pricePerNight + nights * extraGuests * extraGuestPrice

  const blockedSet = new Set(blockedDates)
  function hasConflict() {
    for (let i = 0; i < nights; i++) {
      if (blockedSet.has(addDays(checkIn, i))) return true
    }
    return false
  }

  const tooFewNights = nights > 0 && nights < minNights
  const conflict = nights > 0 && hasConflict()
  const canBook = !!selectedRoom && nights >= minNights && !conflict && checkOut > checkIn

  function handleCheckInChange(val: string) {
    setCheckIn(val)
    if (val >= checkOut) setCheckOut(addDays(val, minNights))
  }

  function handleBook() {
    if (!canBook || !selectedRoom) return
    addItem({
      id: `${listing!.id}-${selectedRoom.id}-${checkIn}`,
      type: 'hospedagem',
      name: `${listing!.title} — ${selectedRoom.name}`,
      date: checkIn,
      checkIn,
      checkOut,
      nights,
      guests,
      adults: guests,
      children: 0,
      priceAdultCents: 0,
      priceChildCents: 0,
      pricePerNightCents: pricePerNight,
      accommodationListingId: listing!.id,
      accommodationRoomId: selectedRoom.id,
    })
    openCart()
    onClose()
  }

  const hotelType = (listing.metadata.hotel_type as string) ?? ''
  const hotelTypeLabel: Record<string, string> = { pousada: 'Pousada', hotel: 'Hotel', airbnb: 'Airbnb' }

  return (
    <>
      {/* Overlay */}
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40, backdropFilter: 'blur(2px)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={listing.title}
        style={{
          position: 'fixed', inset: '0 0 0 auto',
          width: '100%', maxWidth: '480px',
          background: 'white', zIndex: 50,
          display: 'flex', flexDirection: 'column',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.15)',
          overflowY: 'auto',
        }}
      >
        {/* Header — sticky */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.15rem' }}>
              Hospedagem{hotelTypeLabel[hotelType] ? ` · ${hotelTypeLabel[hotelType]}` : ''}
            </p>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', color: 'var(--ocean-deep)', margin: 0 }}>
              {listing.title}
            </h2>
          </div>
          <button onClick={onClose} aria-label="Fechar"
            style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--border)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Cover */}
        {listing.cover_image && (
          <div style={{ height: '180px', overflow: 'hidden', flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={listing.cover_image} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        {/* Body */}
        <div style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Room selector */}
          <div>
            <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1rem', color: 'var(--ocean-deep)', marginBottom: '0.75rem' }}>
              Escolha o quarto
            </h3>
            {loadingRooms ? (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {[1, 2].map(i => (
                  <div key={i} style={{ flex: 1, height: '80px', background: '#f3f4f6', borderRadius: '10px', animation: 'pulse 1.5s infinite' }} />
                ))}
              </div>
            ) : rooms.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Nenhum quarto cadastrado.{' '}
                <a href={`/hotelaria/${listing.slug}`} style={{ color: 'var(--ocean-mid)', fontWeight: 600 }}>Ver página completa</a>
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {rooms.map(room => {
                  const active = selectedRoom?.id === room.id
                  return (
                    <button
                      key={room.id}
                      type="button"
                      onClick={() => setSelectedRoom(room)}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '0.875rem 1rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'left',
                        border: `2px solid ${active ? 'var(--ocean-mid)' : 'var(--border)'}`,
                        background: active ? '#e0f2fe' : 'white',
                        transition: 'border-color 0.15s, background 0.15s',
                      }}
                    >
                      <div>
                        <p style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.15rem', color: 'var(--text-primary)' }}>{room.name}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Máx {room.max_guests} hóspedes · mín {room.min_nights} noite{room.min_nights > 1 ? 's' : ''}
                        </p>
                      </div>
                      <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '1rem', fontWeight: 700, color: 'var(--ocean-deep)', whiteSpace: 'nowrap', marginLeft: '0.75rem' }}>
                        {fmtCents(room.price_per_night_cents)}<span style={{ fontSize: '0.75rem', fontWeight: 400 }}>/noite</span>
                      </p>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Dates */}
          {selectedRoom && (
            <div>
              <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1rem', color: 'var(--ocean-deep)', marginBottom: '0.75rem' }}>Datas</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>Check-in</label>
                  <input type="date" value={checkIn} min={tomorrow} onChange={e => handleCheckInChange(e.target.value)}
                    style={{ width: '100%', padding: '0.625rem 0.5rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>Check-out</label>
                  <input type="date" value={checkOut} min={addDays(checkIn, minNights)} onChange={e => setCheckOut(e.target.value)}
                    style={{ width: '100%', padding: '0.625rem 0.5rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem', boxSizing: 'border-box' }} />
                </div>
              </div>
            </div>
          )}

          {/* Guests */}
          {selectedRoom && (
            <div>
              <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1rem', color: 'var(--ocean-deep)', marginBottom: '0.75rem' }}>Hóspedes</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button type="button" onClick={() => setGuests(g => Math.max(1, g - 1))}
                  style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--border)', background: 'white', cursor: 'pointer', fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                <span style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', fontWeight: 700, minWidth: '2rem', textAlign: 'center' }}>{guests}</span>
                <button type="button" onClick={() => setGuests(g => Math.min(maxGuests, g + 1))}
                  style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--border)', background: 'white', cursor: 'pointer', fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
              </div>
              {guests > maxGuests && (
                <p style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '0.375rem' }}>
                  Máximo de {maxGuests} hóspedes para este quarto
                </p>
              )}
            </div>
          )}

          {/* Validation */}
          {tooFewNights && <p style={{ fontSize: '0.8125rem', color: '#ef4444' }}>Mínimo de {minNights} noite{minNights > 1 ? 's' : ''}</p>}
          {conflict && <p style={{ fontSize: '0.8125rem', color: '#ef4444' }}>Período com datas indisponíveis</p>}

          {/* Price summary */}
          {canBook && (
            <div style={{ background: 'var(--sand)', borderRadius: '8px', padding: '0.875rem 1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                <span>{fmtCents(pricePerNight)} × {nights} noite{nights > 1 ? 's' : ''}</span>
                <span>{fmtCents(pricePerNight * nights)}</span>
              </div>
              {extraGuests > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  <span>+{extraGuests} hóspede extra × {nights} noite{nights > 1 ? 's' : ''}</span>
                  <span>{fmtCents(extraGuestPrice * extraGuests * nights)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--ocean-deep)', paddingTop: '0.5rem', borderTop: '1px solid var(--border)', marginTop: '0.5rem' }}>
                <span>Total</span>
                <span>{fmtCents(totalCents)}</span>
              </div>
            </div>
          )}

          {/* CTA */}
          <button
            type="button"
            onClick={handleBook}
            disabled={!canBook}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', fontSize: '1rem', padding: '1rem', opacity: !canBook ? 0.5 : 1, cursor: !canBook ? 'not-allowed' : 'pointer' }}
          >
            Adicionar ao carrinho
          </button>

          <a
            href={`/hotelaria/${listing.slug}`}
            style={{ display: 'block', textAlign: 'center', fontSize: '0.875rem', color: 'var(--ocean-mid)', fontWeight: 600, textDecoration: 'none', paddingBottom: '1rem' }}
          >
            Ver página completa →
          </a>
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/hotelaria/HotelSheet.tsx
git commit -m "feat(hotelaria): HotelSheet booking drawer with room selector and cart"
```

---

## Task 6: Full page mobile fix — HotelPageClient + layout responsivo

**Files:**
- Create: `components/hotelaria/HotelPageClient.tsx`
- Modify: `app/hotelaria/[slug]/page.tsx`

- [ ] **Step 1: Criar `components/hotelaria/HotelPageClient.tsx`**

```typescript
'use client'

import { useState } from 'react'
import HotelSheet, { type SheetListing } from './HotelSheet'
import type { AccommodationRoom } from '@/lib/types/database'

function fmtCents(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

interface Props {
  listing: SheetListing
  rooms: AccommodationRoom[]
}

export default function HotelPageClient({ listing, rooms }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [defaultRoom, setDefaultRoom] = useState<AccommodationRoom | null>(null)

  function openForRoom(room: AccommodationRoom) {
    setDefaultRoom(room)
    setSheetOpen(true)
  }

  if (rooms.length === 0) return null

  return (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '1rem' }}>
          Tipos de quarto
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {rooms.map(room => (
            <div
              key={room.id}
              style={{ background: 'white', borderRadius: '14px', padding: '1.25rem', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}
            >
              <div style={{ flex: 1, minWidth: '180px' }}>
                <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.0625rem', fontWeight: 700, marginBottom: '0.25rem' }}>{room.name}</p>
                {room.description && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', lineHeight: 1.5 }}>{room.description}</p>
                )}
                {room.amenities.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                    {room.amenities.slice(0, 4).map(a => (
                      <span key={a} style={{ fontSize: '0.7rem', background: '#e0f2fe', color: '#0369a1', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{a}</span>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--ocean-deep)', marginBottom: '0.375rem' }}>
                  {fmtCents(room.price_per_night_cents)}<span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)' }}>/noite</span>
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.625rem' }}>
                  Máx {room.max_guests} hóspedes
                </p>
                <button
                  type="button"
                  onClick={() => openForRoom(room)}
                  className="btn-primary"
                  style={{ padding: '0.625rem 1.25rem', fontSize: '0.875rem' }}
                >
                  Reservar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {sheetOpen && (
        <HotelSheet
          listing={listing}
          onClose={() => setSheetOpen(false)}
          defaultRoom={defaultRoom}
          prefetchedRooms={rooms}
        />
      )}
    </>
  )
}
```

- [ ] **Step 2: Atualizar `app/hotelaria/[slug]/page.tsx` — buscar rooms + layout responsivo**

Substituir o conteúdo completo:

```typescript
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getListingBySlug } from '@/lib/partner-listings'
import { createClient } from '@/lib/supabase/server'
import AccommodationBookingWidget from '@/components/hotelaria/AccommodationBookingWidget'
import CalendarSyncBar from '@/components/hotelaria/CalendarSyncBar'
import HotelPageClient from '@/components/hotelaria/HotelPageClient'
import type { AccommodationRoom } from '@/lib/types/database'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ checkin?: string; checkout?: string; guests?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const listing = await getListingBySlug(slug)
  if (!listing) return { title: 'Hospedagem não encontrada' }
  return {
    title: `${listing.title} — Acalanto Turismo`,
    description: listing.description ?? `Hospedagem em Paraty: ${listing.title}`,
  }
}

export default async function HotelariaSlugPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams
  const listing = await getListingBySlug(slug)
  if (!listing) notFound()

  const supabase = await createClient()

  // Fetch rooms
  const { data: roomRows } = await supabase
    .from('accommodation_rooms')
    .select('*')
    .eq('listing_id', listing.id)
    .eq('active', true)
    .order('display_order')
  const rooms: AccommodationRoom[] = (roomRows ?? []) as AccommodationRoom[]

  // Fetch blocked dates (property-level)
  const { data: blockedRows } = await supabase
    .from('accommodation_availability')
    .select('date, status')
    .eq('listing_id', listing.id)
    .is('room_id', null)
    .neq('status', 'available')

  // Legacy listing-level pricing (for properties without rooms)
  const { data: accomData } = await supabase
    .from('partner_listings')
    .select('price_cents_per_night, price_cents_extra_guest, max_guests, min_nights')
    .eq('id', listing.id)
    .single()

  const meta = listing.metadata as Record<string, unknown>
  const amenities = (meta.amenities as string[]) ?? []
  const hotelType = meta.hotel_type as string | undefined
  const policies = meta.policies as string | undefined
  const hotelTypeLabel: Record<string, string> = { pousada: 'Pousada', hotel: 'Hotel', airbnb: 'Airbnb' }

  const hasRooms = rooms.length > 0
  const hasLegacyPrice = !hasRooms && !!accomData?.price_cents_per_night

  const sheetListing = {
    id: listing.id,
    slug: listing.slug,
    title: listing.title,
    description: listing.description,
    cover_image: listing.cover_image,
    price_label: listing.price_label,
    whatsapp_number: (meta.whatsapp as string) ?? null,
    metadata: meta,
  }

  return (
    <main style={{ paddingTop: '5rem', minHeight: '80vh' }}>
      {/* Hero */}
      <div style={{ height: '280px', background: 'linear-gradient(135deg, var(--ocean-mid), var(--sunset))', position: 'relative', overflow: 'hidden' }}>
        {listing.cover_image && (
          <img src={listing.cover_image} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }} />
        <div style={{ position: 'absolute', bottom: '1.75rem', left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '900px', padding: '0 1.5rem' }}>
          <Link href="/hotelaria" style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.8125rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}>
            ← Hospedagem
          </Link>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', color: 'white', lineHeight: 1.15 }}>
            {listing.title}
          </h1>
          {hotelType && (
            <span style={{ display: 'inline-block', marginTop: '0.375rem', background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.625rem', borderRadius: '999px' }}>
              {hotelTypeLabel[hotelType] ?? hotelType}
            </span>
          )}
        </div>
      </div>

      {/* Content — responsive grid */}
      <section style={{ padding: 'clamp(2rem, 5vw, 3.5rem) 1.25rem', background: 'var(--sand)' }}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: hasLegacyPrice ? 'minmax(0,1fr) minmax(0,320px)' : '1fr',
          gap: '2.5rem',
          alignItems: 'start',
        }}>
          {/* Left: main content */}
          <div>
            {listing.description && (
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>Sobre</h2>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.75, whiteSpace: 'pre-line' }}>{listing.description}</p>
              </div>
            )}

            {amenities.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>Comodidades</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem' }}>
                  {amenities.map((a: string) => (
                    <span key={a} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: 'white', border: '1px solid var(--border)', padding: '0.375rem 0.875rem', borderRadius: '999px', fontSize: '0.85rem' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--ocean-mid)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Room cards (client) */}
            {hasRooms && (
              <HotelPageClient listing={sheetListing} rooms={rooms} />
            )}

            {policies && (
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>Regras e políticas</h2>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.75, whiteSpace: 'pre-line' }}>{policies}</p>
              </div>
            )}

            <CalendarSyncBar slug={listing.slug} siteUrl={process.env.NEXT_PUBLIC_SITE_URL || 'https://acalantoturismo.com.br'} />

            <div style={{ marginTop: '1.25rem', padding: '1rem 1.25rem', background: 'white', border: '1px dashed var(--border)', borderRadius: '10px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Este é o seu negócio?{' '}
              <Link href={`/parceiros/cadastro?claim=${listing.slug}`} style={{ color: 'var(--ocean-mid)', fontWeight: 600 }}>
                Reivindique esta página
              </Link>
            </div>
          </div>

          {/* Right: legacy booking widget (only for properties without rooms) */}
          {hasLegacyPrice && (
            <div>
              <AccommodationBookingWidget
                listing={{
                  id: listing.id,
                  slug: listing.slug,
                  name: listing.title,
                  price_cents_per_night: accomData!.price_cents_per_night ?? null,
                  price_cents_extra_guest: accomData!.price_cents_extra_guest ?? null,
                  max_guests: accomData!.max_guests ?? null,
                  min_nights: accomData!.min_nights ?? null,
                }}
                blockedDates={blockedRows ?? []}
                initialCheckIn={sp.checkin}
                initialCheckOut={sp.checkout}
                initialGuests={sp.guests ? parseInt(sp.guests) : undefined}
              />
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/hotelaria/HotelPageClient.tsx app/hotelaria/[slug]/page.tsx
git commit -m "feat(hotelaria): mobile-responsive full page with room cards and HotelPageClient"
```

---

## Task 7: Webhook — bloquear disponibilidade ao confirmar pagamento

**Files:**
- Modify: `app/api/webhooks/asaas/route.ts`

- [ ] **Step 1: Substituir o conteúdo de `app/api/webhooks/asaas/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { validateWebhookToken, parseWebhookPayload } from '@/lib/asaas/webhook'

export async function POST(request: NextRequest) {
  if (!validateWebhookToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const payload = parseWebhookPayload(body)
  const supabase = await createAdminClient()

  const statusMap: Record<string, string> = {
    PAYMENT_RECEIVED:  'confirmed',
    PAYMENT_CONFIRMED: 'confirmed',
    PAYMENT_OVERDUE:   'overdue',
    PAYMENT_REFUNDED:  'refunded',
  }

  const newStatus = statusMap[payload.event]
  if (!newStatus) {
    return NextResponse.json({ received: true })
  }

  const update: Record<string, unknown> = { payment_status: newStatus }
  if (newStatus === 'confirmed') {
    update.paid_at = new Date().toISOString()
    update.status  = 'confirmed'
  }

  const { data: booking, error } = await supabase
    .from('bookings')
    .update(update)
    .eq('asaas_payment_id', payload.payment.id)
    .select('id, vertical, accommodation_room_id, tour_date, check_out')
    .single()

  if (error) {
    console.error('[webhook/asaas] DB update error:', error)
    return NextResponse.json({ received: true })
  }

  // Block accommodation dates when payment is confirmed
  if (
    newStatus === 'confirmed' &&
    booking?.vertical === 'hospedagem' &&
    booking.accommodation_room_id &&
    booking.tour_date &&
    booking.check_out
  ) {
    // Fetch room to get listing_id
    const { data: room } = await supabase
      .from('accommodation_rooms')
      .select('listing_id')
      .eq('id', booking.accommodation_room_id)
      .single()

    if (room) {
      const nights: { listing_id: string; room_id: string; date: string; status: string; source: string }[] = []
      const end = new Date(booking.check_out)
      let current = new Date(booking.tour_date)  // tour_date = check_in

      while (current < end) {
        nights.push({
          listing_id: room.listing_id,
          room_id:    booking.accommodation_room_id,
          date:       current.toISOString().split('T')[0],
          status:     'booked',
          source:     'acalanto',
        })
        current.setDate(current.getDate() + 1)
      }

      if (nights.length > 0) {
        const { error: availError } = await supabase
          .from('accommodation_availability')
          .upsert(nights, { onConflict: 'room_id,date' })

        if (availError) {
          console.error('[webhook/asaas] availability upsert error:', availError)
        }
      }
    }
  }

  return NextResponse.json({ received: true })
}
```

- [ ] **Step 2: Commit e push**

```bash
git add app/api/webhooks/asaas/route.ts
git commit -m "feat(webhook): block accommodation_availability on PAYMENT_CONFIRMED"
git push origin main
```

---

## Task 8: Salvar listing_id em sessionStorage após criar anúncio hospedagem

**Files:**
- Modify: `app/parceiros/cadastro/anuncio/page.tsx`

- [ ] **Step 1: Salvar o listing_id após insert**

No `handleSubmit` de `anuncio/page.tsx`, após o insert do anúncio, adicionar o salvamento do listing_id em sessionStorage antes de navegar:

```typescript
// Após: const { error: listingError } = await supabase.from('partner_listings').insert({...})
// Adicionar:
if (!listingError && type === 'hospedagem') {
  const { data: created } = await supabase
    .from('partner_listings')
    .select('id')
    .eq('partner_id', partnerId)
    .eq('type', 'hospedagem')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  if (created) sessionStorage.setItem('onboarding_listing_id', created.id)
}
```

- [ ] **Step 2: Commit**

```bash
git add app/parceiros/cadastro/anuncio/page.tsx
git commit -m "fix(wizard): save listing_id to sessionStorage for quartos step"
```

---

## Self-Review

**1. Spec coverage:**
- ✅ `accommodation_rooms` table com todos os campos — Task 1
- ✅ `gallery` universal — Task 1
- ✅ `accommodation_availability.room_id` — Task 1
- ✅ WizardSteps dinâmico — Task 4
- ✅ Passo Quartos hospedagem — Task 4
- ✅ HotelSheet drawer booking completo — Task 5
- ✅ Full page mobile fix + room cards — Task 6
- ✅ Webhook bloqueia datas — Task 7
- ✅ listing_id salvo em sessionStorage — Task 8

**2. Sem placeholders:** Todo código presente.

**3. Consistência de tipos:**
- `AccommodationRoom` definido em Task 2, usado em Tasks 5 e 6 ✅
- `accommodation_room_id` adicionado em Task 1 (migration), Task 2 (types), Task 3 (checkout), Task 7 (webhook) ✅
- `check_out` adicionado em Task 1, Task 2, Task 3, Task 7 ✅
- `SheetListing` mantém interface compatível com HotelariaPageClient ✅
