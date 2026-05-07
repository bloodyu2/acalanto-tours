# Serviços Drawer + Hospedagem Drawer — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** (1) Extend the service sheet/drawer to ALL services with a provider-selection step. (2) Add a quick-preview sheet to the hospedagem listing so clicking "Ver detalhes" opens a side drawer without leaving the page; the full card still navigates to the complete listing.

**Architecture:**
- A new `service_providers` join table links services to partners. The admin can configure which partners offer which service.
- `ServiceSheet` gains a provider-selection step (shown before the booking widget) when providers exist for the service.
- `HotelariaPage` becomes a client component (`HotelariaPageClient`) with `activeListingSlug` state; a new `HotelSheet` component mirrors the existing `ServiceSheet` pattern.

**Tech Stack:** Next.js 16 App Router, Supabase, inline CSS (project convention)

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `supabase/migrations/010_service_providers.sql` | Create | `service_providers` join table |
| `lib/types/database.ts` | Modify | Add `service_providers` type |
| `components/services/ServiceSheet.tsx` | Modify | Add provider-selection step |
| `components/services/ServicosPageClient.tsx` | Modify | Pass providers data; show drawer for ALL services |
| `app/servicos/page.tsx` | Modify | Fetch providers from DB and pass to client |
| `components/hotelaria/HotelariaPageClient.tsx` | Create | Client wrapper with sheet state |
| `components/hotelaria/HotelSheet.tsx` | Create | Quick-preview drawer for a listing |
| `app/hotelaria/page.tsx` | Modify | Delegate grid rendering to `HotelariaPageClient` |

---

### Task 1: DB — `service_providers` table

**Files:**
- Create: `supabase/migrations/010_service_providers.sql`

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/010_service_providers.sql`:

```sql
create table if not exists service_providers (
  id          uuid primary key default gen_random_uuid(),
  service_id  uuid not null references services(id) on delete cascade,
  partner_id  uuid not null references partners(id) on delete cascade,
  notes       text,
  display_order int not null default 0,
  created_at  timestamptz not null default now(),
  unique (service_id, partner_id)
);

alter table service_providers enable row level security;

-- Public can read (needed on the booking page)
create policy "public read service_providers"
  on service_providers for select
  using (true);

-- Admin full access
create policy "admin full access service_providers"
  on service_providers for all
  using (is_admin())
  with check (is_admin());
```

- [ ] **Step 2: Apply via Supabase MCP**

Use `mcp__b851e17c__apply_migration` with project `hnsbstmzbidfehvycptl`.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/010_service_providers.sql
git commit -m "feat(db): service_providers join table"
```

---

### Task 2: TypeScript types for `service_providers`

**Files:**
- Modify: `lib/types/database.ts`

- [ ] **Step 1: Add `service_providers` to Database type**

In `lib/types/database.ts`, inside `Database['public']['Tables']`, add:

```ts
service_providers: {
  Row: {
    id: string
    service_id: string
    partner_id: string
    notes: string | null
    display_order: number
    created_at: string
  }
  Insert: {
    id?: string
    service_id: string
    partner_id: string
    notes?: string | null
    display_order?: number
    created_at?: string
  }
  Update: Partial<Database['public']['Tables']['service_providers']['Insert']>
}
```

Also add a compound type for the joined query result — add this export near the bottom of the file (or with the other compound types):

```ts
export type ServiceProvider = {
  id: string
  partner_id: string
  notes: string | null
  display_order: number
  partner: {
    id: string
    name: string
    description: string | null
    whatsapp_number: string | null
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/types/database.ts
git commit -m "types: add service_providers and ServiceProvider"
```

---

### Task 3: Extend `ServicosPageClient` + `ServiceSheet` with provider selection

**Files:**
- Modify: `components/services/ServiceSheet.tsx`
- Modify: `components/services/ServicosPageClient.tsx`
- Modify: `app/servicos/page.tsx`

**Context:** `ServiceSheet.tsx` currently shows service details + booking widget. We need to add a provider-selection step. `ServicosPageClient.tsx` currently shows the drawer only for non-fotografia services; we keep that same exception (fotografia links to its own page). We need to pass a `providers` map into both components.

- [ ] **Step 1: Update `SheetService` type in `ServiceSheet.tsx`**

At the top of `components/services/ServiceSheet.tsx`, update the `SheetService` export:

```ts
export type SheetService = {
  id: string
  slug: string
  name: string
  description?: string | null
  price_label?: string | null
  pricing_type?: string | null
  price_cents_per_person?: number | null
  price_cents_group?: number | null
  capacity_max?: number | null
}
```

No change here — but add a new import and prop:

At the top add:

```ts
import type { ServiceProvider } from '@/lib/types/database'
```

Change `Props` interface:

```ts
interface Props {
  service: SheetService | null
  unavailableMap: Record<string, string[]>
  providers: ServiceProvider[]  // providers for the active service
  onClose: () => void
}
```

- [ ] **Step 2: Add provider-selection UI inside `ServiceSheet`**

Replace the function signature and add state:

```tsx
export default function ServiceSheet({ service, unavailableMap, providers, onClose }: Props) {
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null)

  // Reset provider selection when service changes
  useEffect(() => { setSelectedProvider(null) }, [service?.id])

  useEffect(() => {
    if (!service) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [service, onClose])

  if (!service) return null
```

Inside the sheet body, add a provider-selection section BEFORE the booking widget / WhatsApp button. Insert this block right after the `highlights` section and before the `{hasBooking ? ... : ...}` block:

```tsx
{providers.length > 0 && (
  <div style={{ marginBottom: '1.5rem' }}>
    <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1rem', color: 'var(--ocean-deep)', marginBottom: '0.75rem' }}>
      Escolha o prestador
    </h3>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
      {providers.map(prov => (
        <button
          key={prov.id}
          type="button"
          onClick={() => setSelectedProvider(prov)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.875rem',
            padding: '0.875rem 1rem', borderRadius: '10px', cursor: 'pointer',
            background: selectedProvider?.id === prov.id ? 'var(--ocean-deep)' : 'white',
            color: selectedProvider?.id === prov.id ? 'white' : 'var(--text-primary)',
            border: selectedProvider?.id === prov.id ? '2px solid var(--ocean-deep)' : '1.5px solid var(--border)',
            transition: 'all 0.15s', textAlign: 'left',
          }}
        >
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
            background: selectedProvider?.id === prov.id ? 'rgba(255,255,255,0.2)' : 'var(--sand)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{prov.partner.name}</div>
            {prov.notes && (
              <div style={{ fontSize: '0.8rem', opacity: 0.75, marginTop: '0.15rem' }}>{prov.notes}</div>
            )}
          </div>
          {selectedProvider?.id === prov.id && (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          )}
        </button>
      ))}
    </div>
  </div>
)}
```

- [ ] **Step 3: Gate the booking/WhatsApp block on provider selection when providers exist**

Wrap the existing `{hasBooking ? ... : ...}` block:

```tsx
{(providers.length === 0 || selectedProvider) && (
  <>
    {hasBooking ? (
      <ServiceBookingWidget
        service={{
          id: service.id,
          slug: service.slug,
          name: service.name,
          pricing_type: service.pricing_type as 'per_person' | 'per_group',
          price_cents_per_person: service.price_cents_per_person ?? null,
          price_cents_group: service.price_cents_group ?? null,
          capacity_max: service.capacity_max ?? null,
        }}
        unavailableDates={unavailableDates}
      />
    ) : (
      <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border)' }}>
        {service.price_label && (
          <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.375rem', fontWeight: 700, color: 'var(--ocean-deep)', marginBottom: '1rem' }}>
            {service.price_label}
          </p>
        )}
        {(() => {
          const waTarget = selectedProvider?.partner.whatsapp_number ?? phone
          const waMsg = encodeURIComponent(
            selectedProvider
              ? `Olá ${selectedProvider.partner.name}! Tenho interesse no serviço de ${service.name} pela Acalanto Tours. Poderia me dar mais informações?`
              : `Olá! Tenho interesse no serviço de ${service.name}. Poderia me dar mais informações?`
          )
          return (
            <a
              href={`https://wa.me/${waTarget}?text=${waMsg}`}
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem', textDecoration: 'none', width: '100%' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Solicitar pelo WhatsApp
            </a>
          )
        })()}
      </div>
    )}
  </>
)}

{providers.length > 0 && !selectedProvider && (
  <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)', padding: '0.75rem 0' }}>
    Selecione um prestador para continuar
  </p>
)}
```

- [ ] **Step 4: Update `ServicosPageClient.tsx` to accept and pass providers**

Replace the `Props` interface and `ServicosPageClient` component in `components/services/ServicosPageClient.tsx`:

```tsx
import type { ServiceProvider } from '@/lib/types/database'

interface Props {
  services: SheetService[]
  unavailableMap: Record<string, string[]>
  providersMap: Record<string, ServiceProvider[]>  // keyed by service.id
}

export default function ServicosPageClient({ services, unavailableMap, providersMap }: Props) {
  const [activeService, setActiveService] = useState<SheetService | null>(null)

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {services.map(svc => (
          <div key={svc.id} className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div style={{ marginBottom: '1rem', color: 'var(--ocean-mid)' }}>
              {icons[svc.slug] ?? <AnchorIcon />}
            </div>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', color: 'var(--ocean-deep)', marginBottom: '0.625rem' }}>
              {svc.name}
            </h2>
            {svc.description && (
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: '1rem', flex: 1 }}>
                {svc.description}
              </p>
            )}
            <div style={{ display: 'flex', gap: '0.625rem', marginTop: 'auto', alignItems: 'center', flexWrap: 'wrap' }}>
              {svc.slug === 'fotografia' ? (
                <Link
                  href="/fotografia"
                  className="btn-primary"
                  style={{ flex: 1, justifyContent: 'center', fontSize: '0.875rem' }}
                >
                  Ver detalhes
                </Link>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveService(svc)}
                    className="btn-primary"
                    style={{ flex: 1, justifyContent: 'center', fontSize: '0.875rem' }}
                  >
                    {svc.pricing_type ? 'Reservar' : 'Solicitar'}
                  </button>
                  <Link
                    href={`/servicos/${svc.slug}`}
                    style={{ fontSize: '0.8rem', color: 'var(--ocean-mid)', fontWeight: 600, textDecoration: 'none', padding: '0.5rem' }}
                  >
                    Ver mais →
                  </Link>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <ServiceSheet
        service={activeService}
        unavailableMap={unavailableMap}
        providers={activeService ? (providersMap[activeService.id] ?? []) : []}
        onClose={() => setActiveService(null)}
      />
    </>
  )
}
```

- [ ] **Step 5: Update `app/servicos/page.tsx` to fetch providers**

In `app/servicos/page.tsx`, add the providers query after the existing queries. Read the current file first to find the exact spot. Add after the `unavailableMap` construction:

```ts
// Fetch providers per service (partners who offer each service)
const { data: providerRows } = await supabase
  .from('service_providers')
  .select('id, service_id, partner_id, notes, display_order, partner:partners(id, name, description, whatsapp_number)')
  .order('display_order', { ascending: true })

const providersMap: Record<string, ServiceProvider[]> = {}
for (const row of providerRows ?? []) {
  if (!row.service_id) continue
  if (!providersMap[row.service_id]) providersMap[row.service_id] = []
  providersMap[row.service_id].push(row as unknown as ServiceProvider)
}
```

Then pass `providersMap` to `<ServicosPageClient>`:

```tsx
<ServicosPageClient
  services={services}
  unavailableMap={unavailableMap}
  providersMap={providersMap}
/>
```

Also add the import at the top:

```ts
import type { ServiceProvider } from '@/lib/types/database'
```

- [ ] **Step 6: Commit**

```bash
git add components/services/ServiceSheet.tsx components/services/ServicosPageClient.tsx app/servicos/page.tsx lib/types/database.ts
git commit -m "feat(servicos): provider selection step in service sheet; extend drawer to all services"
```

---

### Task 4: Hospedagem quick-preview drawer — `HotelSheet`

**Files:**
- Create: `components/hotelaria/HotelSheet.tsx`

- [ ] **Step 1: Create the hotel sheet component**

Read `app/hotelaria/[slug]/page.tsx` briefly to understand what fields a listing has, then create `components/hotelaria/HotelSheet.tsx`:

```tsx
'use client'
import { useEffect } from 'react'

const amenityLabels: Record<string, string> = {
  piscina: 'Piscina',
  estacionamento: 'Estacionamento',
  'café da manhã': 'Café da manhã',
  'wi-fi': 'Wi-Fi',
  'ar-condicionado': 'Ar-condicionado',
  'pet-friendly': 'Pet-friendly',
}

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

interface Props {
  listing: SheetListing | null
  onClose: () => void
}

export default function HotelSheet({ listing, onClose }: Props) {
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

  const amenities = (listing.metadata.amenities as string[]) ?? []
  const hotelType = (listing.metadata.hotel_type as string) ?? ''
  const hotelTypeLabel: Record<string, string> = { pousada: 'Pousada', hotel: 'Hotel', airbnb: 'Airbnb' }
  const phone = listing.whatsapp_number || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5524999627968'
  const waMsg = encodeURIComponent(`Olá! Tenho interesse na hospedagem "${listing.title}" e gostaria de saber disponibilidade e valores.`)

  return (
    <>
      {/* Overlay */}
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40, backdropFilter: 'blur(2px)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
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
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.15rem' }}>
              Hospedagem {hotelTypeLabel[hotelType] ? `· ${hotelTypeLabel[hotelType]}` : ''}
            </p>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', color: 'var(--ocean-deep)', margin: 0 }}>
              {listing.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--border)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {listing.cover_image && (
            <div style={{ height: '200px', overflow: 'hidden', background: 'var(--sand)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={listing.cover_image} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}

          <div style={{ padding: '1.5rem' }}>
            {listing.description && (
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: '1.5rem' }}>
                {listing.description}
              </p>
            )}

            {amenities.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1rem', color: 'var(--ocean-deep)', marginBottom: '0.75rem' }}>
                  Comodidades
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {amenities.map((a: string) => (
                    <span key={a} style={{ fontSize: '0.8125rem', background: '#e0f2fe', color: '#0369a1', padding: '0.3rem 0.75rem', borderRadius: '9999px' }}>
                      {amenityLabels[a.toLowerCase()] ?? a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {listing.price_label && (
              <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.375rem', fontWeight: 700, color: 'var(--ocean-deep)', marginBottom: '1.25rem' }}>
                {listing.price_label}
              </p>
            )}

            <a
              href={`https://wa.me/${phone}?text=${waMsg}`}
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem', textDecoration: 'none', width: '100%', marginBottom: '0.875rem' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Solicitar disponibilidade
            </a>

            <a
              href={`/hotelaria/${listing.slug}`}
              style={{ display: 'block', textAlign: 'center', fontSize: '0.875rem', color: 'var(--ocean-mid)', fontWeight: 600, textDecoration: 'none', padding: '0.5rem' }}
            >
              Ver página completa →
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/hotelaria/HotelSheet.tsx
git commit -m "feat(hotelaria): HotelSheet quick-preview drawer"
```

---

### Task 5: `HotelariaPageClient` — listing grid with sheet state

**Files:**
- Create: `components/hotelaria/HotelariaPageClient.tsx`

- [ ] **Step 1: Create the client wrapper**

Create `components/hotelaria/HotelariaPageClient.tsx`:

```tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import HotelSheet, { type SheetListing } from './HotelSheet'

const amenityLabels: Record<string, string> = {
  piscina: 'Piscina',
  estacionamento: 'Estacionamento',
  'café da manhã': 'Café da manhã',
  'wi-fi': 'Wi-Fi',
  'ar-condicionado': 'Ar-condicionado',
  'pet-friendly': 'Pet-friendly',
}

const hotelTypeLabel: Record<string, string> = {
  pousada: 'Pousada',
  hotel: 'Hotel',
  airbnb: 'Airbnb',
}

interface Props {
  listings: SheetListing[]
  checkin?: string
  checkout?: string
  guests?: string
}

export default function HotelariaPageClient({ listings, checkin, checkout, guests }: Props) {
  const [activeListing, setActiveListing] = useState<SheetListing | null>(null)
  const hasSearch = !!(checkin && checkout)

  if (listings.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1.5rem', color: 'var(--text-muted)' }}>
        <p style={{ fontSize: '1.0625rem', marginBottom: '1rem' }}>
          {hasSearch ? 'Nenhuma hospedagem disponível para esse período.' : 'Em breve, pousadas e hotéis parceiros aqui.'}
        </p>
        {hasSearch ? (
          <Link href="/hotelaria" style={{ color: 'var(--ocean-mid)', fontWeight: 600 }}>
            Ver todas as hospedagens
          </Link>
        ) : (
          <p style={{ fontSize: '0.875rem' }}>
            É dono de uma hospedagem?{' '}
            <Link href="/seja-parceiro" style={{ color: 'var(--ocean-mid)', fontWeight: 600 }}>
              Cadastre seu negócio
            </Link>
          </p>
        )}
      </div>
    )
  }

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {listings.map(listing => {
          const meta = listing.metadata
          const typeLabel = hotelTypeLabel[(meta.hotel_type as string) ?? ''] ?? ''
          const amenities = (meta.amenities as string[]) ?? []
          const fullHref = hasSearch
            ? `/hotelaria/${listing.slug}?checkin=${checkin}&checkout=${checkout}&guests=${guests ?? 2}`
            : `/hotelaria/${listing.slug}`

          return (
            <div
              key={listing.id}
              style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}
            >
              {/* Image — clicking opens full page */}
              <Link href={fullHref} style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{ height: '180px', background: 'linear-gradient(135deg, var(--ocean-mid), var(--sunset))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {listing.cover_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={listing.cover_image} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5">
                      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                      <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                  )}
                </div>
              </Link>

              <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.0625rem', lineHeight: 1.3 }}>{listing.title}</h3>
                  {typeLabel && (
                    <span style={{ fontSize: '0.7rem', background: 'var(--sand)', padding: '0.2rem 0.6rem', borderRadius: '999px', whiteSpace: 'nowrap', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {typeLabel}
                    </span>
                  )}
                </div>

                {listing.description && (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '0.875rem', flex: 1,
                    display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {listing.description}
                  </p>
                )}

                {amenities.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.875rem' }}>
                    {amenities.slice(0, 4).map((a: string) => (
                      <span key={a} style={{ fontSize: '0.7rem', background: '#e0f2fe', color: '#0369a1', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                        {amenityLabels[a.toLowerCase()] ?? a}
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', gap: '0.5rem' }}>
                  {listing.price_label && (
                    <span style={{ fontWeight: 700, color: 'var(--ocean-mid)', fontSize: '0.9rem' }}>{listing.price_label}</span>
                  )}
                  <div style={{ display: 'flex', gap: '0.625rem', marginLeft: 'auto' }}>
                    <button
                      type="button"
                      onClick={() => setActiveListing(listing)}
                      style={{
                        fontSize: '0.8rem', color: 'var(--ocean-mid)', fontWeight: 600,
                        background: 'none', border: 'none', cursor: 'pointer', padding: '0.375rem 0.5rem',
                      }}
                    >
                      Ver detalhes →
                    </button>
                    <Link
                      href={fullHref}
                      style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, textDecoration: 'none', padding: '0.375rem 0.5rem' }}
                    >
                      Página completa
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <HotelSheet listing={activeListing} onClose={() => setActiveListing(null)} />
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/hotelaria/HotelariaPageClient.tsx
git commit -m "feat(hotelaria): HotelariaPageClient with sheet state"
```

---

### Task 6: Update `app/hotelaria/page.tsx` to use `HotelariaPageClient`

**Files:**
- Modify: `app/hotelaria/page.tsx`

- [ ] **Step 1: Replace the listings grid with `HotelariaPageClient`**

In `app/hotelaria/page.tsx`:

1. Add the import at the top:

```tsx
import HotelariaPageClient from '@/components/hotelaria/HotelariaPageClient'
import type { SheetListing } from '@/components/hotelaria/HotelSheet'
```

2. Inside `HotelariaPage`, after the `listings` filter logic, add a cast:

```tsx
const sheetListings: SheetListing[] = listings.map(l => ({
  id: l.id,
  slug: l.slug,
  title: l.title,
  description: l.description ?? null,
  cover_image: l.cover_image ?? null,
  price_label: l.price_label ?? null,
  whatsapp_number: (l as unknown as { whatsapp_number?: string }).whatsapp_number ?? null,
  metadata: (l.metadata as Record<string, unknown>) ?? {},
}))
```

3. Remove the entire `{listings.length === 0 ? ... : <div style={...}>{listings.map(listing => ...)}</div>}` block and replace with:

```tsx
{hasSearch && (
  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
    {listings.length} hospedagem{listings.length !== 1 ? 's' : ''} disponível{listings.length !== 1 ? 'veis' : ''} de <strong>{sp.checkin}</strong> a <strong>{sp.checkout}</strong>
    {' · '}
    <Link href="/hotelaria" style={{ color: 'var(--ocean-mid)', fontWeight: 600, textDecoration: 'none' }}>
      Limpar filtro
    </Link>
  </p>
)}

<HotelariaPageClient
  listings={sheetListings}
  checkin={sp.checkin}
  checkout={sp.checkout}
  guests={sp.guests}
/>
```

4. Remove the now-unused `amenityLabels` and `hotelTypeLabel` constants from `page.tsx` (they're now in `HotelariaPageClient.tsx`).

- [ ] **Step 2: Commit**

```bash
git add app/hotelaria/page.tsx
git commit -m "feat(hotelaria): delegate listing grid to HotelariaPageClient"
```

---

## Self-Review

**Spec coverage:**
- `service_providers` DB table ✅ (Task 1)
- TypeScript types ✅ (Task 2)
- Provider selection in ServiceSheet + extend to ALL services ✅ (Task 3)
- HotelSheet quick-preview drawer ✅ (Task 4)
- HotelariaPageClient with state management ✅ (Task 5)
- hotelaria page updated ✅ (Task 6)

**Placeholder scan:** No TBDs. All code blocks are complete.

**Behavior clarifications:**
- When a service has no providers configured in `service_providers`, the booking/WhatsApp section shows immediately (no provider selection step). This ensures the existing flow is unaffected until admin configures providers.
- The `fotografia` exception remains — clicking that card still navigates to `/fotografia` instead of opening a sheet.
- Clicking the hotel **image** or "Página completa" navigates to `/hotelaria/[slug]`. Clicking "Ver detalhes →" opens the quick sheet. Both coexist on the same card.
- `whatsapp_number` on `partner_listings` may not be in the `getApprovedListings` return type — the cast in Task 6 handles this gracefully with `?? null`.
