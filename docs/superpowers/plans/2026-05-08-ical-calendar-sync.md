# iCal Calendar Sync — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Two-way iCal sync between partner accommodation listings and external calendars (Google, Airbnb, Booking.com), managed from the partner dashboard — replacing the misplaced CalendarSyncBar on the public hotel page.

**Architecture:** The backend infrastructure already exists (`ical_sources` table, export `.ics` endpoint, per-listing sync route, Vercel Cron). This plan adds the missing DB columns + RLS, extracts the iCal parser to a shared lib, adds a partner-authenticated sync endpoint, and builds the partner dashboard UI section.

**Tech Stack:** Next.js 16 App Router, Supabase (RLS + admin client), TypeScript, date-fns (already installed)

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `supabase/migrations/014_ical_sources_partner.sql` | Add `label`, `active` columns + partner RLS policy |
| Create | `lib/ical/parse.ts` | Pure iCal date-range parser (extracted from existing route) |
| Modify | `app/api/ical/sync/[listingId]/route.ts` | Import parser from lib instead of inline |
| Create | `app/api/ical/sync-partner/[listingId]/route.ts` | Partner-session-authenticated sync endpoint |
| Modify | `app/hotelaria/[slug]/page.tsx` | Remove CalendarSyncBar import + usage |
| Delete | `components/hotelaria/CalendarSyncBar.tsx` | No longer needed |
| Modify | `app/conta/parceiro/anuncios/page.tsx` | Add iCal sync section for hospedagem listings |

---

## Task 1: DB Migration — add `label`, `active`, partner RLS

**Files:**
- Create: `supabase/migrations/014_ical_sources_partner.sql`

- [ ] **Step 1: Write the migration**

```sql
-- supabase/migrations/014_ical_sources_partner.sql

-- 1. Add missing columns
alter table ical_sources
  add column if not exists label  text not null default 'Calendário externo',
  add column if not exists active boolean not null default true;

-- 2. Partner RLS: partners can read/write sources for their own listings
create policy "Partners manage own ical_sources"
  on ical_sources for all
  using (
    exists (
      select 1
      from partner_listings pl
      join partners p on p.id = pl.partner_id
      where pl.id = ical_sources.listing_id
        and p.auth_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from partner_listings pl
      join partners p on p.id = pl.partner_id
      where pl.id = ical_sources.listing_id
        and p.auth_user_id = auth.uid()
    )
  );
```

- [ ] **Step 2: Apply the migration via Supabase MCP**

Run with `apply_migration` tool (project `hnsbstmzbidfehvycptl`):
- Name: `014_ical_sources_partner`
- Query: contents of the file above

- [ ] **Step 3: Verify**

Run SQL:
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'ical_sources' AND column_name IN ('label','active');
-- Expected: 2 rows

SELECT policyname FROM pg_policies WHERE tablename = 'ical_sources';
-- Expected: "Admin full access on ical_sources" + "Partners manage own ical_sources"
```

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/014_ical_sources_partner.sql
git commit -m "feat(db): add label/active to ical_sources + partner RLS policy"
```

---

## Task 2: Extract iCal parser to shared lib

**Files:**
- Create: `lib/ical/parse.ts`
- Modify: `app/api/ical/sync/[listingId]/route.ts`

- [ ] **Step 1: Create `lib/ical/parse.ts`**

```typescript
// lib/ical/parse.ts

/**
 * Parses an iCal string and returns an array of date strings ("YYYY-MM-DD")
 * representing every night within each VEVENT date range.
 * DTEND is exclusive (standard iCal all-day convention).
 */
export function parseICalDates(icalText: string): string[] {
  const dates: string[] = []
  const lines = icalText.replace(/\r\n/g, '\n').split('\n')
  let inEvent = false
  let dtstart: string | null = null
  let dtend: string | null = null

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') { inEvent = true; dtstart = null; dtend = null }
    if (!inEvent) continue

    if (line.startsWith('DTSTART') && !dtstart) {
      const val = line.split(':').slice(1).join(':').replace(/\D/g, '').slice(0, 8)
      if (val.length === 8)
        dtstart = `${val.slice(0, 4)}-${val.slice(4, 6)}-${val.slice(6, 8)}`
    }
    if (line.startsWith('DTEND') && !dtend) {
      const val = line.split(':').slice(1).join(':').replace(/\D/g, '').slice(0, 8)
      if (val.length === 8)
        dtend = `${val.slice(0, 4)}-${val.slice(4, 6)}-${val.slice(6, 8)}`
    }
    if (line === 'END:VEVENT' && dtstart) {
      const start = new Date(dtstart)
      const end = dtend ? new Date(dtend) : new Date(dtstart)
      const d = new Date(start)
      while (d < end) {
        dates.push(d.toISOString().split('T')[0])
        d.setDate(d.getDate() + 1)
      }
      if (!dtend) dates.push(dtstart)
      inEvent = false
    }
  }
  return dates
}
```

- [ ] **Step 2: Update `app/api/ical/sync/[listingId]/route.ts` to import from lib**

Replace the inline `parseICalDates` function with an import. The file becomes:

```typescript
// app/api/ical/sync/[listingId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { parseICalDates } from '@/lib/ical/parse'

export const dynamic = 'force-dynamic'

interface Params { params: Promise<{ listingId: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { listingId } = await params
  const supabase = await createAdminClient()

  const { data: sources } = await supabase
    .from('ical_sources')
    .select('id, url')
    .eq('listing_id', listingId)
    .eq('direction', 'import')
    .eq('active', true)

  if (!sources || sources.length === 0) {
    return NextResponse.json({ synced: 0 })
  }

  let totalUpserted = 0

  for (const source of sources) {
    try {
      const res = await fetch(source.url, { next: { revalidate: 0 } })
      if (!res.ok) {
        await supabase.from('ical_sources').update({ sync_status: 'error', error_message: `HTTP ${res.status}` }).eq('id', source.id)
        continue
      }
      const icalText = await res.text()
      const dates = parseICalDates(icalText)
      if (dates.length === 0) continue

      const rows = dates.map(date => ({
        listing_id: listingId,
        date,
        status: 'blocked' as const,
        source: 'ical' as const,
      }))

      const { error } = await supabase
        .from('accommodation_availability')
        .upsert(rows, { onConflict: 'listing_id,date', ignoreDuplicates: false })

      if (!error) totalUpserted += rows.length

      await supabase
        .from('ical_sources')
        .update({ last_synced_at: new Date().toISOString(), sync_status: 'ok', error_message: null })
        .eq('id', source.id)
    } catch (err) {
      await supabase
        .from('ical_sources')
        .update({ sync_status: 'error', error_message: String(err) })
        .eq('id', source.id)
    }
  }

  return NextResponse.json({ synced: totalUpserted })
}
```

Note: imports `createAdminClient` (not `createClient`) so the service role key bypasses RLS during the cron run.

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd acalanto-tours && npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add lib/ical/parse.ts app/api/ical/sync/[listingId]/route.ts
git commit -m "refactor(ical): extract parseICalDates to lib/ical/parse.ts"
```

---

## Task 3: Partner-authenticated sync endpoint

**Files:**
- Create: `app/api/ical/sync-partner/[listingId]/route.ts`

This endpoint is called from the partner dashboard when the partner clicks "Sincronizar agora". It validates the Supabase session and verifies listing ownership before running the sync.

- [ ] **Step 1: Create the file**

```typescript
// app/api/ical/sync-partner/[listingId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { parseICalDates } from '@/lib/ical/parse'

export const dynamic = 'force-dynamic'

interface Params { params: Promise<{ listingId: string }> }

export async function POST(_req: NextRequest, { params }: Params) {
  const { listingId } = await params

  // 1. Validate session
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // 2. Verify listing belongs to this partner
  const { data: listing } = await supabase
    .from('partner_listings')
    .select('id, partner_id')
    .eq('id', listingId)
    .single()

  if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: partner } = await supabase
    .from('partners')
    .select('id')
    .eq('id', listing.partner_id)
    .eq('auth_user_id', user.id)
    .single()

  if (!partner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // 3. Run sync with admin client (bypasses RLS for upsert)
  const admin = await createAdminClient()

  const { data: sources } = await admin
    .from('ical_sources')
    .select('id, url, label')
    .eq('listing_id', listingId)
    .eq('direction', 'import')
    .eq('active', true)

  if (!sources || sources.length === 0) {
    return NextResponse.json({ synced: 0, sources: 0 })
  }

  let totalUpserted = 0

  for (const source of sources) {
    try {
      const res = await fetch(source.url, { next: { revalidate: 0 } })
      if (!res.ok) {
        await admin.from('ical_sources')
          .update({ sync_status: 'error', error_message: `HTTP ${res.status}` })
          .eq('id', source.id)
        continue
      }
      const icalText = await res.text()
      const dates = parseICalDates(icalText)
      if (dates.length === 0) continue

      const rows = dates.map(date => ({
        listing_id: listingId,
        date,
        status: 'blocked' as const,
        source: 'ical' as const,
      }))

      const { error } = await admin
        .from('accommodation_availability')
        .upsert(rows, { onConflict: 'listing_id,date', ignoreDuplicates: false })

      if (!error) totalUpserted += rows.length

      await admin.from('ical_sources')
        .update({ last_synced_at: new Date().toISOString(), sync_status: 'ok', error_message: null })
        .eq('id', source.id)
    } catch (err) {
      await admin.from('ical_sources')
        .update({ sync_status: 'error', error_message: String(err) })
        .eq('id', source.id)
    }
  }

  return NextResponse.json({ synced: totalUpserted, sources: sources.length })
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/api/ical/sync-partner/[listingId]/route.ts
git commit -m "feat(api): partner-authenticated iCal sync endpoint"
```

---

## Task 4: Remove CalendarSyncBar from public hotel page

**Files:**
- Modify: `app/hotelaria/[slug]/page.tsx`
- Delete: `components/hotelaria/CalendarSyncBar.tsx`

- [ ] **Step 1: Edit `app/hotelaria/[slug]/page.tsx`**

Remove these lines:

```typescript
// DELETE this import:
import CalendarSyncBar from '@/components/hotelaria/CalendarSyncBar'

// DELETE this usage (inside the JSX, in the left/main content div):
<CalendarSyncBar slug={listing.slug} siteUrl={process.env.NEXT_PUBLIC_SITE_URL || 'https://acalantoturismo.com.br'} />
```

- [ ] **Step 2: Delete the component file**

```bash
rm components/hotelaria/CalendarSyncBar.tsx
```

- [ ] **Step 3: Verify TypeScript compiles and no remaining imports**

```bash
npx tsc --noEmit
grep -r "CalendarSyncBar" app/ components/
```
Expected: tsc clean, grep returns nothing.

- [ ] **Step 4: Commit**

```bash
git add app/hotelaria/[slug]/page.tsx
git rm components/hotelaria/CalendarSyncBar.tsx
git commit -m "feat: remove CalendarSyncBar from public hotel page"
```

---

## Task 5: Partner dashboard — iCal sync section UI

**Files:**
- Modify: `app/conta/parceiro/anuncios/page.tsx`

This task adds a collapsible "Sincronização de calendário" section inside each listing card that has `type === 'hospedagem'` and `status === 'approved'`.

The section has two parts:
1. **Seu calendário no Acalanto** — copy the export `.ics` URL
2. **Calendários externos** — list/add/delete import sources + "Sincronizar agora" button

- [ ] **Step 1: Add new types at the top of the file** (after existing `Listing` type)

```typescript
type IcalSource = {
  id: string
  label: string
  url: string
  active: boolean
  last_synced_at: string | null
  sync_status: string | null
  error_message: string | null
}
```

- [ ] **Step 2: Add state variables inside `MeusAnunciosPage`** (alongside existing state)

```typescript
// iCal sync state — keyed by listing id
const [icalSources, setIcalSources] = useState<Record<string, IcalSource[]>>({})
const [icalOpen, setIcalOpen] = useState<Record<string, boolean>>({})
const [icalAddingFor, setIcalAddingFor] = useState<string | null>(null)
const [icalNewLabel, setIcalNewLabel] = useState('')
const [icalNewUrl, setIcalNewUrl] = useState('')
const [icalSaving, setIcalSaving] = useState(false)
const [icalSyncing, setIcalSyncing] = useState<Record<string, boolean>>({})
const [icalCopied, setIcalCopied] = useState<Record<string, boolean>>({})
```

- [ ] **Step 3: Add iCal helper functions** (after existing `saveEdit` function)

```typescript
async function loadIcalSources(listingId: string) {
  const { data } = await supabase
    .from('ical_sources')
    .select('id, label, url, active, last_synced_at, sync_status, error_message')
    .eq('listing_id', listingId)
    .eq('direction', 'import')
    .order('created_at')
  setIcalSources(prev => ({ ...prev, [listingId]: data ?? [] }))
}

function toggleIcalSection(listingId: string) {
  const opening = !icalOpen[listingId]
  setIcalOpen(prev => ({ ...prev, [listingId]: opening }))
  if (opening && !icalSources[listingId]) loadIcalSources(listingId)
}

async function addIcalSource(listingId: string) {
  if (!icalNewLabel.trim() || !icalNewUrl.trim()) return
  setIcalSaving(true)
  await supabase.from('ical_sources').insert({
    listing_id: listingId,
    label: icalNewLabel.trim(),
    url: icalNewUrl.trim(),
    direction: 'import',
    active: true,
  })
  setIcalNewLabel('')
  setIcalNewUrl('')
  setIcalAddingFor(null)
  await loadIcalSources(listingId)
  setIcalSaving(false)
}

async function deleteIcalSource(listingId: string, sourceId: string) {
  await supabase.from('ical_sources').delete().eq('id', sourceId)
  await loadIcalSources(listingId)
}

async function syncNow(listingId: string) {
  setIcalSyncing(prev => ({ ...prev, [listingId]: true }))
  await fetch(`/api/ical/sync-partner/${listingId}`, { method: 'POST' })
  await loadIcalSources(listingId)
  setIcalSyncing(prev => ({ ...prev, [listingId]: false }))
}

async function copyIcalUrl(listingId: string, slug: string) {
  const url = `${window.location.origin}/api/ical/${slug}.ics`
  await navigator.clipboard.writeText(url)
  setIcalCopied(prev => ({ ...prev, [listingId]: true }))
  setTimeout(() => setIcalCopied(prev => ({ ...prev, [listingId]: false })), 2000)
}
```

- [ ] **Step 4: Add the UI section inside each listing card**

Inside the `listings.map(listing => ...)` block, add the iCal section after the closing `</div>` of the `{isEditing && ...}` block (i.e., as the last child of the outer listing card `<div>`):

```typescript
{/* iCal Sync — only for approved hospedagem */}
{listing.type === 'hospedagem' && listing.status === 'approved' && (
  <div style={{ borderTop: '1px solid var(--border)' }}>
    {/* Toggle header */}
    <button
      type="button"
      onClick={() => toggleIcalSection(listing.id)}
      style={{
        width: '100%', padding: '0.875rem 1.5rem', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        background: 'none', border: 'none', cursor: 'pointer',
        fontSize: '0.875rem', fontWeight: 600, color: 'var(--ocean-deep)',
        textAlign: 'left',
      }}
    >
      <span>🔄 Sincronização de calendário</span>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        {icalOpen[listing.id] ? '▲ Fechar' : '▼ Abrir'}
      </span>
    </button>

    {icalOpen[listing.id] && (
      <div style={{ padding: '0 1.5rem 1.5rem', background: '#f9fafb' }}>

        {/* Export: Seu calendário no Acalanto */}
        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'white', borderRadius: '0.625rem', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ocean-deep)', marginBottom: '0.35rem', marginTop: 0 }}>
            Seu calendário no Acalanto
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
            Cole esta URL no seu Google Calendar, Airbnb ou Booking.com para que eles vejam as reservas do Acalanto automaticamente.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <code style={{ flex: 1, fontSize: '0.7rem', background: '#f1f5f9', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', overflowX: 'auto', whiteSpace: 'nowrap', display: 'block' }}>
              {`${typeof window !== 'undefined' ? window.location.origin : ''}/api/ical/${listing.id}.ics`}
            </code>
            <button
              type="button"
              onClick={() => copyIcalUrl(listing.id, listing.id)}
              style={{ flexShrink: 0, padding: '0.5rem 0.875rem', background: icalCopied[listing.id] ? '#dcfce7' : 'var(--ocean-deep)', color: icalCopied[listing.id] ? '#166534' : 'white', border: 'none', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
            >
              {icalCopied[listing.id] ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>

        {/* Import: Calendários externos */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ocean-deep)', margin: 0 }}>
              Calendários externos
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => syncNow(listing.id)}
                disabled={icalSyncing[listing.id]}
                style={{ padding: '0.375rem 0.75rem', background: 'white', border: '1.5px solid var(--border)', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: 600, cursor: icalSyncing[listing.id] ? 'not-allowed' : 'pointer', opacity: icalSyncing[listing.id] ? 0.6 : 1 }}
              >
                {icalSyncing[listing.id] ? 'Sincronizando...' : '↺ Sincronizar agora'}
              </button>
              <button
                type="button"
                onClick={() => { setIcalAddingFor(listing.id); setIcalNewLabel(''); setIcalNewUrl('') }}
                style={{ padding: '0.375rem 0.75rem', background: 'var(--ocean-deep)', color: 'white', border: 'none', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
              >
                + Adicionar
              </button>
            </div>
          </div>

          {/* Add form */}
          {icalAddingFor === listing.id && (
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '0.625rem', padding: '1rem', marginBottom: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              <input
                type="text"
                placeholder="Nome (ex: Airbnb, Google Calendar)"
                value={icalNewLabel}
                onChange={e => setIcalNewLabel(e.target.value)}
                style={{ border: '1.5px solid var(--border)', borderRadius: '0.375rem', padding: '0.5rem 0.75rem', fontSize: '0.85rem', outline: 'none' }}
              />
              <input
                type="url"
                placeholder="URL iCal (começa com https://...)"
                value={icalNewUrl}
                onChange={e => setIcalNewUrl(e.target.value)}
                style={{ border: '1.5px solid var(--border)', borderRadius: '0.375rem', padding: '0.5rem 0.75rem', fontSize: '0.85rem', outline: 'none' }}
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => addIcalSource(listing.id)}
                  disabled={icalSaving || !icalNewLabel.trim() || !icalNewUrl.trim()}
                  style={{ padding: '0.5rem 1rem', background: 'var(--ocean-deep)', color: 'white', border: 'none', borderRadius: '0.375rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', opacity: icalSaving ? 0.6 : 1 }}
                >
                  {icalSaving ? 'Salvando...' : 'Salvar'}
                </button>
                <button
                  type="button"
                  onClick={() => setIcalAddingFor(null)}
                  style={{ padding: '0.5rem 1rem', background: 'white', border: '1.5px solid var(--border)', borderRadius: '0.375rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Sources list */}
          {(icalSources[listing.id] ?? []).length === 0 ? (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Nenhum calendário externo cadastrado ainda.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(icalSources[listing.id] ?? []).map(src => (
                <div key={src.id} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '0.625rem', padding: '0.75rem 1rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: '0 0 0.2rem' }}>{src.label}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '0 0 0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {src.url}
                    </p>
                    {src.sync_status === 'error' ? (
                      <p style={{ fontSize: '0.7rem', color: '#dc2626', margin: 0 }}>
                        Erro na última sync: {src.error_message ?? 'desconhecido'}
                      </p>
                    ) : src.last_synced_at ? (
                      <p style={{ fontSize: '0.7rem', color: '#16a34a', margin: 0 }}>
                        Última sync: {new Date(src.last_synced_at).toLocaleString('pt-BR')}
                      </p>
                    ) : (
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0, fontStyle: 'italic' }}>
                        Ainda não sincronizado
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteIcalSource(listing.id, src.id)}
                    style={{ flexShrink: 0, padding: '0.375rem 0.625rem', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '0.375rem', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )}
  </div>
)}
```

**Note on export URL:** The export URL in the copy section uses `listing.id` not `listing.slug` because the export route is `/api/ical/[slug]/route.ts`. Fix the `copyIcalUrl` call to pass `listing.slug` and render `${origin}/api/ical/${listing.slug}.ics` in the `<code>` block. The state for `icalCopied` should be keyed by `listing.id` (which is what we already have).

Actually, correct the code block in the export section to use slug:
```typescript
// In the <code> element, replace listing.id with listing.slug:
{`${typeof window !== 'undefined' ? window.location.origin : ''}/api/ical/${listing.id}.ics`}
// becomes:
{`${typeof window !== 'undefined' ? window.location.origin : ''}/api/ical/${(listing as Listing & { slug?: string }).slug ?? listing.id}.ics`}
```

Simpler: add `slug: string` to the `Listing` type at the top, and include `slug` in the Supabase select query:

```typescript
// In the Listing type, add:
slug: string

// In the supabase select in useEffect:
.select('id, title, type, status, rejection_reason, price_label, description, cover_image, active, slug')

// In the <code> and copyIcalUrl call:
{`${typeof window !== 'undefined' ? window.location.origin : ''}/api/ical/${listing.slug}.ics`}
// and:
onClick={() => copyIcalUrl(listing.id, listing.slug)}
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add app/conta/parceiro/anuncios/page.tsx
git commit -m "feat(parceiro): iCal calendar sync section in partner dashboard"
```

---

## Task 6: Push and verify deploy

- [ ] **Step 1: Push to main**

```bash
git push origin main
```

- [ ] **Step 2: Monitor Vercel deploy**

Check that the deployment reaches READY status. If build errors occur, read logs and fix.

- [ ] **Step 3: Smoke test**

1. Log in as a partner at `/conta/login`
2. Go to `/conta/parceiro/anuncios`
3. Open a hospedagem listing card → click "Sincronização de calendário"
4. Verify "Seu calendário no Acalanto" section shows with copy button
5. Click "+ Adicionar", enter label "Teste" and any valid iCal URL, save
6. Click "↺ Sincronizar agora", verify no error
7. Go to `/hotelaria/pousada-do-sossego` (or any hospedagem) — confirm CalendarSyncBar is gone

---

## Self-Review Checklist

- [x] **Spec coverage:** DB migration ✓ | export URL ✓ | import sources UI ✓ | partner RLS ✓ | cron already exists ✓ | CalendarSyncBar removed ✓
- [x] **No placeholders:** all code blocks complete
- [x] **Type consistency:** `IcalSource` type defined before use; `slug` added to `Listing` type before use in Task 5
- [x] **Conflict upsert:** uses `onConflict: 'listing_id,date'` — matches existing `accommodation_availability_listing_id_date_key` unique index
