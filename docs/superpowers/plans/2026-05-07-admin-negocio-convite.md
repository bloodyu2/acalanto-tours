# Admin Negócio + Convite de Parceiros — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give Acalanto admins full CRUD over boats, services and photographer packages, plus a partner-invite flow where the admin creates a business account and the owner receives an email invite to manage it directly.

**Architecture:** CRUD pages live under `/admin/negocio/[vertical]/` using Next.js server actions for mutations. The partner invite flow calls `supabase.auth.admin.inviteUserByEmail` (service role) and patches `partners.auth_user_id` in the auth callback when the user accepts.

**Tech Stack:** Next.js 16 App Router, Supabase (service role via `createAdminClient()`), server actions, inline CSS (project convention)

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `app/admin/layout.tsx` | Modify | Add "Negócios" nav item |
| `app/admin/negocio/page.tsx` | Create | Landing with counts for each section |
| `app/admin/negocio/escunas/page.tsx` | Create | List all boats |
| `app/admin/negocio/escunas/novo/page.tsx` | Create | Create boat form (server action) |
| `app/admin/negocio/escunas/[id]/page.tsx` | Create | Edit boat form (server action) |
| `app/admin/negocio/servicos/page.tsx` | Create | List all services |
| `app/admin/negocio/servicos/novo/page.tsx` | Create | Create service form |
| `app/admin/negocio/servicos/[id]/page.tsx` | Create | Edit service form |
| `app/admin/negocio/fotografia/page.tsx` | Create | List all photographer packages |
| `app/admin/negocio/fotografia/novo/page.tsx` | Create | Create package form |
| `app/admin/negocio/fotografia/[id]/page.tsx` | Create | Edit package form |
| `app/admin/parceiros/page.tsx` | Modify | Add "Novo Parceiro" button + edit links |
| `app/admin/parceiros/novo/page.tsx` | Create | Create partner + send email invite |
| `app/admin/parceiros/[id]/page.tsx` | Create | Edit partner data |
| `app/api/admin/partners/invite/route.ts` | Create | POST: create partner + inviteUserByEmail |
| `app/auth/callback/route.ts` | Modify | Link partner auth_user_id on invite accept |

---

### Task 1: Admin sidebar — add "Negócios" nav item

**Files:**
- Modify: `app/admin/layout.tsx`

- [ ] **Step 1: Add BriefcaseIcon and nav item**

In `app/admin/layout.tsx`, add after the existing `RoadmapIcon` definition:

```tsx
const BriefcaseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/>
    <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
  </svg>
)
```

In the `navItems` array, insert after `{ href: '/admin', label: 'Dashboard', ... }`:

```tsx
{ href: '/admin/negocio', label: 'Negócios', icon: <BriefcaseIcon /> },
```

- [ ] **Step 2: Commit**

```bash
git add app/admin/layout.tsx
git commit -m "feat(admin): add Negócios nav item"
```

---

### Task 2: Negócios landing page

**Files:**
- Create: `app/admin/negocio/page.tsx`

- [ ] **Step 1: Create file**

```tsx
// app/admin/negocio/page.tsx
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AdminNegocioPage() {
  const supabase = await createAdminClient()
  const [
    { count: boatsCount },
    { count: servicesCount },
    { count: pkgsCount },
    { count: partnersCount },
  ] = await Promise.all([
    supabase.from('boats').select('*', { count: 'exact', head: true }),
    supabase.from('services').select('*', { count: 'exact', head: true }),
    supabase.from('photographer_packages').select('*', { count: 'exact', head: true }),
    supabase.from('partners').select('*', { count: 'exact', head: true }),
  ])

  const sections = [
    { href: '/admin/negocio/escunas', label: 'Escunas', count: boatsCount ?? 0, desc: 'Passeios de barco', color: 'var(--ocean-mid)' },
    { href: '/admin/negocio/servicos', label: 'Serviços', count: servicesCount ?? 0, desc: 'Jeep, transfer, guia, etc.', color: '#D97706' },
    { href: '/admin/negocio/fotografia', label: 'Fotografia', count: pkgsCount ?? 0, desc: 'Pacotes fotográficos', color: '#8B5CF6' },
    { href: '/admin/parceiros', label: 'Parceiros', count: partnersCount ?? 0, desc: 'Negócios cadastrados', color: '#059669' },
  ]

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--ocean-deep)', marginBottom: '0.5rem' }}>
        Negócios
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Gerencie todos os produtos e parceiros da plataforma.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {sections.map(({ href, label, count, desc, color }) => (
          <Link key={href} href={href} style={{ textDecoration: 'none' }}>
            <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderTop: `4px solid ${color}` }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color, marginBottom: '0.25rem' }}>{count}</div>
              <div style={{ fontWeight: 700, color: 'var(--ocean-deep)', marginBottom: '0.25rem' }}>{label}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/admin/negocio/page.tsx
git commit -m "feat(admin): Negócios landing page with section counts"
```

---

### Task 3: Escunas CRUD

**Files:**
- Create: `app/admin/negocio/escunas/page.tsx`
- Create: `app/admin/negocio/escunas/novo/page.tsx`
- Create: `app/admin/negocio/escunas/[id]/page.tsx`

- [ ] **Step 1: List page**

```tsx
// app/admin/negocio/escunas/page.tsx
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function fmt(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default async function AdminEscunasPage() {
  const supabase = await createAdminClient()
  const { data: boats } = await supabase.from('boats').select('*').order('display_order')

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <Link href="/admin/negocio" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none' }}>← Negócios</Link>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--ocean-deep)', marginTop: '0.25rem' }}>Escunas</h1>
        </div>
        <Link href="/admin/negocio/escunas/novo" className="btn-primary" style={{ textDecoration: 'none', padding: '0.625rem 1.25rem', fontSize: '0.875rem' }}>
          + Nova Escuna
        </Link>
      </div>
      <div style={{ background: 'white', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f7f9fc', borderBottom: '1px solid var(--border)' }}>
              {['Nome', 'Saída', 'Duração', 'Adulto', 'Capacidade', 'Status', ''].map(h => (
                <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(boats ?? []).map(b => (
              <tr key={b.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--ocean-deep)' }}>{b.name}</div>
                  {b.tagline && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{b.tagline}</div>}
                </td>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem' }}>{b.departure_time?.slice(0, 5)}</td>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem' }}>{b.duration_hours}h</td>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem' }}>{fmt(b.price_adult)}</td>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem' }}>{b.capacity_max} pax</td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <span style={{ background: b.active ? '#38a16920' : '#a0aec020', color: b.active ? '#38a169' : '#a0aec0', fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: '999px' }}>
                    {b.active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <Link href={`/admin/negocio/escunas/${b.id}`} style={{ fontSize: '0.8rem', color: 'var(--ocean-mid)', fontWeight: 600, textDecoration: 'none' }}>Editar</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!boats || boats.length === 0) && (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhuma escuna cadastrada.</div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create form (server action)**

```tsx
// app/admin/negocio/escunas/novo/page.tsx
import { createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FEATURE_LABELS } from '@/lib/constants'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function createBoat(formData: FormData) {
  'use server'
  const supabase = await createAdminClient()
  const features = formData.getAll('features') as string[]
  const itineraryRaw = (formData.get('itinerary') as string) || '[]'
  let itinerary = []
  try { itinerary = JSON.parse(itineraryRaw) } catch { itinerary = [] }

  await supabase.from('boats').insert({
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    tagline: (formData.get('tagline') as string) || null,
    description: (formData.get('description') as string) || null,
    departure_time: formData.get('departure_time') as string,
    duration_hours: Number(formData.get('duration_hours')),
    price_adult: Math.round(Number(formData.get('price_adult')) * 100),
    price_child: Math.round(Number(formData.get('price_child')) * 100),
    capacity_max: Number(formData.get('capacity_max')),
    capacity_min: Number(formData.get('capacity_min') || 1),
    child_free_until_age: Number(formData.get('child_free_until_age') || 5),
    child_half_until_age: Number(formData.get('child_half_until_age') || 12),
    cover_image: (formData.get('cover_image') as string) || null,
    features,
    itinerary,
    active: formData.get('active') === 'on',
    display_order: Number(formData.get('display_order') || 99),
  })
  redirect('/admin/negocio/escunas')
}

export default function NovaEscunaPage() {
  return (
    <div style={{ padding: '2rem', maxWidth: '720px' }}>
      <Link href="/admin/negocio/escunas" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none' }}>← Escunas</Link>
      <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--ocean-deep)', margin: '0.5rem 0 1.5rem' }}>Nova Escuna</h1>
      <form action={createBoat} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div className="form-group">
          <label className="form-label">Nome *</label>
          <input className="form-input" name="name" required placeholder="ex: Ilha Rasa IV" />
        </div>
        <div className="form-group">
          <label className="form-label">Slug * (URL)</label>
          <input className="form-input" name="slug" required placeholder="ex: ilha-rasa-iv" />
        </div>
        <div className="form-group">
          <label className="form-label">Tagline</label>
          <input className="form-input" name="tagline" placeholder="Uma frase curta de destaque" />
        </div>
        <div className="form-group">
          <label className="form-label">Descrição</label>
          <textarea className="form-input" name="description" rows={4} style={{ resize: 'vertical' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Horário de saída *</label>
            <input className="form-input" name="departure_time" type="time" required defaultValue="10:30" />
          </div>
          <div className="form-group">
            <label className="form-label">Duração (horas) *</label>
            <input className="form-input" name="duration_hours" type="number" step="0.5" required defaultValue="5" />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Preço Adulto (R$) *</label>
            <input className="form-input" name="price_adult" type="number" step="0.01" required defaultValue="110" />
          </div>
          <div className="form-group">
            <label className="form-label">Preço Criança (R$) *</label>
            <input className="form-input" name="price_child" type="number" step="0.01" required defaultValue="55" />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Cap. máx *</label>
            <input className="form-input" name="capacity_max" type="number" required defaultValue="40" />
          </div>
          <div className="form-group">
            <label className="form-label">Cap. mín</label>
            <input className="form-input" name="capacity_min" type="number" defaultValue="1" />
          </div>
          <div className="form-group">
            <label className="form-label">Grátis até (anos)</label>
            <input className="form-input" name="child_free_until_age" type="number" defaultValue="5" />
          </div>
          <div className="form-group">
            <label className="form-label">Meia até (anos)</label>
            <input className="form-input" name="child_half_until_age" type="number" defaultValue="12" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Imagem de capa (URL)</label>
          <input className="form-input" name="cover_image" type="url" placeholder="https://..." />
        </div>
        <div className="form-group">
          <label className="form-label">Destaques</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
            {Object.entries(FEATURE_LABELS).map(([key, label]) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                <input type="checkbox" name="features" value={key} /> {label}
              </label>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Roteiro (JSON)</label>
          <textarea className="form-input" name="itinerary" rows={4} style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '0.82rem' }}
            placeholder={'[{"stop":"Ilha dos Cocos","minutes":40},{"stop":"Praia da Lula","minutes":60}]'} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Array de objetos com "stop" e "minutes"</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Ordem de exibição</label>
            <input className="form-input" name="display_order" type="number" defaultValue="99" />
          </div>
          <div className="form-group" style={{ paddingTop: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" name="active" defaultChecked /> Ativo
            </label>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="submit" className="btn-primary">Criar Escuna</button>
          <Link href="/admin/negocio/escunas" className="btn-outline" style={{ textDecoration: 'none' }}>Cancelar</Link>
        </div>
      </form>
    </div>
  )
}
```

- [ ] **Step 3: Edit form (server action)**

```tsx
// app/admin/negocio/escunas/[id]/page.tsx
import { createAdminClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { FEATURE_LABELS } from '@/lib/constants'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function updateBoat(id: string, formData: FormData) {
  'use server'
  const supabase = await createAdminClient()
  const features = formData.getAll('features') as string[]
  const itineraryRaw = (formData.get('itinerary') as string) || '[]'
  let itinerary = []
  try { itinerary = JSON.parse(itineraryRaw) } catch { itinerary = [] }

  await supabase.from('boats').update({
    name: formData.get('name') as string,
    tagline: (formData.get('tagline') as string) || null,
    description: (formData.get('description') as string) || null,
    departure_time: formData.get('departure_time') as string,
    duration_hours: Number(formData.get('duration_hours')),
    price_adult: Math.round(Number(formData.get('price_adult')) * 100),
    price_child: Math.round(Number(formData.get('price_child')) * 100),
    capacity_max: Number(formData.get('capacity_max')),
    capacity_min: Number(formData.get('capacity_min') || 1),
    child_free_until_age: Number(formData.get('child_free_until_age') || 5),
    child_half_until_age: Number(formData.get('child_half_until_age') || 12),
    cover_image: (formData.get('cover_image') as string) || null,
    features,
    itinerary,
    active: formData.get('active') === 'on',
    display_order: Number(formData.get('display_order') || 99),
  }).eq('id', id)
  redirect('/admin/negocio/escunas')
}

export default async function EditEscunaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createAdminClient()
  const { data: boat } = await supabase.from('boats').select('*').eq('id', id).single()
  if (!boat) notFound()

  const itineraryStr = Array.isArray(boat.itinerary) ? JSON.stringify(boat.itinerary, null, 2) : '[]'
  const updateWithId = updateBoat.bind(null, id)

  return (
    <div style={{ padding: '2rem', maxWidth: '720px' }}>
      <Link href="/admin/negocio/escunas" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none' }}>← Escunas</Link>
      <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--ocean-deep)', margin: '0.5rem 0 1.5rem' }}>
        Editar: {boat.name}
      </h1>
      <form action={updateWithId} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div className="form-group">
          <label className="form-label">Nome *</label>
          <input className="form-input" name="name" required defaultValue={boat.name} />
        </div>
        <div className="form-group">
          <label className="form-label">Tagline</label>
          <input className="form-input" name="tagline" defaultValue={boat.tagline ?? ''} />
        </div>
        <div className="form-group">
          <label className="form-label">Descrição</label>
          <textarea className="form-input" name="description" rows={4} style={{ resize: 'vertical' }} defaultValue={boat.description ?? ''} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Horário de saída *</label>
            <input className="form-input" name="departure_time" type="time" required defaultValue={boat.departure_time?.slice(0, 5)} />
          </div>
          <div className="form-group">
            <label className="form-label">Duração (horas) *</label>
            <input className="form-input" name="duration_hours" type="number" step="0.5" required defaultValue={boat.duration_hours} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Preço Adulto (R$) *</label>
            <input className="form-input" name="price_adult" type="number" step="0.01" required defaultValue={boat.price_adult / 100} />
          </div>
          <div className="form-group">
            <label className="form-label">Preço Criança (R$) *</label>
            <input className="form-input" name="price_child" type="number" step="0.01" required defaultValue={boat.price_child / 100} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Cap. máx *</label>
            <input className="form-input" name="capacity_max" type="number" required defaultValue={boat.capacity_max} />
          </div>
          <div className="form-group">
            <label className="form-label">Cap. mín</label>
            <input className="form-input" name="capacity_min" type="number" defaultValue={boat.capacity_min} />
          </div>
          <div className="form-group">
            <label className="form-label">Grátis até (anos)</label>
            <input className="form-input" name="child_free_until_age" type="number" defaultValue={boat.child_free_until_age} />
          </div>
          <div className="form-group">
            <label className="form-label">Meia até (anos)</label>
            <input className="form-input" name="child_half_until_age" type="number" defaultValue={boat.child_half_until_age} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Imagem de capa (URL)</label>
          <input className="form-input" name="cover_image" type="url" defaultValue={boat.cover_image ?? ''} />
        </div>
        <div className="form-group">
          <label className="form-label">Destaques</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
            {Object.entries(FEATURE_LABELS).map(([key, label]) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                <input type="checkbox" name="features" value={key} defaultChecked={boat.features?.includes(key)} /> {label}
              </label>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Roteiro (JSON)</label>
          <textarea className="form-input" name="itinerary" rows={6} style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '0.82rem' }} defaultValue={itineraryStr} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Ordem de exibição</label>
            <input className="form-input" name="display_order" type="number" defaultValue={boat.display_order} />
          </div>
          <div className="form-group" style={{ paddingTop: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" name="active" defaultChecked={boat.active} /> Ativo
            </label>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="submit" className="btn-primary">Salvar Alterações</button>
          <Link href="/admin/negocio/escunas" className="btn-outline" style={{ textDecoration: 'none' }}>Cancelar</Link>
        </div>
      </form>
    </div>
  )
}
```

- [ ] **Step 4: TypeScript check**

```bash
cd acalanto-tours && npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors.

- [ ] **Step 5: Commit**

```bash
git add app/admin/negocio/escunas/
git commit -m "feat(admin): escunas CRUD — list, create, edit"
```

---

### Task 4: Serviços CRUD

**Files:**
- Create: `app/admin/negocio/servicos/page.tsx`
- Create: `app/admin/negocio/servicos/novo/page.tsx`
- Create: `app/admin/negocio/servicos/[id]/page.tsx`

- [ ] **Step 1: List page**

```tsx
// app/admin/negocio/servicos/page.tsx
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function fmt(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default async function AdminServicosPage() {
  const supabase = await createAdminClient()
  const { data: services } = await supabase.from('services').select('*').order('display_order')

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <Link href="/admin/negocio" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none' }}>← Negócios</Link>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--ocean-deep)', marginTop: '0.25rem' }}>Serviços</h1>
        </div>
        <Link href="/admin/negocio/servicos/novo" className="btn-primary" style={{ textDecoration: 'none', padding: '0.625rem 1.25rem', fontSize: '0.875rem' }}>
          + Novo Serviço
        </Link>
      </div>
      <div style={{ background: 'white', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f7f9fc', borderBottom: '1px solid var(--border)' }}>
              {['Nome', 'Slug', 'Tipo Preço', 'Valor', 'Status', ''].map(h => (
                <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(services ?? []).map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--ocean-deep)' }}>{s.name}</div>
                  {s.description && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.description}</div>}
                </td>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{s.slug}</td>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem' }}>{s.pricing_type === 'per_person' ? 'Por pessoa' : 'Por grupo'}</td>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem' }}>
                  {s.price_cents_per_person ? fmt(s.price_cents_per_person) + '/pax'
                    : s.price_cents_group ? fmt(s.price_cents_group) + '/grp'
                    : s.price_label ?? '—'}
                </td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <span style={{ background: s.active ? '#38a16920' : '#a0aec020', color: s.active ? '#38a169' : '#a0aec0', fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: '999px' }}>
                    {s.active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <Link href={`/admin/negocio/servicos/${s.id}`} style={{ fontSize: '0.8rem', color: 'var(--ocean-mid)', fontWeight: 600, textDecoration: 'none' }}>Editar</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!services || services.length === 0) && (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum serviço cadastrado.</div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create form**

```tsx
// app/admin/negocio/servicos/novo/page.tsx
import { createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function createService(formData: FormData) {
  'use server'
  const supabase = await createAdminClient()
  const pricingType = formData.get('pricing_type') as 'per_person' | 'per_group'
  const ppRaw = formData.get('price_cents_per_person') as string
  const pgRaw = formData.get('price_cents_group') as string

  await supabase.from('services').insert({
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    description: (formData.get('description') as string) || null,
    pricing_type: pricingType,
    price_cents_per_person: pricingType === 'per_person' && ppRaw ? Math.round(Number(ppRaw) * 100) : null,
    price_cents_group: pricingType === 'per_group' && pgRaw ? Math.round(Number(pgRaw) * 100) : null,
    price_label: (formData.get('price_label') as string) || null,
    capacity_max: formData.get('capacity_max') ? Number(formData.get('capacity_max')) : null,
    cover_image: (formData.get('cover_image') as string) || null,
    active: formData.get('active') === 'on',
    display_order: Number(formData.get('display_order') || 99),
  })
  redirect('/admin/negocio/servicos')
}

export default function NovoServicoPage() {
  return (
    <div style={{ padding: '2rem', maxWidth: '640px' }}>
      <Link href="/admin/negocio/servicos" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none' }}>← Serviços</Link>
      <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--ocean-deep)', margin: '0.5rem 0 1.5rem' }}>Novo Serviço</h1>
      <form action={createService} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div className="form-group">
          <label className="form-label">Nome *</label>
          <input className="form-input" name="name" required placeholder="ex: Passeio de Jeep" />
        </div>
        <div className="form-group">
          <label className="form-label">Slug * (URL)</label>
          <input className="form-input" name="slug" required placeholder="ex: passeio-de-jeep" />
        </div>
        <div className="form-group">
          <label className="form-label">Descrição</label>
          <textarea className="form-input" name="description" rows={3} style={{ resize: 'vertical' }} />
        </div>
        <div className="form-group">
          <label className="form-label">Tipo de precificação *</label>
          <select className="form-input" name="pricing_type" required>
            <option value="per_person">Por pessoa</option>
            <option value="per_group">Por grupo</option>
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Preço por pessoa (R$)</label>
            <input className="form-input" name="price_cents_per_person" type="number" step="0.01" placeholder="80.00" />
          </div>
          <div className="form-group">
            <label className="form-label">Preço por grupo (R$)</label>
            <input className="form-input" name="price_cents_group" type="number" step="0.01" placeholder="500.00" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Label de preço (exibição)</label>
          <input className="form-input" name="price_label" placeholder="ex: A partir de R$ 80" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Capacidade máx.</label>
            <input className="form-input" name="capacity_max" type="number" placeholder="ex: 8" />
          </div>
          <div className="form-group">
            <label className="form-label">Ordem de exibição</label>
            <input className="form-input" name="display_order" type="number" defaultValue="99" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Imagem de capa (URL)</label>
          <input className="form-input" name="cover_image" type="url" placeholder="https://..." />
        </div>
        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="checkbox" name="active" defaultChecked /> Ativo
          </label>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="submit" className="btn-primary">Criar Serviço</button>
          <Link href="/admin/negocio/servicos" className="btn-outline" style={{ textDecoration: 'none' }}>Cancelar</Link>
        </div>
      </form>
    </div>
  )
}
```

- [ ] **Step 3: Edit form**

```tsx
// app/admin/negocio/servicos/[id]/page.tsx
import { createAdminClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function updateService(id: string, formData: FormData) {
  'use server'
  const supabase = await createAdminClient()
  const pricingType = formData.get('pricing_type') as 'per_person' | 'per_group'
  const ppRaw = formData.get('price_cents_per_person') as string
  const pgRaw = formData.get('price_cents_group') as string

  await supabase.from('services').update({
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || null,
    pricing_type: pricingType,
    price_cents_per_person: pricingType === 'per_person' && ppRaw ? Math.round(Number(ppRaw) * 100) : null,
    price_cents_group: pricingType === 'per_group' && pgRaw ? Math.round(Number(pgRaw) * 100) : null,
    price_label: (formData.get('price_label') as string) || null,
    capacity_max: formData.get('capacity_max') ? Number(formData.get('capacity_max')) : null,
    cover_image: (formData.get('cover_image') as string) || null,
    active: formData.get('active') === 'on',
    display_order: Number(formData.get('display_order') || 99),
  }).eq('id', id)
  redirect('/admin/negocio/servicos')
}

export default async function EditServicoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createAdminClient()
  const { data: s } = await supabase.from('services').select('*').eq('id', id).single()
  if (!s) notFound()

  const update = updateService.bind(null, id)

  return (
    <div style={{ padding: '2rem', maxWidth: '640px' }}>
      <Link href="/admin/negocio/servicos" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none' }}>← Serviços</Link>
      <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--ocean-deep)', margin: '0.5rem 0 1.5rem' }}>Editar: {s.name}</h1>
      <form action={update} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div className="form-group">
          <label className="form-label">Nome *</label>
          <input className="form-input" name="name" required defaultValue={s.name} />
        </div>
        <div className="form-group">
          <label className="form-label">Descrição</label>
          <textarea className="form-input" name="description" rows={3} style={{ resize: 'vertical' }} defaultValue={s.description ?? ''} />
        </div>
        <div className="form-group">
          <label className="form-label">Tipo de precificação *</label>
          <select className="form-input" name="pricing_type" required defaultValue={s.pricing_type ?? 'per_person'}>
            <option value="per_person">Por pessoa</option>
            <option value="per_group">Por grupo</option>
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Preço por pessoa (R$)</label>
            <input className="form-input" name="price_cents_per_person" type="number" step="0.01" defaultValue={s.price_cents_per_person ? s.price_cents_per_person / 100 : ''} />
          </div>
          <div className="form-group">
            <label className="form-label">Preço por grupo (R$)</label>
            <input className="form-input" name="price_cents_group" type="number" step="0.01" defaultValue={s.price_cents_group ? s.price_cents_group / 100 : ''} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Label de preço</label>
          <input className="form-input" name="price_label" defaultValue={s.price_label ?? ''} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Capacidade máx.</label>
            <input className="form-input" name="capacity_max" type="number" defaultValue={s.capacity_max ?? ''} />
          </div>
          <div className="form-group">
            <label className="form-label">Ordem de exibição</label>
            <input className="form-input" name="display_order" type="number" defaultValue={s.display_order} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Imagem de capa (URL)</label>
          <input className="form-input" name="cover_image" type="url" defaultValue={s.cover_image ?? ''} />
        </div>
        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="checkbox" name="active" defaultChecked={s.active} /> Ativo
          </label>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="submit" className="btn-primary">Salvar Alterações</button>
          <Link href="/admin/negocio/servicos" className="btn-outline" style={{ textDecoration: 'none' }}>Cancelar</Link>
        </div>
      </form>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add app/admin/negocio/servicos/
git commit -m "feat(admin): serviços CRUD — list, create, edit"
```

---

### Task 5: Fotografia CRUD

**Files:**
- Create: `app/admin/negocio/fotografia/page.tsx`
- Create: `app/admin/negocio/fotografia/novo/page.tsx`
- Create: `app/admin/negocio/fotografia/[id]/page.tsx`

- [ ] **Step 1: List page**

```tsx
// app/admin/negocio/fotografia/page.tsx
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function fmt(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default async function AdminFotografiaPage() {
  const supabase = await createAdminClient()
  const { data: pkgs } = await supabase
    .from('photographer_packages')
    .select('*, partners(name)')
    .order('display_order')

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <Link href="/admin/negocio" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none' }}>← Negócios</Link>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--ocean-deep)', marginTop: '0.25rem' }}>Fotografia</h1>
        </div>
        <Link href="/admin/negocio/fotografia/novo" className="btn-primary" style={{ textDecoration: 'none', padding: '0.625rem 1.25rem', fontSize: '0.875rem' }}>
          + Novo Pacote
        </Link>
      </div>
      <div style={{ background: 'white', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f7f9fc', borderBottom: '1px solid var(--border)' }}>
              {['Nome', 'Parceiro', 'Preço', 'Duração', 'Status', ''].map(h => (
                <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(pkgs ?? []).map(p => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const partner = (p as any).partners as { name: string } | null
              return (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <div style={{ fontWeight: 700, color: 'var(--ocean-deep)' }}>{p.name}</div>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem' }}>{partner?.name ?? '—'}</td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem' }}>{p.price_cents ? fmt(p.price_cents) : p.price_label ?? '—'}</td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem' }}>{p.duration_label ?? '—'}</td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <span style={{ background: p.active ? '#38a16920' : '#a0aec020', color: p.active ? '#38a169' : '#a0aec0', fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: '999px' }}>
                      {p.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <Link href={`/admin/negocio/fotografia/${p.id}`} style={{ fontSize: '0.8rem', color: 'var(--ocean-mid)', fontWeight: 600, textDecoration: 'none' }}>Editar</Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {(!pkgs || pkgs.length === 0) && (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum pacote cadastrado.</div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create form**

```tsx
// app/admin/negocio/fotografia/novo/page.tsx
import { createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function createPackage(formData: FormData) {
  'use server'
  const supabase = await createAdminClient()
  const includesRaw = (formData.get('includes') as string) || ''
  const includes = includesRaw.split('\n').map(s => s.trim()).filter(Boolean)
  const priceRaw = formData.get('price_cents') as string

  await supabase.from('photographer_packages').insert({
    partner_id: formData.get('partner_id') as string,
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    description: (formData.get('description') as string) || null,
    price_label: (formData.get('price_label') as string) || null,
    price_cents: priceRaw ? Math.round(Number(priceRaw) * 100) : null,
    duration_label: (formData.get('duration_label') as string) || null,
    cover_image: (formData.get('cover_image') as string) || null,
    includes,
    active: formData.get('active') === 'on',
    display_order: Number(formData.get('display_order') || 99),
  })
  redirect('/admin/negocio/fotografia')
}

export default async function NovoPacotePage() {
  const supabase = await createAdminClient()
  const { data: partners } = await supabase.from('partners').select('id, name').eq('active', true)

  return (
    <div style={{ padding: '2rem', maxWidth: '640px' }}>
      <Link href="/admin/negocio/fotografia" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none' }}>← Fotografia</Link>
      <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--ocean-deep)', margin: '0.5rem 0 1.5rem' }}>Novo Pacote</h1>
      <form action={createPackage} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div className="form-group">
          <label className="form-label">Parceiro (fotógrafo) *</label>
          <select className="form-input" name="partner_id" required>
            <option value="">Selecionar…</option>
            {(partners ?? []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Nome do pacote *</label>
          <input className="form-input" name="name" required placeholder="ex: Ensaio Casal" />
        </div>
        <div className="form-group">
          <label className="form-label">Slug * (URL)</label>
          <input className="form-input" name="slug" required placeholder="ex: ensaio-casal" />
        </div>
        <div className="form-group">
          <label className="form-label">Descrição</label>
          <textarea className="form-input" name="description" rows={3} style={{ resize: 'vertical' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Preço (R$)</label>
            <input className="form-input" name="price_cents" type="number" step="0.01" placeholder="800.00" />
          </div>
          <div className="form-group">
            <label className="form-label">Label de preço</label>
            <input className="form-input" name="price_label" placeholder="A partir de R$ 800" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Duração estimada</label>
          <input className="form-input" name="duration_label" placeholder="ex: 2 horas" />
        </div>
        <div className="form-group">
          <label className="form-label">O que inclui (um item por linha)</label>
          <textarea className="form-input" name="includes" rows={4} style={{ resize: 'vertical' }}
            placeholder={"30 fotos editadas\nEntrega em 7 dias\nArquivo digital em alta resolução"} />
        </div>
        <div className="form-group">
          <label className="form-label">Imagem de capa (URL)</label>
          <input className="form-input" name="cover_image" type="url" placeholder="https://..." />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Ordem de exibição</label>
            <input className="form-input" name="display_order" type="number" defaultValue="99" />
          </div>
          <div className="form-group" style={{ paddingTop: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" name="active" defaultChecked /> Ativo
            </label>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="submit" className="btn-primary">Criar Pacote</button>
          <Link href="/admin/negocio/fotografia" className="btn-outline" style={{ textDecoration: 'none' }}>Cancelar</Link>
        </div>
      </form>
    </div>
  )
}
```

- [ ] **Step 3: Edit form**

```tsx
// app/admin/negocio/fotografia/[id]/page.tsx
import { createAdminClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function updatePackage(id: string, formData: FormData) {
  'use server'
  const supabase = await createAdminClient()
  const includesRaw = (formData.get('includes') as string) || ''
  const includes = includesRaw.split('\n').map(s => s.trim()).filter(Boolean)
  const priceRaw = formData.get('price_cents') as string

  await supabase.from('photographer_packages').update({
    partner_id: formData.get('partner_id') as string,
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || null,
    price_label: (formData.get('price_label') as string) || null,
    price_cents: priceRaw ? Math.round(Number(priceRaw) * 100) : null,
    duration_label: (formData.get('duration_label') as string) || null,
    cover_image: (formData.get('cover_image') as string) || null,
    includes,
    active: formData.get('active') === 'on',
    display_order: Number(formData.get('display_order') || 99),
  }).eq('id', id)
  redirect('/admin/negocio/fotografia')
}

export default async function EditPacotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createAdminClient()
  const [{ data: pkg }, { data: partners }] = await Promise.all([
    supabase.from('photographer_packages').select('*').eq('id', id).single(),
    supabase.from('partners').select('id, name').eq('active', true),
  ])
  if (!pkg) notFound()

  const update = updatePackage.bind(null, id)
  const includesStr = (pkg.includes ?? []).join('\n')

  return (
    <div style={{ padding: '2rem', maxWidth: '640px' }}>
      <Link href="/admin/negocio/fotografia" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none' }}>← Fotografia</Link>
      <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--ocean-deep)', margin: '0.5rem 0 1.5rem' }}>Editar: {pkg.name}</h1>
      <form action={update} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div className="form-group">
          <label className="form-label">Parceiro (fotógrafo) *</label>
          <select className="form-input" name="partner_id" required defaultValue={pkg.partner_id}>
            {(partners ?? []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Nome do pacote *</label>
          <input className="form-input" name="name" required defaultValue={pkg.name} />
        </div>
        <div className="form-group">
          <label className="form-label">Descrição</label>
          <textarea className="form-input" name="description" rows={3} style={{ resize: 'vertical' }} defaultValue={pkg.description ?? ''} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Preço (R$)</label>
            <input className="form-input" name="price_cents" type="number" step="0.01" defaultValue={pkg.price_cents ? pkg.price_cents / 100 : ''} />
          </div>
          <div className="form-group">
            <label className="form-label">Label de preço</label>
            <input className="form-input" name="price_label" defaultValue={pkg.price_label ?? ''} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Duração estimada</label>
          <input className="form-input" name="duration_label" defaultValue={pkg.duration_label ?? ''} />
        </div>
        <div className="form-group">
          <label className="form-label">O que inclui (um item por linha)</label>
          <textarea className="form-input" name="includes" rows={4} style={{ resize: 'vertical' }} defaultValue={includesStr} />
        </div>
        <div className="form-group">
          <label className="form-label">Imagem de capa (URL)</label>
          <input className="form-input" name="cover_image" type="url" defaultValue={pkg.cover_image ?? ''} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Ordem de exibição</label>
            <input className="form-input" name="display_order" type="number" defaultValue={pkg.display_order} />
          </div>
          <div className="form-group" style={{ paddingTop: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" name="active" defaultChecked={pkg.active} /> Ativo
            </label>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="submit" className="btn-primary">Salvar Alterações</button>
          <Link href="/admin/negocio/fotografia" className="btn-outline" style={{ textDecoration: 'none' }}>Cancelar</Link>
        </div>
      </form>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add app/admin/negocio/fotografia/
git commit -m "feat(admin): fotografia CRUD — list, create, edit"
```

---

### Task 6: Partner invite flow

**Files:**
- Modify: `app/admin/parceiros/page.tsx`
- Create: `app/admin/parceiros/novo/page.tsx`
- Create: `app/admin/parceiros/[id]/page.tsx`
- Create: `app/api/admin/partners/invite/route.ts`
- Modify: `app/auth/callback/route.ts`

- [ ] **Step 1: Add "Novo Parceiro" button and edit links to list page**

In `app/admin/parceiros/page.tsx`, line 68, the existing header div lacks a button. Replace:
```tsx
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
  <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--ocean-deep)' }}>Parceiros</h1>
</div>
```
With:
```tsx
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
  <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--ocean-deep)' }}>Parceiros</h1>
  <Link href="/admin/parceiros/novo" className="btn-primary" style={{ textDecoration: 'none', padding: '0.625rem 1.25rem', fontSize: '0.875rem' }}>
    + Novo Parceiro
  </Link>
</div>
```

In each partner card (after the notes section, before the closing `</div>`), add:
```tsx
<div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
  <Link href={`/admin/parceiros/${p.id}`} style={{ fontSize: '0.8rem', color: 'var(--ocean-mid)', fontWeight: 600, textDecoration: 'none' }}>
    Editar →
  </Link>
</div>
```

Also add at the top of the file if not present: `import Link from 'next/link'`

- [ ] **Step 2: Create invite API route**

```ts
// app/api/admin/partners/invite/route.ts
import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createAdminClient()
  const body = await req.json() as {
    name: string; type: string; email: string;
    phone?: string; notes?: string; internal_rating?: number
  }
  const { name, type, email, phone, notes, internal_rating } = body

  if (!name || !type || !email) {
    return NextResponse.json({ error: 'name, type e email são obrigatórios' }, { status: 400 })
  }

  // Create partner row (auth_user_id will be set when user accepts invite)
  const { data: partner, error: partnerError } = await supabase
    .from('partners')
    .insert({ name, type, email, phone: phone || null, notes: notes || null, internal_rating: internal_rating ?? null, active: true })
    .select()
    .single()

  if (partnerError) {
    return NextResponse.json({ error: partnerError.message }, { status: 400 })
  }

  // Send invite email via Supabase Auth admin API
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/parceiros/dashboard`,
  })

  if (inviteError) {
    // Partner created but invite failed — return 207 so admin knows to retry
    return NextResponse.json({ partner, inviteError: inviteError.message }, { status: 207 })
  }

  return NextResponse.json({ partner })
}
```

- [ ] **Step 3: Create "novo parceiro" page (client component for async feedback)**

```tsx
// app/admin/parceiros/novo/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const PARTNER_TYPES = [
  { value: 'boat', label: 'Embarcação' },
  { value: 'photo', label: 'Fotografia' },
  { value: 'jeep', label: 'Jeep' },
  { value: 'guide', label: 'Guia Turístico' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'hotel', label: 'Hotel / Pousada' },
  { value: 'other', label: 'Outro' },
]

export default function NovoParceiroPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    const fd = new FormData(e.currentTarget)
    const body = {
      name: fd.get('name'),
      type: fd.get('type'),
      email: fd.get('email'),
      phone: fd.get('phone') || undefined,
      notes: fd.get('notes') || undefined,
      internal_rating: fd.get('internal_rating') ? Number(fd.get('internal_rating')) : undefined,
    }

    const res = await fetch('/api/admin/partners/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok && res.status !== 207) {
      setError(data.error ?? 'Erro ao criar parceiro')
      return
    }
    if (data.inviteError) {
      setSuccess(`Parceiro criado, mas o convite falhou: ${data.inviteError}`)
    } else {
      setSuccess(`Parceiro criado e convite enviado para ${body.email}!`)
      setTimeout(() => router.push('/admin/parceiros'), 2000)
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '600px' }}>
      <Link href="/admin/parceiros" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none' }}>← Parceiros</Link>
      <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--ocean-deep)', margin: '0.5rem 0 0.5rem' }}>Novo Parceiro</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        Preencha os dados do negócio. O responsável receberá um e-mail de convite para criar sua senha e acessar o portal de parceiro.
      </p>

      {error && (
        <div style={{ background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '8px', padding: '0.75rem 1rem', color: '#c53030', fontSize: '0.875rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ background: '#f0fff4', border: '1px solid #c6f6d5', borderRadius: '8px', padding: '0.75rem 1rem', color: '#276749', fontSize: '0.875rem', marginBottom: '1rem' }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div className="form-group">
          <label className="form-label">Nome do negócio *</label>
          <input className="form-input" name="name" required placeholder="ex: Fotografia Marina" />
        </div>
        <div className="form-group">
          <label className="form-label">Tipo *</label>
          <select className="form-input" name="type" required>
            <option value="">Selecionar tipo…</option>
            {PARTNER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">E-mail do responsável * (receberá o convite)</label>
          <input className="form-input" name="email" type="email" required placeholder="responsavel@exemplo.com" />
        </div>
        <div className="form-group">
          <label className="form-label">Telefone</label>
          <input className="form-input" name="phone" type="tel" placeholder="(24) 99999-0000" />
        </div>
        <div className="form-group">
          <label className="form-label">Avaliação interna (0–5)</label>
          <input className="form-input" name="internal_rating" type="number" min="0" max="5" step="0.1" placeholder="4.5" />
        </div>
        <div className="form-group">
          <label className="form-label">Notas internas</label>
          <textarea className="form-input" name="notes" rows={3} style={{ resize: 'vertical' }} placeholder="Observações internas sobre este parceiro…" />
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="submit" className="btn-primary" disabled={loading} style={{ opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Cadastrando…' : 'Cadastrar e Enviar Convite'}
          </button>
          <Link href="/admin/parceiros" className="btn-outline" style={{ textDecoration: 'none' }}>Cancelar</Link>
        </div>
      </form>
    </div>
  )
}
```

- [ ] **Step 4: Create partner edit page**

```tsx
// app/admin/parceiros/[id]/page.tsx
import { createAdminClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const PARTNER_TYPES = [
  { value: 'boat', label: 'Embarcação' },
  { value: 'photo', label: 'Fotografia' },
  { value: 'jeep', label: 'Jeep' },
  { value: 'guide', label: 'Guia Turístico' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'hotel', label: 'Hotel / Pousada' },
  { value: 'other', label: 'Outro' },
]

async function updatePartner(id: string, formData: FormData) {
  'use server'
  const supabase = await createAdminClient()
  await supabase.from('partners').update({
    name: formData.get('name') as string,
    type: formData.get('type') as string,
    email: (formData.get('email') as string) || null,
    phone: (formData.get('phone') as string) || null,
    notes: (formData.get('notes') as string) || null,
    internal_rating: formData.get('internal_rating') ? Number(formData.get('internal_rating')) : null,
    active: formData.get('active') === 'on',
  }).eq('id', id)
  redirect('/admin/parceiros')
}

export default async function EditParceiroPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createAdminClient()
  const { data: partner } = await supabase.from('partners').select('*').eq('id', id).single()
  if (!partner) notFound()

  const update = updatePartner.bind(null, id)

  return (
    <div style={{ padding: '2rem', maxWidth: '600px' }}>
      <Link href="/admin/parceiros" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none' }}>← Parceiros</Link>
      <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--ocean-deep)', margin: '0.5rem 0 1.5rem' }}>
        Editar: {partner.name}
      </h1>
      {partner.auth_user_id && (
        <div style={{ background: '#f0fff4', border: '1px solid #c6f6d5', borderRadius: '8px', padding: '0.625rem 1rem', color: '#276749', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
          ✓ Conta de acesso vinculada — parceiro pode acessar o portal
        </div>
      )}
      {!partner.auth_user_id && partner.email && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '0.625rem 1rem', color: '#92400e', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
          ⏳ Convite pendente — o parceiro ainda não aceitou o convite
        </div>
      )}
      <form action={update} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div className="form-group">
          <label className="form-label">Nome *</label>
          <input className="form-input" name="name" required defaultValue={partner.name} />
        </div>
        <div className="form-group">
          <label className="form-label">Tipo *</label>
          <select className="form-input" name="type" required defaultValue={partner.type}>
            {PARTNER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">E-mail</label>
          <input className="form-input" name="email" type="email" defaultValue={partner.email ?? ''} />
        </div>
        <div className="form-group">
          <label className="form-label">Telefone</label>
          <input className="form-input" name="phone" defaultValue={partner.phone ?? ''} />
        </div>
        <div className="form-group">
          <label className="form-label">Avaliação interna (0–5)</label>
          <input className="form-input" name="internal_rating" type="number" min="0" max="5" step="0.1" defaultValue={partner.internal_rating ?? ''} />
        </div>
        <div className="form-group">
          <label className="form-label">Notas internas</label>
          <textarea className="form-input" name="notes" rows={3} style={{ resize: 'vertical' }} defaultValue={partner.notes ?? ''} />
        </div>
        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="checkbox" name="active" defaultChecked={partner.active} /> Ativo
          </label>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="submit" className="btn-primary">Salvar Alterações</button>
          <Link href="/admin/parceiros" className="btn-outline" style={{ textDecoration: 'none' }}>Cancelar</Link>
        </div>
      </form>
    </div>
  )
}
```

- [ ] **Step 5: Update auth callback to link partner on invite accept**

Replace the entire content of `app/auth/callback/route.ts`:

```ts
// app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') ?? '/conta'

  if (code) {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.exchangeCodeForSession(code)

    // Link partner auth_user_id when a partner accepts their invite
    if (session?.user) {
      const user = session.user
      const { data: partner } = await supabase
        .from('partners')
        .select('id')
        .eq('email', user.email!)
        .is('auth_user_id', null)
        .maybeSingle()

      if (partner) {
        // Link the user to the partner row
        await supabase
          .from('partners')
          .update({ auth_user_id: user.id })
          .eq('id', partner.id)

        // Create profiles row so partner dashboard auth guard works
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('auth_user_id', user.id)
          .maybeSingle()

        if (!existing) {
          await supabase.from('profiles').insert({
            auth_user_id: user.id,
            role: 'partner',
            partner_id: partner.id,
          })
        }
      }
    }
  }

  return NextResponse.redirect(new URL(next, request.url))
}
```

- [ ] **Step 6: TypeScript check + commit**

```bash
npx tsc --noEmit 2>&1 | head -20
git add app/admin/parceiros/ app/api/admin/partners/ app/auth/callback/route.ts
git commit -m "feat(admin): partner invite — create partner, send email invite, link on accept"
```

---

## Self-Review

**Spec coverage:**
- ✅ Admin can CRUD boats (Task 3)
- ✅ Admin can CRUD services (Task 4)
- ✅ Admin can CRUD photographer packages (Task 5)
- ✅ Admin can create partner + send email invite (Task 6)
- ✅ Partner receives email → accepts → account linked → can access /parceiros/dashboard (Task 6, Steps 2+5)
- ✅ Admin can edit existing partner data (Task 6, Step 4)
- ✅ Negócios nav item and landing page (Tasks 1+2)

**Placeholder scan:** None found — all code blocks are complete.

**Type consistency:** `createAdminClient` used throughout (existing pattern). `Partner` type from `lib/types/database.ts` includes `auth_user_id` (confirmed in DB schema).
