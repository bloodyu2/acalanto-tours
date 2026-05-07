# Partner Portal — Complete Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fully functional partner dashboard at `/parceiros/dashboard` where logged-in partners see their bookings, revenue summary, payout history, availability calendar management (for accommodation partners), and profile editing — all behind Supabase Auth + role='partner' guard.

**Architecture:** Server Components fetch data using the Supabase server client. A `ParceiroLayout` wraps all `/parceiros/dashboard/*` routes with an auth guard that reads the session and the `profiles + partners` join. Client components handle interactive pieces (availability toggle, profile form). No new npm packages — same stack as admin panel.

**Tech Stack:** Next.js 15 App Router, TypeScript, Supabase Auth (existing), `@supabase/ssr` server client, inline CSS following existing codebase style.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `app/parceiros/dashboard/layout.tsx` | Auth guard — redirect to /parceiros/login if no session or role≠partner |
| Create | `app/parceiros/dashboard/page.tsx` | Overview: KPIs (bookings this month, revenue, pending payout) + recent bookings |
| Create | `app/parceiros/dashboard/reservas/page.tsx` | Full bookings list filtered to this partner |
| Create | `app/parceiros/dashboard/financeiro/page.tsx` | Revenue breakdown + payout history table |
| Create | `app/parceiros/dashboard/disponibilidade/page.tsx` | Availability calendar for accommodation partners (mark dates blocked/available) |
| Create | `app/parceiros/dashboard/perfil/page.tsx` | Edit partner name, phone, bio, Instagram, WhatsApp |
| Create | `app/api/parceiros/availability/route.ts` | POST: toggle a date blocked/available in accommodation_availability |
| Modify | `app/parceiros/login/page.tsx` | After login, redirect to /parceiros/dashboard instead of push placeholder |

---

## Task 1: Auth-guarded layout for /parceiros/dashboard

**Files:**
- Create: `app/parceiros/dashboard/layout.tsx`

- [ ] **Step 1: Create the layout**

```tsx
// app/parceiros/dashboard/layout.tsx
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function ParceiroDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/parceiros/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, partner_id, partners(name, type)')
    .eq('auth_user_id', session.user.id)
    .single()

  if (!profile || profile.role !== 'partner' || !profile.partner_id) {
    redirect('/parceiros/login')
  }

  const partner = Array.isArray(profile.partners)
    ? profile.partners[0]
    : profile.partners as { name: string; type: string } | null

  const navItems = [
    { href: '/parceiros/dashboard', label: 'Visão geral', icon: '◈' },
    { href: '/parceiros/dashboard/reservas', label: 'Reservas', icon: '📋' },
    { href: '/parceiros/dashboard/financeiro', label: 'Financeiro', icon: '💰' },
    ...(partner?.type === 'hospedagem' ? [{ href: '/parceiros/dashboard/disponibilidade', label: 'Disponibilidade', icon: '📅' }] : []),
    { href: '/parceiros/dashboard/perfil', label: 'Perfil', icon: '👤' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'var(--font-jakarta)' }}>
      {/* Sidebar */}
      <aside style={{
        width: '240px',
        background: 'var(--ocean-deep)',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        padding: '0',
      }}>
        <div style={{ padding: '1.5rem 1.5rem 1rem' }}>
          <div style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.125rem', fontWeight: 700, color: 'white', marginBottom: '0.2rem' }}>
            {partner?.name ?? 'Parceiro'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Portal do Parceiro
          </div>
        </div>
        <nav style={{ flex: 1, padding: '0.5rem 0' }}>
          {navItems.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1.5rem',
                color: 'rgba(255,255,255,0.75)',
                textDecoration: 'none',
                fontSize: '0.9rem',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Link href="/" style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', textDecoration: 'none', marginBottom: '0.75rem' }}>
            ← Ver site
          </Link>
          <form action="/api/auth/signout" method="post">
            <button type="submit" style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.875rem', padding: 0 }}>
              Sair
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, background: '#f7f9fc', overflow: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Create signout API route (reuse or create)**

Check if `app/api/auth/signout/route.ts` exists. If not, create it:

```typescript
// app/api/auth/signout/route.ts
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function POST() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/parceiros/login')
}
```

- [ ] **Step 3: Commit**

```bash
git add app/parceiros/dashboard/layout.tsx app/api/auth/signout/route.ts
git commit -m "feat: partner dashboard layout with auth guard and sidebar"
```

---

## Task 2: Dashboard overview page (KPIs + recent bookings)

**Files:**
- Create: `app/parceiros/dashboard/page.tsx`

- [ ] **Step 1: Create the overview page**

```tsx
// app/parceiros/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

function fmtCents(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default async function ParceiroDashboardPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/parceiros/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('partner_id')
    .eq('auth_user_id', session.user.id)
    .single()

  const partnerId = profile?.partner_id
  if (!partnerId) redirect('/parceiros/login')

  const now = new Date()
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

  // Bookings this month for this partner
  const { data: monthBookings } = await supabase
    .from('bookings')
    .select('id, total_cents, status, customer_name, tour_date, vertical, created_at')
    .eq('partner_id', partnerId)
    .gte('created_at', monthStart)
    .order('created_at', { ascending: false })

  const bookings = monthBookings ?? []
  const confirmedBookings = bookings.filter(b => ['confirmed', 'paid'].includes(b.status))
  const grossRevenue = confirmedBookings.reduce((s, b) => s + (b.total_cents ?? 0), 0)

  // Pending payout
  const { data: pendingPayout } = await supabase
    .from('payouts')
    .select('net_cents')
    .eq('partner_id', partnerId)
    .eq('status', 'pending')
  const pendingTotal = (pendingPayout ?? []).reduce((s, p) => s + (p.net_cents ?? 0), 0)

  // Recent 5 bookings (all time)
  const { data: recentBookings } = await supabase
    .from('bookings')
    .select('id, customer_name, tour_date, vertical, total_cents, status, created_at')
    .eq('partner_id', partnerId)
    .order('created_at', { ascending: false })
    .limit(5)

  const kpis = [
    { label: 'Reservas este mês', value: String(bookings.length), sub: `${confirmedBookings.length} confirmadas` },
    { label: 'Receita bruta (mês)', value: fmtCents(grossRevenue), sub: 'vendas confirmadas' },
    { label: 'Repasse pendente', value: fmtCents(pendingTotal), sub: 'a receber da Acalanto' },
  ]

  const statusLabel: Record<string, { text: string; color: string }> = {
    pending: { text: 'Pendente', color: '#d97706' },
    confirmed: { text: 'Confirmada', color: '#16a34a' },
    paid: { text: 'Pago', color: '#16a34a' },
    cancelled: { text: 'Cancelada', color: '#dc2626' },
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px' }}>
      <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: '#0f172a', marginBottom: '0.25rem' }}>
        Visão Geral
      </h1>
      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Resumo do mês atual
      </p>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        {kpis.map(k => (
          <div key={k.label} style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
            <p style={{ margin: '0 0 0.375rem', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k.label}</p>
            <p style={{ margin: '0 0 0.25rem', fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', fontFamily: 'var(--font-playfair)' }}>{k.value}</p>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Recent bookings */}
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Últimas reservas</h2>
        </div>
        {(recentBookings ?? []).length === 0 ? (
          <p style={{ padding: '2rem', color: '#94a3b8', textAlign: 'center' }}>Nenhuma reserva ainda.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Cliente', 'Data', 'Tipo', 'Valor', 'Status'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(recentBookings ?? []).map((b, i) => {
                const st = statusLabel[b.status] ?? { text: b.status, color: '#64748b' }
                return (
                  <tr key={b.id} style={{ borderTop: i > 0 ? '1px solid #f1f5f9' : undefined }}>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#0f172a' }}>{b.customer_name ?? '—'}</td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#64748b' }}>{b.tour_date ?? '—'}</td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#64748b', textTransform: 'capitalize' }}>{b.vertical ?? '—'}</td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>{fmtCents(b.total_cents ?? 0)}</td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{ display: 'inline-block', padding: '0.2rem 0.625rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, color: st.color, background: `${st.color}18` }}>
                        {st.text}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/parceiros/dashboard/page.tsx
git commit -m "feat: partner dashboard overview with KPIs and recent bookings"
```

---

## Task 3: Bookings list page

**Files:**
- Create: `app/parceiros/dashboard/reservas/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
// app/parceiros/dashboard/reservas/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

function fmtCents(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default async function ParceiroReservasPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/parceiros/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('partner_id')
    .eq('auth_user_id', session.user.id)
    .single()
  if (!profile?.partner_id) redirect('/parceiros/login')

  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, customer_name, customer_email, customer_phone, tour_date, vertical, adults, children, total_cents, status, commission_rate, notes, created_at')
    .eq('partner_id', profile.partner_id)
    .order('created_at', { ascending: false })

  const statusLabel: Record<string, { text: string; color: string }> = {
    pending: { text: 'Pendente', color: '#d97706' },
    confirmed: { text: 'Confirmada', color: '#16a34a' },
    paid: { text: 'Pago', color: '#16a34a' },
    cancelled: { text: 'Cancelada', color: '#dc2626' },
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1100px' }}>
      <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: '#0f172a', marginBottom: '0.25rem' }}>
        Reservas
      </h1>
      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Todas as reservas vinculadas ao seu perfil
      </p>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {(bookings ?? []).length === 0 ? (
          <p style={{ padding: '3rem', color: '#94a3b8', textAlign: 'center' }}>Nenhuma reserva ainda.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Data', 'Cliente', 'Contato', 'Tipo', 'Pessoas', 'Valor', 'Comissão', 'Status'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(bookings ?? []).map((b, i) => {
                  const st = statusLabel[b.status] ?? { text: b.status, color: '#64748b' }
                  const commissionCents = Math.round((b.total_cents ?? 0) * (b.commission_rate ?? 30) / 100)
                  const netCents = (b.total_cents ?? 0) - commissionCents
                  return (
                    <tr key={b.id} style={{ borderTop: i > 0 ? '1px solid #f1f5f9' : undefined }}>
                      <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap' }}>{b.tour_date ?? '—'}</td>
                      <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#0f172a' }}>{b.customer_name ?? '—'}</td>
                      <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: '#64748b' }}>
                        {b.customer_phone && <div>{b.customer_phone}</div>}
                        {b.customer_email && <div style={{ fontSize: '0.75rem' }}>{b.customer_email}</div>}
                      </td>
                      <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: '#64748b', textTransform: 'capitalize' }}>{b.vertical ?? '—'}</td>
                      <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: '#64748b' }}>{(b.adults ?? 0) + (b.children ?? 0)} pax</td>
                      <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap' }}>{fmtCents(b.total_cents ?? 0)}</td>
                      <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                        <div style={{ color: '#dc2626' }}>-{fmtCents(commissionCents)} ({b.commission_rate}%)</div>
                        <div style={{ color: '#16a34a', fontWeight: 600 }}>={fmtCents(netCents)}</div>
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <span style={{ display: 'inline-block', padding: '0.2rem 0.625rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, color: st.color, background: `${st.color}18`, whiteSpace: 'nowrap' }}>
                          {st.text}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/parceiros/dashboard/reservas/page.tsx
git commit -m "feat: partner bookings list with commission breakdown"
```

---

## Task 4: Financial page (revenue + payouts)

**Files:**
- Create: `app/parceiros/dashboard/financeiro/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
// app/parceiros/dashboard/financeiro/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

function fmtCents(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default async function ParceiroFinanceiroPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/parceiros/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('partner_id')
    .eq('auth_user_id', session.user.id)
    .single()
  if (!profile?.partner_id) redirect('/parceiros/login')

  const partnerId = profile.partner_id

  // All paid bookings
  const { data: paidBookings } = await supabase
    .from('bookings')
    .select('id, total_cents, commission_rate, tour_date, vertical, created_at')
    .eq('partner_id', partnerId)
    .in('status', ['confirmed', 'paid'])
    .order('created_at', { ascending: false })

  const allBookings = paidBookings ?? []
  const totalGross = allBookings.reduce((s, b) => s + (b.total_cents ?? 0), 0)
  const totalCommission = allBookings.reduce((s, b) => s + Math.round((b.total_cents ?? 0) * (b.commission_rate ?? 30) / 100), 0)
  const totalNet = totalGross - totalCommission

  // Payouts
  const { data: payouts } = await supabase
    .from('payouts')
    .select('id, period_month, gross_cents, commission_cents, net_cents, status, paid_at, notes')
    .eq('partner_id', partnerId)
    .order('period_month', { ascending: false })

  const pendingNet = (payouts ?? []).filter(p => p.status === 'pending').reduce((s, p) => s + (p.net_cents ?? 0), 0)

  return (
    <div style={{ padding: '2rem', maxWidth: '900px' }}>
      <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: '#0f172a', marginBottom: '0.25rem' }}>
        Financeiro
      </h1>
      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Receita, comissões e repasses
      </p>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        {[
          { label: 'Receita bruta total', value: fmtCents(totalGross), color: '#0f172a' },
          { label: 'Comissão Acalanto', value: `-${fmtCents(totalCommission)}`, color: '#dc2626' },
          { label: 'Seu valor líquido', value: fmtCents(totalNet), color: '#16a34a' },
          { label: 'Repasse pendente', value: fmtCents(pendingNet), color: '#d97706' },
        ].map(k => (
          <div key={k.label} style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
            <p style={{ margin: '0 0 0.375rem', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k.label}</p>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: k.color, fontFamily: 'var(--font-playfair)' }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Payouts table */}
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: '2rem' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Histórico de repasses</h2>
        </div>
        {(payouts ?? []).length === 0 ? (
          <p style={{ padding: '2rem', color: '#94a3b8', textAlign: 'center' }}>Nenhum repasse registrado ainda.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Período', 'Bruto', 'Comissão', 'Líquido', 'Status', 'Pago em'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(payouts ?? []).map((p, i) => (
                <tr key={p.id} style={{ borderTop: i > 0 ? '1px solid #f1f5f9' : undefined }}>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#0f172a' }}>{p.period_month}</td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#64748b' }}>{fmtCents(p.gross_cents ?? 0)}</td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#dc2626' }}>-{fmtCents(p.commission_cents ?? 0)}</td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', fontWeight: 700, color: '#16a34a' }}>{fmtCents(p.net_cents ?? 0)}</td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <span style={{
                      display: 'inline-block', padding: '0.2rem 0.625rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                      color: p.status === 'paid' ? '#16a34a' : '#d97706',
                      background: p.status === 'paid' ? '#dcfce7' : '#fef3c7',
                    }}>
                      {p.status === 'paid' ? 'Pago' : 'Pendente'}
                    </span>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                    {p.paid_at ? new Date(p.paid_at).toLocaleDateString('pt-BR') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
        Os repasses são realizados manualmente pela equipe Acalanto Turismo. Em caso de dúvidas, entre em contato pelo WhatsApp.
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/parceiros/dashboard/financeiro/page.tsx
git commit -m "feat: partner financial page with payout history"
```

---

## Task 5: Availability calendar page (accommodation partners)

**Files:**
- Create: `app/parceiros/dashboard/disponibilidade/page.tsx`
- Create: `app/api/parceiros/availability/route.ts`

- [ ] **Step 1: Create the API route**

```typescript
// app/api/parceiros/availability/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('partner_id')
    .eq('auth_user_id', session.user.id)
    .single()
  if (!profile?.partner_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { listingId, date, status } = body as { listingId: string; date: string; status: 'available' | 'blocked' }

  // Verify the listing belongs to this partner
  const { data: listing } = await supabase
    .from('partner_listings')
    .select('id')
    .eq('id', listingId)
    .eq('partner_id', profile.partner_id)
    .single()
  if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await supabase
    .from('accommodation_availability')
    .upsert({
      listing_id: listingId,
      date,
      status,
      source: 'manual',
    }, { onConflict: 'listing_id,date' })

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 2: Create the availability page**

```tsx
// app/parceiros/dashboard/disponibilidade/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AvailabilityCalendarEditor from './_components/AvailabilityCalendarEditor'

export default async function ParceiroDisponibilidadePage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/parceiros/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('partner_id')
    .eq('auth_user_id', session.user.id)
    .single()
  if (!profile?.partner_id) redirect('/parceiros/login')

  const { data: listings } = await supabase
    .from('partner_listings')
    .select('id, title, slug')
    .eq('partner_id', profile.partner_id)
    .eq('type', 'accommodation')
    .order('title')

  if (!listings || listings.length === 0) {
    return (
      <div style={{ padding: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: '#0f172a', marginBottom: '1rem' }}>
          Disponibilidade
        </h1>
        <p style={{ color: '#64748b' }}>Nenhuma hospedagem cadastrada ainda. Entre em contato com a equipe Acalanto.</p>
      </div>
    )
  }

  // Fetch availability for all listings
  const listingIds = listings.map(l => l.id)
  const { data: avail } = await supabase
    .from('accommodation_availability')
    .select('listing_id, date, status')
    .in('listing_id', listingIds)

  const availMap: Record<string, Record<string, string>> = {}
  for (const row of avail ?? []) {
    if (!availMap[row.listing_id]) availMap[row.listing_id] = {}
    availMap[row.listing_id][row.date] = row.status
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '900px' }}>
      <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: '#0f172a', marginBottom: '0.25rem' }}>
        Disponibilidade
      </h1>
      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Clique em uma data para alternar entre disponível e bloqueado.
      </p>
      {listings.map(listing => (
        <AvailabilityCalendarEditor
          key={listing.id}
          listing={listing}
          initialAvail={availMap[listing.id] ?? {}}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Create the interactive calendar editor component**

Create file `app/parceiros/dashboard/disponibilidade/_components/AvailabilityCalendarEditor.tsx`:

```tsx
'use client'
import { useState } from 'react'

type Props = {
  listing: { id: string; title: string; slug: string }
  initialAvail: Record<string, string> // date → status
}

const MONTHS_PT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
const DAYS_PT = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

function getTodayISO() {
  return new Date().toISOString().split('T')[0]
}

export default function AvailabilityCalendarEditor({ listing, initialAvail }: Props) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [avail, setAvail] = useState<Record<string, string>>(initialAvail)
  const [saving, setSaving] = useState<string | null>(null)

  function daysInMonth(y: number, m: number) { return new Date(y, m, 0).getDate() }
  function firstDow(y: number, m: number) { return new Date(y, m - 1, 1).getDay() }

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  async function toggleDate(iso: string) {
    const today = getTodayISO()
    if (iso < today) return
    const current = avail[iso] ?? 'available'
    const next = current === 'blocked' ? 'available' : 'blocked'
    setSaving(iso)
    const res = await fetch('/api/parceiros/availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId: listing.id, date: iso, status: next }),
    })
    if (res.ok) {
      setAvail(prev => ({ ...prev, [iso]: next }))
    }
    setSaving(null)
  }

  const totalDays = daysInMonth(year, month)
  const startDow = firstDow(year, month)
  const cells: (number | null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)
  const today = getTodayISO()

  return (
    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: '1.5rem' }}>
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{listing.title}</h2>
      </div>

      <div style={{ padding: '1rem 1.25rem' }}>
        {/* Month nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--ocean-mid)', padding: '0.25rem 0.5rem' }}>‹</button>
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{MONTHS_PT[month - 1]} {year}</span>
          <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--ocean-mid)', padding: '0.25rem 0.5rem' }}>›</button>
        </div>

        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '0.25rem' }}>
          {DAYS_PT.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', padding: '0.25rem 0' }}>{d}</div>
          ))}
        </div>

        {/* Cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
          {cells.map((day, idx) => {
            if (day === null) return <div key={`e${idx}`} />
            const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const isPast = iso < today
            const status = avail[iso] ?? 'available'
            const isBlocked = status === 'blocked'
            const isBooked = status === 'booked'
            const isSaving = saving === iso

            return (
              <button
                key={iso}
                onClick={() => !isPast && !isBooked && toggleDate(iso)}
                disabled={isPast || isBooked || isSaving}
                title={isBooked ? 'Reservado (não pode alterar)' : isBlocked ? 'Clique para desbloquear' : 'Clique para bloquear'}
                style={{
                  padding: '0.35rem 0',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.825rem',
                  fontWeight: 500,
                  cursor: isPast || isBooked ? 'default' : 'pointer',
                  background: isBooked
                    ? '#dbeafe'
                    : isBlocked
                    ? '#fee2e2'
                    : isPast
                    ? 'transparent'
                    : '#dcfce7',
                  color: isBooked
                    ? '#1d4ed8'
                    : isBlocked
                    ? '#dc2626'
                    : isPast
                    ? '#d1d5db'
                    : '#16a34a',
                  opacity: isSaving ? 0.5 : 1,
                  transition: 'background 0.15s',
                }}
              >
                {day}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.75rem', color: '#64748b', flexWrap: 'wrap' }}>
          {[
            { color: '#dcfce7', border: '#16a34a', text: 'Disponível' },
            { color: '#fee2e2', border: '#dc2626', text: 'Bloqueado' },
            { color: '#dbeafe', border: '#1d4ed8', text: 'Reservado' },
          ].map(({ color, border, text }) => (
            <span key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: color, border: `1px solid ${border}`, display: 'inline-block' }} />
              {text}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add app/parceiros/dashboard/disponibilidade/ app/api/parceiros/availability/route.ts
git commit -m "feat: partner availability calendar editor for accommodation listings"
```

---

## Task 6: Profile edit page

**Files:**
- Create: `app/parceiros/dashboard/perfil/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
// app/parceiros/dashboard/perfil/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PerfilForm from './_components/PerfilForm'

export default async function ParceiroPerfilPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/parceiros/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('partner_id')
    .eq('auth_user_id', session.user.id)
    .single()
  if (!profile?.partner_id) redirect('/parceiros/login')

  const { data: partner } = await supabase
    .from('partners')
    .select('id, name, email, phone, type')
    .eq('id', profile.partner_id)
    .single()

  const { data: partnerPage } = await supabase
    .from('partner_pages')
    .select('id, slug, headline, bio, instagram_url, whatsapp_number, cover_image')
    .eq('partner_id', profile.partner_id)
    .maybeSingle()

  return (
    <div style={{ padding: '2rem', maxWidth: '700px' }}>
      <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: '#0f172a', marginBottom: '0.25rem' }}>
        Perfil
      </h1>
      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Suas informações públicas no site da Acalanto
      </p>
      <PerfilForm partner={partner} partnerPage={partnerPage} />
    </div>
  )
}
```

- [ ] **Step 2: Create PerfilForm client component**

Create `app/parceiros/dashboard/perfil/_components/PerfilForm.tsx`:

```tsx
'use client'
import { useState, type FormEvent } from 'react'
import { createClient } from '@/lib/supabase/client'

type Partner = { id: string; name: string; email: string | null; phone: string | null; type: string }
type PartnerPage = { id: string; slug: string; headline: string | null; bio: string | null; instagram_url: string | null; whatsapp_number: string | null; cover_image: string | null } | null

type Props = { partner: Partner | null; partnerPage: PartnerPage }

export default function PerfilForm({ partner, partnerPage }: Props) {
  const [name, setName] = useState(partner?.name ?? '')
  const [phone, setPhone] = useState(partner?.phone ?? '')
  const [headline, setHeadline] = useState(partnerPage?.headline ?? '')
  const [bio, setBio] = useState(partnerPage?.bio ?? '')
  const [instagram, setInstagram] = useState(partnerPage?.instagram_url ?? '')
  const [whatsapp, setWhatsapp] = useState(partnerPage?.whatsapp_number ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const supabase = createClient()

    if (partner) {
      const { error: err } = await supabase
        .from('partners')
        .update({ name, phone: phone || null })
        .eq('id', partner.id)
      if (err) { setError(err.message); setSaving(false); return }
    }

    if (partnerPage) {
      const { error: err } = await supabase
        .from('partner_pages')
        .update({ headline: headline || null, bio: bio || null, instagram_url: instagram || null, whatsapp_number: whatsapp || null })
        .eq('id', partnerPage.id)
      if (err) { setError(err.message); setSaving(false); return }
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const inputStyle = {
    width: '100%', padding: '0.625rem 0.875rem', border: '1px solid #e2e8f0',
    borderRadius: '8px', fontSize: '0.9375rem', background: 'white', outline: 'none',
    boxSizing: 'border-box' as const,
  }
  const labelStyle = { display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.375rem' }
  const groupStyle = { marginBottom: '1.25rem' }

  return (
    <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '2rem' }}>
      <h2 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', marginBottom: '1.25rem', marginTop: 0 }}>
        Dados básicos
      </h2>

      <div style={groupStyle}>
        <label style={labelStyle}>Nome / Razão social</label>
        <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div style={groupStyle}>
        <label style={labelStyle}>Telefone</label>
        <input style={inputStyle} value={phone} onChange={e => setPhone(e.target.value)} placeholder="55 24 99999-9999" />
      </div>

      {partnerPage && (
        <>
          <h2 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', marginBottom: '1.25rem', marginTop: '1.75rem' }}>
            Página pública
          </h2>
          <div style={groupStyle}>
            <label style={labelStyle}>Título / Headline</label>
            <input style={inputStyle} value={headline} onChange={e => setHeadline(e.target.value)} placeholder="Ex: Fotografia profissional de passeios em Paraty" />
          </div>
          <div style={groupStyle}>
            <label style={labelStyle}>Bio / Apresentação</label>
            <textarea
              style={{ ...inputStyle, minHeight: '100px', resize: 'vertical', fontFamily: 'inherit' }}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Conte um pouco sobre você ou seu negócio..."
            />
          </div>
          <div style={groupStyle}>
            <label style={labelStyle}>Instagram URL</label>
            <input style={inputStyle} type="url" value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="https://instagram.com/seu_perfil" />
          </div>
          <div style={groupStyle}>
            <label style={labelStyle}>WhatsApp (número com DDI)</label>
            <input style={inputStyle} value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="5524999999999" />
          </div>
        </>
      )}

      {error && <p style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: '0.75rem' }}>{error}</p>}

      <button
        type="submit"
        disabled={saving}
        style={{
          background: saved ? '#16a34a' : 'var(--ocean-mid, #1A6B8A)',
          color: 'white', border: 'none', borderRadius: '8px',
          padding: '0.75rem 1.5rem', fontSize: '0.9375rem', fontWeight: 600,
          cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
          transition: 'background 0.2s',
        }}
      >
        {saved ? '✓ Salvo!' : saving ? 'Salvando…' : 'Salvar alterações'}
      </button>
    </form>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/parceiros/dashboard/perfil/
git commit -m "feat: partner profile edit page"
```

---

## Task 7: Fix partner login redirect + ensure bookings have partner_id

**Files:**
- Modify: `app/parceiros/login/page.tsx` (already redirects to /parceiros/dashboard — verify)
- Verify DB: `bookings` table has `partner_id` column

- [ ] **Step 1: Verify login redirects correctly**

Open `app/parceiros/login/page.tsx`. The `handleLogin` function should already push to `/parceiros/dashboard` (added in previous session). Confirm:

```typescript
router.push('/parceiros/dashboard')  // ← should already be there
```

If not, change from `router.push('/admin')` or any other path to `/parceiros/dashboard`.

- [ ] **Step 2: Verify partner_id column on bookings**

Run in Supabase SQL editor or via MCP:

```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'bookings' AND column_name = 'partner_id';
```

If the column doesn't exist, run migration:

```sql
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS partner_id uuid REFERENCES partners(id);
CREATE INDEX IF NOT EXISTS bookings_partner_id_idx ON bookings(partner_id);
```

- [ ] **Step 3: Commit**

```bash
git add app/parceiros/login/page.tsx
git commit -m "fix: ensure partner login redirects to dashboard"
```

---

## Task 8: Push and smoke test

- [ ] **Step 1: Push all commits**

```bash
git push
```

- [ ] **Step 2: Test the full flow**
  1. Go to `/parceiros/login` — enter a partner email/password
  2. Should redirect to `/parceiros/dashboard` — see KPIs
  3. Click Reservas — see bookings table
  4. Click Financeiro — see payout history
  5. If accommodation partner: click Disponibilidade — see calendar, toggle a date
  6. Click Perfil — edit name, save

- [ ] **Step 3: Test auth guard**
  1. Visit `/parceiros/dashboard` without login → should redirect to `/parceiros/login`
  2. Visit with admin account → should also redirect (role !== 'partner')

---

*Last updated: 2026-05-07*
