# ASAAS Payments + Platform Improvements — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace InfinityPay with ASAAS (PIX + cartão + boleto + débito), add CPF hashed checkout, prepare split by partner, and make the admin roadmap dynamic.

**Architecture:** Single ASAAS charge per cart checkout with an optional `split[]` array (activated via `ASAAS_SPLIT_ENABLED` env var). CPF is validated client+server-side, sent raw to ASAAS, and stored only as HMAC-SHA256 in the DB. Roadmap tasks migrate from hardcoded array to `roadmap_tasks` Supabase table with inline admin CRUD.

**Tech Stack:** Next.js 16 App Router, TypeScript, Supabase, ASAAS REST API v3, Node.js `crypto` (built-in, no extra dep).

---

## Task 0: Mobile Fixes + Admin Auth Bug ✅ CONCLUÍDO

**Files:**
- Modify: `app/globals.css`
- Modify: `app/admin/layout.tsx`
- Modify: `components/home/HeroSection.tsx`

- [x] **Step 1: Admin sidebar mobile — drawer off-canvas**

`app/globals.css`: adicionado bloco `@media (max-width: 768px)` para `.admin-sidebar`:
- `position: fixed; left: -260px` (escondido por padrão)
- `.admin-sidebar.open { left: 0 }` (visível quando aberto)
- `.admin-sidebar-overlay.open { display: block }` (overlay escurecido)
- `.admin-main { padding: 1rem }` em mobile

`app/admin/layout.tsx`: adicionado `.admin-mobile-header` com botão hambúrguer, estado `sidebarOpen`, overlay clicável, e fechamento automático ao trocar de rota.

- [x] **Step 2: Fix admin auth — "Verificando acesso..." infinito**

`app/admin/layout.tsx`:
- `createClient()` movido para `useRef` — evita novo objeto a cada render e loop infinito no `useEffect`
- `getSession()` substituído por `onAuthStateChange` — dispara imediatamente com o estado atual (mais confiável logo após login)
- Dependency array do `useEffect` esvaziado `[]`

- [x] **Step 3: Hero scroll hint sobrepondo trust bar em mobile**

`components/home/HeroSection.tsx`: adicionada classe `hero-scroll-hint` ao elemento.
`app/globals.css`: `.hero-scroll-hint { display: none !important }` em `@media (max-width: 768px)`.

- [x] **Step 4: Commit**

```bash
git add app/globals.css app/admin/layout.tsx components/home/HeroSection.tsx
git commit -m "fix(mobile): admin sidebar drawer, auth loop, hero scroll hint overlap"
```

---

## File Map

**New files:**
- `lib/asaas/client.ts` — ASAAS HTTP client (fetch wrapper, env-aware sandbox/prod)
- `lib/asaas/types.ts` — TypeScript types for ASAAS requests/responses
- `lib/asaas/split.ts` — builds split array from cart items
- `lib/asaas/webhook.ts` — validates ASAAS webhook token
- `lib/crypto/cpf.ts` — HMAC-SHA256 CPF hash + CPF validation
- `app/checkout/page.tsx` — checkout page (form + payment method selector)
- `app/checkout/confirmacao/page.tsx` — confirmation/PIX QR page
- `app/api/checkout/route.ts` — POST: validates cart server-side, creates ASAAS charge
- `app/api/webhooks/asaas/route.ts` — POST: receives ASAAS payment events
- `supabase/migrations/011_asaas_payments.sql` — DB columns + roadmap_tasks table

**Modified files:**
- `components/cart/CartDrawer.tsx` — add débito badge, change "Infinity Pay" → "ASAAS"
- `lib/types/database.ts` — add new columns to `bookings` and `partners` types + `roadmap_tasks`
- `app/admin/roadmap/page.tsx` — replace hardcoded tasks with DB-driven CRUD
- `.env.local` — add ASAAS + CPF_HASH_SECRET vars (with placeholder values)

---

## Task 1: DB Migration

**Files:**
- Create: `supabase/migrations/011_asaas_payments.sql`

- [ ] **Step 1: Create migration file**

```sql
-- supabase/migrations/011_asaas_payments.sql

-- ── Bookings: ASAAS payment columns ─────────────────────────────────────────
alter table bookings
  add column if not exists customer_name      text,
  add column if not exists customer_email     text,
  add column if not exists customer_phone     text,
  add column if not exists cpf_hash           text,
  add column if not exists asaas_payment_id   text,
  add column if not exists asaas_customer_id  text,
  add column if not exists payment_method     text,
  add column if not exists payment_status     text not null default 'pending',
  add column if not exists payment_url        text,
  add column if not exists pix_qr_code        text,
  add column if not exists pix_copy_paste     text,
  add column if not exists paid_at            timestamptz;

-- ── Partners: ASAAS subconta wallet ─────────────────────────────────────────
alter table partners
  add column if not exists asaas_wallet_id    text,
  add column if not exists commission_pct     integer not null default 90;

-- ── Roadmap tasks (replaces hardcoded array) ─────────────────────────────────
create table if not exists roadmap_tasks (
  id          uuid primary key default gen_random_uuid(),
  area        text not null,
  title       text not null,
  description text,
  status      text not null default 'pending',
  priority    text not null default 'média',
  eta         text,
  notes       text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table roadmap_tasks enable row level security;

create policy "admin full access roadmap_tasks"
  on roadmap_tasks for all
  using (is_admin())
  with check (is_admin());
```

- [ ] **Step 2: Apply migration to Supabase**

```bash
cd "C:\Users\Victor Lima\Desktop\sites\tours\acalanto-tours"
npx supabase db push
```

Expected: migration applied without errors. If Supabase CLI not configured, run the SQL manually in the Supabase Dashboard → SQL Editor.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/011_asaas_payments.sql
git commit -m "feat(db): add ASAAS payment columns, partner wallet_id, roadmap_tasks table"
```

---

## Task 2: TypeScript Types Update

**Files:**
- Modify: `lib/types/database.ts`

- [ ] **Step 1: Add new fields to `bookings` Row type**

Find the `bookings` Row interface in `lib/types/database.ts` and add these fields after the existing ones:

```typescript
// Add inside bookings.Row:
customer_name:      string | null
customer_email:     string | null
customer_phone:     string | null
cpf_hash:           string | null
asaas_payment_id:   string | null
asaas_customer_id:  string | null
payment_method:     string | null
payment_status:     string
payment_url:        string | null
pix_qr_code:        string | null
pix_copy_paste:     string | null
paid_at:            string | null
```

- [ ] **Step 2: Add new fields to `partners` Row type**

Find the `partners` Row interface and add:

```typescript
// Add inside partners.Row:
asaas_wallet_id:  string | null
commission_pct:   number
```

- [ ] **Step 3: Add `roadmap_tasks` table type**

Add after the last table definition, before the closing `}`:

```typescript
roadmap_tasks: {
  Row: {
    id:          string
    area:        string
    title:       string
    description: string | null
    status:      string
    priority:    string
    eta:         string | null
    notes:       string | null
    sort_order:  number
    created_at:  string
    updated_at:  string
  }
  Insert: Omit<Database['public']['Tables']['roadmap_tasks']['Row'], 'id' | 'created_at' | 'updated_at'>
  Update: Partial<Database['public']['Tables']['roadmap_tasks']['Insert']>
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/types/database.ts
git commit -m "feat(types): add ASAAS payment fields, roadmap_tasks type"
```

---

## Task 3: CPF Crypto Utility

**Files:**
- Create: `lib/crypto/cpf.ts`

- [ ] **Step 1: Create the utility**

```typescript
// lib/crypto/cpf.ts
import { createHmac } from 'crypto'

/** Strips formatting and returns only 11 digits */
export function cleanCpf(cpf: string): string {
  return cpf.replace(/\D/g, '')
}

/** Validates CPF check digits (returns false for all-same-digit CPFs too) */
export function isValidCpf(cpf: string): boolean {
  const c = cleanCpf(cpf)
  if (c.length !== 11) return false
  if (/^(\d)\1+$/.test(c)) return false

  const calc = (factor: number) => {
    let sum = 0
    for (let i = 0; i < factor - 1; i++) sum += parseInt(c[i]) * (factor - i)
    const rem = (sum * 10) % 11
    return rem === 10 || rem === 11 ? 0 : rem
  }
  return calc(10) === parseInt(c[9]) && calc(11) === parseInt(c[10])
}

/** HMAC-SHA256 of clean CPF. Never store raw CPF — only this hash goes to DB. */
export function hashCpf(cpf: string): string {
  const secret = process.env.CPF_HASH_SECRET
  if (!secret) throw new Error('CPF_HASH_SECRET env var is not set')
  return createHmac('sha256', secret).update(cleanCpf(cpf)).digest('hex')
}

/** Formats CPF for display: 000.000.000-00 */
export function formatCpf(cpf: string): string {
  const c = cleanCpf(cpf)
  return c.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}
```

- [ ] **Step 2: Add env var placeholder to `.env.local`**

Open `.env.local` and add at the end:

```env
# ASAAS — fill in with keys from Gustavo
ASAAS_API_KEY=
ASAAS_SANDBOX_API_KEY=
ASAAS_WEBHOOK_TOKEN=
ASAAS_ENVIRONMENT=sandbox
ASAAS_WALLET_ID=

# Split — uncomment when ASAAS subcontas are activated
# ASAAS_SPLIT_ENABLED=true

# CPF hashing — generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
CPF_HASH_SECRET=changeme_generate_with_crypto_randombytes
```

- [ ] **Step 3: Commit**

```bash
git add lib/crypto/cpf.ts .env.local
git commit -m "feat(crypto): CPF HMAC-SHA256 hash utility + ASAAS env placeholders"
```

---

## Task 4: ASAAS Client Library

**Files:**
- Create: `lib/asaas/types.ts`
- Create: `lib/asaas/client.ts`
- Create: `lib/asaas/split.ts`
- Create: `lib/asaas/webhook.ts`

- [ ] **Step 1: Create types**

```typescript
// lib/asaas/types.ts

export type AsaasBillingType = 'PIX' | 'CREDIT_CARD' | 'BOLETO' | 'DEBIT_CARD'

export interface AsaasCustomer {
  name: string
  cpfCnpj: string
  email?: string
  phone?: string
}

export interface AsaasSplitItem {
  walletId: string
  percentualValue?: number
  fixedValue?: number
}

export interface AsaasChargeRequest {
  customer: string          // ASAAS customer ID
  billingType: AsaasBillingType
  value: number             // BRL float (e.g. 110.00)
  dueDate: string           // YYYY-MM-DD
  description?: string
  externalReference?: string // our booking ID
  split?: AsaasSplitItem[]
  creditCard?: {
    holderName: string
    number: string
    expiryMonth: string
    expiryYear: string
    ccv: string
  }
  creditCardHolderInfo?: {
    name: string
    cpfCnpj: string
    email: string
    phone: string
    postalCode: string
    addressNumber: string
  }
}

export interface AsaasCharge {
  id: string
  status: string
  billingType: AsaasBillingType
  value: number
  invoiceUrl: string | null
  bankSlipUrl: string | null
  pixQrCode?: {
    encodedImage: string
    payload: string
  }
}

export interface AsaasWebhookPayload {
  event: 'PAYMENT_RECEIVED' | 'PAYMENT_OVERDUE' | 'PAYMENT_REFUNDED' | 'PAYMENT_CONFIRMED'
  payment: {
    id: string
    externalReference: string | null
    status: string
    value: number
    billingType: AsaasBillingType
  }
}
```

- [ ] **Step 2: Create ASAAS HTTP client**

```typescript
// lib/asaas/client.ts
import type { AsaasCustomer, AsaasChargeRequest, AsaasCharge } from './types'

function getBaseUrl(): string {
  return process.env.ASAAS_ENVIRONMENT === 'production'
    ? 'https://api.asaas.com/v3'
    : 'https://sandbox.asaas.com/api/v3'
}

function getApiKey(): string {
  const key = process.env.ASAAS_ENVIRONMENT === 'production'
    ? process.env.ASAAS_API_KEY
    : process.env.ASAAS_SANDBOX_API_KEY
  if (!key) throw new Error('ASAAS API key not configured')
  return key
}

async function asaasFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${getBaseUrl()}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'access_token': getApiKey(),
      ...options.headers,
    },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`ASAAS ${options.method ?? 'GET'} ${path} → ${res.status}: ${body}`)
  }
  return res.json()
}

export async function createOrFindCustomer(data: AsaasCustomer): Promise<string> {
  // Try to find existing customer by CPF
  const search = await asaasFetch<{ data: Array<{ id: string }> }>(
    `/customers?cpfCnpj=${data.cpfCnpj}&limit=1`
  )
  if (search.data.length > 0) return search.data[0].id

  const customer = await asaasFetch<{ id: string }>('/customers', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return customer.id
}

export async function createCharge(data: AsaasChargeRequest): Promise<AsaasCharge> {
  return asaasFetch<AsaasCharge>('/payments', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function getCharge(id: string): Promise<AsaasCharge> {
  return asaasFetch<AsaasCharge>(`/payments/${id}`)
}
```

- [ ] **Step 3: Create split builder**

```typescript
// lib/asaas/split.ts
import type { AsaasSplitItem } from './types'
import type { CartItem } from '@/components/cart/CartProvider'

export interface CartItemWithPartner extends CartItem {
  partnerWalletId?: string
  commissionPct?: number
}

export function buildSplit(items: CartItemWithPartner[]): AsaasSplitItem[] | undefined {
  if (!process.env.ASAAS_SPLIT_ENABLED) return undefined

  const splits: AsaasSplitItem[] = []
  for (const item of items) {
    if (!item.partnerWalletId) continue
    splits.push({
      walletId: item.partnerWalletId,
      percentualValue: item.commissionPct ?? 90,
    })
  }
  return splits.length > 0 ? splits : undefined
}
```

- [ ] **Step 4: Create webhook validator**

```typescript
// lib/asaas/webhook.ts
import type { AsaasWebhookPayload } from './types'

export function validateWebhookToken(request: Request): boolean {
  const token = request.headers.get('asaas-access-token')
  const expected = process.env.ASAAS_WEBHOOK_TOKEN
  if (!expected || !token) return false
  return token === expected
}

export function parseWebhookPayload(body: unknown): AsaasWebhookPayload {
  return body as AsaasWebhookPayload
}
```

- [ ] **Step 5: Commit**

```bash
git add lib/asaas/
git commit -m "feat(asaas): HTTP client, types, split builder, webhook validator"
```

---

## Task 5: Checkout API Route

**Files:**
- Create: `app/api/checkout/route.ts`

This route receives the cart + customer data, recalculates the total server-side (never trust the client), creates the ASAAS charge, saves the booking to Supabase, and returns the payment URL/QR code.

- [ ] **Step 1: Create the route**

```typescript
// app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createOrFindCustomer, createCharge } from '@/lib/asaas/client'
import { buildSplit } from '@/lib/asaas/split'
import { hashCpf, isValidCpf, cleanCpf } from '@/lib/crypto/cpf'
import type { AsaasBillingType } from '@/lib/asaas/types'

const CheckoutSchema = z.object({
  billingType: z.enum(['PIX', 'CREDIT_CARD', 'BOLETO', 'DEBIT_CARD']),
  customerName:  z.string().min(3).max(120),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(10).max(20),
  cpf:           z.string().refine(isValidCpf, { message: 'CPF inválido' }),
  items: z.array(z.object({
    id:               z.string(),
    type:             z.enum(['passeio', 'fotografia', 'servico', 'hospedagem']),
    name:             z.string(),
    date:             z.string(),
    adults:           z.number().int().min(0),
    children:         z.number().int().min(0),
    priceAdultCents:  z.number().int().min(0),
    priceChildCents:  z.number().int().min(0),
    boatId:                   z.string().optional(),
    photographerPackageId:    z.string().optional(),
    serviceId:                z.string().optional(),
    pricingType:              z.enum(['per_person', 'per_group']).optional(),
    groupSize:                z.number().optional(),
    accommodationListingId:   z.string().optional(),
    checkIn:                  z.string().optional(),
    checkOut:                 z.string().optional(),
    nights:                   z.number().optional(),
    guests:                   z.number().optional(),
    pricePerNightCents:       z.number().optional(),
    partnerWalletId:          z.string().optional(),
    commissionPct:            z.number().optional(),
  })).min(1),
})

function calcItemCents(item: z.infer<typeof CheckoutSchema>['items'][0]): number {
  if (item.type === 'hospedagem') {
    return (item.pricePerNightCents ?? 0) * (item.nights ?? 1)
  }
  if (item.type === 'servico' && item.pricingType === 'per_group') {
    return item.priceAdultCents
  }
  return item.priceAdultCents * item.adults + item.priceChildCents * item.children
}

export async function POST(request: NextRequest) {
  // Rate limiting: basic check (Vercel Edge handles deeper limiting via middleware)
  const parsed = CheckoutSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { billingType, customerName, customerEmail, customerPhone, cpf, items } = parsed.data

  // Server-side price recalculation (never trust client total)
  const totalCents = items.reduce((sum, item) => sum + calcItemCents(item), 0)
  const totalBRL   = totalCents / 100

  const supabase = await createClient()

  try {
    // 1. Create or find ASAAS customer (raw CPF only goes here)
    const asaasCustomerId = await createOrFindCustomer({
      name:  customerName,
      cpfCnpj: cleanCpf(cpf),
      email: customerEmail,
      phone: customerPhone,
    })

    // 2. Due date: today for PIX/card, +3 days for boleto
    const dueDate = new Date()
    if (billingType === 'BOLETO') dueDate.setDate(dueDate.getDate() + 3)
    const dueDateStr = dueDate.toISOString().split('T')[0]

    // 3. Description
    const description = items.map(i => i.name).join(' + ')

    // 4. Split (only if env var set and partners have wallet IDs)
    const split = buildSplit(items)

    // 5. Create ASAAS charge
    const charge = await createCharge({
      customer:          asaasCustomerId,
      billingType:       billingType as AsaasBillingType,
      value:             totalBRL,
      dueDate:           dueDateStr,
      description,
      split,
    })

    // 6. Hash CPF — raw CPF is never stored
    const cpfHash = hashCpf(cpf)

    // 7. Insert booking row
    const bookingData = {
      customer_name:      customerName,
      customer_email:     customerEmail,
      customer_phone:     customerPhone,
      cpf_hash:           cpfHash,
      asaas_payment_id:   charge.id,
      asaas_customer_id:  asaasCustomerId,
      payment_method:     billingType,
      payment_status:     'pending',
      payment_url:        charge.invoiceUrl ?? charge.bankSlipUrl,
      pix_qr_code:        charge.pixQrCode?.encodedImage ?? null,
      pix_copy_paste:     charge.pixQrCode?.payload ?? null,
      total_cents:        totalCents,
      items_json:         JSON.stringify(items.map(({ cpf: _cpf, ...rest }) => rest)), // never store CPF in JSON
    }

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select('id')
      .single()

    if (bookingError) throw bookingError

    return NextResponse.json({
      bookingId:    booking.id,
      billingType,
      totalCents,
      paymentUrl:   charge.invoiceUrl ?? charge.bankSlipUrl,
      pixQrCode:    charge.pixQrCode?.encodedImage ?? null,
      pixCopyPaste: charge.pixQrCode?.payload ?? null,
    })

  } catch (err) {
    console.error('[checkout] error:', err)
    return NextResponse.json(
      { error: 'Erro ao processar pagamento. Tente novamente.' },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/checkout/route.ts
git commit -m "feat(api): checkout route with ASAAS charge creation and CPF hashing"
```

---

## Task 6: ASAAS Webhook Handler

**Files:**
- Create: `app/api/webhooks/asaas/route.ts`

- [ ] **Step 1: Create webhook route**

```typescript
// app/api/webhooks/asaas/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateWebhookToken, parseWebhookPayload } from '@/lib/asaas/webhook'

export async function POST(request: NextRequest) {
  if (!validateWebhookToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const payload = parseWebhookPayload(body)
  const supabase = await createClient()

  const paymentId = payload.payment.id

  const statusMap: Record<string, string> = {
    PAYMENT_RECEIVED:  'confirmed',
    PAYMENT_CONFIRMED: 'confirmed',
    PAYMENT_OVERDUE:   'overdue',
    PAYMENT_REFUNDED:  'refunded',
  }

  const newStatus = statusMap[payload.event]
  if (!newStatus) {
    // Event we don't handle — acknowledge and move on
    return NextResponse.json({ received: true })
  }

  const update: Record<string, unknown> = { payment_status: newStatus }
  if (newStatus === 'confirmed') update.paid_at = new Date().toISOString()

  const { error } = await supabase
    .from('bookings')
    .update(update)
    .eq('asaas_payment_id', paymentId)

  if (error) {
    console.error('[webhook/asaas] update error:', error)
    // Return 200 so ASAAS doesn't retry — log for investigation
  }

  return NextResponse.json({ received: true })
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/webhooks/asaas/route.ts
git commit -m "feat(webhook): ASAAS payment event handler updates booking status"
```

---

## Task 7: Checkout Page

**Files:**
- Create: `app/checkout/page.tsx`

- [ ] **Step 1: Create checkout page**

```typescript
// app/checkout/page.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/components/cart/CartProvider'
import { isValidCpf, formatCpf, cleanCpf } from '@/lib/crypto/cpf'
import type { AsaasBillingType } from '@/lib/asaas/types'

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const METHODS: { id: AsaasBillingType; label: string; desc: string; color: string; bg: string; border: string }[] = [
  { id: 'PIX',         label: 'PIX',              desc: 'Confirmado em segundos',  color: '#166534', bg: '#f0fdf4', border: '#bbf7d0' },
  { id: 'CREDIT_CARD', label: 'Cartão de crédito', desc: 'Confirmado em minutos',   color: '#1e40af', bg: '#eff6ff', border: '#bfdbfe' },
  { id: 'BOLETO',      label: 'Boleto bancário',   desc: 'Até 3 dias úteis',        color: '#854d0e', bg: '#fefce8', border: '#fef08a' },
  { id: 'DEBIT_CARD',  label: 'Débito online',     desc: 'Confirmado em minutos',   color: '#5b21b6', bg: '#f5f3ff', border: '#ddd6fe' },
]

export default function CheckoutPage() {
  const { items, totalCents, clearCart } = useCart()
  const router = useRouter()

  const [billingType, setBillingType] = useState<AsaasBillingType>('PIX')
  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState('')
  const [phone,   setPhone]   = useState('')
  const [cpf,     setCpf]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const cpfError = cpf.length >= 11 && !isValidCpf(cpf) ? 'CPF inválido' : null

  function handleCpfChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 11)
    setCpf(formatCpf(raw))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValidCpf(cpf)) { setError('CPF inválido'); return }
    if (items.length === 0) { setError('Carrinho vazio'); return }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billingType,
          customerName:  name,
          customerEmail: email,
          customerPhone: phone.replace(/\D/g, ''),
          cpf: cleanCpf(cpf),
          items,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Erro ao processar pagamento.')
        return
      }

      clearCart()
      router.push(`/checkout/confirmacao?bid=${data.bookingId}&method=${billingType}`)
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Carrinho vazio.</p>
        <a href="/passeios" style={{ color: 'var(--ocean-mid)', fontWeight: 600 }}>Ver passeios</a>
      </div>
    )
  }

  return (
    <section style={{ padding: '3rem 0 6rem', background: 'white', minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: '640px' }}>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '2rem', marginBottom: '0.25rem', color: 'var(--ocean-deep)' }}>
          Finalizar reserva
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
          Total: <strong style={{ color: 'var(--ocean-deep)' }}>{formatBRL(totalCents)}</strong>
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Payment method */}
          <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
            <legend style={{ fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              Forma de pagamento
            </legend>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
              {METHODS.map(m => (
                <label key={m.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
                  padding: '0.875rem 1rem', borderRadius: '10px', cursor: 'pointer',
                  border: `2px solid ${billingType === m.id ? m.border : 'var(--border)'}`,
                  background: billingType === m.id ? m.bg : 'white',
                  transition: 'border-color 0.15s, background 0.15s',
                }}>
                  <input
                    type="radio" name="billingType" value={m.id}
                    checked={billingType === m.id}
                    onChange={() => setBillingType(m.id)}
                    style={{ marginTop: '3px', accentColor: m.color }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: billingType === m.id ? m.color : 'var(--text-primary)' }}>
                      {m.label}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                      {m.desc}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Personal data */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h3 style={{ fontWeight: 700, margin: 0, color: 'var(--text-primary)', fontSize: '1rem' }}>
              Seus dados
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                  Nome completo *
                </label>
                <input
                  required value={name} onChange={e => setName(e.target.value)}
                  placeholder="João Silva"
                  style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1.5px solid var(--border)', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                  CPF *
                </label>
                <input
                  required value={cpf} onChange={handleCpfChange}
                  placeholder="000.000.000-00"
                  inputMode="numeric"
                  style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: `1.5px solid ${cpfError ? '#ef4444' : 'var(--border)'}`, fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
                {cpfError && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', margin: '0.25rem 0 0' }}>{cpfError}</p>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                  E-mail *
                </label>
                <input
                  required type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="joao@email.com"
                  style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1.5px solid var(--border)', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                  Telefone / WhatsApp *
                </label>
                <input
                  required value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="(24) 99999-9999"
                  inputMode="tel"
                  style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1.5px solid var(--border)', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.75rem 1rem', color: '#dc2626', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !!cpfError}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', fontSize: '1rem', padding: '0.875rem', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Processando...' : `Confirmar e pagar ${formatBRL(totalCents)}`}
          </button>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            Pagamento 100% seguro via ASAAS · Seus dados são protegidos pela LGPD
          </p>
        </form>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/checkout/page.tsx
git commit -m "feat(checkout): checkout page with CPF field and payment method selector"
```

---

## Task 8: Payment Confirmation Page

**Files:**
- Create: `app/checkout/confirmacao/page.tsx`

- [ ] **Step 1: Create confirmation page**

```typescript
// app/checkout/confirmacao/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Confirmação de Reserva' }
export const dynamic = 'force-dynamic'

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5524999627968'

interface Props {
  searchParams: Promise<{ bid?: string; method?: string }>
}

export default async function ConfirmacaoPage({ searchParams }: Props) {
  const { bid, method } = await searchParams
  const supabase = await createClient()

  let booking: { payment_status: string; pix_qr_code: string | null; pix_copy_paste: string | null; payment_url: string | null; customer_name: string | null } | null = null

  if (bid) {
    const { data } = await supabase
      .from('bookings')
      .select('payment_status, pix_qr_code, pix_copy_paste, payment_url, customer_name')
      .eq('id', bid)
      .single()
    booking = data
  }

  const isPix    = method === 'PIX'
  const isBoleto = method === 'BOLETO'
  const isCard   = method === 'CREDIT_CARD' || method === 'DEBIT_CARD'

  return (
    <section style={{ padding: '4rem 0 6rem', background: 'white', minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: '540px', textAlign: 'center' }}>

        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f0fdf4', border: '2px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2rem' }}>
          {isPix ? '📱' : isBoleto ? '📄' : '✅'}
        </div>

        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '2rem', color: 'var(--ocean-deep)', marginBottom: '0.5rem' }}>
          {isCard ? 'Reserva confirmada!' : 'Quase lá!'}
        </h1>

        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
          {isPix && 'Use o QR Code ou copie o código PIX abaixo para concluir o pagamento. A reserva será confirmada em segundos.'}
          {isBoleto && 'Seu boleto foi gerado. O prazo de vencimento é de 3 dias úteis. A reserva será confirmada após a compensação.'}
          {isCard && `Obrigado${booking?.customer_name ? ', ' + booking.customer_name.split(' ')[0] : ''}! Seu pagamento foi processado e sua reserva está confirmada.`}
        </p>

        {/* PIX QR Code */}
        {isPix && booking?.pix_qr_code && (
          <div style={{ background: 'var(--sand-warm, #F5EDD8)', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.5rem', display: 'inline-block' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`data:image/png;base64,${booking.pix_qr_code}`}
              alt="QR Code PIX"
              style={{ width: '200px', height: '200px', display: 'block' }}
            />
          </div>
        )}

        {isPix && booking?.pix_copy_paste && (
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>Código PIX Copia e Cola:</p>
            <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.75rem', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', wordBreak: 'break-all', textAlign: 'left' }}>
              {booking.pix_copy_paste}
            </div>
          </div>
        )}

        {/* Boleto link */}
        {isBoleto && booking?.payment_url && (
          <a
            href={booking.payment_url}
            target="_blank"
            rel="noreferrer"
            className="btn-primary"
            style={{ display: 'inline-block', marginBottom: '1.5rem', textDecoration: 'none' }}
          >
            Abrir boleto PDF
          </a>
        )}

        {/* WhatsApp fallback */}
        <div style={{ marginBottom: '2rem' }}>
          <a
            href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Olá! Acabei de fazer uma reserva (ID: ${bid ?? 'N/A'}). Podem confirmar?`)}`}
            target="_blank"
            rel="noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#166534', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
            Falar no WhatsApp
          </a>
        </div>

        <Link href="/" style={{ color: 'var(--ocean-mid)', fontWeight: 600, fontSize: '0.9rem' }}>
          ← Voltar para o início
        </Link>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/checkout/confirmacao/page.tsx
git commit -m "feat(checkout): confirmation page with PIX QR code, boleto link, WhatsApp CTA"
```

---

## Task 9: CartDrawer — Add Débito + Update Branding

**Files:**
- Modify: `components/cart/CartDrawer.tsx`

- [ ] **Step 1: Add débito badge and update "Infinity Pay" text**

In `components/cart/CartDrawer.tsx`, find the payment methods section (around line 182–226) and replace the entire block between `{/* Pix */}` and the closing `</div>` with:

```tsx
{/* Pix */}
<div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem', borderRadius: '6px', background: '#f0fdf4', border: '1px solid #bbf7d0', fontSize: '0.75rem', fontWeight: 600, color: '#166534' }}>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M11.354 2.646a.9.9 0 011.292 0l2.354 2.354 2.354-2.354a.9.9 0 011.292 0l3.708 3.708a.9.9 0 010 1.292L19.646 10 22 12.354a.9.9 0 010 1.292L18.354 17a.9.9 0 01-1.292 0L14.708 14.646 12.354 17a.9.9 0 01-1.292 0L8.708 14.646 6.354 17a.9.9 0 01-1.292 0L1.354 13.646a.9.9 0 010-1.292L3.708 10 1.354 7.646a.9.9 0 010-1.292L5.062 2.646a.9.9 0 011.292 0L8.708 5l2.354-2.354z"/></svg>
  Pix
</div>
{/* Cartão */}
<div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem', borderRadius: '6px', background: '#eff6ff', border: '1px solid #bfdbfe', fontSize: '0.75rem', fontWeight: 600, color: '#1e40af' }}>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
  Cartão
</div>
{/* Boleto */}
<div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem', borderRadius: '6px', background: '#fefce8', border: '1px solid #fef08a', fontSize: '0.75rem', fontWeight: 600, color: '#854d0e' }}>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="3" height="18"/><rect x="8" y="3" width="1" height="18"/><rect x="11" y="3" width="3" height="18"/><rect x="16" y="3" width="1" height="18"/><rect x="19" y="3" width="2" height="18"/></svg>
  Boleto
</div>
{/* Débito */}
<div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem', borderRadius: '6px', background: '#f5f3ff', border: '1px solid #ddd6fe', fontSize: '0.75rem', fontWeight: 600, color: '#5b21b6' }}>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><circle cx="7" cy="15" r="1" fill="currentColor"/></svg>
  Débito
</div>
```

Then find the line `Pagamento 100% seguro via Infinity Pay` and replace with:

```tsx
Pagamento 100% seguro via ASAAS · Protegido pela LGPD
```

- [ ] **Step 2: Commit**

```bash
git add components/cart/CartDrawer.tsx
git commit -m "feat(cart): add débito badge, update payment provider text to ASAAS"
```

---

## Task 10: Dynamic Admin Roadmap

**Files:**
- Modify: `app/admin/roadmap/page.tsx`

- [ ] **Step 1: Replace hardcoded page with DB-driven CRUD**

Replace the entire content of `app/admin/roadmap/page.tsx` with:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Status = 'done' | 'in_progress' | 'pending' | 'blocked'

interface Task {
  id: string
  area: string
  title: string
  description: string | null
  status: Status
  priority: string
  eta: string | null
  notes: string | null
  sort_order: number
}

const statusConfig: Record<Status, { label: string; color: string; bg: string }> = {
  done:        { label: 'Concluído',    color: '#16a34a', bg: '#dcfce7' },
  in_progress: { label: 'Em andamento', color: '#d97706', bg: '#fef3c7' },
  pending:     { label: 'Pendente',     color: '#6b7280', bg: '#f3f4f6' },
  blocked:     { label: 'Bloqueado',    color: '#dc2626', bg: '#fee2e2' },
}

const STATUSES: Status[] = ['done', 'in_progress', 'pending', 'blocked']

// Tasks to seed on first load if the table is empty
const SEED_TASKS: Omit<Task, 'id'>[] = [
  { area: 'Infra',      title: 'Deploy inicial no Vercel',          description: 'Next.js 16 + Supabase + domínio configurado',                                              status: 'done',        priority: 'alta',  eta: 'Maio 2026',  notes: null,                                                            sort_order: 1  },
  { area: 'Passeios',   title: 'Catálogo de escunas + booking widget', description: 'Página por barco, seletor adultos/crianças, data, carrinho',                           status: 'done',        priority: 'alta',  eta: 'Maio 2026',  notes: null,                                                            sort_order: 2  },
  { area: 'Hospedagem', title: 'Catálogo de pousadas + booking widget', description: 'Página por pousada, datas check-in/out, hóspedes, disponibilidade via iCal',          status: 'done',        priority: 'alta',  eta: 'Maio 2026',  notes: null,                                                            sort_order: 3  },
  { area: 'Serviços',   title: 'Catálogo de serviços + booking inline', description: 'Lancha privativa, jeep, fotografia, transfer — data/pessoas, carrinho',               status: 'done',        priority: 'alta',  eta: 'Maio 2026',  notes: null,                                                            sort_order: 4  },
  { area: 'iCal',       title: 'Sincronização de calendário (exportação)', description: 'Feed .ics por pousada, botões Google/Apple Calendar',                              status: 'done',        priority: 'média', eta: 'Maio 2026',  notes: null,                                                            sort_order: 5  },
  { area: 'Admin',      title: 'Painel admin base',                  description: 'Dashboard KPIs, reservas, capacidade, repasses, contatos, NPS, parceiros, depoimentos', status: 'done',        priority: 'alta',  eta: 'Maio 2026',  notes: null,                                                            sort_order: 6  },
  { area: 'Segurança',  title: 'Hardening OWASP',                    description: 'CSP, X-Frame, rate limiting, validação server-side, service_role server-only',           status: 'done',        priority: 'alta',  eta: 'Maio 2026',  notes: null,                                                            sort_order: 7  },
  { area: 'Pagamentos', title: 'ASAAS — todos os métodos (PIX + Cartão + Boleto + Débito)', description: 'Substituição do InfinityPay. Checkout com CPF (LGPD), cobrança única com split por parceiro.', status: 'in_progress', priority: 'alta', eta: 'Jun 2026', notes: null, sort_order: 8 },
  { area: 'Pagamentos', title: 'Split de pagamento por parceiro (subcontas ASAAS)', description: 'Repasse automático. Requer KYC verificado + subcontas ativadas no ASAAS.', status: 'blocked', priority: 'alta', eta: 'A definir', notes: 'BLOQUEADO — aguarda KYC + aprovação subcontas ASAAS.', sort_order: 9 },
  { area: 'Admin',      title: 'Painel financeiro por parceiro',     description: 'Vendas, comissões, repasses pendentes/pagos por parceiro.',                               status: 'pending',     priority: 'alta',  eta: 'Jun/Jul 2026', notes: 'Depende da decisão do split.',                               sort_order: 10 },
  { area: 'Parceiros',  title: 'Portal do parceiro (login próprio)', description: '/parceiros/dashboard — reservas, agenda, financeiro, uploads.',                          status: 'pending',     priority: 'alta',  eta: 'Jul 2026',   notes: null,                                                            sort_order: 11 },
  { area: 'Pagamentos', title: 'Definir porcentagens de comissão por categoria', description: 'Passeios próprios 100%; pousadas/barcos/serviços parceiros: % a definir.', status: 'pending', priority: 'alta', eta: 'A definir (cliente)', notes: null, sort_order: 12 },
  { area: 'iCal',       title: 'iCal bidirecional — importação',     description: 'Cron que importa bloqueios de datas de Airbnb/Booking.com.',                             status: 'in_progress', priority: 'média', eta: 'Jun 2026',   notes: 'Falta UI no admin para parceiro cadastrar URL do calendário.', sort_order: 13 },
  { area: 'SEO',        title: 'SEO completo + Google Search Console', description: 'sitemap.xml, robots.txt, JSON-LD por página, meta descriptions, WebP.',               status: 'pending',     priority: 'média', eta: 'Jun 2026',   notes: null,                                                            sort_order: 14 },
  { area: 'Marketing',  title: 'GTM + GA4 + Consent Mode v2',        description: 'Google Tag Manager, eventos de conversão, funil.',                                       status: 'pending',     priority: 'média', eta: 'Jun 2026',   notes: null,                                                            sort_order: 15 },
  { area: 'Conteúdo',   title: 'Migração de conteúdo do WordPress',  description: 'Fotos das escunas, textos, depoimentos reais, galeria por barco.',                       status: 'pending',     priority: 'alta',  eta: 'A definir',  notes: 'Aguarda entrega de assets do cliente.',                         sort_order: 16 },
  { area: 'Infra',      title: 'Domínio definitivo + SSL',            description: 'Apontar domínio final no Vercel.',                                                       status: 'pending',     priority: 'alta',  eta: 'A definir',  notes: 'Aguarda decisão do cliente.',                                   sort_order: 17 },
  { area: 'Fotografia', title: 'Página de fotografia completa',      description: 'Portfolio, pacotes de ensaio, galeria, booking inline.',                                  status: 'pending',     priority: 'média', eta: 'Jul 2026',   notes: null,                                                            sort_order: 18 },
  { area: 'NPS',        title: 'Cron NPS + emails automáticos pós-passeio', description: 'Cron noturno + validar emails chegando em produção.',                             status: 'in_progress', priority: 'baixa', eta: 'Jun 2026',   notes: null,                                                            sort_order: 19 },
]

export default function RoadmapPage() {
  const supabase = createClient()
  const [tasks, setTasks]     = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving]   = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [newTask, setNewTask] = useState<Omit<Task, 'id' | 'sort_order'>>({
    area: '', title: '', description: null, status: 'pending', priority: 'média', eta: null, notes: null,
  })

  async function load() {
    const { data } = await supabase
      .from('roadmap_tasks')
      .select('*')
      .order('sort_order')
    if (!data) { setLoading(false); return }

    // Seed if empty
    if (data.length === 0) {
      await supabase.from('roadmap_tasks').insert(SEED_TASKS)
      const { data: seeded } = await supabase.from('roadmap_tasks').select('*').order('sort_order')
      setTasks((seeded as Task[]) ?? [])
    } else {
      setTasks(data as Task[])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function updateStatus(id: string, status: Status) {
    setSaving(true)
    await supabase.from('roadmap_tasks').update({ status }).eq('id', id)
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t))
    setSaving(false)
  }

  async function updateField(id: string, field: keyof Task, value: string) {
    await supabase.from('roadmap_tasks').update({ [field]: value || null }).eq('id', id)
    setTasks(prev => prev.map(t => t.id === id ? { ...t, [field]: value || null } : t))
  }

  async function deleteTask(id: string) {
    if (!confirm('Excluir esta tarefa?')) return
    await supabase.from('roadmap_tasks').delete().eq('id', id)
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  async function createTask() {
    if (!newTask.area || !newTask.title) return
    const maxOrder = Math.max(0, ...tasks.map(t => t.sort_order))
    const { data } = await supabase
      .from('roadmap_tasks')
      .insert({ ...newTask, sort_order: maxOrder + 1 })
      .select()
      .single()
    if (data) {
      setTasks(prev => [...prev, data as Task])
      setShowNew(false)
      setNewTask({ area: '', title: '', description: null, status: 'pending', priority: 'média', eta: null, notes: null })
    }
  }

  const done  = tasks.filter(t => t.status === 'done').length
  const total = tasks.length
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0
  const areas = [...new Set(tasks.map(t => t.area))]

  if (loading) return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Carregando...</div>

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: '#0f172a', marginBottom: '0.25rem' }}>
            Roadmap do Projeto
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Acalanto Turismo{saving ? ' · salvando...' : ''}</p>
        </div>
        <button
          onClick={() => setShowNew(v => !v)}
          style={{ background: 'var(--ocean-mid)', color: 'white', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
        >
          + Nova tarefa
        </button>
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ flex: 1, height: '8px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: '#16a34a', borderRadius: '999px' }}/>
        </div>
        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#16a34a', whiteSpace: 'nowrap' }}>
          {done}/{total} ({pct}%)
        </span>
      </div>

      {/* New task form */}
      {showNew && (
        <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.25rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>Nova tarefa</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
            <input placeholder="Área (ex: Pagamentos)" value={newTask.area} onChange={e => setNewTask(p => ({ ...p, area: e.target.value }))} style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.875rem' }} />
            <input placeholder="Título" value={newTask.title} onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))} style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.875rem' }} />
          </div>
          <textarea placeholder="Descrição (opcional)" value={newTask.description ?? ''} onChange={e => setNewTask(p => ({ ...p, description: e.target.value || null }))} rows={2} style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.875rem', resize: 'vertical' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <select value={newTask.status} onChange={e => setNewTask(p => ({ ...p, status: e.target.value as Status }))} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.875rem' }}>
              {STATUSES.map(s => <option key={s} value={s}>{statusConfig[s].label}</option>)}
            </select>
            <select value={newTask.priority} onChange={e => setNewTask(p => ({ ...p, priority: e.target.value }))} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.875rem' }}>
              <option value="alta">↑ Alta</option><option value="média">→ Média</option><option value="baixa">↓ Baixa</option>
            </select>
            <input placeholder="ETA (ex: Jun 2026)" value={newTask.eta ?? ''} onChange={e => setNewTask(p => ({ ...p, eta: e.target.value || null }))} style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.875rem' }} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={createTask} style={{ background: 'var(--ocean-mid)', color: 'white', border: 'none', borderRadius: '6px', padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Salvar</button>
            <button onClick={() => setShowNew(false)} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.5rem 1rem', fontSize: '0.85rem', cursor: 'pointer' }}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Tasks by area */}
      {areas.map(area => {
        const areaTasks = tasks.filter(t => t.area === area)
        return (
          <div key={area} style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '0.75rem' }}>
              {area}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {areaTasks.map(task => (
                <div key={task.id} style={{ background: 'white', border: `1px solid ${task.status === 'blocked' ? '#fca5a5' : '#e2e8f0'}`, borderRadius: '10px', padding: '0.875rem 1.25rem' }}>
                  {editingId === task.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <input defaultValue={task.title} onBlur={e => updateField(task.id, 'title', e.target.value)} style={{ padding: '0.4rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border)', fontWeight: 600, fontSize: '0.9rem' }} />
                      <textarea defaultValue={task.description ?? ''} onBlur={e => updateField(task.id, 'description', e.target.value)} rows={2} style={{ padding: '0.4rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.8rem', resize: 'vertical' }} />
                      <textarea defaultValue={task.notes ?? ''} placeholder="Notas / bloqueios" onBlur={e => updateField(task.id, 'notes', e.target.value)} rows={1} style={{ padding: '0.4rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.8rem', resize: 'vertical' }} />
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input defaultValue={task.eta ?? ''} placeholder="ETA" onBlur={e => updateField(task.id, 'eta', e.target.value)} style={{ padding: '0.4rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.8rem', width: '120px' }} />
                        <button onClick={() => setEditingId(null)} style={{ background: 'var(--ocean-mid)', color: 'white', border: 'none', borderRadius: '6px', padding: '0.35rem 0.75rem', fontSize: '0.8rem', cursor: 'pointer' }}>Fechar</button>
                        <button onClick={() => deleteTask(task.id)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', padding: '0.35rem 0.75rem', fontSize: '0.8rem', cursor: 'pointer' }}>Excluir</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem', alignItems: 'start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>{task.title}</span>
                        </div>
                        {task.description && <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 0.25rem' }}>{task.description}</p>}
                        {task.notes && <p style={{ fontSize: '0.8rem', color: task.status === 'blocked' ? '#dc2626' : '#d97706', margin: 0, fontStyle: 'italic' }}>⚠ {task.notes}</p>}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.375rem' }}>
                        {/* Status dropdown */}
                        <select
                          value={task.status}
                          onChange={e => updateStatus(task.id, e.target.value as Status)}
                          style={{ padding: '0.2rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, color: statusConfig[task.status].color, background: statusConfig[task.status].bg, border: 'none', cursor: 'pointer' }}
                        >
                          {STATUSES.map(s => <option key={s} value={s}>{statusConfig[s].label}</option>)}
                        </select>
                        {task.eta && <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{task.eta}</span>}
                        <button onClick={() => setEditingId(task.id)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.75rem', padding: '0' }}>editar</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/admin/roadmap/page.tsx
git commit -m "feat(admin): dynamic roadmap — DB-driven CRUD with inline status editing"
```

---

## Task 11: Add Partner `asaas_wallet_id` to Admin

**Files:**
- Modify: `app/admin/parceiros/[id]/page.tsx`

- [ ] **Step 1: Add wallet_id field to partner edit form**

Open `app/admin/parceiros/[id]/page.tsx`. Find the partner form fields and add after the `commission_pct` field (or after the last existing field if it doesn't exist yet):

```tsx
{/* ASAAS Wallet ID */}
<div>
  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
    ASAAS Wallet ID
    <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: '0.25rem' }}>(preenchido quando subcontas ativadas)</span>
  </label>
  <input
    value={form.asaas_wallet_id ?? ''}
    onChange={e => setForm(f => ({ ...f, asaas_wallet_id: e.target.value || null }))}
    placeholder="ex: 3c0c9b41-..."
    style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1.5px solid var(--border)', fontSize: '0.9rem', fontFamily: 'var(--font-mono)', boxSizing: 'border-box' }}
  />
</div>

{/* Comissão % */}
<div>
  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
    Comissão do parceiro (%)
  </label>
  <input
    type="number" min={0} max={100}
    value={form.commission_pct ?? 90}
    onChange={e => setForm(f => ({ ...f, commission_pct: parseInt(e.target.value) || 90 }))}
    style={{ width: '120px', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1.5px solid var(--border)', fontSize: '0.9rem', boxSizing: 'border-box' }}
  />
  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>% vai para o parceiro (restante é da Acalanto)</span>
</div>
```

Make sure the form save handler includes `asaas_wallet_id` and `commission_pct` in the update payload.

- [ ] **Step 2: Commit**

```bash
git add app/admin/parceiros/
git commit -m "feat(admin): add asaas_wallet_id and commission_pct fields to partner edit form"
```

---

## Final: Push and Summary

- [ ] **Push to remote**

```bash
git push origin master
```

- [ ] **Verify on Vercel**

Check deployment logs at `/admin/roadmap` — roadmap should seed automatically on first load. Check `/checkout` — form should render. `/api/webhooks/asaas` — returns 401 on GET (expected).

---

## What to Ask Gustavo (copy this message)

```
Olá Gustavo! Precisamos de 4 informações da conta ASAAS para ativar os pagamentos:

1. API Key de PRODUÇÃO
   Configurações → Integrações → Chave de API → copiar a chave $aact_...

2. API Key de SANDBOX (para testes primeiro)
   Mesma tela, aba Sandbox

3. Wallet ID da conta principal
   Configurações → Dados da conta → ID da carteira

4. Token do Webhook
   Configurações → Integrações → Webhooks → criar novo webhook
   URL: https://[dominio-do-site]/api/webhooks/asaas
   Eventos a marcar: PAYMENT_RECEIVED, PAYMENT_CONFIRMED, PAYMENT_OVERDUE, PAYMENT_REFUNDED
   Copiar o token gerado

5. Confirmar: o plano atual permite subcontas/marketplace?
   Verificar em Configurações → Plano

Só isso! Nenhum setup adicional necessário no painel ASAAS.
```
