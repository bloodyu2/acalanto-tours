# ASAAS Subconta Automática — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar subconta ASAAS automaticamente quando um serviço de parceiro é aprovado, coletar os dados fiscais obrigatórios durante o cadastro, e desativar a subconta quando o serviço for rejeitado/removido.

**Architecture:** Um novo passo no wizard de cadastro coleta dados fiscais (CPF/CNPJ, endereço, data de nascimento) e os salva em `partners`. Na aprovação do anúncio pelo admin, a server action chama a API ASAAS para criar a subconta e salva `asaas_wallet_id` + `asaas_account_id` no parceiro — o split de pagamento passa a funcionar automaticamente. Na rejeição, a subconta é desativada e os IDs são zerados.

**Tech Stack:** Next.js 16 Server Actions, Supabase (admin client), ASAAS API v3 (`POST /accounts`, `POST /accounts/{id}/status`), TypeScript, Zod (validação CPF/CNPJ no client)

---

## File Structure

| Arquivo | Ação | Responsabilidade |
|---------|------|-----------------|
| `supabase/migrations/012_partner_fiscal.sql` | Criar | Colunas fiscais + `asaas_account_id` em `partners` |
| `lib/types/database.ts` | Modificar | Adicionar novas colunas ao tipo `partners.Row` |
| `lib/asaas/types.ts` | Modificar | Adicionar `AsaasSubcontaRequest`, `AsaasSubcontaResponse` |
| `lib/asaas/client.ts` | Modificar | Adicionar `createSubconta`, `disableSubconta` |
| `app/parceiros/cadastro/_components/WizardSteps.tsx` | Modificar | 5 passos: Conta → Tipo → Dados → Anúncio → Pronto |
| `app/parceiros/cadastro/tipo/page.tsx` | Modificar | Navegar para `dados-fiscais` em vez de `anuncio` |
| `app/parceiros/cadastro/dados-fiscais/page.tsx` | Criar | Formulário: CPF/CNPJ, nascimento, telefone, endereço |
| `app/admin/parceiros/actions.ts` | Modificar | Criar/desativar subconta na aprovação/rejeição |

---

## Task 1: Migration — colunas fiscais em `partners`

**Files:**
- Create: `supabase/migrations/012_partner_fiscal.sql`

- [ ] **Step 1: Criar o arquivo de migration**

```sql
-- supabase/migrations/012_partner_fiscal.sql

alter table partners
  add column if not exists cpf_cnpj        text,
  add column if not exists birth_date      text,
  add column if not exists mobile_phone    text,
  add column if not exists address         text,
  add column if not exists address_number  text,
  add column if not exists province        text,
  add column if not exists postal_code     text,
  add column if not exists asaas_account_id text;
```

- [ ] **Step 2: Aplicar no Supabase**

No painel Supabase → SQL Editor → colar e executar o SQL acima.

Verificar com: `select column_name from information_schema.columns where table_name = 'partners' order by ordinal_position;`

Colunas esperadas novas: `cpf_cnpj`, `birth_date`, `mobile_phone`, `address`, `address_number`, `province`, `postal_code`, `asaas_account_id`.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/012_partner_fiscal.sql
git commit -m "feat(db): add fiscal columns and asaas_account_id to partners"
```

---

## Task 2: Atualizar tipos TypeScript

**Files:**
- Modify: `lib/types/database.ts` — `partners.Row`
- Modify: `lib/asaas/types.ts` — novos tipos de subconta

- [ ] **Step 1: Atualizar `partners.Row` em `lib/types/database.ts`**

Localizar o bloco `partners:` (começa em `partners: {`) e substituir o `Row` para incluir as novas colunas:

```typescript
partners: {
  Row: {
    id: string
    name: string
    email: string | null
    phone: string | null
    type: string
    active: boolean
    internal_rating: number | null
    notes: string | null
    asaas_wallet_id: string | null
    asaas_account_id: string | null
    commission_pct: number
    cpf_cnpj: string | null
    birth_date: string | null
    mobile_phone: string | null
    address: string | null
    address_number: string | null
    province: string | null
    postal_code: string | null
    created_at: string
    updated_at: string
  }
  Insert: Omit<Database['public']['Tables']['partners']['Row'], 'id' | 'created_at' | 'updated_at'>
  Update: Partial<Database['public']['Tables']['partners']['Insert']>
}
```

- [ ] **Step 2: Adicionar tipos de subconta em `lib/asaas/types.ts`**

Adicionar ao final do arquivo (antes do último export, ou após):

```typescript
export interface AsaasSubcontaRequest {
  name: string
  email: string
  cpfCnpj: string
  birthDate: string      // YYYY-MM-DD
  mobilePhone: string    // apenas dígitos
  address: string
  addressNumber: string
  province: string
  postalCode: string     // apenas dígitos
  companyType?: 'MEI' | 'LIMITED' | 'INDIVIDUAL' | 'ASSOCIATION'
}

export interface AsaasSubcontaResponse {
  id: string             // asaas account ID — salvar como asaas_account_id
  walletId: string       // salvar como asaas_wallet_id
  name: string
  email: string
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/types/database.ts lib/asaas/types.ts
git commit -m "feat(types): add fiscal columns to partners Row + ASAAS subconta types"
```

---

## Task 3: Funções ASAAS — `createSubconta` e `disableSubconta`

**Files:**
- Modify: `lib/asaas/client.ts`

- [ ] **Step 1: Adicionar `createSubconta` e `disableSubconta` em `lib/asaas/client.ts`**

Adicionar após a função `getCharge` existente:

```typescript
export async function createSubconta(
  data: AsaasSubcontaRequest
): Promise<AsaasSubcontaResponse> {
  return asaasFetch<AsaasSubcontaResponse>('/accounts', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function disableSubconta(asaasAccountId: string): Promise<void> {
  await asaasFetch<unknown>(`/accounts/${asaasAccountId}/status`, {
    method: 'POST',
    body: JSON.stringify({ status: 'INACTIVE' }),
  })
}
```

Atualizar o import no topo do arquivo para incluir os novos tipos:

```typescript
import type {
  AsaasCustomer,
  AsaasChargeRequest,
  AsaasCharge,
  AsaasSubcontaRequest,
  AsaasSubcontaResponse,
} from './types'
```

- [ ] **Step 2: Verificar que `asaasFetch` já lida com erros corretamente**

A função `asaasFetch` já lança `Error` com o body da resposta quando `!res.ok`. Isso cobre os casos de CPF/CNPJ inválido ou e-mail já cadastrado no ASAAS — o erro vai subir para o caller em `actions.ts`.

- [ ] **Step 3: Commit**

```bash
git add lib/asaas/client.ts
git commit -m "feat(asaas): add createSubconta and disableSubconta"
```

---

## Task 4: Atualizar wizard — 5 passos e nova rota

**Files:**
- Modify: `app/parceiros/cadastro/_components/WizardSteps.tsx`
- Modify: `app/parceiros/cadastro/tipo/page.tsx`

- [ ] **Step 1: Atualizar `WizardSteps.tsx` para 5 passos**

Substituir o conteúdo completo do arquivo:

```typescript
export function WizardSteps({ current }: { current: 1 | 2 | 3 | 4 | 5 }) {
  const steps = ['Conta', 'Tipo', 'Dados', 'Anúncio', 'Pronto']
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

- [ ] **Step 2: Atualizar `tipo/page.tsx` — mudar destino de navegação**

Na linha onde `choose()` faz `router.push`, alterar o destino:

```typescript
// antes:
router.push('/parceiros/cadastro/anuncio')

// depois:
router.push('/parceiros/cadastro/dados-fiscais')
```

Também atualizar o número do passo na chamada de `WizardSteps`:
```typescript
// já está current={2} — manter assim
<WizardSteps current={2} />
```

- [ ] **Step 3: Atualizar `anuncio/page.tsx` — número do passo**

Em `app/parceiros/cadastro/anuncio/page.tsx`, o passo atual é `current={3}`. Com o novo passo "Dados" como step 3, o anúncio passa a ser step 4:

```typescript
<WizardSteps current={4} />
```

- [ ] **Step 4: Commit**

```bash
git add app/parceiros/cadastro/_components/WizardSteps.tsx \
        app/parceiros/cadastro/tipo/page.tsx \
        app/parceiros/cadastro/anuncio/page.tsx
git commit -m "feat(wizard): add 'Dados fiscais' as step 3, shift anuncio to step 4"
```

---

## Task 5: Nova página — `/parceiros/cadastro/dados-fiscais`

**Files:**
- Create: `app/parceiros/cadastro/dados-fiscais/page.tsx`

- [ ] **Step 1: Criar a página**

```typescript
'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { WizardSteps } from '../_components/WizardSteps'

function cleanDigits(v: string) {
  return v.replace(/\D/g, '')
}

function isValidCpf(cpf: string): boolean {
  const d = cleanDigits(cpf)
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(d[i]) * (10 - i)
  let r = (sum * 10) % 11
  if (r === 10 || r === 11) r = 0
  if (r !== parseInt(d[9])) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(d[i]) * (11 - i)
  r = (sum * 10) % 11
  if (r === 10 || r === 11) r = 0
  return r === parseInt(d[10])
}

function isValidCnpj(cnpj: string): boolean {
  const d = cleanDigits(cnpj)
  if (d.length !== 14 || /^(\d)\1+$/.test(d)) return false
  const calc = (d: string, weights: number[]) =>
    weights.reduce((s, w, i) => s + parseInt(d[i]) * w, 0)
  const mod = (n: number) => { const r = n % 11; return r < 2 ? 0 : 11 - r }
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  return mod(calc(d, w1)) === parseInt(d[12]) && mod(calc(d, w2)) === parseInt(d[13])
}

export default function DadosFiscaisPage() {
  const router = useRouter()
  const [partnerId, setPartnerId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [cpfCnpj, setCpfCnpj] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [mobilePhone, setMobilePhone] = useState('')
  const [address, setAddress] = useState('')
  const [addressNumber, setAddressNumber] = useState('')
  const [province, setProvince] = useState('')
  const [postalCode, setPostalCode] = useState('')

  useEffect(() => {
    const pid = sessionStorage.getItem('onboarding_partner_id')
    if (!pid) { router.push('/parceiros/cadastro'); return }
    setPartnerId(pid)
  }, [router])

  const digits = cleanDigits(cpfCnpj)
  const isPf = digits.length <= 11
  const cpfCnpjValid = isPf ? isValidCpf(digits) : isValidCnpj(digits)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!partnerId) return
    if (!cpfCnpjValid) { setError('CPF ou CNPJ inválido.'); return }
    if (cleanDigits(postalCode).length !== 8) { setError('CEP deve ter 8 dígitos.'); return }

    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('partners')
      .update({
        cpf_cnpj:       cleanDigits(cpfCnpj),
        birth_date:     birthDate,
        mobile_phone:   cleanDigits(mobilePhone),
        address,
        address_number: addressNumber,
        province,
        postal_code:    cleanDigits(postalCode),
      })
      .eq('id', partnerId)

    if (updateError) {
      setError('Erro ao salvar dados. Tente novamente.')
      setLoading(false)
      return
    }

    router.push('/parceiros/cadastro/anuncio')
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.8125rem 1rem',
    border: '1px solid var(--border)', borderRadius: '8px',
    fontSize: '0.9375rem', fontFamily: 'inherit',
    outline: 'none', background: 'white', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.8125rem',
    fontWeight: 600, marginBottom: '0.375rem',
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
          <WizardSteps current={3} />
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Dados para recebimento</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            Necessários para configurar sua conta de recebimento. Seus dados são protegidos e criptografados.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            <div>
              <label style={labelStyle}>CPF ou CNPJ *</label>
              <input
                type="text"
                value={cpfCnpj}
                onChange={e => setCpfCnpj(e.target.value)}
                required
                placeholder="000.000.000-00 ou 00.000.000/0001-00"
                style={{ ...inputStyle, borderColor: cpfCnpj && !cpfCnpjValid ? '#dc2626' : undefined }}
              />
              {cpfCnpj && !cpfCnpjValid && (
                <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }}>
                  {isPf ? 'CPF inválido' : 'CNPJ inválido'}
                </p>
              )}
              {cpfCnpj && cpfCnpjValid && (
                <p style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.25rem' }}>
                  ✓ {isPf ? 'CPF válido' : 'CNPJ válido'}
                </p>
              )}
            </div>

            <div>
              <label style={labelStyle}>{isPf ? 'Data de nascimento' : 'Data de abertura da empresa'} *</label>
              <input
                type="date"
                value={birthDate}
                onChange={e => setBirthDate(e.target.value)}
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Celular *</label>
              <input
                type="tel"
                value={mobilePhone}
                onChange={e => setMobilePhone(e.target.value)}
                required
                placeholder="(24) 99999-9999"
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem' }}>
              <div>
                <label style={labelStyle}>Endereço *</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  required
                  placeholder="Rua, Avenida..."
                  style={inputStyle}
                />
              </div>
              <div style={{ width: '90px' }}>
                <label style={labelStyle}>Número *</label>
                <input
                  type="text"
                  value={addressNumber}
                  onChange={e => setAddressNumber(e.target.value)}
                  required
                  placeholder="123"
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Bairro *</label>
              <input
                type="text"
                value={province}
                onChange={e => setProvince(e.target.value)}
                required
                placeholder="Centro"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>CEP *</label>
              <input
                type="text"
                value={postalCode}
                onChange={e => setPostalCode(e.target.value)}
                required
                placeholder="23970-000"
                style={inputStyle}
              />
            </div>

            {error && (
              <p style={{ color: '#dc2626', fontSize: '0.875rem', background: '#fef2f2', padding: '0.75rem 1rem', borderRadius: '8px', margin: 0 }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !cpfCnpjValid}
              style={{ padding: '1rem', fontSize: '1rem', opacity: (loading || !cpfCnpjValid) ? 0.7 : 1, cursor: (loading || !cpfCnpjValid) ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Salvando...' : 'Continuar'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Testar manualmente o fluxo**

1. Acessar `/parceiros/cadastro`
2. Criar conta de teste
3. Selecionar tipo
4. Confirmar que redirecionou para `/parceiros/cadastro/dados-fiscais`
5. Confirmar que WizardSteps mostra 5 passos com step 3 ativo
6. Preencher com CPF `529.982.247-25` (válido) — verificar "✓ CPF válido"
7. Preencher restante e submeter
8. Confirmar redirecionamento para `/parceiros/cadastro/anuncio` com step 4 ativo
9. No Supabase, verificar que `partners` tem as colunas fiscais preenchidas

- [ ] **Step 3: Commit**

```bash
git add app/parceiros/cadastro/dados-fiscais/page.tsx
git commit -m "feat(wizard): add dados-fiscais step (CPF/CNPJ, endereço, nascimento)"
```

---

## Task 6: Server actions — criar e desativar subconta na aprovação

**Files:**
- Modify: `app/admin/parceiros/actions.ts`

- [ ] **Step 1: Substituir o conteúdo de `app/admin/parceiros/actions.ts`**

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { createSubconta, disableSubconta } from '@/lib/asaas/client'

export async function approveListing(listingId: string) {
  const supabase = await createAdminClient()

  // 1. Fetch listing to get partner_id
  const { data: listing, error: listingFetchError } = await supabase
    .from('partner_listings')
    .select('partner_id')
    .eq('id', listingId)
    .single()
  if (listingFetchError || !listing) throw new Error('Listing not found')

  // 2. Fetch partner fiscal data
  const { data: partner, error: partnerFetchError } = await supabase
    .from('partners')
    .select('id, name, email, asaas_wallet_id, asaas_account_id, cpf_cnpj, birth_date, mobile_phone, address, address_number, province, postal_code')
    .eq('id', listing.partner_id)
    .single()
  if (partnerFetchError || !partner) throw new Error('Partner not found')

  // 3. Create ASAAS subconta only if not already created
  if (!partner.asaas_wallet_id) {
    if (!partner.cpf_cnpj || !partner.birth_date || !partner.mobile_phone || !partner.address || !partner.address_number || !partner.province || !partner.postal_code) {
      throw new Error('Parceiro não preencheu os dados fiscais obrigatórios.')
    }

    const subconta = await createSubconta({
      name:          partner.name,
      email:         partner.email ?? `parceiro+${partner.id}@acalanto.com.br`,
      cpfCnpj:       partner.cpf_cnpj,
      birthDate:     partner.birth_date,
      mobilePhone:   partner.mobile_phone,
      address:       partner.address,
      addressNumber: partner.address_number,
      province:      partner.province,
      postalCode:    partner.postal_code,
    })

    const { error: walletError } = await supabase
      .from('partners')
      .update({
        asaas_wallet_id:  subconta.walletId,
        asaas_account_id: subconta.id,
      })
      .eq('id', partner.id)
    if (walletError) throw new Error(`Erro ao salvar walletId: ${walletError.message}`)
  }

  // 4. Approve the listing
  const { error } = await supabase
    .from('partner_listings')
    .update({ status: 'approved', updated_at: new Date().toISOString() })
    .eq('id', listingId)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/parceiros')
}

export async function rejectListing(listingId: string, reason: string) {
  const supabase = await createAdminClient()

  // 1. Fetch listing to get partner_id
  const { data: listing, error: listingFetchError } = await supabase
    .from('partner_listings')
    .select('partner_id')
    .eq('id', listingId)
    .single()
  if (listingFetchError || !listing) throw new Error('Listing not found')

  // 2. Fetch partner's ASAAS account ID
  const { data: partner } = await supabase
    .from('partners')
    .select('id, asaas_account_id')
    .eq('id', listing.partner_id)
    .single()

  // 3. Disable ASAAS subconta if it exists
  if (partner?.asaas_account_id) {
    await disableSubconta(partner.asaas_account_id)
    await supabase
      .from('partners')
      .update({ asaas_wallet_id: null, asaas_account_id: null })
      .eq('id', partner.id)
  }

  // 4. Reject the listing
  const { error } = await supabase
    .from('partner_listings')
    .update({ status: 'rejected', rejection_reason: reason, updated_at: new Date().toISOString() })
    .eq('id', listingId)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/parceiros')
}

export async function approvePartnerClaim(partnerId: string) {
  const supabase = await createAdminClient()
  const { error } = await supabase
    .from('partners')
    .update({ status: 'approved' })
    .eq('id', partnerId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/parceiros')
}

export async function rejectPartnerClaim(partnerId: string, reason: string) {
  const supabase = await createAdminClient()
  const { error } = await supabase
    .from('partners')
    .update({ status: 'rejected', rejection_reason: reason })
    .eq('id', partnerId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/parceiros')
}
```

- [ ] **Step 2: Ativar env var do split**

Em `.env.local` (desenvolvimento) e nas env vars da Vercel (produção):

```
ASAAS_SPLIT_ENABLED=true
```

- [ ] **Step 3: Commit**

```bash
git add app/admin/parceiros/actions.ts
git commit -m "feat(admin): auto-create/disable ASAAS subconta on listing approve/reject"
```

---

## Task 7: Verificação end-to-end

- [ ] **Step 1: Testar fluxo de aprovação em sandbox**

1. Criar parceiro de teste via `/parceiros/cadastro` (completar todos os passos incluindo dados fiscais)
2. No painel admin `/admin/parceiros`, aprovar o anúncio
3. Verificar no Supabase: `select asaas_wallet_id, asaas_account_id from partners where id = '[id]'`
4. Ambas as colunas devem estar preenchidas
5. Verificar no painel ASAAS sandbox que a subconta foi criada

- [ ] **Step 2: Testar fluxo de rejeição**

1. Rejeitar o mesmo anúncio aprovado no passo anterior
2. Verificar no Supabase: `asaas_wallet_id` e `asaas_account_id` voltaram para `null`
3. Verificar no painel ASAAS sandbox que a subconta está INACTIVE

- [ ] **Step 3: Testar idempotência**

1. Aprovar novamente o mesmo parceiro (que foi rejeitado e não tem mais walletId)
2. Uma nova subconta deve ser criada com novos IDs

- [ ] **Step 4: Testar checkout com split ativo**

1. Injetar carrinho com `partnerWalletId: '<walletId do parceiro aprovado>'` e `commissionPct: 70`
2. Completar checkout PIX
3. Verificar no ASAAS sandbox que o pagamento tem split configurado

- [ ] **Step 5: Commit final e push**

```bash
git add -A
git commit -m "chore: verify asaas subconta e2e — split enabled"
git push
```

---

## Self-Review

**1. Cobertura do spec:**
- ✅ Dados fiscais coletados no cadastro (Task 5)
- ✅ Subconta criada apenas na aprovação (Task 6 — `approveListing`)
- ✅ Criada apenas uma vez (guard `if (!partner.asaas_wallet_id)`)
- ✅ Desativada na rejeição e IDs zerados (Task 6 — `rejectListing`)
- ✅ Se reativado, nova subconta criada (IDs eram null, guard passa e cria novamente)
- ✅ Split automático no checkout via `ASAAS_SPLIT_ENABLED` (Task 6 — env var)

**2. Sem placeholders:** Nenhum TBD ou "implementar depois" — todo código está presente.

**3. Consistência de tipos:** `AsaasSubcontaRequest` definido em Task 2, usado em Task 3 e Task 6. `asaas_account_id` adicionado na migration (Task 1), nos tipos (Task 2), salvo nas actions (Task 6). ✅
