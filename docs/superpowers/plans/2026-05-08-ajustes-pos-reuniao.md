# Ajustes Pós-Reunião Entrega Final — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement all pending Victor Lima tasks identified in the 2026-05-08 client delivery meeting for Acalanto Tours.

**Architecture:** Small targeted changes across admin forms, a client component, a confirmation page, and a new admin route. No DB migrations needed.

**Tech Stack:** Next.js 16.2.4 App Router, TypeScript, Tailwind CSS v4, Supabase. Package manager: npm (in this project). Working directory: `C:\Users\Victor Lima\Desktop\sites\tours\acalanto-tours`.

---

## File Map

| File | Action | Task |
|------|--------|------|
| `app/admin/negocio/escunas/novo/page.tsx` | Modify line 98-101 | Task 1 |
| `app/admin/negocio/servicos/novo/page.tsx` | Modify line 79-82 | Task 1 |
| `app/admin/negocio/fotografia/novo/page.tsx` | Modify line 78-80 | Task 1 |
| `components/photography/PackageSelector.tsx` | Modify partner name display | Task 2 |
| `app/(marketplace)/checkout/confirmacao/page.tsx` | Add email notice | Task 3 |
| `app/admin/reservas/page.tsx` | Add row links | Task 4 |
| `app/admin/reservas/[id]/page.tsx` | Create new file | Task 4 |
| `components/ui/GalleryLightbox.tsx` | Add onError handlers | Task 5 |

---

### Task 1: Adicionar Botão Upload nos formulários "Criar"

Replace `<input type="url">` with `ImageUploader` component in 3 create forms.

**Files:**
- Modify: `app/admin/negocio/escunas/novo/page.tsx`
- Modify: `app/admin/negocio/servicos/novo/page.tsx`
- Modify: `app/admin/negocio/fotografia/novo/page.tsx`

**Key:** `ImageUploader` is `'use client'` but can be imported into Server Components (RSC model). It renders a `<input type="hidden" name={name} value={url}>` so the Server Action reads it via `formData.get('cover_image')` — no changes needed to the action functions.

- [ ] **Step 1: Edit escunas/novo/page.tsx**

Add import after existing imports:
```typescript
import ImageUploader from '@/components/admin/ImageUploader'
```

Replace lines 98-101 (the URL input block):
```tsx
{/* OLD: */}
<div className="form-group">
  <label className="form-label">Imagem de capa (URL)</label>
  <input className="form-input" name="cover_image" type="url" placeholder="https://..." />
</div>

{/* NEW: */}
<ImageUploader name="cover_image" />
```

- [ ] **Step 2: Edit servicos/novo/page.tsx**

Add import:
```typescript
import ImageUploader from '@/components/admin/ImageUploader'
```

Replace lines 79-82:
```tsx
{/* OLD: */}
<div className="form-group">
  <label className="form-label">Imagem de capa (URL)</label>
  <input className="form-input" name="cover_image" type="url" placeholder="https://..." />
</div>

{/* NEW: */}
<ImageUploader name="cover_image" />
```

- [ ] **Step 3: Edit fotografia/novo/page.tsx**

Add import:
```typescript
import ImageUploader from '@/components/admin/ImageUploader'
```

Replace lines 78-80:
```tsx
{/* OLD: */}
<div className="form-group">
  <label className="form-label">Imagem de capa (URL)</label>
  <input className="form-input" name="cover_image" type="url" placeholder="https://..." />
</div>

{/* NEW: */}
<ImageUploader name="cover_image" />
```

- [ ] **Step 4: Commit**

```bash
git add app/admin/negocio/escunas/novo/page.tsx app/admin/negocio/servicos/novo/page.tsx app/admin/negocio/fotografia/novo/page.tsx
git commit -m "feat(admin): replace URL inputs with ImageUploader in create forms"
```

---

### Task 2: Ajustar Pacote Fotógrafo — "Fotógrafos de Parati"

Replace the dynamic partner name with the generic brand name "Fotógrafos de Parati".

**Files:**
- Modify: `components/photography/PackageSelector.tsx`

Current code (around line 70-74 in PackageSelector.tsx):
```tsx
{pkg.partners?.name && (
  <p style={{ margin: '0 0 0.25rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
    {pkg.partners.name}
  </p>
)}
```

- [ ] **Step 1: Edit PackageSelector.tsx**

Replace the conditional partner name display with a static label:
```tsx
<p style={{ margin: '0 0 0.25rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
  Fotógrafos de Parati
</p>
```

- [ ] **Step 2: Commit**

```bash
git add components/photography/PackageSelector.tsx
git commit -m "feat(fotografia): exibir 'Fotógrafos de Parati' em vez do nome do parceiro"
```

---

### Task 3: Ajustar Pagamento — Aviso de e-mail na confirmação

Add "Verifique seu e-mail" notice on the PIX/Boleto/Card confirmation page.

**Files:**
- Modify: `app/(marketplace)/checkout/confirmacao/page.tsx`

- [ ] **Step 1: Edit confirmacao/page.tsx**

After the `{paymentId && ...}` paragraph (around line 100), and before the PIX/Boleto/Card content blocks, add an email notice. Insert after the `paymentId` paragraph and before `{isPix && (`:

```tsx
{/* Email notice */}
<p
  style={{ fontFamily: 'var(--font-jakarta, sans-serif)', color: '#374151', fontSize: '0.875rem', textAlign: 'center', marginBottom: '1.25rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.625rem', padding: '0.625rem 1rem' }}
>
  📧 Um e-mail de confirmação foi enviado para você. Verifique sua caixa de entrada (e o spam).
</p>
```

- [ ] **Step 2: Commit**

```bash
git add "app/(marketplace)/checkout/confirmacao/page.tsx"
git commit -m "feat(checkout): adicionar aviso de e-mail na confirmação de pagamento"
```

---

### Task 4: Desenvolver Admin — Detalhes da reserva (click-through)

Make reservation rows clickable and create a detail page.

**Files:**
- Modify: `app/admin/reservas/page.tsx`
- Create: `app/admin/reservas/[id]/page.tsx`

- [ ] **Step 1: Edit reservas/page.tsx — add Link import and wrap rows**

Add import at top:
```typescript
import Link from 'next/link'
```

Wrap each `<tr>` so the entire row is a link. Replace the `<tr key={b.id} ...>` with a clickable row using `<tr>` + cursor pointer + `onClick` via a wrapping approach. Since `<tr>` can't be an `<a>`, use `onClick` with a relative style, or put a `<Link>` in the first `<td>`.

Simplest approach — make the first cell a `<Link>`:
```tsx
<tr key={b.id} style={{ borderTop: '1px solid var(--border)', background: i % 2 === 0 ? 'white' : '#fafbfc', cursor: 'pointer' }}
  onClick={() => {}} // handled by link in first cell
>
  <td style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--ocean-deep)' }}>
    <Link href={`/admin/reservas/${b.id}`} style={{ color: 'var(--ocean-deep)', textDecoration: 'none' }}>
      {(b.boats as { name: string } | null)?.name || '—'}
    </Link>
  </td>
```

Actually, use `<tr>` with an `onClick` that navigates. But in a Server Component this won't work. Instead, wrap the first cell in a `<Link>` and also convert the table to a client component, OR use CSS trick of making all cells contain the link. The cleanest server-compatible way: add `<Link href={...}>` in the first `<td>` only.

Better: convert just the `<tbody>` to a client component with `useRouter`, OR just make the first column a Link. Use the Link-in-first-cell approach for simplicity.

Replace the `<tbody>` block:
```tsx
<tbody>
  {bookings?.map((b, i) => (
    <tr key={b.id} style={{ borderTop: '1px solid var(--border)', background: i % 2 === 0 ? 'white' : '#fafbfc' }}>
      <td style={{ padding: '0.875rem 1rem', fontWeight: 600 }}>
        <Link href={`/admin/reservas/${b.id}`} style={{ color: 'var(--ocean-deep)', textDecoration: 'none', display: 'block' }}>
          {(b.boats as { name: string } | null)?.name || '—'}
        </Link>
      </td>
      {/* ...rest of cells unchanged... */}
```

- [ ] **Step 2: Create app/admin/reservas/[id]/page.tsx**

```typescript
import { createAdminClient } from '@/lib/supabase/server'
import { formatCents } from '@/lib/booking/pricing'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

const statusLabels: Record<string, string> = {
  pending: 'Aguardando pagamento',
  whatsapp_initiated: 'Iniciada pelo WhatsApp',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  no_show: 'No-show',
}

const statusColors: Record<string, string> = {
  pending: '#805ad5',
  whatsapp_initiated: '#d69e2e',
  confirmed: '#38a169',
  cancelled: '#e53e3e',
  no_show: '#a0aec0',
}

export default async function ReservaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createAdminClient()
  const { data: b } = await supabase
    .from('bookings')
    .select('*, boats(name, slug)')
    .eq('id', id)
    .maybeSingle()

  if (!b) notFound()

  const rows: [string, string][] = [
    ['ID', b.id],
    ['Embarcação', (b.boats as { name: string } | null)?.name ?? '—'],
    ['Data do passeio', b.tour_date ?? '—'],
    ['Adultos', String(b.adults ?? 0)],
    ['Crianças', String(b.children ?? 0)],
    ['Total', formatCents(b.total_cents)],
    ['Status', statusLabels[b.status] ?? b.status],
    ['Cliente', b.customer_name ?? '—'],
    ['E-mail', b.customer_email ?? '—'],
    ['Telefone', b.customer_phone ?? '—'],
    ['Método de pagamento', b.payment_method ?? '—'],
    ['ID pagamento', b.payment_id ?? '—'],
    ['Criado em', new Date(b.created_at!).toLocaleString('pt-BR')],
  ]

  return (
    <div style={{ padding: '2rem', maxWidth: '640px' }}>
      <Link href="/admin/reservas" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none' }}>← Reservas</Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '0.5rem 0 1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--ocean-deep)', margin: 0 }}>
          Reserva
        </h1>
        <span style={{
          background: `${statusColors[b.status] ?? '#6b7280'}20`,
          color: statusColors[b.status] ?? '#6b7280',
          fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.75rem', borderRadius: '999px',
        }}>
          {statusLabels[b.status] ?? b.status}
        </span>
      </div>

      <div style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <dl style={{ margin: 0 }}>
          {rows.map(([label, value], i) => (
            <div key={label} style={{
              display: 'flex', justifyContent: 'space-between', gap: '1rem',
              padding: '0.875rem 1.25rem',
              borderTop: i === 0 ? 'none' : '1px solid var(--border)',
              background: i % 2 === 0 ? 'white' : '#fafbfc',
            }}>
              <dt style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-jakarta)', flexShrink: 0 }}>{label}</dt>
              <dd style={{ margin: 0, fontSize: '0.9rem', fontFamily: 'var(--font-jakarta)', fontWeight: label === 'Total' ? 700 : 400, color: label === 'Total' ? 'var(--sunset)' : '#1a202c', textAlign: 'right', wordBreak: 'break-all' }}>{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {b.notes && (
        <div style={{ marginTop: '1.25rem', background: 'white', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: '1.25rem' }}>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1rem', color: 'var(--ocean-deep)', margin: '0 0 0.5rem' }}>Observações</h2>
          <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '0.9rem', color: '#374151', margin: 0 }}>{b.notes}</p>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/admin/reservas/page.tsx "app/admin/reservas/[id]/page.tsx"
git commit -m "feat(admin): reservas com link para detalhe + página de detalhe da reserva"
```

---

### Task 5: Corrigir Fotos — onError fallback no GalleryLightbox

Add `onError` handler to hide broken images and show a placeholder.

**Files:**
- Modify: `components/ui/GalleryLightbox.tsx`

- [ ] **Step 1: Edit GalleryLightbox.tsx**

For the grid thumbnails (Next.js `<Image>` component), add `onError` prop. Also add state to track which images failed.

Add state at top of component:
```typescript
const [failedIds, setFailedIds] = useState<Set<string>>(new Set())
const markFailed = (id: string) => setFailedIds(prev => new Set(prev).add(id))
```

In the grid, filter out failed images and add onError:
```tsx
{images.filter(img => !failedIds.has(img.id)).map((img, i) => (
  <button ...>
    <Image
      ...
      onError={() => markFailed(img.id)}
    />
    ...
  </button>
))}
```

For the lightbox `<img>` (line 124):
```tsx
<img
  src={images[idx].url}
  alt={images[idx].alt_text ?? `Foto ${idx + 1}`}
  style={{ ... }}
  onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
/>
```

- [ ] **Step 2: Commit**

```bash
git add components/ui/GalleryLightbox.tsx
git commit -m "fix(gallery): ocultar imagens quebradas com onError fallback"
```

---

### Task 6: Push e monitor deploy

After all tasks committed:

- [ ] **Step 1: Push**

```bash
git push origin main
```

- [ ] **Step 2: Monitor via Vercel MCP**

Use `mcp__87d03896__list_deployments` to find latest deployment, then poll until READY.
