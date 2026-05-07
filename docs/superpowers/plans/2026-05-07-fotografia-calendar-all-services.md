# Fotografia Booking + Visual Calendar for All Services

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a visual date-picker calendar to every service booking widget (ServiceBookingWidget, photography), replacing the plain `<input type="date">`, and add a full cart-based booking flow to the fotografia detail page.

**Architecture:** A reusable `DatePickerCalendar` client component renders a month grid, marks unavailable dates in red, and returns the selected ISO date. `ServiceBookingWidget` and a new `PhotographyBookingWidget` use it. The fotografia slug page gets the new widget instead of the current WhatsApp-only CTA. Photographer packages already have `price_cents` in DB — no migration needed.

**Tech Stack:** Next.js 15 App Router, TypeScript, Supabase (service_availability table already exists), CartProvider (useCart), inline CSS (no new deps).

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `components/ui/DatePickerCalendar.tsx` | Reusable visual monthly calendar, marks unavailable days |
| Modify | `components/booking/ServiceBookingWidget.tsx` | Replace `<input type="date">` with `DatePickerCalendar` |
| Create | `components/photography/PhotographyBookingWidget.tsx` | Full booking widget for photography packages (date + package select + cart) |
| Modify | `app/fotografia/[slug]/page.tsx` | Fetch unavail dates, render `PhotographyBookingWidget` instead of WhatsApp-only sticky |
| Modify | `app/api/infinity-pay/create/route.ts` | Handle `type: 'fotografia'` price lookup from `photographer_packages.price_cents` |

---

## Task 1: DatePickerCalendar component

**Files:**
- Create: `components/ui/DatePickerCalendar.tsx`

- [ ] **Step 1: Create the component**

```tsx
// components/ui/DatePickerCalendar.tsx
'use client'
import { useState } from 'react'

type Props = {
  value: string        // selected ISO date, e.g. "2026-06-10"
  onChange: (iso: string) => void
  unavailableDates?: string[]   // ISO dates to block
  minDate?: string     // ISO — default: tomorrow
}

function getTodayISO() {
  return new Date().toISOString().split('T')[0]
}

function addDays(iso: string, n: number) {
  const d = new Date(iso + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

function isoToYM(iso: string) {
  const [y, m] = iso.split('-')
  return { year: Number(y), month: Number(m) }
}

const MONTHS_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const DAYS_PT = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

export default function DatePickerCalendar({ value, onChange, unavailableDates = [], minDate }: Props) {
  const effectiveMin = minDate ?? addDays(getTodayISO(), 1)
  const init = value && value >= effectiveMin ? isoToYM(value) : isoToYM(effectiveMin)
  const [year, setYear] = useState(init.year)
  const [month, setMonth] = useState(init.month) // 1-based

  const unavailSet = new Set(unavailableDates)

  function daysInMonth(y: number, m: number) {
    return new Date(y, m, 0).getDate()
  }

  function firstDayOfWeek(y: number, m: number) {
    return new Date(y, m - 1, 1).getDay()
  }

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const totalDays = daysInMonth(year, month)
  const startDow = firstDayOfWeek(year, month)
  const cells: (number | null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', background: 'white', userSelect: 'none' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)' }}>
        <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem 0.5rem', fontSize: '1rem', color: 'var(--ocean-mid)' }}>‹</button>
        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
          {MONTHS_PT[month - 1]} {year}
        </span>
        <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem 0.5rem', fontSize: '1rem', color: 'var(--ocean-mid)' }}>›</button>
      </div>

      {/* Day labels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0.5rem 0.75rem 0' }}>
        {DAYS_PT.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', paddingBottom: '0.375rem' }}>{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 0.75rem 0.75rem', gap: '2px' }}>
        {cells.map((day, idx) => {
          if (day === null) return <div key={`e${idx}`} />
          const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isPast = iso < effectiveMin
          const isUnavail = unavailSet.has(iso)
          const isSelected = iso === value
          const disabled = isPast || isUnavail

          return (
            <button
              key={iso}
              onClick={() => !disabled && onChange(iso)}
              disabled={disabled}
              style={{
                padding: '0.35rem 0',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.825rem',
                fontWeight: isSelected ? 700 : 400,
                cursor: disabled ? 'not-allowed' : 'pointer',
                background: isSelected
                  ? 'var(--ocean-mid)'
                  : isUnavail
                  ? '#fee2e2'
                  : isPast
                  ? 'transparent'
                  : 'transparent',
                color: isSelected
                  ? 'white'
                  : isUnavail
                  ? '#ef4444'
                  : isPast
                  ? '#d1d5db'
                  : 'var(--text-primary)',
                textDecoration: isUnavail ? 'line-through' : 'none',
                transition: 'background 0.15s',
              }}
            >
              {day}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ padding: '0.5rem 1rem 0.75rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--ocean-mid)', display: 'inline-block' }} />
          Selecionado
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#fee2e2', border: '1px solid #ef4444', display: 'inline-block' }} />
          Indisponível
        </span>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/ui/DatePickerCalendar.tsx
git commit -m "feat: add DatePickerCalendar reusable component"
```

---

## Task 2: Swap ServiceBookingWidget to use DatePickerCalendar

**Files:**
- Modify: `components/booking/ServiceBookingWidget.tsx`

- [ ] **Step 1: Replace the date `<input>` with DatePickerCalendar**

Replace the entire file `components/booking/ServiceBookingWidget.tsx` with:

```tsx
'use client'
import { useState } from 'react'
import { useCart } from '@/components/cart/CartProvider'
import DatePickerCalendar from '@/components/ui/DatePickerCalendar'

export type ServiceForWidget = {
  id: string
  slug: string
  name: string
  pricing_type: 'per_person' | 'per_group' | null
  price_cents_per_person: number | null
  price_cents_group: number | null
  capacity_max: number | null
}

type Props = {
  service: ServiceForWidget
  unavailableDates?: string[]
}

function fmtCents(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function getTodayISO() {
  return new Date().toISOString().split('T')[0]
}

function addDays(iso: string, n: number) {
  const d = new Date(iso + 'T12:00:00')
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
      priceAdultCents: price,
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
      {/* Price header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
          {isPerGroup ? 'Valor por grupo' : 'Valor por pessoa'}
        </p>
        <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
          {fmtCents(price)}
        </p>
        {isPerGroup && service.capacity_max && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Até {service.capacity_max} pessoas
          </p>
        )}
      </div>

      {/* Visual calendar */}
      <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.625rem' }}>
          Escolha a data
        </label>
        <DatePickerCalendar
          value={date}
          onChange={setDate}
          unavailableDates={unavailableDates}
        />
      </div>

      {/* Count */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          {isPerGroup ? 'Pessoas no grupo' : 'Número de pessoas'}
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => setCount(c => Math.max(1, c - 1))}
            style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--border)', background: 'white', cursor: 'pointer', fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >−</button>
          <span style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', fontWeight: 700, minWidth: '2rem', textAlign: 'center' }}>{count}</span>
          <button
            onClick={() => setCount(c => Math.min(maxCount, c + 1))}
            style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--border)', background: 'white', cursor: 'pointer', fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >+</button>
        </div>
        {isPerGroup && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>
            Preço fixo para o grupo inteiro
          </p>
        )}
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
        style={{
          width: '100%',
          justifyContent: 'center',
          fontSize: '1rem',
          opacity: (isUnavailable || !date) ? 0.5 : 1,
          cursor: (isUnavailable || !date) ? 'not-allowed' : 'pointer',
        }}
      >
        Adicionar ao carrinho
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
        {['Pagamento via Pix ou cartão', 'Confirmação por e-mail', 'Equipe local em Paraty'].map(item => (
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
git commit -m "feat: replace date input with visual calendar in ServiceBookingWidget"
```

---

## Task 3: PhotographyBookingWidget

**Files:**
- Create: `components/photography/PhotographyBookingWidget.tsx`

- [ ] **Step 1: Create the widget**

```tsx
// components/photography/PhotographyBookingWidget.tsx
'use client'
import { useState } from 'react'
import { useCart } from '@/components/cart/CartProvider'
import DatePickerCalendar from '@/components/ui/DatePickerCalendar'

export type PhotographyPackageForWidget = {
  id: string
  slug: string
  name: string
  price_cents: number | null
  price_label: string | null
  duration_label: string | null
  includes: string[]
}

type Props = {
  pkg: PhotographyPackageForWidget
  unavailableDates?: string[]
}

function fmtCents(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function getTodayISO() {
  return new Date().toISOString().split('T')[0]
}

function addDays(iso: string, n: number) {
  const d = new Date(iso + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

export default function PhotographyBookingWidget({ pkg, unavailableDates = [] }: Props) {
  const { addItem, openCart } = useCart()
  const [date, setDate] = useState(addDays(getTodayISO(), 1))
  const [added, setAdded] = useState(false)

  const isUnavailable = unavailableDates.includes(date)
  const priceCents = pkg.price_cents ?? 0
  const canAdd = !!date && !isUnavailable && priceCents > 0

  function handleAdd() {
    if (!canAdd) return
    const utmCampaign = typeof window !== 'undefined' ? sessionStorage.getItem('utm_campaign') : null
    addItem({
      id: `${pkg.id}-${date}`,
      type: 'fotografia',
      name: pkg.name,
      date,
      adults: 1,
      children: 0,
      priceAdultCents: priceCents,
      priceChildCents: 0,
      photographerPackageId: pkg.id,
      utmCampaign: utmCampaign ?? null,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2500)
    openCart()
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
          Valor do pacote
        </p>
        <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--ocean-deep)', letterSpacing: '-0.02em', margin: 0 }}>
          {priceCents > 0 ? fmtCents(priceCents) : (pkg.price_label ?? 'Consultar')}
        </p>
        {pkg.duration_label && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {pkg.duration_label}
          </p>
        )}
      </div>

      {/* Calendar */}
      {priceCents > 0 ? (
        <>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.625rem' }}>
              Data do passeio
            </label>
            <DatePickerCalendar
              value={date}
              onChange={setDate}
              unavailableDates={unavailableDates}
            />
          </div>

          <button
            onClick={handleAdd}
            disabled={!canAdd || added}
            className="btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              fontSize: '1rem',
              opacity: (!canAdd || added) ? 0.6 : 1,
              cursor: (!canAdd || added) ? 'not-allowed' : 'pointer',
              background: added ? '#16a34a' : undefined,
            }}
          >
            {added ? '✓ Adicionado ao carrinho' : 'Adicionar ao carrinho'}
          </button>
        </>
      ) : (
        <a
          href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5524999627968'}?text=${encodeURIComponent(`Olá! Tenho interesse no pacote "${pkg.name}". Poderia me informar disponibilidade?`)}`}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem',
            width: '100%', background: '#25D366', color: 'white',
            padding: '0.875rem', borderRadius: '0.75rem', textDecoration: 'none',
            fontWeight: 700, fontSize: '1rem',
          }}
        >
          💬 Consultar pelo WhatsApp
        </a>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
        {['Fotógrafo embarca junto na escuna', 'Fotos editadas em 48h', 'Link privado de download'].map(item => (
          <p key={item} style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--vertical-fotografia, #f59e0b)', flexShrink: 0 }}>
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
git add components/photography/PhotographyBookingWidget.tsx
git commit -m "feat: add PhotographyBookingWidget with visual calendar"
```

---

## Task 4: Wire PhotographyBookingWidget into fotografia/[slug]/page.tsx

**Files:**
- Modify: `app/fotografia/[slug]/page.tsx`

- [ ] **Step 1: Fetch unavailable dates for photography package and render widget**

In `app/fotografia/[slug]/page.tsx`, replace the server component to:

1. Import `PhotographyBookingWidget` and `PhotographyPackageForWidget`
2. Fetch `service_availability` rows for the photography service (by convention, use `service_id = pkg.id` or a dedicated photography_availability table — for now query `service_availability` where `service_id = pkg.id`)
3. Pass data to the widget

Replace the sticky CTA `<div>` (the `/* Right: Sticky CTA */` section in the file, roughly lines 105–165) with:

```tsx
// At top of file, add import:
import PhotographyBookingWidget from '@/components/photography/PhotographyBookingWidget'
import type { PhotographyPackageForWidget } from '@/components/photography/PhotographyBookingWidget'

// Inside the server component, after fetching pkg, add:
const { data: unavailRows } = await supabase
  .from('service_availability')
  .select('date')
  .eq('service_id', typedPkg.id)
  .eq('available', false)
const unavailableDates = (unavailRows ?? []).map((r: { date: string }) => r.date)

const pkgForWidget: PhotographyPackageForWidget = {
  id: typedPkg.id,
  slug: typedPkg.slug,
  name: typedPkg.name,
  price_cents: typedPkg.price_cents,
  price_label: typedPkg.price_label,
  duration_label: typedPkg.duration_label,
  includes: typedPkg.includes,
}

// Replace the sticky CTA div with:
<PhotographyBookingWidget pkg={pkgForWidget} unavailableDates={unavailableDates} />
```

The full replacement for the right column in the grid (inside `{/* Right: Sticky CTA */}<div>`):

```tsx
{/* Right: Booking widget */}
<div>
  <PhotographyBookingWidget pkg={pkgForWidget} unavailableDates={unavailableDates} />
</div>
```

Remove the old WhatsApp `waLink` / `waMessage` sticky card.

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /path/to/acalanto-tours
npx tsc --noEmit
```

Expected: no errors related to the changed files.

- [ ] **Step 3: Commit**

```bash
git add app/fotografia/\[slug\]/page.tsx
git commit -m "feat: replace WhatsApp CTA with PhotographyBookingWidget on fotografia detail page"
```

---

## Task 5: Fix infinity-pay/create to price fotografia from DB

**Files:**
- Modify: `app/api/infinity-pay/create/route.ts`

- [ ] **Step 1: Add price lookup for fotografia items**

In the price calculation loop (after the `} else if (item.accommodationListingId) {` block, around line 78), add:

```typescript
} else if (item.photographerPackageId) {
  const { data: photoPkg } = await supabase
    .from('photographer_packages')
    .select('price_cents')
    .eq('id', item.photographerPackageId)
    .single()
  if (!photoPkg || !photoPkg.price_cents) {
    return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 400 })
  }
  totalAmountCents += photoPkg.price_cents
}
```

Also update the `CartItemInput` interface at the top to include `photographerPackageId`:

```typescript
interface CartItemInput {
  boatId?: string | null
  serviceId?: string | null
  accommodationListingId?: string | null
  photographerPackageId?: string | null   // ← add this line
  name: string
  date: string
  adults: number
  children: number
  type: 'passeio' | 'fotografia' | 'servico' | 'hospedagem'
  checkIn?: string | null
  checkOut?: string | null
  nights?: number | null
  guests?: number | null
  pricePerNightCents?: number | null
}
```

Also update the booking insert to handle `type: 'fotografia'`:

```typescript
const { data: booking } = await supabase
  .from('bookings')
  .insert({
    boat_id: firstItem.boatId ?? null,
    service_id: firstItem.serviceId ?? null,
    accommodation_listing_id: firstItem.accommodationListingId ?? null,
    photographer_package_id: firstItem.photographerPackageId ?? null,  // ← add
    tour_date: tourDate || null,
    adults: firstItem.type === 'hospedagem' ? (firstItem.guests ?? firstItem.adults) : firstItem.adults,
    children: firstItem.children,
    total_cents: totalAmountCents,
    customer_name: customerName,
    customer_email: customerEmail,
    customer_phone: customerPhone,
    status: 'pending',
    vertical: firstItem.type,
    utm_campaign: utmCampaign ?? null,
    commission_rate: commissionRate,
    notes: firstItem.type === 'hospedagem' && firstItem.checkOut
      ? `check-out: ${firstItem.checkOut}`
      : null,
  })
```

- [ ] **Step 2: Commit**

```bash
git add app/api/infinity-pay/create/route.ts
git commit -m "feat: price fotografia items from DB in checkout API"
```

---

## Task 6: Push and verify deploy

- [ ] **Step 1: Push**

```bash
git push
```

- [ ] **Step 2: Verify in browser**
  - Open `/servicos/lancha-privativa` → should show visual calendar grid (not HTML date input)
  - Open `/servicos/passeio-de-jeep` → same
  - Open `/fotografia/[any-active-slug]` → should show sticky booking widget with calendar and "Adicionar ao carrinho" button
  - Add a photography item → cart should open, item should appear, checkout should work

- [ ] **Step 3: Commit if any fixes needed**

```bash
git add -p
git commit -m "fix: post-deploy corrections for calendar and photography booking"
```

---

*Last updated: 2026-05-07*
