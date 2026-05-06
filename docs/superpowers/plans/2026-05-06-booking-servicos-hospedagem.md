# Booking de Serviços + Hospedagem + Nome Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar booking funcional (InfinitePay) para serviços (ServiceBookingWidget) e hospedagem (AccommodationBookingWidget + iCal bidirecional), e renomear Acalanto Tours → Acalanto Turismo no texto público.

**Architecture:** Services (lancha/jeep/transfer) vivem na tabela `services` — novas colunas de preço e `service_availability`. Hospedagem usa `partner_listings` com `accommodation_availability` + `ical_sources`. Ambos fluem pelo CartProvider existente → checkout → InfinitePay → webhook que bloqueia datas ao confirmar pagamento.

**Tech Stack:** Next.js 16 App Router, TypeScript, Supabase (server/client), Supabase MCP para migrations, InfinitePay Pix, RFC 5545 iCal

---

## File Map

**Criar:**
- `components/booking/ServiceBookingWidget.tsx`
- `components/hotelaria/AccommodationBookingWidget.tsx`
- `components/hotelaria/SearchBar.tsx`
- `app/api/ical/[slug]/route.ts` — export .ics
- `app/api/ical/sync/[listingId]/route.ts` — import iCal

**Modificar:**
- `components/cart/CartProvider.tsx` — extends CartItem + fix totalCents
- `lib/types/database.ts` — novos tipos
- `app/layout.tsx` — nome
- `components/layout/Header.tsx` — nome
- `components/layout/Footer.tsx` — nome
- `app/servicos/[slug]/page.tsx` — ServiceBookingWidget na lateral
- `app/hotelaria/[slug]/page.tsx` — AccommodationBookingWidget na lateral
- `app/hotelaria/page.tsx` — SearchBar + filtro
- `app/api/infinity-pay/webhook/route.ts` — bloquear datas ao pagar
- `vercel.json` — cron job iCal sync

---

## Task 0: Rename Acalanto Tours → Acalanto Turismo

**Files:**
- Modify: `app/layout.tsx`
- Modify: `components/layout/Header.tsx`
- Modify: `components/layout/Footer.tsx`

- [ ] **Step 1: Update layout.tsx**

Replace all occurrences of `Acalanto Tours` with `Acalanto Turismo` in text strings (NOT in URLs, slugs, or IDs).

In `app/layout.tsx` change:
```typescript
// jsonLd.name
name: 'Acalanto Turismo',

// metadata.title.default
default: 'Acalanto Turismo | Turismo em Paraty',
template: '%s | Acalanto Turismo',

// metadata.openGraph.siteName
siteName: 'Acalanto Turismo',
title: 'Acalanto Turismo | Turismo em Paraty',

// metadata.twitter.title  
title: 'Acalanto Turismo | Turismo em Paraty',

// metadata.description — keep "Acalanto" no link, change brand name
description: 'Tudo para seu turismo em Paraty: passeios de escuna, fotografia profissional, hospedagem selecionada e serviços exclusivos.',
```

- [ ] **Step 2: Update Header.tsx and Footer.tsx**

Open both files and replace any text "Acalanto Tours" with "Acalanto Turismo".

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx components/layout/Header.tsx components/layout/Footer.tsx
git commit -m "feat: rename Acalanto Tours → Acalanto Turismo in public text"
```

---

## Task 1: DB Migrations

**Files:**
- Supabase MCP: apply_migration × 4

- [ ] **Step 1: Add price columns to services table**

```sql
ALTER TABLE services
  ADD COLUMN IF NOT EXISTS pricing_type        text CHECK (pricing_type IN ('per_person','per_group')),
  ADD COLUMN IF NOT EXISTS price_cents_per_person integer,
  ADD COLUMN IF NOT EXISTS price_cents_group   integer,
  ADD COLUMN IF NOT EXISTS capacity_max        integer;
```

- [ ] **Step 2: Create service_availability table**

```sql
CREATE TABLE IF NOT EXISTS service_availability (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id  uuid REFERENCES services(id) ON DELETE CASCADE NOT NULL,
  date        date NOT NULL,
  available   boolean NOT NULL DEFAULT true,
  created_at  timestamptz DEFAULT now(),
  UNIQUE (service_id, date)
);
ALTER TABLE service_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read service_availability" ON service_availability FOR SELECT USING (true);
CREATE POLICY "Admin full access" ON service_availability USING (
  EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role = 'admin')
);
```

- [ ] **Step 3: Add accommodation columns to partner_listings + create accommodation_availability**

First, check if partner_listings exists and add columns:
```sql
ALTER TABLE partner_listings
  ADD COLUMN IF NOT EXISTS price_cents_per_night    integer,
  ADD COLUMN IF NOT EXISTS price_cents_extra_guest  integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_guests               integer,
  ADD COLUMN IF NOT EXISTS min_nights               integer DEFAULT 1;

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
ALTER TABLE accommodation_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read accommodation_availability" ON accommodation_availability FOR SELECT USING (true);
CREATE POLICY "Admin full access" ON accommodation_availability USING (
  EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role = 'admin')
);
```

- [ ] **Step 4: Create ical_sources table**

```sql
CREATE TABLE IF NOT EXISTS ical_sources (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id      uuid REFERENCES partner_listings(id) ON DELETE CASCADE NOT NULL,
  url             text NOT NULL,
  direction       text NOT NULL DEFAULT 'import'
    CHECK (direction IN ('import','export')),
  channel_type    text,
  channel_token   text,
  last_synced_at  timestamptz,
  sync_status     text DEFAULT 'pending'
    CHECK (sync_status IN ('pending','ok','error')),
  error_message   text,
  created_at      timestamptz DEFAULT now()
);
ALTER TABLE ical_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access" ON ical_sources USING (
  EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role = 'admin')
);
```

- [ ] **Step 5: Seed pricing data for existing services**

```sql
UPDATE services SET
  pricing_type = 'per_group',
  price_cents_group = 120000,
  capacity_max = 6
WHERE slug = 'lancha-privativa';

UPDATE services SET
  pricing_type = 'per_person',
  price_cents_per_person = 18000
WHERE slug = 'passeio-de-jeep';

UPDATE services SET
  pricing_type = 'per_person',
  price_cents_per_person = 25000
WHERE slug = 'transfer';
```

- [ ] **Step 6: Commit**

```bash
git commit -m "feat: db migrations — service pricing, service_availability, accommodation_availability, ical_sources"
```

---

## Task 2: Extend CartItem Type + CartProvider

**Files:**
- Modify: `components/cart/CartProvider.tsx`

- [ ] **Step 1: Update CartItem type and CartProvider**

Replace the entire `components/cart/CartProvider.tsx`:

```typescript
'use client'
import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export type CartItem = {
  id: string
  type: 'passeio' | 'fotografia' | 'servico' | 'hospedagem'
  name: string
  date: string // ISO date string (for passeio/fotografia/servico = tour date; for hospedagem = check-in)
  adults: number
  children: number
  priceAdultCents: number
  priceChildCents: number
  boatId?: string
  photographerPackageId?: string
  utmCampaign?: string | null
  // Serviço fields
  serviceId?: string
  pricingType?: 'per_person' | 'per_group'
  groupSize?: number
  // Hospedagem fields
  accommodationListingId?: string
  checkIn?: string    // YYYY-MM-DD
  checkOut?: string   // YYYY-MM-DD
  nights?: number
  guests?: number
  pricePerNightCents?: number
}

type CartContextType = {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  clearCart: () => void
  totalCents: number
  itemCount: number
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
}

export const CartContext = createContext<CartContextType | null>(null)

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

function itemTotal(item: CartItem): number {
  if (item.type === 'hospedagem') {
    return (item.pricePerNightCents ?? 0) * (item.nights ?? 1)
  }
  if (item.type === 'servico' && item.pricingType === 'per_group') {
    return item.priceAdultCents // priceAdultCents stores group price
  }
  return item.priceAdultCents * item.adults + item.priceChildCents * item.children
}

export default function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const addItem = useCallback((item: CartItem) => {
    setItems(prev => {
      const exists = prev.find(i => i.id === item.id)
      if (exists) return prev
      return [...prev, item]
    })
    setIsOpen(true)
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const totalCents = items.reduce((sum, item) => sum + itemTotal(item), 0)

  const itemCount = items.length

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, clearCart,
      totalCents, itemCount,
      isOpen, openCart: () => setIsOpen(true), closeCart: () => setIsOpen(false),
    }}>
      {children}
    </CartContext.Provider>
  )
}
```

- [ ] **Step 2: Update CartDrawer to display hospedagem items correctly**

In `components/cart/CartDrawer.tsx`, find the price display logic and add a case for hospedagem:

```typescript
function displayItemPrice(item: CartItem): string {
  if (item.type === 'hospedagem') {
    return `${item.nights} noite${item.nights !== 1 ? 's' : ''} × ${fmtCents(item.pricePerNightCents ?? 0)}`
  }
  if (item.type === 'servico' && item.pricingType === 'per_group') {
    return fmtCents(item.priceAdultCents)
  }
  const parts = []
  if (item.adults > 0) parts.push(`${item.adults} adulto${item.adults > 1 ? 's' : ''} × ${fmtCents(item.priceAdultCents)}`)
  if (item.children > 0) parts.push(`${item.children} criança${item.children > 1 ? 's' : ''}`)
  return parts.join(' + ')
}
```

- [ ] **Step 3: Commit**

```bash
git add components/cart/CartProvider.tsx components/cart/CartDrawer.tsx
git commit -m "feat: extend CartItem type for servico/hospedagem + fix totalCents"
```

---

## Task 3: ServiceBookingWidget

**Files:**
- Create: `components/booking/ServiceBookingWidget.tsx`

- [ ] **Step 1: Create the component**

```typescript
'use client'
import { useState } from 'react'
import { useCart } from '@/components/cart/CartProvider'

type ServiceListing = {
  id: string
  slug: string
  name: string
  pricing_type: 'per_person' | 'per_group' | null
  price_cents_per_person: number | null
  price_cents_group: number | null
  capacity_max: number | null
}

type Props = {
  service: ServiceListing
  unavailableDates?: string[] // ISO date strings
}

function fmtCents(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function getTodayISO() {
  return new Date().toISOString().split('T')[0]
}

function addDays(iso: string, n: number) {
  const d = new Date(iso)
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

export default function ServiceBookingWidget({ service, unavailableDates = [] }: Props) {
  const { addItem } = useCart()
  const [date, setDate] = useState(addDays(getTodayISO(), 1))
  const [count, setCount] = useState(1)

  const isPerGroup = service.pricing_type === 'per_group'
  const price = isPerGroup
    ? (service.price_cents_group ?? 0)
    : (service.price_cents_per_person ?? 0)
  const maxCount = isPerGroup ? (service.capacity_max ?? 20) : 20
  const isUnavailable = unavailableDates.includes(date)

  const totalCents = isPerGroup ? price : price * count

  function handleAdd() {
    if (isUnavailable || !date) return
    addItem({
      id: `${service.id}-${date}`,
      type: 'servico',
      name: service.name,
      date,
      adults: count,
      children: 0,
      priceAdultCents: isPerGroup ? price : price,
      priceChildCents: 0,
      serviceId: service.id,
      pricingType: service.pricing_type ?? 'per_person',
      groupSize: count,
    })
  }

  return (
    <div style={{
      background: 'white',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '2rem',
      boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      position: 'sticky',
      top: '90px',
    }}>
      {/* Price */}
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
          {isPerGroup ? 'Valor por grupo' : 'Valor por pessoa'}
        </p>
        <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          {fmtCents(price)}
        </p>
        {isPerGroup && service.capacity_max && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Até {service.capacity_max} pessoas
          </p>
        )}
      </div>

      {/* Date picker */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Data
        </label>
        <input
          type="date"
          value={date}
          min={addDays(getTodayISO(), 1)}
          onChange={e => setDate(e.target.value)}
          style={{
            width: '100%',
            padding: '0.625rem 0.875rem',
            border: `1px solid ${isUnavailable ? '#ef4444' : 'var(--border)'}`,
            borderRadius: '8px',
            fontSize: '0.9375rem',
            background: 'white',
            outline: 'none',
          }}
        />
        {isUnavailable && (
          <p style={{ fontSize: '0.8125rem', color: '#ef4444', marginTop: '0.25rem' }}>
            Data indisponível — escolha outra data
          </p>
        )}
      </div>

      {/* People count */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          {isPerGroup ? 'Número de pessoas no grupo' : 'Número de pessoas'}
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => setCount(c => Math.max(1, c - 1))}
            style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--border)', background: 'white', cursor: 'pointer', fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >−</button>
          <span style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', fontWeight: 700, minWidth: '2rem', textAlign: 'center' }}>{count}</span>
          <button
            onClick={() => setCount(c => Math.min(maxCount, c + 1))}
            style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--border)', background: 'white', cursor: 'pointer', fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >+</button>
        </div>
      </div>

      {/* Total */}
      {!isPerGroup && count > 1 && (
        <div style={{ background: 'var(--sand)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total ({count} pessoas)</span>
          <span style={{ fontWeight: 700, color: 'var(--ocean-deep)' }}>{fmtCents(totalCents)}</span>
        </div>
      )}

      {/* CTA */}
      <button
        onClick={handleAdd}
        disabled={isUnavailable || !date}
        className="btn-primary"
        style={{ width: '100%', justifyContent: 'center', fontSize: '1rem', opacity: (isUnavailable || !date) ? 0.5 : 1, cursor: (isUnavailable || !date) ? 'not-allowed' : 'pointer' }}
      >
        Adicionar ao carrinho
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
        {['Pagamento via Pix', 'Confirmação por e-mail', 'Equipe local em Paraty'].map(item => (
          <p key={item} style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--ocean-mid)', flexShrink: 0 }}>
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            {item}
          </p>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/booking/ServiceBookingWidget.tsx
git commit -m "feat: ServiceBookingWidget — date picker + count + cart integration"
```

---

## Task 4: Wire ServiceBookingWidget into /servicos/[slug]

**Files:**
- Modify: `app/servicos/[slug]/page.tsx`
- Modify: `app/servicos/page.tsx` (query switch from services to partner_listings — not needed, services table is correct)

- [ ] **Step 1: Update the slug page to fetch pricing columns and render widget**

In `app/servicos/[slug]/page.tsx`, update the Supabase query and add ServiceBookingWidget:

```typescript
// Change query to include pricing columns:
const { data: svc } = await supabase
  .from('services')
  .select('*, pricing_type, price_cents_per_person, price_cents_group, capacity_max')
  .eq('slug', slug)
  .eq('active', true)
  .single()

// Fetch unavailable dates:
const { data: unavailRows } = await supabase
  .from('service_availability')
  .select('date')
  .eq('service_id', svc.id)
  .eq('available', false)
const unavailableDates = (unavailRows ?? []).map(r => r.date)
```

Replace the right-column sticky CTA block with:
```typescript
import ServiceBookingWidget from '@/components/booking/ServiceBookingWidget'

// In the JSX right column:
{svc.pricing_type ? (
  <ServiceBookingWidget service={svc} unavailableDates={unavailableDates} />
) : (
  // Keep old WhatsApp CTA for services without pricing_type set yet
  <div className="service-cta-sticky" style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', position: 'sticky', top: '90px' }}>
    {/* ... existing WhatsApp block ... */}
  </div>
)}
```

- [ ] **Step 2: Commit**

```bash
git add app/servicos/
git commit -m "feat: wire ServiceBookingWidget into servicos/[slug] page"
```

---

## Task 5: AccommodationBookingWidget

**Files:**
- Create: `components/hotelaria/AccommodationBookingWidget.tsx`

- [ ] **Step 1: Create the component**

```typescript
'use client'
import { useState } from 'react'
import { useCart } from '@/components/cart/CartProvider'

type AccomListing = {
  id: string
  slug: string
  name: string
  price_cents_per_night: number | null
  price_cents_extra_guest: number | null
  max_guests: number | null
  min_nights: number | null
}

type BlockedDate = { date: string; status: string }

type Props = {
  listing: AccomListing
  blockedDates?: BlockedDate[]
  initialCheckIn?: string
  initialCheckOut?: string
  initialGuests?: number
}

function fmtCents(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function getTodayISO() {
  return new Date().toISOString().split('T')[0]
}

function addDays(iso: string, n: number) {
  const d = new Date(iso)
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

function diffDays(from: string, to: string) {
  return Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86400000)
}

function isDateBlocked(date: string, blocked: BlockedDate[]) {
  return blocked.some(b => b.date === date && b.status !== 'available')
}

function hasBlockedNight(checkIn: string, checkOut: string, blocked: BlockedDate[]) {
  const nights = diffDays(checkIn, checkOut)
  for (let i = 0; i < nights; i++) {
    if (isDateBlocked(addDays(checkIn, i), blocked)) return true
  }
  return false
}

export default function AccommodationBookingWidget({ listing, blockedDates = [], initialCheckIn, initialCheckOut, initialGuests }: Props) {
  const { addItem } = useCart()
  const tomorrow = addDays(getTodayISO(), 1)
  const dayAfter = addDays(getTodayISO(), 2)
  const [checkIn, setCheckIn] = useState(initialCheckIn ?? tomorrow)
  const [checkOut, setCheckOut] = useState(initialCheckOut ?? dayAfter)
  const [guests, setGuests] = useState(initialGuests ?? 2)

  const minNights = listing.min_nights ?? 1
  const maxGuests = listing.max_guests ?? 10
  const pricePerNight = listing.price_cents_per_night ?? 0
  const extraGuestPrice = listing.price_cents_extra_guest ?? 0
  const nights = Math.max(0, diffDays(checkIn, checkOut))

  const baseGuests = 2
  const extraGuests = Math.max(0, guests - baseGuests)
  const totalCents = nights * pricePerNight + nights * extraGuests * extraGuestPrice

  const hasConflict = nights > 0 && hasBlockedNight(checkIn, checkOut, blockedDates)
  const tooFewNights = nights > 0 && nights < minNights
  const canBook = nights >= minNights && !hasConflict && checkOut > checkIn

  function handleCheckInChange(val: string) {
    setCheckIn(val)
    if (val >= checkOut) setCheckOut(addDays(val, minNights))
  }

  function handleBook() {
    if (!canBook) return
    addItem({
      id: `${listing.id}-${checkIn}-${checkOut}`,
      type: 'hospedagem',
      name: listing.name,
      date: checkIn,
      adults: guests,
      children: 0,
      priceAdultCents: 0,
      priceChildCents: 0,
      accommodationListingId: listing.id,
      checkIn,
      checkOut,
      nights,
      guests,
      pricePerNightCents: pricePerNight,
    })
  }

  return (
    <div style={{
      background: 'white',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '2rem',
      boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      position: 'sticky',
      top: '90px',
    }}>
      {/* Price */}
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
          A partir de
        </p>
        <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          {fmtCents(pricePerNight)}
          <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--text-muted)' }}>/noite</span>
        </p>
      </div>

      {/* Check-in / Check-out */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Check-in</label>
          <input
            type="date"
            value={checkIn}
            min={tomorrow}
            onChange={e => handleCheckInChange(e.target.value)}
            style={{ width: '100%', padding: '0.625rem 0.75rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Check-out</label>
          <input
            type="date"
            value={checkOut}
            min={addDays(checkIn, minNights)}
            onChange={e => setCheckOut(e.target.value)}
            style={{ width: '100%', padding: '0.625rem 0.75rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem' }}
          />
        </div>
      </div>

      {/* Guests */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Hóspedes
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => setGuests(g => Math.max(1, g - 1))}
            style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--border)', background: 'white', cursor: 'pointer', fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
          <span style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', fontWeight: 700, minWidth: '2rem', textAlign: 'center' }}>{guests}</span>
          <button onClick={() => setGuests(g => Math.min(maxGuests, g + 1))}
            style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--border)', background: 'white', cursor: 'pointer', fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
        </div>
      </div>

      {/* Errors */}
      {tooFewNights && (
        <p style={{ fontSize: '0.8125rem', color: '#ef4444', marginBottom: '0.75rem' }}>
          Mínimo de {minNights} noite{minNights > 1 ? 's' : ''}
        </p>
      )}
      {hasConflict && (
        <p style={{ fontSize: '0.8125rem', color: '#ef4444', marginBottom: '0.75rem' }}>
          Período com datas bloqueadas ou reservadas
        </p>
      )}

      {/* Total */}
      {canBook && (
        <div style={{ background: 'var(--sand)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            <span>{fmtCents(pricePerNight)} × {nights} noite{nights > 1 ? 's' : ''}</span>
            <span>{fmtCents(pricePerNight * nights)}</span>
          </div>
          {extraGuests > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              <span>+{extraGuests} hóspede extra × {nights} noites</span>
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
        onClick={handleBook}
        disabled={!canBook}
        className="btn-primary"
        style={{ width: '100%', justifyContent: 'center', fontSize: '1rem', opacity: !canBook ? 0.5 : 1, cursor: !canBook ? 'not-allowed' : 'pointer' }}
      >
        Reservar
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
        {['Pagamento via Pix', 'Confirmação por e-mail', 'Cancelamento gratuito 48h antes'].map(item => (
          <p key={item} style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--ocean-mid)', flexShrink: 0 }}>
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            {item}
          </p>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Wire into /hotelaria/[slug]/page.tsx**

Add to the page server component:
```typescript
import AccommodationBookingWidget from '@/components/hotelaria/AccommodationBookingWidget'

// In the query, add new columns:
const { data: listing } = await supabase
  .from('partner_listings')
  .select('*, price_cents_per_night, price_cents_extra_guest, max_guests, min_nights')
  .eq('slug', slug)
  .single()

// Fetch blocked dates:
const { data: blockedRows } = await supabase
  .from('accommodation_availability')
  .select('date, status')
  .eq('listing_id', listing.id)
  .neq('status', 'available')

// Parse URL params for pre-filled dates
const searchParams = await props.searchParams
const initialCheckIn = searchParams?.checkin
const initialCheckOut = searchParams?.checkout
const initialGuests = searchParams?.guests ? parseInt(searchParams.guests) : undefined
```

Replace the current CTA/WhatsApp block with:
```typescript
<AccommodationBookingWidget
  listing={listing}
  blockedDates={blockedRows ?? []}
  initialCheckIn={initialCheckIn}
  initialCheckOut={initialCheckOut}
  initialGuests={initialGuests}
/>
```

- [ ] **Step 3: Commit**

```bash
git add components/hotelaria/AccommodationBookingWidget.tsx app/hotelaria/
git commit -m "feat: AccommodationBookingWidget — date range picker + blocked dates + cart"
```

---

## Task 6: SearchBar + filter on /hotelaria

**Files:**
- Create: `components/hotelaria/SearchBar.tsx`
- Modify: `app/hotelaria/page.tsx`

- [ ] **Step 1: Create SearchBar component**

```typescript
'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

function addDays(iso: string, n: number) {
  const d = new Date(iso)
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

function getTodayISO() {
  return new Date().toISOString().split('T')[0]
}

export default function SearchBar() {
  const router = useRouter()
  const sp = useSearchParams()
  const tomorrow = addDays(getTodayISO(), 1)
  const dayAfter = addDays(getTodayISO(), 2)

  const [checkIn, setCheckIn] = useState(sp.get('checkin') ?? tomorrow)
  const [checkOut, setCheckOut] = useState(sp.get('checkout') ?? dayAfter)
  const [guests, setGuests] = useState(sp.get('guests') ?? '2')

  function handleSearch() {
    const params = new URLSearchParams({ checkin: checkIn, checkout: checkOut, guests })
    router.push(`/hotelaria?${params.toString()}`)
  }

  function handleCheckInChange(val: string) {
    setCheckIn(val)
    if (val >= checkOut) setCheckOut(addDays(val, 1))
  }

  return (
    <div style={{
      background: 'white',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '1.25rem 1.5rem',
      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      display: 'flex',
      gap: '1rem',
      flexWrap: 'wrap',
      alignItems: 'flex-end',
    }}>
      <div style={{ flex: 1, minWidth: '140px' }}>
        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.375rem' }}>Check-in</label>
        <input
          type="date"
          value={checkIn}
          min={tomorrow}
          onChange={e => handleCheckInChange(e.target.value)}
          style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.9375rem' }}
        />
      </div>
      <div style={{ flex: 1, minWidth: '140px' }}>
        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.375rem' }}>Check-out</label>
        <input
          type="date"
          value={checkOut}
          min={addDays(checkIn, 1)}
          onChange={e => setCheckOut(e.target.value)}
          style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.9375rem' }}
        />
      </div>
      <div style={{ flex: 1, minWidth: '120px' }}>
        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.375rem' }}>Hóspedes</label>
        <select
          value={guests}
          onChange={e => setGuests(e.target.value)}
          style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.9375rem', background: 'white' }}
        >
          {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} hóspede{n > 1 ? 's' : ''}</option>)}
        </select>
      </div>
      <button
        onClick={handleSearch}
        className="btn-primary"
        style={{ whiteSpace: 'nowrap', padding: '0.625rem 1.5rem' }}
      >
        Buscar
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Update /hotelaria/page.tsx to use SearchBar and filter by availability**

In the server component, read searchParams and filter:
```typescript
import { Suspense } from 'react'
import SearchBar from '@/components/hotelaria/SearchBar'

// In the page component, accept searchParams:
export default async function HotelariaPage({ searchParams }: { searchParams: Promise<{ checkin?: string; checkout?: string; guests?: string }> }) {
  const sp = await searchParams
  const supabase = await createClient()
  
  let listingsQuery = supabase.from('partner_listings').select('*').eq('type', 'hospedagem').eq('active', true)
  
  // If search params provided, filter by availability
  if (sp.checkin && sp.checkout) {
    // Get listing IDs that have any blocked/booked night in the period
    const { data: blocked } = await supabase
      .from('accommodation_availability')
      .select('listing_id')
      .neq('status', 'available')
      .gte('date', sp.checkin)
      .lt('date', sp.checkout)
    
    const blockedIds = [...new Set((blocked ?? []).map(r => r.listing_id))]
    if (blockedIds.length > 0) {
      listingsQuery = listingsQuery.not('id', 'in', `(${blockedIds.join(',')})`)
    }
  }
  
  const { data: listings } = await listingsQuery

  return (
    <>
      {/* Hero section... */}
      <section style={{ padding: '2rem 0 1rem' }}>
        <div className="container">
          <Suspense fallback={null}>
            <SearchBar />
          </Suspense>
        </div>
      </section>
      {/* ... rest of page with listings grid ... */}
    </>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/hotelaria/SearchBar.tsx app/hotelaria/page.tsx
git commit -m "feat: hotelaria SearchBar + date-based availability filter"
```

---

## Task 7: iCal Export

**Files:**
- Create: `app/api/ical/[slug]/route.ts`

- [ ] **Step 1: Create the export endpoint**

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function escapeIcal(str: string) {
  return str.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

function toIcalDate(iso: string) {
  return iso.replace(/-/g, '')
}

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: listing } = await supabase
    .from('partner_listings')
    .select('id, name')
    .eq('slug', slug)
    .single()

  if (!listing) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const { data: booked } = await supabase
    .from('accommodation_availability')
    .select('date')
    .eq('listing_id', listing.id)
    .eq('status', 'booked')
    .eq('source', 'acalanto')
    .order('date')

  const events = (booked ?? []).map(row => {
    const startDate = toIcalDate(row.date)
    // End date = next day (iCal exclusive end for all-day events)
    const nextDay = new Date(row.date)
    nextDay.setDate(nextDay.getDate() + 1)
    const endDate = nextDay.toISOString().split('T')[0].replace(/-/g, '')
    const uid = `${row.date}-${listing.id}@acalantoturismo.com.br`

    return [
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTART;VALUE=DATE:${startDate}`,
      `DTEND;VALUE=DATE:${endDate}`,
      `SUMMARY:${escapeIcal(listing.name)} — Reservado`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
    ].join('\r\n')
  })

  const now = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z'
  const cal = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Acalanto Turismo//Hospedagem//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcal(listing.name)}`,
    ...events,
    'END:VCALENDAR',
  ].join('\r\n')

  return new NextResponse(cal, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${slug}.ics"`,
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/ical/
git commit -m "feat: iCal export endpoint GET /api/ical/[slug]"
```

---

## Task 8: iCal Import + Vercel Cron

**Files:**
- Create: `app/api/ical/sync/[listingId]/route.ts`
- Create/Modify: `vercel.json`

- [ ] **Step 1: Create the import endpoint**

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function parseIcalDates(icalText: string): string[] {
  const dates: string[] = []
  const vevents = icalText.split('BEGIN:VEVENT').slice(1)
  
  for (const vevent of vevents) {
    // Match DTSTART;VALUE=DATE:YYYYMMDD or DTSTART:YYYYMMDDTHHmmssZ
    const startMatch = vevent.match(/DTSTART(?:;[^:]+)?:(\d{8})/)
    const endMatch = vevent.match(/DTEND(?:;[^:]+)?:(\d{8})/)
    
    if (!startMatch) continue
    
    const startStr = startMatch[1]
    const endStr = endMatch ? endMatch[1] : startStr
    
    const start = new Date(
      parseInt(startStr.slice(0,4)),
      parseInt(startStr.slice(4,6)) - 1,
      parseInt(startStr.slice(6,8))
    )
    const end = new Date(
      parseInt(endStr.slice(0,4)),
      parseInt(endStr.slice(4,6)) - 1,
      parseInt(endStr.slice(6,8))
    )
    
    // Enumerate each night (exclusive end = iCal convention)
    const cur = new Date(start)
    while (cur < end) {
      dates.push(cur.toISOString().split('T')[0])
      cur.setDate(cur.getDate() + 1)
    }
  }
  
  return dates
}

export async function GET(req: Request, { params }: { params: Promise<{ listingId: string }> }) {
  const { listingId } = await params
  const supabase = await createClient()

  const { data: sources } = await supabase
    .from('ical_sources')
    .select('*')
    .eq('listing_id', listingId)
    .eq('direction', 'import')

  if (!sources?.length) {
    return NextResponse.json({ synced: 0 })
  }

  let totalSynced = 0

  for (const source of sources) {
    try {
      const res = await fetch(source.url, { next: { revalidate: 0 } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      
      const text = await res.text()
      const dates = parseIcalDates(text)

      if (dates.length > 0) {
        const rows = dates.map(date => ({
          listing_id: listingId,
          date,
          status: 'blocked' as const,
          source: 'ical' as const,
        }))

        await supabase
          .from('accommodation_availability')
          .upsert(rows, { onConflict: 'listing_id,date', ignoreDuplicates: false })
      }

      await supabase
        .from('ical_sources')
        .update({ last_synced_at: new Date().toISOString(), sync_status: 'ok', error_message: null })
        .eq('id', source.id)

      totalSynced += dates.length
    } catch (err) {
      await supabase
        .from('ical_sources')
        .update({ sync_status: 'error', error_message: String(err) })
        .eq('id', source.id)
    }
  }

  return NextResponse.json({ synced: totalSynced })
}
```

- [ ] **Step 2: Create/update vercel.json with cron**

```json
{
  "crons": [
    {
      "path": "/api/ical/cron/sync-all",
      "schedule": "0 * * * *"
    }
  ]
}
```

- [ ] **Step 3: Create cron endpoint**

Create `app/api/ical/cron/sync-all/route.ts`:

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  // Vercel cron sends Authorization header
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()
  const { data: sources } = await supabase
    .from('ical_sources')
    .select('listing_id')
    .eq('direction', 'import')

  const listingIds = [...new Set((sources ?? []).map(s => s.listing_id))]
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const results = await Promise.allSettled(
    listingIds.map(id => fetch(`${siteUrl}/api/ical/sync/${id}`))
  )

  return NextResponse.json({ triggered: listingIds.length, results: results.length })
}
```

- [ ] **Step 4: Commit**

```bash
git add app/api/ical/ vercel.json
git commit -m "feat: iCal import sync endpoint + Vercel Cron hourly job"
```

---

## Task 9: Webhook Extension — Block Dates on Payment

**Files:**
- Modify: `app/api/infinity-pay/webhook/route.ts`

- [ ] **Step 1: Add date-blocking logic to the webhook**

After the existing `await supabase.from('payments').update(...)` block, add:

```typescript
// Block dates for hospedagem
if (booking.vertical === 'hospedagem' && booking.accommodation_listing_id) {
  const checkIn = booking.tour_date // check-in date
  const nights = booking.adults // stored as adults field for hospedagem
  if (nights > 0) {
    const rows = []
    for (let i = 0; i < nights; i++) {
      const d = new Date(checkIn)
      d.setDate(d.getDate() + i)
      rows.push({
        listing_id: booking.accommodation_listing_id,
        date: d.toISOString().split('T')[0],
        status: 'booked',
        source: 'acalanto',
      })
    }
    await supabase
      .from('accommodation_availability')
      .upsert(rows, { onConflict: 'listing_id,date', ignoreDuplicates: false })
  }
}

// Block date for servico
if (booking.vertical === 'servico' && booking.service_id) {
  await supabase
    .from('service_availability')
    .upsert([{
      service_id: booking.service_id,
      date: booking.tour_date,
      available: false,
    }], { onConflict: 'service_id,date', ignoreDuplicates: false })
}
```

Note: The `bookings` table needs `accommodation_listing_id` and `service_id` columns. The checkout page must write these when creating the booking. Add to the `bookings` schema and checkout flow:
- When `item.type === 'hospedagem'`: set `accommodation_listing_id = item.accommodationListingId`, `adults = item.nights`
- When `item.type === 'servico'`: set `service_id = item.serviceId`

- [ ] **Step 2: Add missing columns to bookings table**

```sql
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS service_id               uuid REFERENCES services(id),
  ADD COLUMN IF NOT EXISTS accommodation_listing_id uuid REFERENCES partner_listings(id);
```

- [ ] **Step 3: Update checkout to write these IDs**

In `app/(marketplace)/checkout/page.tsx`, in the booking creation payload, add:
```typescript
service_id: item.serviceId ?? null,
accommodation_listing_id: item.accommodationListingId ?? null,
// For hospedagem, store nights in adults field for webhook access
adults: item.type === 'hospedagem' ? (item.nights ?? 1) : item.adults,
```

- [ ] **Step 4: Commit**

```bash
git add app/api/infinity-pay/webhook/route.ts app/(marketplace)/checkout/
git commit -m "feat: webhook blocks dates on payment confirmed (hospedagem + servico)"
```

---

## Task 10: Update database.ts Types

**Files:**
- Modify: `lib/types/database.ts`

- [ ] **Step 1: Add new table types and extend existing ones**

Add to the `services.Row`:
```typescript
pricing_type: 'per_person' | 'per_group' | null
price_cents_per_person: number | null
price_cents_group: number | null
capacity_max: number | null
```

Add to `partner_listings.Row` (if it exists in DB types):
```typescript
price_cents_per_night: number | null
price_cents_extra_guest: number | null
max_guests: number | null
min_nights: number | null
```

Add new table types:
```typescript
service_availability: {
  Row: {
    id: string
    service_id: string
    date: string
    available: boolean
    created_at: string
  }
  Insert: Omit<..., 'id' | 'created_at'>
  Update: Partial<...'Insert'>
}
accommodation_availability: {
  Row: {
    id: string
    listing_id: string
    date: string
    status: 'available' | 'blocked' | 'booked'
    source: 'manual' | 'ical' | 'acalanto'
    created_at: string
  }
  Insert: Omit<..., 'id' | 'created_at'>
  Update: Partial<...'Insert'>
}
ical_sources: {
  Row: {
    id: string
    listing_id: string
    url: string
    direction: 'import' | 'export'
    channel_type: string | null
    channel_token: string | null
    last_synced_at: string | null
    sync_status: 'pending' | 'ok' | 'error'
    error_message: string | null
    created_at: string
  }
  Insert: Omit<..., 'id' | 'created_at'>
  Update: Partial<...'Insert'>
}
```

Also add to `bookings.Row`:
```typescript
service_id: string | null
accommodation_listing_id: string | null
```

- [ ] **Step 2: Commit**

```bash
git add lib/types/database.ts
git commit -m "feat: update database.ts types for new tables and columns"
```

---

## Final: Push + Deploy Monitor

- [ ] **Step 1: Push all commits**

```bash
git push origin master
```

- [ ] **Step 2: Monitor Vercel deploy**

Spawn background agent watching for READY status. Fix any build errors.
