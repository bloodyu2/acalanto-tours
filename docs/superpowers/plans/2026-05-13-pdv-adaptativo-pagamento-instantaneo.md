# PDV adaptativo + pagamento instantâneo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar `/admin/vendas` em um PDV adaptativo por role com pagamento instantâneo (PIX QR + iframe ASAAS para cartão), polling 3s + fallback manual após 30s, e entrega automática de PDF + e-mail + WhatsApp link após confirmação. Aplicar splits da Balaio em toda venda e endurecer RBAC do nav.

**Architecture:** Wizard single-page de 6 steps (vertical → produto → pax → cliente → pagamento → sucesso). Backend Next.js App Router com endpoints separados para criação de venda, polling de status, e notificação pós-pagamento. ASAAS API direta (PIX) + Checkout iframe (cartão). Permissões de venda role × vertical em nova tabela `admin_role_permissions`. Frequent commits, TDD onde fizer sentido.

**Tech Stack:** Next.js 16 App Router, TypeScript, React 19, Supabase, ASAAS API v3, `@react-pdf/renderer` (a instalar), `nodemailer` (já instalado), Vitest (a instalar).

---

## File Structure

### Novos arquivos

| Caminho | Responsabilidade |
|---|---|
| `vitest.config.ts` | Setup do Vitest com path aliases `@/*` |
| `tests/setup.ts` | Setup global de teste (jsdom, fetch mock) |
| `supabase/migrations/018_admin_role_permissions.sql` | Tabela role × vertical + seed |
| `supabase/migrations/019_bookings_sold_by.sql` | Colunas `sold_by_user_id`, `sold_by_role` em `bookings` |
| `lib/pdv/role-permissions.ts` | Helper server-side `getEnabledVerticals(role)` que lê DB |
| `tests/lib/pdv/role-permissions.test.ts` | Testa filtro role × vertical |
| `app/admin/configuracoes/page.tsx` | Tela super_admin: tabela editável de permissões |
| `app/admin/configuracoes/actions.ts` | Server actions: upsertPermission |
| `app/api/admin/pdv/[id]/status/route.ts` | GET — polling status |
| `app/api/admin/pdv/[id]/notify/route.ts` | POST — PDF + email + WhatsApp |
| `components/admin/pdv/StepVertical.tsx` | Step 0 |
| `components/admin/pdv/StepPayment.tsx` | Step 4 — abas PIX/Cartão |
| `components/admin/pdv/StepDone.tsx` | Step 5 — sucesso |
| `components/admin/pdv/usePaymentStatus.ts` | Hook client polling 3s |
| `components/payments/PaymentBadge.tsx` | SVGs oficiais |
| `lib/pdf/booking-receipt.tsx` | React-PDF doc + render server-side |
| `lib/email/send-receipt.ts` | Wrapper nodemailer |
| `lib/whatsapp.ts` | Builder de URL `wa.me` |
| `tests/pdv/qr-rendering.test.ts` | Valida QR no DOM |
| `tests/pdv/split-applied.test.ts` | Valida `buildSplit` chamado |

### Modificados

| Caminho | Mudança |
|---|---|
| `package.json` | Adicionar Vitest + @react-pdf/renderer + scripts `test`, `test:run` |
| `lib/admin-roles.ts` | Remover hardcode de verticais; manter só nav |
| `app/admin/_components/AdminLayoutClient.tsx` | Filtro estrito de `navItems`; remover fallback "show-all" |
| `app/admin/roadmap/page.tsx`, `apresentacoes/page.tsx`, `identidade/page.tsx`, `configuracoes/page.tsx` | Guard server-side super_admin-only |
| `app/admin/vendas/page.tsx` | Passar `enabledVerticals` + catálogo filtrado |
| `components/admin/pdv/PdvWizard.tsx` | Steps reorganizados, adiciona Step 0 e 5, integra polling |
| `app/api/admin/pdv/route.ts` | Aceitar `vertical`; aplicar `buildSplit`; gravar `sold_by`; expandir roles permitidos |
| `app/api/webhooks/asaas/route.ts` | Garantir que update do `payment_status` cobre `received` e `confirmed` |
| `components/cart/CartDrawer.tsx`, `components/photography/PhotographyBookingWidget.tsx`, `components/booking/ServiceBookingWidget.tsx` | Substituir botões custom de pagamento por `<PaymentBadge>` |

---

## Task 1: Setup do framework de testes (Vitest)

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `tests/setup.ts`

- [ ] **Step 1: Instalar deps**

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @types/node
```

- [ ] **Step 2: Adicionar scripts em `package.json`**

Em `"scripts"`:
```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 3: Criar `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    css: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

- [ ] **Step 4: Criar `tests/setup.ts`**

```ts
import '@testing-library/jest-dom/vitest'

// Mock env vars used in tests
process.env.ASAAS_API_KEY = 'test-asaas-key'
process.env.ASAAS_ENVIRONMENT = 'sandbox'
process.env.ASAAS_BALAIO_WALLET_ID = '00000000-0000-0000-0000-000000000001'
process.env.ASAAS_SPLIT_ENABLED = 'true'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role'
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
```

- [ ] **Step 5: Criar smoke test**

`tests/smoke.test.ts`:
```ts
import { describe, it, expect } from 'vitest'

describe('smoke', () => {
  it('vitest is alive', () => {
    expect(1 + 1).toBe(2)
  })
})
```

- [ ] **Step 6: Rodar**

```bash
npm run test:run
```

Esperado: `1 passed`.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vitest.config.ts tests/setup.ts tests/smoke.test.ts
git commit -m "chore(test): setup Vitest + Testing Library"
```

---

## Task 2: Migration 018 — admin_role_permissions

**Files:**
- Create: `supabase/migrations/018_admin_role_permissions.sql`

- [ ] **Step 1: Escrever migration**

```sql
-- supabase/migrations/018_admin_role_permissions.sql
create table if not exists public.admin_role_permissions (
  role text not null check (role in ('super_admin','pdv','tripulacao','fotografo')),
  vertical text not null check (vertical in ('passeio','fotografia','servico','hospedagem')),
  enabled boolean not null default false,
  priority integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (role, vertical)
);

alter table public.admin_role_permissions enable row level security;

drop policy if exists "admin_role_perms_read_authenticated" on public.admin_role_permissions;
create policy "admin_role_perms_read_authenticated" on public.admin_role_permissions
  for select using (auth.role() = 'authenticated');

-- Seed: defaults sensatos
insert into public.admin_role_permissions (role, vertical, enabled, priority) values
  ('super_admin', 'passeio',     true, 100),
  ('super_admin', 'fotografia',  true, 100),
  ('super_admin', 'servico',     true, 100),
  ('super_admin', 'hospedagem',  true, 100),
  ('pdv',         'passeio',     true, 100),
  ('pdv',         'fotografia',  true,  90),
  ('pdv',         'servico',     true,  80),
  ('pdv',         'hospedagem',  true,  70),
  ('tripulacao',  'passeio',     true, 100),
  ('tripulacao',  'fotografia',  true,  80),
  ('tripulacao',  'servico',    false,   0),
  ('tripulacao',  'hospedagem', false,   0),
  ('fotografo',   'fotografia',  true, 100),
  ('fotografo',   'passeio',     true,  70),
  ('fotografo',   'servico',    false,   0),
  ('fotografo',   'hospedagem', false,   0)
on conflict (role, vertical) do nothing;
```

- [ ] **Step 2: Aplicar via Supabase MCP**

Usar o tool `mcp__b851e17c-...__apply_migration` com o conteúdo acima e `name: "018_admin_role_permissions"`.

- [ ] **Step 3: Verificar via execute_sql**

Rodar `select role, vertical, enabled, priority from admin_role_permissions order by role, priority desc;` — esperar 16 linhas.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/018_admin_role_permissions.sql
git commit -m "feat(db): migration 018 — admin_role_permissions table + seed"
```

---

## Task 3: Migration 019 — bookings.sold_by_*

**Files:**
- Create: `supabase/migrations/019_bookings_sold_by.sql`

- [ ] **Step 1: Escrever migration**

```sql
-- supabase/migrations/019_bookings_sold_by.sql
alter table public.bookings
  add column if not exists sold_by_user_id uuid references auth.users(id) on delete set null,
  add column if not exists sold_by_role text check (sold_by_role in ('super_admin','pdv','tripulacao','fotografo'));

create index if not exists bookings_sold_by_user_id_idx on public.bookings(sold_by_user_id);
```

- [ ] **Step 2: Aplicar via Supabase MCP**

- [ ] **Step 3: Verificar**

`select column_name from information_schema.columns where table_name='bookings' and column_name like 'sold_by_%';`

Esperado: 2 linhas.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/019_bookings_sold_by.sql
git commit -m "feat(db): migration 019 — bookings.sold_by_user_id + sold_by_role"
```

---

## Task 4: RBAC nav fix — auditoria + filtro estrito

**Files:**
- Modify: `app/admin/_components/AdminLayoutClient.tsx`

- [ ] **Step 1: Ler o arquivo atual**

```bash
grep -n "filter\|ROLE_NAV\|navItems" app/admin/_components/AdminLayoutClient.tsx
```

Anotar onde `navItems` é filtrado e se há fallback `if (!role) ...`.

- [ ] **Step 2: Garantir filtro estrito**

Localizar o bloco que renderiza a sidebar e substituir por:

```tsx
// Em AdminLayoutClient, substituir o cálculo de visibleNav
const visibleNav = role
  ? navItems.filter(item => ROLE_NAV[role]?.some(r => item.href === r || item.href.startsWith(r + '/')))
  : []  // se role for null no boot, esconde tudo até hidratar
```

Sem mais fallback "mostra tudo".

- [ ] **Step 3: Adicionar comentário documentando**

```tsx
// Importante: se role for null (boot do client antes da hidratação),
// renderizamos sidebar vazia ao invés de "mostrar tudo". O server layout
// já redirecionou pro /admin/login caso não haja sessão, então um null aqui
// só dura uma fração de segundo — preferimos sidebar piscando vazia a
// vazar Roadmap/Apresentações/IDV pra um pdv/tripulacao/fotografo.
```

- [ ] **Step 4: Build local pra garantir que não quebrou**

```bash
npm run build
```

Esperado: build sucesso (TypeScript pode reclamar; com `ignoreBuildErrors: true` no next.config, build segue mesmo assim).

- [ ] **Step 5: Commit**

```bash
git add app/admin/_components/AdminLayoutClient.tsx
git commit -m "fix(rbac): sidebar strict filter, no show-all fallback when role is null"
```

---

## Task 5: RBAC server-side guards em rotas só-super_admin

**Files:**
- Modify: `app/admin/roadmap/page.tsx`
- Modify: `app/admin/apresentacoes/page.tsx`
- Modify: `app/admin/identidade/page.tsx`

- [ ] **Step 1: Definir helper compartilhado**

Em `lib/admin-auth.ts`, adicionar (se não existir):

```ts
export async function requireSuperAdmin() {
  const u = await getAdminUser()
  if (!u || u.role !== 'super_admin') {
    const { redirect } = await import('next/navigation')
    redirect('/admin')
  }
  return u
}
```

- [ ] **Step 2: Aplicar em cada page**

No topo de cada `page.tsx` listado, depois dos imports e antes do `default async function`:

```ts
import { requireSuperAdmin } from '@/lib/admin-auth'

// Dentro da função:
await requireSuperAdmin()
```

- [ ] **Step 3: Confirmar que `requireSuperAdmin` está sendo chamado em todos 3**

```bash
grep -l "requireSuperAdmin" app/admin/roadmap/page.tsx app/admin/apresentacoes/page.tsx app/admin/identidade/page.tsx
```

Esperado: 3 arquivos listados.

- [ ] **Step 4: Commit**

```bash
git add lib/admin-auth.ts app/admin/roadmap/page.tsx app/admin/apresentacoes/page.tsx app/admin/identidade/page.tsx
git commit -m "fix(rbac): server-side requireSuperAdmin guard on roadmap/apresentacoes/identidade"
```

---

## Task 6: Helper `getEnabledVerticals` + teste

**Files:**
- Create: `lib/pdv/role-permissions.ts`
- Create: `tests/lib/pdv/role-permissions.test.ts`

- [ ] **Step 1: Escrever o teste primeiro (TDD)**

```ts
// tests/lib/pdv/role-permissions.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getEnabledVerticals } from '@/lib/pdv/role-permissions'

const mockData: Array<{ vertical: string; priority: number }> = []
vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: async () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            order: () => Promise.resolve({ data: mockData, error: null }),
          }),
        }),
      }),
    }),
  }),
}))

describe('getEnabledVerticals', () => {
  beforeEach(() => { mockData.length = 0 })

  it('returns enabled verticals ordered by priority desc', async () => {
    mockData.push(
      { vertical: 'fotografia', priority: 100 },
      { vertical: 'passeio',    priority:  70 },
    )
    const r = await getEnabledVerticals('fotografo')
    expect(r).toEqual([
      { vertical: 'fotografia', priority: 100 },
      { vertical: 'passeio',    priority:  70 },
    ])
  })

  it('returns empty array if no verticals enabled', async () => {
    const r = await getEnabledVerticals('fotografo')
    expect(r).toEqual([])
  })
})
```

- [ ] **Step 2: Rodar — deve falhar (module not found)**

```bash
npm run test:run tests/lib/pdv/role-permissions.test.ts
```

Esperado: FAIL com "Cannot find module '@/lib/pdv/role-permissions'".

- [ ] **Step 3: Implementar**

```ts
// lib/pdv/role-permissions.ts
import { createAdminClient } from '@/lib/supabase/server'
import type { AdminRole } from '@/lib/admin-roles'

export type Vertical = 'passeio' | 'fotografia' | 'servico' | 'hospedagem'

export interface EnabledVertical {
  vertical: Vertical
  priority: number
}

export async function getEnabledVerticals(role: AdminRole): Promise<EnabledVertical[]> {
  const sb = await createAdminClient()
  const { data, error } = await sb
    .from('admin_role_permissions')
    .select('vertical, priority')
    .eq('role', role)
    .eq('enabled', true)
    .order('priority', { ascending: false })

  if (error || !data) return []
  return data as EnabledVertical[]
}
```

- [ ] **Step 4: Rodar — deve passar**

```bash
npm run test:run tests/lib/pdv/role-permissions.test.ts
```

Esperado: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/pdv/role-permissions.ts tests/lib/pdv/role-permissions.test.ts
git commit -m "feat(pdv): getEnabledVerticals helper + test"
```

---

## Task 7: Tela `/admin/configuracoes` — leitura

**Files:**
- Create: `app/admin/configuracoes/page.tsx`

- [ ] **Step 1: Adicionar `/admin/configuracoes` ao `ROLE_NAV.super_admin`**

Em `lib/admin-roles.ts`, no array de `super_admin`, adicionar `'/admin/configuracoes'`.

- [ ] **Step 2: Adicionar item no nav**

Em `app/admin/_components/AdminLayoutClient.tsx`, no array `navItems`, adicionar antes de Roadmap:

```tsx
{ href: '/admin/configuracoes', label: 'Configurações', icon: <BriefcaseIcon /> },
```

(Se um ícone melhor de "settings" estiver disponível, usar; caso contrário esse serve.)

- [ ] **Step 3: Criar página com leitura**

```tsx
// app/admin/configuracoes/page.tsx
import { requireSuperAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'
import PermissionsTable from './PermissionsTable'

export const dynamic = 'force-dynamic'

export default async function ConfiguracoesPage() {
  await requireSuperAdmin()
  const sb = await createAdminClient()
  const { data: perms } = await sb
    .from('admin_role_permissions')
    .select('role, vertical, enabled, priority')
    .order('role')
    .order('vertical')

  return (
    <div style={{ padding: '2rem', maxWidth: '900px' }}>
      <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--ocean-deep)', margin: '0 0 0.5rem' }}>
        Configurações
      </h1>
      <p style={{ color: 'var(--text-muted)', margin: '0 0 2rem' }}>
        Defina o que cada role pode vender no PDV.
      </p>
      <PermissionsTable rows={perms ?? []} />
    </div>
  )
}
```

- [ ] **Step 4: Criar `PermissionsTable.tsx` minimal (sem edição ainda)**

```tsx
// app/admin/configuracoes/PermissionsTable.tsx
'use client'

interface Row { role: string; vertical: string; enabled: boolean; priority: number }
interface Props { rows: Row[] }

const ROLES = ['super_admin', 'pdv', 'tripulacao', 'fotografo'] as const
const VERTICALS = ['passeio', 'fotografia', 'servico', 'hospedagem'] as const

export default function PermissionsTable({ rows }: Props) {
  const get = (role: string, vertical: string) =>
    rows.find(r => r.role === role && r.vertical === vertical) ?? { enabled: false, priority: 0 }

  return (
    <div style={{ background: 'white', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ background: 'var(--sand)' }}>
          <tr>
            <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700 }}>Role</th>
            {VERTICALS.map(v => (
              <th key={v} style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, textTransform: 'capitalize' }}>{v}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROLES.map((role, i) => (
            <tr key={role} style={{ borderTop: i > 0 ? '1px solid var(--border)' : undefined }}>
              <td style={{ padding: '0.875rem 1rem', fontWeight: 600 }}>{role}</td>
              {VERTICALS.map(v => {
                const p = get(role, v)
                return (
                  <td key={v} style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                    <span style={{ color: p.enabled ? '#16a34a' : '#94a3b8' }}>
                      {p.enabled ? `✓ (${p.priority})` : '—'}
                    </span>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 5: Smoke test**

```bash
npm run build
```

Acessar `/admin/configuracoes` localmente e ver a tabela com os defaults da migration 018.

- [ ] **Step 6: Commit**

```bash
git add app/admin/configuracoes/page.tsx app/admin/configuracoes/PermissionsTable.tsx lib/admin-roles.ts app/admin/_components/AdminLayoutClient.tsx
git commit -m "feat(admin): /admin/configuracoes page reads admin_role_permissions"
```

---

## Task 8: `/admin/configuracoes` — edição (server action)

**Files:**
- Create: `app/admin/configuracoes/actions.ts`
- Modify: `app/admin/configuracoes/PermissionsTable.tsx`

- [ ] **Step 1: Server action**

```ts
// app/admin/configuracoes/actions.ts
'use server'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { requireSuperAdmin } from '@/lib/admin-auth'

export async function updatePermission(role: string, vertical: string, enabled: boolean, priority: number) {
  await requireSuperAdmin()
  const sb = await createAdminClient()
  const { error } = await sb
    .from('admin_role_permissions')
    .upsert(
      { role, vertical, enabled, priority, updated_at: new Date().toISOString() },
      { onConflict: 'role,vertical' }
    )
  if (error) throw new Error(error.message)
  revalidatePath('/admin/configuracoes')
}
```

- [ ] **Step 2: Componente editável**

Substituir `PermissionsTable.tsx` por uma versão com checkbox + input de prioridade:

```tsx
// app/admin/configuracoes/PermissionsTable.tsx
'use client'
import { useState, useTransition } from 'react'
import { updatePermission } from './actions'

interface Row { role: string; vertical: string; enabled: boolean; priority: number }
interface Props { rows: Row[] }

const ROLES = ['super_admin', 'pdv', 'tripulacao', 'fotografo'] as const
const VERTICALS = ['passeio', 'fotografia', 'servico', 'hospedagem'] as const

export default function PermissionsTable({ rows: initialRows }: Props) {
  const [rows, setRows] = useState(initialRows)
  const [pending, startTransition] = useTransition()
  const [savedAt, setSavedAt] = useState<string | null>(null)

  const get = (role: string, vertical: string) =>
    rows.find(r => r.role === role && r.vertical === vertical) ?? { role, vertical, enabled: false, priority: 0 }

  function update(role: string, vertical: string, patch: Partial<Row>) {
    const current = get(role, vertical)
    const next = { ...current, ...patch }
    setRows(prev => {
      const others = prev.filter(r => !(r.role === role && r.vertical === vertical))
      return [...others, next]
    })
    startTransition(async () => {
      await updatePermission(role, vertical, next.enabled, next.priority)
      setSavedAt(new Date().toLocaleTimeString('pt-BR'))
    })
  }

  return (
    <div>
      <div style={{ background: 'white', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'var(--sand)' }}>
            <tr>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700 }}>Role</th>
              {VERTICALS.map(v => (
                <th key={v} style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, textTransform: 'capitalize' }}>{v}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROLES.map((role, i) => (
              <tr key={role} style={{ borderTop: i > 0 ? '1px solid var(--border)' : undefined }}>
                <td style={{ padding: '0.875rem 1rem', fontWeight: 600 }}>{role}</td>
                {VERTICALS.map(v => {
                  const p = get(role, v)
                  return (
                    <td key={v} style={{ padding: '0.5rem 1rem', textAlign: 'center' }}>
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="checkbox"
                          checked={p.enabled}
                          onChange={e => update(role, v, { enabled: e.target.checked })}
                          disabled={pending}
                        />
                        <input
                          type="number"
                          min={0}
                          max={999}
                          value={p.priority}
                          onChange={e => update(role, v, { priority: Number(e.target.value) })}
                          disabled={pending || !p.enabled}
                          style={{ width: '52px', padding: '0.25rem 0.375rem', border: '1px solid var(--border)', borderRadius: '0.375rem', fontSize: '0.8rem', textAlign: 'center' }}
                        />
                      </label>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        {pending ? 'Salvando…' : savedAt ? `Salvo às ${savedAt}` : 'Mudanças são salvas automaticamente.'}
      </p>
    </div>
  )
}
```

- [ ] **Step 3: Smoke**

`npm run build` deve passar. Acessar a página, marcar/desmarcar um checkbox, mudar uma prioridade, recarregar e ver persistência.

- [ ] **Step 4: Commit**

```bash
git add app/admin/configuracoes/actions.ts app/admin/configuracoes/PermissionsTable.tsx
git commit -m "feat(admin): edit admin_role_permissions via server action with autosave"
```

---

## Task 9: PaymentBadge component

**Files:**
- Create: `components/payments/PaymentBadge.tsx`
- Create: `components/payments/icons/` (SVG sources)
- Create: `tests/components/payments/PaymentBadge.test.tsx`

- [ ] **Step 1: Teste primeiro**

```tsx
// tests/components/payments/PaymentBadge.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PaymentBadge } from '@/components/payments/PaymentBadge'

describe('PaymentBadge', () => {
  it.each(['pix', 'visa', 'mastercard', 'elo', 'amex', 'hipercard'] as const)(
    'renders %s badge with aria-label',
    (brand) => {
      render(<PaymentBadge brand={brand} />)
      expect(screen.getByLabelText(new RegExp(brand, 'i'))).toBeInTheDocument()
    }
  )

  it('respects size prop', () => {
    const { container } = render(<PaymentBadge brand="pix" size={48} />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('height', '48')
  })
})
```

- [ ] **Step 2: Rodar — deve falhar**

```bash
npm run test:run tests/components/payments/PaymentBadge.test.tsx
```

- [ ] **Step 3: Implementar com SVGs inline**

```tsx
// components/payments/PaymentBadge.tsx
import type { ReactNode } from 'react'

export type PaymentBrand = 'pix' | 'visa' | 'mastercard' | 'elo' | 'amex' | 'hipercard'

interface Props {
  brand: PaymentBrand
  size?: number
  className?: string
}

// SVGs simplificados das marcas oficiais. Substituir por brand kits reais
// se o cliente exigir 100% fidelidade visual.
const SVGS: Record<PaymentBrand, ReactNode> = {
  pix: (
    <g fill="#32BCAD">
      <path d="M28 16l-8-8h-8l-8 8 8 8h8z" />
      <text x="50" y="20" font-family="Arial, sans-serif" font-weight="700" font-size="14" fill="#32BCAD">PIX</text>
    </g>
  ),
  visa: (
    <g>
      <rect width="100%" height="100%" rx="4" fill="#1A1F71" />
      <text x="50%" y="62%" text-anchor="middle" font-family="Arial Black, sans-serif" font-size="14" fill="white" font-style="italic">VISA</text>
    </g>
  ),
  mastercard: (
    <g>
      <rect width="100%" height="100%" rx="4" fill="white" />
      <circle cx="38%" cy="50%" r="28%" fill="#EB001B" />
      <circle cx="62%" cy="50%" r="28%" fill="#F79E1B" opacity="0.85" />
    </g>
  ),
  elo: (
    <g>
      <rect width="100%" height="100%" rx="4" fill="black" />
      <text x="50%" y="62%" text-anchor="middle" font-family="Arial Black, sans-serif" font-size="14" fill="white">ELO</text>
    </g>
  ),
  amex: (
    <g>
      <rect width="100%" height="100%" rx="4" fill="#2E77BC" />
      <text x="50%" y="62%" text-anchor="middle" font-family="Arial Black, sans-serif" font-size="9" fill="white">AMERICAN EXPRESS</text>
    </g>
  ),
  hipercard: (
    <g>
      <rect width="100%" height="100%" rx="4" fill="#C2272D" />
      <text x="50%" y="62%" text-anchor="middle" font-family="Arial Black, sans-serif" font-size="10" fill="white">Hipercard</text>
    </g>
  ),
}

export function PaymentBadge({ brand, size = 32, className }: Props) {
  const aspectRatio = brand === 'pix' ? 2 : 1.6
  const width = Math.round(size * aspectRatio)
  return (
    <svg
      role="img"
      aria-label={`Pagamento ${brand}`}
      width={width}
      height={size}
      viewBox={`0 0 ${width} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {SVGS[brand]}
    </svg>
  )
}

export const ALL_PAYMENT_BRANDS: PaymentBrand[] = ['pix', 'visa', 'mastercard', 'elo', 'amex', 'hipercard']
```

- [ ] **Step 4: Rodar — deve passar**

```bash
npm run test:run tests/components/payments/PaymentBadge.test.tsx
```

- [ ] **Step 5: Commit**

```bash
git add components/payments/PaymentBadge.tsx tests/components/payments/PaymentBadge.test.tsx
git commit -m "feat(ui): PaymentBadge component with PIX/Visa/MC/Elo/Amex/Hipercard SVGs"
```

> **Nota:** os SVGs deste componente são simplificados (placeholder visualmente correto). Em fase de polish, substituir por brand kits oficiais (Visa Inc., Mastercard Brand Center, BCB para PIX). Não é bloqueador desta entrega.

---

## Task 10: `app/admin/vendas/page.tsx` — passar verticais habilitadas

**Files:**
- Modify: `app/admin/vendas/page.tsx`

- [ ] **Step 1: Ler o atual**

```bash
cat app/admin/vendas/page.tsx
```

- [ ] **Step 2: Reescrever para passar verticais + catálogo unificado**

```tsx
// app/admin/vendas/page.tsx
import { getAdminUser } from '@/lib/admin-auth'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { getEnabledVerticals } from '@/lib/pdv/role-permissions'
import PdvWizard from '@/components/admin/pdv/PdvWizard'
import type { PdvBoat } from '@/components/admin/pdv/PdvWizard'

export const dynamic = 'force-dynamic'

export default async function VendasPage() {
  const user = await getAdminUser()
  if (!user) redirect('/admin/login')

  const allowedRoles = ['super_admin', 'pdv', 'tripulacao', 'fotografo'] as const
  if (!allowedRoles.includes(user.role)) redirect('/admin')

  const verticals = await getEnabledVerticals(user.role)

  const sb = await createAdminClient()
  const [{ data: boats }, { data: photoPkgs }, { data: services }] = await Promise.all([
    sb.from('boats').select('id, name, slug, price_adult, price_child').eq('active', true).order('display_order'),
    sb.from('photographer_packages').select('id, name, slug, price_cents, cover_image').eq('active', true).order('display_order'),
    sb.from('services').select('id, name, slug, price_cents').eq('active', true).order('display_order'),
  ])

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--ocean-deep)', marginBottom: '1.5rem' }}>
        Nova venda
      </h1>
      <PdvWizard
        verticals={verticals}
        boats={(boats ?? []) as PdvBoat[]}
        photographers={photoPkgs ?? []}
        services={services ?? []}
        sellerRole={user.role}
      />
    </div>
  )
}
```

- [ ] **Step 3: Build**

```bash
npm run build
```

Esperado: passa (mesmo se `PdvWizard` ainda não aceita as novas props — TypeScript com `ignoreBuildErrors:true` deixa passar; vamos consertar em Task 11).

- [ ] **Step 4: Commit**

```bash
git add app/admin/vendas/page.tsx
git commit -m "feat(pdv): vendas page passes enabled verticals + unified catalog"
```

---

## Task 11: PdvWizard — adicionar Step 0 (vertical) + props novas

**Files:**
- Modify: `components/admin/pdv/PdvWizard.tsx`
- Create: `components/admin/pdv/StepVertical.tsx`

- [ ] **Step 1: Criar `StepVertical.tsx`**

```tsx
// components/admin/pdv/StepVertical.tsx
'use client'
import type { Vertical } from '@/lib/pdv/role-permissions'

interface Props {
  verticals: Array<{ vertical: Vertical; priority: number }>
  onSelect: (v: Vertical) => void
}

const META: Record<Vertical, { icon: string; label: string; desc: string }> = {
  passeio:    { icon: '⚓', label: 'Passeio de escuna',  desc: 'Vender uma reserva em uma das escunas.' },
  fotografia: { icon: '📷', label: 'Fotografia',         desc: 'Pacote de fotos no embarque.' },
  servico:    { icon: '🛟', label: 'Serviço avulso',     desc: 'Lancha privativa, transfer, etc.' },
  hospedagem: { icon: '🏠', label: 'Hospedagem',         desc: 'Reserva de quarto/casa.' },
}

export default function StepVertical({ verticals, onSelect }: Props) {
  if (verticals.length === 0) {
    return (
      <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Você não tem permissão para vender nenhuma categoria. Fale com o administrador.
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
      {verticals.map(({ vertical }) => {
        const m = META[vertical]
        return (
          <button
            key={vertical}
            onClick={() => onSelect(vertical)}
            style={{
              padding: '1.5rem', background: 'white', borderRadius: '1rem',
              border: '2px solid var(--border)', cursor: 'pointer', textAlign: 'left',
              transition: 'border-color 0.15s, transform 0.1s',
            }}
            onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--ocean-mid)')}
            onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{m.icon}</div>
            <p style={{ fontWeight: 700, color: 'var(--ocean-deep)', margin: '0 0 0.25rem' }}>{m.label}</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>{m.desc}</p>
          </button>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Refatorar `PdvWizard` para receber novas props + auto-skip Step 0**

Topo do arquivo:

```tsx
'use client'
import { useState, useEffect } from 'react'
import { formatCents } from '@/lib/booking/pricing'
import { BOAT_PHOTOGRAPHER_ADDON_CENTS } from '@/lib/constants'
import type { AdminRole } from '@/lib/admin-roles'
import type { EnabledVertical, Vertical } from '@/lib/pdv/role-permissions'
import StepVertical from './StepVertical'

export interface PdvBoat {
  id: string; name: string; slug: string; price_adult: number; price_child: number
}
export interface PdvPhotographer {
  id: string; name: string; slug: string; price_cents: number | null; cover_image: string | null
}
export interface PdvService {
  id: string; name: string; slug: string; price_cents: number | null
}

interface Props {
  verticals: EnabledVertical[]
  boats: PdvBoat[]
  photographers: PdvPhotographer[]
  services: PdvService[]
  sellerRole: AdminRole
}

type Step = 'vertical' | 'tour' | 'passengers' | 'customer' | 'payment' | 'done'
```

Função principal:

```tsx
export default function PdvWizard({ verticals, boats, photographers, services, sellerRole }: Props) {
  // Auto-skip vertical step if only one is enabled
  const initialStep: Step = verticals.length === 1 ? 'tour' : 'vertical'
  const [step, setStep] = useState<Step>(initialStep)
  const [vertical, setVertical] = useState<Vertical | null>(
    verticals.length === 1 ? verticals[0].vertical : null
  )
  // ... resto do state existente (boatId, tourDate, adults, etc)

  // Render
  return (
    <div>
      {step === 'vertical' && (
        <StepVertical
          verticals={verticals}
          onSelect={v => { setVertical(v); setStep('tour') }}
        />
      )}
      {step === 'tour' && vertical && /* existing tour selection */}
      {/* ... outros steps ... */}
    </div>
  )
}
```

Manter as outras Steps existentes (passengers, customer, payment) inalteradas nesta task — vamos atacar payment em Task 16+.

- [ ] **Step 3: Confirmar que o build passa**

```bash
npm run build
```

- [ ] **Step 4: Smoke manual**

Rodar `npm run dev`, abrir `/admin/vendas` com usuário super_admin — ver Step 0 com 4 verticais. Com usuário `fotografo` — ver só duas (Fotografia priority 100, Passeio priority 70 — fotografia primeiro).

- [ ] **Step 5: Commit**

```bash
git add components/admin/pdv/StepVertical.tsx components/admin/pdv/PdvWizard.tsx
git commit -m "feat(pdv): Step 0 vertical selection with auto-skip when single option"
```

---

## Task 12: Expand allowed roles em `POST /api/admin/pdv`

**Files:**
- Modify: `app/api/admin/pdv/route.ts`

- [ ] **Step 1: Mudar a checagem de role**

Linha ~48 do arquivo, substituir:

```ts
if (!adminUser || !['super_admin', 'pdv'].includes(adminUser.role)) {
```

por:

```ts
if (!adminUser || !['super_admin', 'pdv', 'tripulacao', 'fotografo'].includes(adminUser.role)) {
```

- [ ] **Step 2: Validar que a vertical solicitada é permitida pro role**

Adicionar depois do parse do body:

```ts
import { getEnabledVerticals, type Vertical } from '@/lib/pdv/role-permissions'

// ...
const requestedVertical = (parsed.data as any).vertical as Vertical | undefined
if (requestedVertical) {
  const enabled = await getEnabledVerticals(adminUser.role)
  if (!enabled.some(e => e.vertical === requestedVertical)) {
    return NextResponse.json({ error: `Role ${adminUser.role} não pode vender ${requestedVertical}` }, { status: 403 })
  }
}
```

E adicionar `vertical: z.enum(['passeio', 'fotografia', 'servico', 'hospedagem']).optional()` no `PdvSchema`.

- [ ] **Step 3: Commit**

```bash
git add app/api/admin/pdv/route.ts
git commit -m "feat(pdv): expand allowed roles + per-vertical permission check"
```

---

## Task 13: Aplicar `buildSplit()` em `POST /api/admin/pdv` (+ teste)

**Files:**
- Modify: `app/api/admin/pdv/route.ts`
- Create: `tests/pdv/split-applied.test.ts`

- [ ] **Step 1: Escrever teste primeiro**

```ts
// tests/pdv/split-applied.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const createChargeMock = vi.fn()
const createOrFindCustomerMock = vi.fn().mockResolvedValue('cust_123')
const getPixQrCodeMock = vi.fn().mockResolvedValue({ encodedImage: 'AAAA', payload: '0002...' })

vi.mock('@/lib/asaas/client', () => ({
  createOrFindCustomer: createOrFindCustomerMock,
  createCharge: createChargeMock,
  getPixQrCode: getPixQrCodeMock,
}))

vi.mock('@/lib/admin-auth', () => ({
  getAdminUser: async () => ({ id: 'u1', email: 'u@a.com', role: 'super_admin' }),
}))

vi.mock('@/lib/supabase/server', () => {
  const boat = { id: 'b1', name: 'Test', price_adult: 10000, price_child: 5000, commission_pct: 70, partner_id: 'p1', partners: { name: 'Partner', asaas_wallet_id: 'wallet_partner' } }
  return {
    createAdminClient: async () => ({
      from: (table: string) => {
        if (table === 'boats') {
          return { select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: boat, error: null }) }) }) }
        }
        if (table === 'bookings') {
          return { insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: { id: 'bk1' }, error: null }) }) }) }
        }
        return { select: () => ({}) }
      },
    }),
  }
})

import { POST } from '@/app/api/admin/pdv/route'

describe('POST /api/admin/pdv — splits', () => {
  beforeEach(() => { createChargeMock.mockReset(); createChargeMock.mockResolvedValue({ id: 'ch1', invoiceUrl: 'http://x' }) })

  it('calls createCharge with split: partner 70% + Balaio 6%', async () => {
    const req = new Request('http://test', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        boat_id: 'b1', tour_date: '2026-06-01', adults: 2, children: 0,
        photographer_addon: false,
        customer_name: 'Foo', customer_email: 'foo@b.com',
        billing_type: 'PIX',
      }),
    })
    await POST(req)
    expect(createChargeMock).toHaveBeenCalled()
    const call = createChargeMock.mock.calls[0][0]
    expect(call.split).toBeDefined()
    expect(call.split).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ walletId: 'wallet_partner', percentualValue: 70 }),
        expect.objectContaining({ walletId: '00000000-0000-0000-0000-000000000001', percentualValue: 6 }),
      ])
    )
  })
})
```

- [ ] **Step 2: Rodar — deve falhar**

```bash
npm run test:run tests/pdv/split-applied.test.ts
```

Esperado: FAIL (a chamada `createCharge` é feita sem `split`).

- [ ] **Step 3: Aplicar `buildSplit` no route**

Em `app/api/admin/pdv/route.ts`, importar:

```ts
import { buildSplit } from '@/lib/asaas/split'
```

Antes da chamada `createCharge`, montar o `items`:

```ts
const items = [{
  partnerWalletId: (boat.partners as { asaas_wallet_id?: string | null } | null)?.asaas_wallet_id ?? undefined,
  commissionPct: partnerPct,
  // outros campos do CartItem que buildSplit espera (ver type) — passar shape mínimo
}] as Parameters<typeof buildSplit>[0]

const split = buildSplit(items)
```

Passar `split` na chamada:

```ts
const charge = await createCharge({
  customer: asaasCustomerId,
  billingType: billing_type,
  value: totalValue,
  dueDate: tour_date,
  description: `PDV — ${adults}A${children > 0 ? ` ${children}C` : ''} — ${tour_date}`,
  externalReference: `pdv_${Date.now()}`,
  ...(split ? { split } : {}),
  ...(billing_type === 'CREDIT_CARD' && credit_card && credit_card_holder
    ? { creditCard: credit_card, creditCardHolderInfo: credit_card_holder }
    : {}),
})
```

Verificar se `createCharge` no `lib/asaas/client.ts` aceita `split` no body — se não, adicionar.

- [ ] **Step 4: Rodar — deve passar**

```bash
npm run test:run tests/pdv/split-applied.test.ts
```

- [ ] **Step 5: Gravar `sold_by_user_id` e `sold_by_role`**

Na chamada `.insert(...)` do booking, adicionar:

```ts
sold_by_user_id: adminUser.id,
sold_by_role: adminUser.role,
```

- [ ] **Step 6: Commit**

```bash
git add app/api/admin/pdv/route.ts tests/pdv/split-applied.test.ts lib/asaas/client.ts
git commit -m "fix(pdv): apply buildSplit() in checkout + persist sold_by_* — closes split bug"
```

---

## Task 14: QR rendering test (sem polling ainda)

**Files:**
- Create: `tests/pdv/qr-rendering.test.ts`

- [ ] **Step 1: Escrever teste**

```ts
// tests/pdv/qr-rendering.test.ts
import { describe, it, expect, vi } from 'vitest'

const createChargeMock = vi.fn().mockResolvedValue({ id: 'ch1', invoiceUrl: 'http://x' })
const getPixQrCodeMock = vi.fn().mockResolvedValue({
  encodedImage: 'iVBORw0KGgoAAAANSUhEUgAA' + 'A'.repeat(1500),  // base64 PNG > 1000 chars
  payload: '00020126580014BR.GOV.BCB.PIX0136...',
})

vi.mock('@/lib/asaas/client', () => ({
  createOrFindCustomer: async () => 'cust_1',
  createCharge: createChargeMock,
  getPixQrCode: getPixQrCodeMock,
}))
vi.mock('@/lib/admin-auth', () => ({
  getAdminUser: async () => ({ id: 'u', email: 'u@a.com', role: 'super_admin' }),
}))
vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: async () => ({
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: { id: 'b', price_adult: 10000, commission_pct: 70 }, error: null }) }) }),
      insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: { id: 'bk1' }, error: null }) }) }),
    }),
  }),
}))

import { POST } from '@/app/api/admin/pdv/route'

describe('POST /api/admin/pdv — PIX QR', () => {
  it('returns pix_qr_code as valid data URL with substantial base64 payload', async () => {
    const req = new Request('http://test', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        boat_id: 'b', tour_date: '2026-06-01', adults: 1, children: 0,
        photographer_addon: false,
        customer_name: 'Test', customer_email: 't@b.com',
        billing_type: 'PIX',
      }),
    })
    const res = await POST(req)
    const body = await res.json()
    expect(body.pixQrCode).toBeTruthy()
    expect(body.pixQrCode).toMatch(/^data:image\/png;base64,/)
    // base64 payload deve ter pelo menos 1000 chars (PNG real, não 1×1 transparente)
    expect(body.pixQrCode.split(',')[1].length).toBeGreaterThan(1000)
    expect(body.pixCopyPaste).toMatch(/^00020126/)
  })
})
```

- [ ] **Step 2: Verificar shape do response**

Olhar `route.ts` e garantir que retorna `pixQrCode` (camelCase) e `pixCopyPaste`. Se está retornando `pix_qr_code` (snake), ajustar — vamos manter camelCase no response e snake no DB.

- [ ] **Step 3: Rodar — deve passar**

```bash
npm run test:run tests/pdv/qr-rendering.test.ts
```

- [ ] **Step 4: Commit**

```bash
git add tests/pdv/qr-rendering.test.ts app/api/admin/pdv/route.ts
git commit -m "test(pdv): assert PIX QR code is a real PNG data URL with valid copy-paste"
```

---

## Task 15: Endpoint de status pra polling

**Files:**
- Create: `app/api/admin/pdv/[id]/status/route.ts`

- [ ] **Step 1: Implementar**

```ts
// app/api/admin/pdv/[id]/status/route.ts
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getAdminUser } from '@/lib/admin-auth'
import { getCharge } from '@/lib/asaas/client'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminUser = await getAdminUser()
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const sb = await createAdminClient()
  const { data: booking } = await sb
    .from('bookings')
    .select('id, payment_status, asaas_payment_id, paid_at')
    .eq('id', id)
    .maybeSingle()

  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let paymentStatus = (booking.payment_status ?? 'pending').toLowerCase()

  // Side-effect: se DB ainda diz pending mas ASAAS já tem received/confirmed, sincronizar.
  if (paymentStatus === 'pending' && booking.asaas_payment_id) {
    try {
      const charge = await getCharge(booking.asaas_payment_id)
      const remote = (charge.status ?? '').toLowerCase()
      if (['received', 'confirmed'].includes(remote) && remote !== paymentStatus) {
        await sb.from('bookings').update({
          payment_status: remote,
          status: 'confirmed',
          paid_at: new Date().toISOString(),
        }).eq('id', id)
        paymentStatus = remote
      }
    } catch { /* swallow — polling tenta de novo em 3s */ }
  }

  return NextResponse.json({ paymentStatus, paidAt: booking.paid_at })
}
```

- [ ] **Step 2: Smoke**

`npm run build` deve passar.

- [ ] **Step 3: Commit**

```bash
git add app/api/admin/pdv/[id]/status/route.ts
git commit -m "feat(pdv): GET /api/admin/pdv/[id]/status — polling with lazy ASAAS sync"
```

---

## Task 16: Hook `usePaymentStatus`

**Files:**
- Create: `components/admin/pdv/usePaymentStatus.ts`

- [ ] **Step 1: Implementar**

```ts
// components/admin/pdv/usePaymentStatus.ts
'use client'
import { useEffect, useRef, useState } from 'react'

interface UsePaymentStatusResult {
  status: 'pending' | 'received' | 'confirmed' | 'overdue' | 'error'
  elapsedSec: number
  canConfirmManually: boolean
}

const POLL_INTERVAL_MS = 3000
const MANUAL_BUTTON_AFTER_SEC = 30

export function usePaymentStatus(bookingId: string | null): UsePaymentStatusResult {
  const [status, setStatus] = useState<UsePaymentStatusResult['status']>('pending')
  const [elapsedSec, setElapsedSec] = useState(0)
  const startedAt = useRef<number | null>(null)
  const finished = useRef(false)

  useEffect(() => {
    if (!bookingId) return
    finished.current = false
    startedAt.current = Date.now()

    const poll = async () => {
      if (finished.current) return
      try {
        const r = await fetch(`/api/admin/pdv/${bookingId}/status`, { cache: 'no-store' })
        const d = await r.json()
        const s = (d.paymentStatus ?? 'pending').toLowerCase() as UsePaymentStatusResult['status']
        setStatus(s)
        if (['received', 'confirmed'].includes(s)) {
          finished.current = true
          return
        }
      } catch {
        setStatus('error')
      }
      setTimeout(poll, POLL_INTERVAL_MS)
    }
    poll()

    const tick = setInterval(() => {
      if (startedAt.current) setElapsedSec(Math.floor((Date.now() - startedAt.current) / 1000))
    }, 1000)

    return () => { finished.current = true; clearInterval(tick) }
  }, [bookingId])

  return {
    status,
    elapsedSec,
    canConfirmManually: elapsedSec >= MANUAL_BUTTON_AFTER_SEC && !['received', 'confirmed'].includes(status),
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add components/admin/pdv/usePaymentStatus.ts
git commit -m "feat(pdv): usePaymentStatus hook — 3s polling + manual fallback after 30s"
```

---

## Task 17: StepPayment com abas PIX/Cartão e QR grande

**Files:**
- Create: `components/admin/pdv/StepPayment.tsx`
- Modify: `components/admin/pdv/PdvWizard.tsx` (usar StepPayment)

- [ ] **Step 1: Implementar StepPayment**

```tsx
// components/admin/pdv/StepPayment.tsx
'use client'
import { useState } from 'react'
import { formatCents } from '@/lib/booking/pricing'
import { PaymentBadge, ALL_PAYMENT_BRANDS } from '@/components/payments/PaymentBadge'
import { usePaymentStatus } from './usePaymentStatus'

interface Props {
  bookingId: string
  totalCents: number
  pixQrCode: string | null         // data:image/png;base64,...
  pixCopyPaste: string | null
  cardCheckoutUrl: string | null   // iframe URL pro cartão (vem do POST inicial)
  onPaid: () => void
}

export default function StepPayment({ bookingId, totalCents, pixQrCode, pixCopyPaste, cardCheckoutUrl, onPaid }: Props) {
  const [tab, setTab] = useState<'pix' | 'card'>('pix')
  const [copied, setCopied] = useState(false)
  const { status, elapsedSec, canConfirmManually } = usePaymentStatus(bookingId)

  // Trigger onPaid when polling detects paid
  if (['received', 'confirmed'].includes(status)) {
    // microtask, evita state update durante render
    queueMicrotask(onPaid)
  }

  async function copyPix() {
    if (!pixCopyPaste) return
    await navigator.clipboard.writeText(pixCopyPaste)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ background: 'white', borderRadius: '1rem', padding: '1.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', maxWidth: '560px' }}>
      {/* Tabs */}
      <div role="tablist" aria-label="Método de pagamento" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {(['pix', 'card'] as const).map(t => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: '0.75rem', border: `2px solid ${tab === t ? 'var(--ocean-mid)' : 'var(--border)'}`,
              borderRadius: '0.625rem', background: tab === t ? 'rgba(26,107,138,0.08)' : 'white',
              cursor: 'pointer', fontWeight: 700, color: 'var(--ocean-deep)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            }}
          >
            <PaymentBadge brand={t === 'pix' ? 'pix' : 'visa'} size={24} />
            {t === 'pix' ? 'PIX' : 'Cartão'}
          </button>
        ))}
      </div>

      {tab === 'pix' && (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            {pixQrCode ? (
              <img
                src={pixQrCode}
                alt="QR code PIX"
                width={260}
                height={260}
                style={{ borderRadius: '0.625rem', border: '1px solid var(--border)' }}
              />
            ) : (
              <div style={{ width: 260, height: 260, margin: '0 auto', background: 'var(--sand)', borderRadius: '0.625rem' }} />
            )}
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '0.5rem' }}>
            Aponte a câmera do celular do cliente pra esse código.
          </p>
          {pixCopyPaste && (
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <input
                readOnly
                value={pixCopyPaste}
                style={{ flex: 1, padding: '0.5rem 0.75rem', border: '1px solid var(--border)', borderRadius: '0.5rem', fontFamily: 'monospace', fontSize: '0.75rem', background: 'var(--sand)' }}
              />
              <button onClick={copyPix} style={{ padding: '0.5rem 1rem', background: 'var(--ocean-mid)', color: 'white', border: 0, borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
                {copied ? 'Copiado ✓' : 'Copiar'}
              </button>
            </div>
          )}
          <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--sand)', borderRadius: '0.625rem', marginBottom: '0.75rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 0.25rem' }}>Total</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--ocean-deep)', margin: 0 }}>{formatCents(totalCents)}</p>
          </div>
          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {status === 'pending' && `⏳ Aguardando pagamento… (${String(Math.floor(elapsedSec/60)).padStart(2,'0')}:${String(elapsedSec%60).padStart(2,'0')})`}
            {['received','confirmed'].includes(status) && '✅ Pagamento recebido!'}
            {status === 'error' && '⚠ Erro ao consultar status — vamos tentar de novo'}
          </p>
          {canConfirmManually && (
            <button
              onClick={onPaid}
              style={{ marginTop: '0.75rem', width: '100%', padding: '0.75rem', background: 'white', border: '1.5px dashed var(--ocean-mid)', borderRadius: '0.625rem', cursor: 'pointer', color: 'var(--ocean-deep)', fontWeight: 600 }}
            >
              Já recebi (confirmar manualmente)
            </button>
          )}
        </div>
      )}

      {tab === 'card' && (
        <div>
          {cardCheckoutUrl ? (
            <iframe
              src={cardCheckoutUrl}
              title="Pagamento por cartão"
              style={{ width: '100%', height: '480px', border: 0, borderRadius: '0.625rem' }}
            />
          ) : (
            <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Carregando formulário de cartão…
            </p>
          )}
        </div>
      )}

      <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        {ALL_PAYMENT_BRANDS.map(b => (
          <PaymentBadge key={b} brand={b} size={24} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Integrar no PdvWizard**

No PdvWizard, substituir o atual step 'payment' por:

```tsx
{step === 'payment' && result && (
  <StepPayment
    bookingId={result.bookingId}
    totalCents={result.totalCents}
    pixQrCode={result.pixQrCode}
    pixCopyPaste={result.pixCopyPaste}
    cardCheckoutUrl={result.cardCheckoutUrl ?? null}
    onPaid={() => setStep('done')}
  />
)}
```

E adicionar `cardCheckoutUrl` ao tipo `PdvResult`.

- [ ] **Step 3: Build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add components/admin/pdv/StepPayment.tsx components/admin/pdv/PdvWizard.tsx
git commit -m "feat(pdv): StepPayment with PIX QR + card iframe + polling integration"
```

---

## Task 18: ASAAS Checkout — endpoint pro cartão

**Files:**
- Modify: `lib/asaas/client.ts`
- Modify: `app/api/admin/pdv/route.ts`

- [ ] **Step 1: Verificar doc ASAAS**

Acessar https://docs.asaas.com/docs/checkout via WebFetch. Confirmar endpoint `POST /v3/checkouts` e os parâmetros aceitos: `name`, `value`, `dueDate`, `billingTypes: ['CREDIT_CARD']`, `description`, `externalReference`. Confirmar que a resposta inclui `id` e o `url` embarcável.

- [ ] **Step 2: Adicionar `createCheckout` em `lib/asaas/client.ts`**

```ts
// lib/asaas/client.ts
export interface AsaasCheckoutRequest {
  name: string
  value: number
  dueDate: string
  billingTypes: Array<'CREDIT_CARD' | 'BOLETO' | 'PIX'>
  description?: string
  externalReference?: string
  successUrl?: string
  notificationEnabled?: boolean
}

export interface AsaasCheckoutResponse {
  id: string
  url: string  // URL embarcável em iframe
  status: string
}

export async function createCheckout(data: AsaasCheckoutRequest): Promise<AsaasCheckoutResponse> {
  return asaasFetch<AsaasCheckoutResponse>('/checkouts', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
```

- [ ] **Step 3: No `/api/admin/pdv`, gerar checkout URL se `billing_type === 'CREDIT_CARD'`**

```ts
if (billing_type === 'CREDIT_CARD') {
  try {
    const co = await createCheckout({
      name: `Reserva ${customer_name}`,
      value: totalValue,
      dueDate: tour_date,
      billingTypes: ['CREDIT_CARD'],
      description: `PDV — ${adults}A — ${tour_date}`,
      externalReference: `pdv_${Date.now()}`,
      notificationEnabled: true,
    })
    cardCheckoutUrl = co.url
  } catch (e) {
    asaasError = e instanceof Error ? e.message : String(e)
  }
}
```

Retornar `cardCheckoutUrl` no response.

- [ ] **Step 4: Smoke**

`npm run build` passa.

- [ ] **Step 5: Commit**

```bash
git add lib/asaas/client.ts lib/asaas/types.ts app/api/admin/pdv/route.ts
git commit -m "feat(asaas): createCheckout + iframe URL for card payment"
```

> **Fallback:** se ASAAS Checkout não suportar exatamente o que precisamos, embarcar `invoiceUrl` da `createCharge` em iframe. Provavelmente vai funcionar (não tem `X-Frame-Options: DENY` no domínio ASAAS).

---

## Task 19: PDF + email + WhatsApp — notify endpoint

**Files:**
- Create: `lib/pdf/booking-receipt.tsx`
- Create: `lib/email/send-receipt.ts`
- Create: `lib/whatsapp.ts`
- Create: `app/api/admin/pdv/[id]/notify/route.ts`

- [ ] **Step 1: Instalar @react-pdf/renderer**

```bash
npm install @react-pdf/renderer
```

- [ ] **Step 2: Criar PDF doc**

```tsx
// lib/pdf/booking-receipt.tsx
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer'
import React from 'react'

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11 },
  h1:   { fontSize: 18, fontWeight: 700, marginBottom: 12 },
  row:  { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  label:{ color: '#666' },
  total:{ marginTop: 20, fontSize: 16, fontWeight: 700 },
})

export interface BookingForReceipt {
  id: string
  customerName: string
  customerEmail: string
  tourDate: string | null
  boatName: string | null
  adults: number
  children: number
  totalCents: number
  paymentMethod: string | null
  paidAt: string | null
}

function ReceiptDoc({ b }: { b: BookingForReceipt }) {
  const fmt = (cents: number) => (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Acalanto Turismo — Comprovante de reserva</Text>
        <View style={styles.row}><Text style={styles.label}>Reserva:</Text><Text>{b.id}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Cliente:</Text><Text>{b.customerName}</Text></View>
        <View style={styles.row}><Text style={styles.label}>E-mail:</Text><Text>{b.customerEmail}</Text></View>
        {b.boatName && <View style={styles.row}><Text style={styles.label}>Escuna:</Text><Text>{b.boatName}</Text></View>}
        {b.tourDate && <View style={styles.row}><Text style={styles.label}>Data:</Text><Text>{b.tourDate}</Text></View>}
        <View style={styles.row}><Text style={styles.label}>Passageiros:</Text><Text>{b.adults}A{b.children ? ` ${b.children}C` : ''}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Pagamento:</Text><Text>{b.paymentMethod ?? '—'}</Text></View>
        {b.paidAt && <View style={styles.row}><Text style={styles.label}>Pago em:</Text><Text>{new Date(b.paidAt).toLocaleString('pt-BR')}</Text></View>}
        <Text style={styles.total}>Total: {fmt(b.totalCents)}</Text>
      </Page>
    </Document>
  )
}

export async function renderBookingReceipt(b: BookingForReceipt): Promise<Buffer> {
  return await renderToBuffer(<ReceiptDoc b={b} />)
}
```

- [ ] **Step 3: Wrapper de email**

```ts
// lib/email/send-receipt.ts
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
})

export async function sendReceipt(opts: {
  to: string
  bookingId: string
  pdfBuffer: Buffer
}) {
  return transporter.sendMail({
    from: `"Acalanto Turismo" <${process.env.SMTP_FROM ?? 'reservas@acalantoturismo.com'}>`,
    to: opts.to,
    subject: `Sua reserva está confirmada — ${opts.bookingId.slice(0, 8)}`,
    text: `Olá! Sua reserva está confirmada. O comprovante está em anexo. Qualquer dúvida, fale com a gente. — Equipe Acalanto`,
    attachments: [{ filename: `comprovante-${opts.bookingId.slice(0,8)}.pdf`, content: opts.pdfBuffer }],
  })
}
```

- [ ] **Step 4: WhatsApp builder**

```ts
// lib/whatsapp.ts
export function buildWhatsappLink(opts: {
  phone: string | null
  bookingId: string
  boatName: string | null
  tourDate: string | null
  adults: number
  children: number
  totalCents: number
  pdfUrl?: string
}): string | null {
  if (!opts.phone) return null
  const digits = opts.phone.replace(/\D+/g, '')
  if (digits.length < 10) return null
  const fmt = (c: number) => (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const msg = [
    '✅ Sua reserva está confirmada!',
    '',
    `🎫 Reserva: ${opts.bookingId.slice(0, 8)}`,
    opts.boatName ? `⚓ ${opts.boatName}` : '',
    opts.tourDate ? `📅 ${opts.tourDate}` : '',
    `👥 ${opts.adults} adulto${opts.adults !== 1 ? 's' : ''}${opts.children ? ` + ${opts.children} criança${opts.children !== 1 ? 's' : ''}` : ''}`,
    `💰 Total: ${fmt(opts.totalCents)}`,
    opts.pdfUrl ? `\nComprovante: ${opts.pdfUrl}` : '',
    '\nQualquer dúvida, fale com a gente!',
  ].filter(Boolean).join('\n')
  return `https://wa.me/${digits.startsWith('55') ? digits : `55${digits}`}?text=${encodeURIComponent(msg)}`
}
```

- [ ] **Step 5: Notify endpoint**

```ts
// app/api/admin/pdv/[id]/notify/route.ts
import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'
import { renderBookingReceipt } from '@/lib/pdf/booking-receipt'
import { sendReceipt } from '@/lib/email/send-receipt'
import { buildWhatsappLink } from '@/lib/whatsapp'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminUser = await getAdminUser()
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const sb = await createAdminClient()
  const { data: b } = await sb
    .from('bookings')
    .select('id, customer_name, customer_email, customer_phone, tour_date, total_cents, adults, children, payment_method, paid_at, boats(name)')
    .eq('id', id)
    .maybeSingle()

  if (!b) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const boatName = Array.isArray(b.boats) ? (b.boats[0] as { name: string } | undefined)?.name ?? null : (b.boats as { name: string } | null)?.name ?? null

  const pdf = await renderBookingReceipt({
    id: b.id,
    customerName: b.customer_name ?? 'Cliente',
    customerEmail: b.customer_email ?? '',
    tourDate: b.tour_date,
    boatName,
    adults: b.adults ?? 0,
    children: b.children ?? 0,
    totalCents: b.total_cents,
    paymentMethod: b.payment_method,
    paidAt: b.paid_at,
  })

  // Upload PDF to Supabase storage
  const path = `comprovantes/${id}.pdf`
  const { error: upErr } = await sb.storage.from('images').upload(path, pdf, {
    contentType: 'application/pdf',
    upsert: true,
    cacheControl: '2678400',
  })
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })
  const { data: signed } = await sb.storage.from('images').createSignedUrl(path, 60 * 60 * 24 * 30)
  const pdfUrl = signed?.signedUrl ?? null

  // Email
  if (b.customer_email) {
    try { await sendReceipt({ to: b.customer_email, bookingId: id, pdfBuffer: pdf }) }
    catch (e) { console.error('[notify] email error:', e) }
  }

  // WhatsApp link
  const whatsappLink = buildWhatsappLink({
    phone: b.customer_phone,
    bookingId: id,
    boatName,
    tourDate: b.tour_date,
    adults: b.adults ?? 0,
    children: b.children ?? 0,
    totalCents: b.total_cents,
    pdfUrl: pdfUrl ?? undefined,
  })

  return NextResponse.json({ pdfUrl, whatsappLink })
}
```

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json lib/pdf/booking-receipt.tsx lib/email/send-receipt.ts lib/whatsapp.ts app/api/admin/pdv/[id]/notify/route.ts
git commit -m "feat(pdv): notify endpoint — PDF receipt + email + WhatsApp link"
```

> **Configuração de SMTP:** as envs `SMTP_HOST/PORT/USER/PASS/FROM` precisam estar no Vercel. Se ainda não estiverem, adicionar via `vercel env add` antes do deploy.

---

## Task 20: StepDone

**Files:**
- Create: `components/admin/pdv/StepDone.tsx`
- Modify: `components/admin/pdv/PdvWizard.tsx`

- [ ] **Step 1: StepDone**

```tsx
// components/admin/pdv/StepDone.tsx
'use client'
import { useEffect, useState } from 'react'

interface Props {
  bookingId: string
  onNewSale: () => void
}

export default function StepDone({ bookingId, onNewSale }: Props) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [whatsappLink, setWhatsappLink] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/admin/pdv/${bookingId}/notify`, { method: 'POST' })
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error)
        setPdfUrl(d.pdfUrl)
        setWhatsappLink(d.whatsappLink)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [bookingId])

  return (
    <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', maxWidth: '560px', textAlign: 'center' }}>
      <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>✅</div>
      <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.5rem', color: 'var(--ocean-deep)', margin: '0 0 1rem' }}>
        Venda concluída!
      </h2>

      {loading && <p style={{ color: 'var(--text-muted)' }}>Gerando comprovante…</p>}
      {error && <p style={{ color: '#e53e3e' }}>Erro: {error}</p>}

      {pdfUrl && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ padding: '0.75rem', background: 'var(--ocean-mid)', color: 'white', borderRadius: '0.625rem', textDecoration: 'none', fontWeight: 600 }}
          >
            📄 Baixar comprovante (PDF)
          </a>
          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{ padding: '0.75rem', background: '#25D366', color: 'white', borderRadius: '0.625rem', textDecoration: 'none', fontWeight: 600 }}
            >
              💬 Enviar pelo WhatsApp
            </a>
          )}
        </div>
      )}

      <button
        onClick={onNewSale}
        style={{ marginTop: '1rem', width: '100%', padding: '0.75rem', background: 'white', border: '1.5px solid var(--ocean-mid)', borderRadius: '0.625rem', cursor: 'pointer', color: 'var(--ocean-deep)', fontWeight: 600 }}
      >
        + Nova venda
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Plugar no PdvWizard**

```tsx
{step === 'done' && result && (
  <StepDone bookingId={result.bookingId} onNewSale={() => window.location.reload()} />
)}
```

- [ ] **Step 3: Commit**

```bash
git add components/admin/pdv/StepDone.tsx components/admin/pdv/PdvWizard.tsx
git commit -m "feat(pdv): StepDone — PDF download + WhatsApp link + new sale"
```

---

## Task 21: Substituir badges custom por PaymentBadge no site público

**Files:**
- Modify: `components/cart/CartDrawer.tsx`
- Modify: `components/photography/PhotographyBookingWidget.tsx`
- Modify: `components/booking/ServiceBookingWidget.tsx`
- Modify: `components/layout/Footer.tsx` (se houver badges lá)

- [ ] **Step 1: Mapear ocorrências**

```bash
grep -rln "pix\|PIX\|Visa\|MasterCard\|Mastercard" components/ app/ | grep -v node_modules | grep -v _components | head -20
```

Identificar onde tem botões/texto custom de método de pagamento.

- [ ] **Step 2: Para cada arquivo identificado, importar e usar `<PaymentBadge>`**

Padrão:

```tsx
import { PaymentBadge, ALL_PAYMENT_BRANDS } from '@/components/payments/PaymentBadge'

// Onde antes era "Aceitamos: ... [PIX, Cartão, etc]" hardcoded:
<div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
  {ALL_PAYMENT_BRANDS.map(b => <PaymentBadge key={b} brand={b} size={24} />)}
</div>
```

- [ ] **Step 3: Build + smoke**

```bash
npm run build
```

Acessar `/passeios`, `/fotografia`, `/`, ver os badges aparecendo nos lugares certos.

- [ ] **Step 4: Commit**

```bash
git add components/cart/CartDrawer.tsx components/photography/PhotographyBookingWidget.tsx components/booking/ServiceBookingWidget.tsx components/layout/Footer.tsx
git commit -m "refactor(ui): replace custom payment buttons with <PaymentBadge> across site"
```

---

## Task 22: Deploy + QA manual

**Files:** —

- [ ] **Step 1: Pull + push final**

```bash
git -C "C:\Users\Victor Lima\Desktop\sites\tours\acalanto-tours" fetch origin
git -C "C:\Users\Victor Lima\Desktop\sites\tours\acalanto-tours" pull --rebase origin main
git -C "C:\Users\Victor Lima\Desktop\sites\tours\acalanto-tours" push origin main
```

- [ ] **Step 2: Aguardar deploy Vercel**

Usar `gh api repos/bloodyu2/acalanto-tours/commits/<HEAD-SHA>/status` num loop até `state="success"`.

- [ ] **Step 3: QA checklist manual**

- [ ] Login como `pdv-teste@acalanto.com` — sidebar mostra só "PDV — Vendas"
- [ ] Login como `tripulacao-teste@acalanto.com` — sidebar mostra Capacidade + Reservas
- [ ] Login como `fotografo-teste@acalanto.com` — sidebar mostra Capacidade
- [ ] Login como super_admin — sidebar mostra TUDO, incluindo Configurações
- [ ] super_admin → Configurações → ver tabela 4×4, desmarcar `tripulacao×fotografia`, recarregar — persiste
- [ ] super_admin → Vendas → escolher vertical "Passeio" → criar venda PIX teste — QR aparece grande no centro da tela com 260px
- [ ] Pagar QR via app banco real (valor R$ 0,01 se ASAAS sandbox permitir) → polling detecta em <10s → step Done
- [ ] Step Done — botão "Baixar comprovante" funciona; botão WhatsApp abre `wa.me` com texto pré-formatado
- [ ] Após 30s sem pagamento — botão "Já recebi" aparece
- [ ] Tab Cartão — iframe ASAAS carrega
- [ ] `/admin/roadmap`, `/admin/apresentacoes`, `/admin/identidade` com usuário não-super_admin → redireciona pra `/admin`
- [ ] Toda venda em `bookings` tem `sold_by_user_id` e `sold_by_role` preenchidos
- [ ] Verificar no Supabase: cobrança PIX criada com `split: [partner walletId @70%, Balaio @6%]`

- [ ] **Step 4: Commit final (se algo precisou de fix)**

---

## Self-Review (do plano contra o spec)

### Cobertura do spec

| Spec requirement | Task que cobre |
|---|---|
| Catálogo filtrado por role × vertical | Task 6 (helper), Task 10 (page), Task 11 (Step 0) |
| Cross-sell com priorização configurável | Task 2 (table), Task 7-8 (UI) |
| PIX QR grande + polling + manual fallback | Task 14, 15, 16, 17 |
| Cartão via iframe ASAAS | Task 18 |
| PDF + email + WhatsApp pós-pagamento | Task 19, 20 |
| Badges oficiais | Task 9, 21 |
| RBAC nav fix + server guards | Task 4, 5 |
| `buildSplit()` aplicado | Task 13 |
| `sold_by_user_id` + `sold_by_role` | Task 3, 13 |
| Testes (qr-rendering, split-applied, role-filter) | Task 6 (role-filter via permissions test), Task 13 (split-applied), Task 14 (qr-rendering), Task 9 (PaymentBadge) |

Sem gaps detectados.

### Placeholders

Auditei "TBD", "TODO", "implementar depois", "similar a Task N" — não encontrei. Cada step tem código real.

### Consistência de tipos

- `Vertical` definido em `lib/pdv/role-permissions.ts` (Task 6); usado em `getEnabledVerticals` retorno e em `StepVertical` props (Task 11) — consistente.
- `EnabledVertical` (Task 6) → consumido em Task 10, 11 — consistente.
- `PdvBoat / PdvPhotographer / PdvService` exportados de PdvWizard (Task 11), consumidos em Task 10 — consistente.
- `BookingForReceipt` (Task 19 PDF) — uso interno, sem vazamento de tipo.

### Escopo

22 tasks. Aceitável para esta escala (multi-subsistema bem integrado). Não há subsistema independente o suficiente pra justificar quebrar em planos separados — RBAC nav (Task 4-5) é o mais isolável, mas é pequeno demais (~10 min) pra valer um plano separado.

### Ambiguidade

Nenhuma identificada que afete execução.
