# Acalanto Tours — Bloco 2 Implementation Plan (Marketplace de Parceiros)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete partner marketplace: DB schema migration, partner onboarding wizard (4 steps), hospedagem marketplace public pages, claim flow, "Seja Parceiro" landing redesign, admin approval queue, and expanded partner dashboard.

**Architecture:** New Supabase tables (`partner_listings`, plus columns on `partners`), new Next.js App Router pages under `/parceiros/cadastro/*`, `/hotelaria/*`, expanded `/admin/parceiros`, expanded `/conta/parceiro`. Supabase Auth drives partner identity. All new pages are Server Components where possible; form pages are `'use client'`.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS v4, Supabase (`hnsbstmzbidfehvycptl`), inline CSS design system, Supabase Auth

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `supabase/migrations/004_partner_marketplace.sql` | Create | Add columns to `partners`, create `partner_listings` table |
| `app/seja-parceiro/page.tsx` | Replace | Informational landing with 5 sections + CTA to `/parceiros/cadastro` |
| `app/parceiros/cadastro/page.tsx` | Create | Step 1: email + password + business name |
| `app/parceiros/cadastro/tipo/page.tsx` | Create | Step 2: choose type (4 cards) |
| `app/parceiros/cadastro/anuncio/page.tsx` | Create | Step 3: dynamic form by type |
| `app/parceiros/cadastro/aguardando/page.tsx` | Create | Step 4: waiting confirmation |
| `app/parceiros/[slug]/page.tsx` | Create | Public partner profile page |
| `app/hotelaria/page.tsx` | Replace | Marketplace grid with filters |
| `app/hotelaria/[slug]/page.tsx` | Create | Individual accommodation page |
| `app/admin/parceiros/page.tsx` | Modify | Add approval queue tabs |
| `app/conta/parceiro/page.tsx` | Modify | Fix partner lookup; add status/listing UI |
| `app/conta/parceiro/anuncios/page.tsx` | Create | Partner's own listing CRUD |
| `lib/partner-listings.ts` | Create | Shared server-side helpers for listings queries |

---

## Task 1: Database migration

**Files:**
- Create: `supabase/migrations/004_partner_marketplace.sql`

- [ ] **Step 1: Write migration**

Create `supabase/migrations/004_partner_marketplace.sql`:

```sql
-- ============================================================
-- 004_partner_marketplace.sql
-- Adds marketplace columns to partners + creates partner_listings
-- ============================================================

-- Auth user binding (allows partner to log in and own their record)
ALTER TABLE partners ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Approval workflow
-- Default 'approved' preserves existing rows; new onboarding sets 'pending' in code
ALTER TABLE partners ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'approved'
  CONSTRAINT partners_status_check CHECK (status IN ('pending','approved','rejected'));

ALTER TABLE partners ADD COLUMN IF NOT EXISTS rejection_reason text;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS submitted_at timestamptz;

-- Claim flow
ALTER TABLE partners ADD COLUMN IF NOT EXISTS claimed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Unique index for auth_user_id lookups
CREATE UNIQUE INDEX IF NOT EXISTS partners_auth_user_id_idx ON partners(auth_user_id) WHERE auth_user_id IS NOT NULL;

-- ============================================================
-- partner_listings: one partner can have multiple listings
-- ============================================================
CREATE TABLE IF NOT EXISTS partner_listings (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id   uuid REFERENCES partners(id) ON DELETE CASCADE NOT NULL,
  type         text NOT NULL CHECK (type IN ('hospedagem','fotografia','jeep','guia')),
  title        text NOT NULL,
  slug         text NOT NULL UNIQUE,
  description  text,
  price_label  text,
  cover_image  text,
  gallery      text[] DEFAULT '{}',
  metadata     jsonb DEFAULT '{}',
  status       text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  rejection_reason text,
  active       boolean DEFAULT true,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS partner_listings_updated_at ON partner_listings;
CREATE TRIGGER partner_listings_updated_at
  BEFORE UPDATE ON partner_listings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS
ALTER TABLE partner_listings ENABLE ROW LEVEL SECURITY;

-- Public can read approved active listings
CREATE POLICY "public_read_approved_listings"
  ON partner_listings FOR SELECT
  USING (status = 'approved' AND active = true);

-- Partner can read/update their own listings
CREATE POLICY "partner_own_listings_select"
  ON partner_listings FOR SELECT
  USING (
    partner_id IN (
      SELECT id FROM partners WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "partner_own_listings_insert"
  ON partner_listings FOR INSERT
  WITH CHECK (
    partner_id IN (
      SELECT id FROM partners WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "partner_own_listings_update"
  ON partner_listings FOR UPDATE
  USING (
    partner_id IN (
      SELECT id FROM partners WHERE auth_user_id = auth.uid()
    )
  );

-- Admin full access
CREATE POLICY "admin_all_listings"
  ON partner_listings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.auth_user_id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- RLS for partners table updates (admin can update status)
DROP POLICY IF EXISTS "admin_all_partners" ON partners;
CREATE POLICY "admin_all_partners"
  ON partners FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.auth_user_id = auth.uid()
        AND profiles.role = 'admin'
    )
  );
```

- [ ] **Step 2: Apply migration via Supabase MCP**

```
mcp__b851e17c-f234-4c2b-ab54-0d9230400bf7__apply_migration({
  project_id: "hnsbstmzbidfehvycptl",
  name: "004_partner_marketplace",
  query: <contents above>
})
```

- [ ] **Step 3: Commit migration**

```bash
git add supabase/migrations/004_partner_marketplace.sql
git commit -m "feat(db): add partner auth/status columns + create partner_listings table"
```

---

## Task 2: Seja Parceiro — redesign as informational landing

**Files:**
- Replace: `app/seja-parceiro/page.tsx`

- [ ] **Step 1: Replace the current contact form with a landing page**

Rewrite `app/seja-parceiro/page.tsx` completely:

```tsx
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Seja Parceiro — Acalanto Tours',
  description: 'Junte-se ao marketplace da Acalanto Tours: fotógrafos, hospedagens, jeep/transfer e guias. Aprovação em 24h, página própria com SEO e suporte WhatsApp.',
}

const partnerTypes = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
        <circle cx="12" cy="13" r="4"/>
      </svg>
    ),
    title: 'Fotógrafo',
    desc: 'Ofereça pacotes de fotografia profissional a bordo das escunas e em terra. Seus clientes saem de Paraty com fotos inesquecíveis.',
    gains: ['Pacotes listados no marketplace', 'Reservas diretas pela plataforma', 'Link UTM para comissão rastreável'],
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    title: 'Hospedagem',
    desc: 'Pousadas, hotéis e Airbnbs próximos ao pier. Apareça na página de hospedagem e receba contatos diretos de turistas.',
    gains: ['Galeria com fotos do seu espaço', 'Página própria com SEO', 'Contato via WhatsApp direto'],
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="2"/>
        <path d="M16 8h4l3 3v5h-7V8z"/>
        <circle cx="5.5" cy="18.5" r="2.5"/>
        <circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
    title: 'Jeep / Transfer',
    desc: 'Serviços de transfer e passeios de jeep pelos arredores de Paraty. Alcance turistas que precisam chegar ou explorar a região.',
    gains: ['Roteiros listados na plataforma', 'Solicitações diretas de clientes', 'Visibilidade para turistas nacionais e internacionais'],
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87"/>
        <path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
    title: 'Guia de Turismo',
    desc: 'Conduza experiências culturais, gastronômicas e históricas em Paraty. Conecte-se com viajantes que querem mais do que um passeio comum.',
    gains: ['Bio e foto de perfil no marketplace', 'Agenda de experiências', 'Reservas e repasses pela plataforma'],
  },
]

const steps = [
  { n: '1', label: 'Cadastro', desc: 'Crie sua conta com e-mail e senha' },
  { n: '2', label: 'Tipo', desc: 'Escolha: fotógrafo, hospedagem, jeep ou guia' },
  { n: '3', label: 'Anúncio', desc: 'Preencha seu perfil com fotos, preço e descrição' },
  { n: '4', label: 'Aprovação', desc: 'Análise em até 24h e publicação automática' },
]

const guarantees = [
  { icon: '⚡', label: 'Aprovação em 24h', desc: 'Nossa equipe analisa cada cadastro com agilidade.' },
  { icon: '💬', label: 'Suporte WhatsApp', desc: 'Tire dúvidas diretamente com nossa equipe.' },
  { icon: '🔍', label: 'Página própria com SEO', desc: 'Seu negócio encontrado no Google por turistas.' },
  { icon: '📊', label: 'Link UTM próprio', desc: 'Rastreie os clientes que chegaram pela Acalanto.' },
]

export default function SejaParceiroPage() {
  return (
    <main style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-primary)' }}>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(160deg, #111111 0%, #1a1a2e 55%, #2d0f20 100%)',
        padding: 'clamp(5rem, 12vw, 8rem) 1.5rem clamp(4rem, 8vw, 6rem)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '640px', margin: '0 auto' }}>
          <span style={{
            display: 'inline-block', background: 'rgba(146,23,77,0.3)', color: 'rgba(255,255,255,0.85)',
            fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase',
            padding: '0.3rem 0.85rem', borderRadius: '999px', marginBottom: '1.5rem',
            fontFamily: 'var(--font-mono)',
          }}>
            Marketplace de Parceiros
          </span>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', color: 'white', marginBottom: '1.25rem', lineHeight: 1.1 }}>
            Faça parte da Acalanto
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 'clamp(1rem, 2vw, 1.125rem)', lineHeight: 1.7, marginBottom: '2.5rem' }}>
            Conecte seu negócio a turistas de todo o Brasil. Fotógrafos, hospedagens, jeep/transfer e guias: todos têm espaço na plataforma.
          </p>
          <Link href="/parceiros/cadastro" className="btn-primary" style={{ fontSize: '1rem', padding: '1rem 2.25rem' }}>
            Cadastrar meu negócio
          </Link>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '60px' }}>
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Como funciona */}
      <section style={{ padding: 'clamp(4rem, 8vw, 6rem) 1.5rem', background: 'white' }}>
        <div className="container" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.75rem, 3.5vw, 2.25rem)', marginBottom: '0.75rem' }}>Como funciona</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.65 }}>4 passos simples para seu negócio estar no ar.</p>
        </div>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          {steps.map(({ n, label, desc }) => (
            <div key={n} style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
              <div style={{
                width: '3rem', height: '3rem', background: 'linear-gradient(135deg, var(--ocean-mid), var(--sunset))',
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'white', fontSize: '1rem',
              }}>{n}</div>
              <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.125rem', marginBottom: '0.5rem' }}>{label}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tipos de parceiro */}
      <section style={{ padding: 'clamp(4rem, 8vw, 6rem) 1.5rem', background: 'var(--sand)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.75rem, 3.5vw, 2.25rem)', marginBottom: '0.75rem' }}>Tipos de parceiro</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.65 }}>Cada tipo de negócio tem seu próprio perfil, benefícios e visibilidade.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {partnerTypes.map(({ icon, title, desc, gains }) => (
              <div key={title} style={{ background: 'white', borderRadius: '16px', padding: '1.75rem', border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--ocean-mid)', marginBottom: '1rem' }}>{icon}</div>
                <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.125rem', marginBottom: '0.625rem' }}>{title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.65, marginBottom: '1rem' }}>{desc}</p>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {gains.map(g => (
                    <li key={g} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ocean-mid)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}>
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      {g}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comissionamento */}
      <section style={{ padding: 'clamp(4rem, 8vw, 5rem) 1.5rem', background: 'white' }}>
        <div className="container" style={{ maxWidth: '640px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.75rem, 3.5vw, 2.25rem)', marginBottom: '0.75rem' }}>Comissionamento</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
            Nossa estrutura de comissão é transparente e alinhada com o crescimento do seu negócio. Entre em contato para conhecer as condições completas.
          </p>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5524999627968'}?text=Olá, tenho interesse em ser parceiro da Acalanto Tours. Gostaria de saber as condições de comissionamento.`}
            className="btn-outline"
            target="_blank"
            rel="noreferrer"
            style={{ display: 'inline-flex' }}
          >
            Falar pelo WhatsApp
          </a>
        </div>
      </section>

      {/* Garantias */}
      <section style={{ padding: 'clamp(4rem, 8vw, 6rem) 1.5rem', background: 'var(--sand)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.75rem, 3.5vw, 2.25rem)', marginBottom: '0.75rem' }}>Garantias da plataforma</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
            {guarantees.map(({ icon, label, desc }) => (
              <div key={label} style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', border: '1px solid var(--border)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{icon}</div>
                <h3 style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.5rem' }}>{label}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section style={{ padding: 'clamp(4rem, 8vw, 6rem) 1.5rem', background: 'linear-gradient(160deg, #111111 0%, #1a1a2e 55%, #2d0f20 100%)', textAlign: 'center' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: 'white', marginBottom: '1rem' }}>
            Pronto para começar?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: '2rem' }}>
            Cadastro gratuito, aprovação em 24h e seu negócio no ar para turistas de todo o Brasil.
          </p>
          <Link href="/parceiros/cadastro" className="btn-white" style={{ fontSize: '1rem', padding: '1rem 2.25rem' }}>
            Cadastrar meu negócio
          </Link>
        </div>
      </section>

    </main>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/seja-parceiro/page.tsx
git commit -m "feat(seja-parceiro): redesign as informational landing with CTA to /parceiros/cadastro"
```

---

## Task 3: Partner onboarding wizard

**Files:**
- Create: `app/parceiros/cadastro/page.tsx`
- Create: `app/parceiros/cadastro/tipo/page.tsx`
- Create: `app/parceiros/cadastro/anuncio/page.tsx`
- Create: `app/parceiros/cadastro/aguardando/page.tsx`

- [ ] **Step 1: Create the wizard step indicator component (shared)**

Create `app/parceiros/cadastro/_components/WizardSteps.tsx`:

```tsx
export function WizardSteps({ current }: { current: 1 | 2 | 3 | 4 }) {
  const steps = ['Conta', 'Tipo', 'Anúncio', 'Pronto']
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: '2.5rem' }}>
      {steps.map((label, i) => {
        const n = i + 1
        const done = n < current
        const active = n === current
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', flex: n < steps.length ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '3rem' }}>
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
              <span style={{ fontSize: '0.65rem', color: active ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: active ? 600 : 400, marginTop: '0.25rem', whiteSpace: 'nowrap' }}>
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

- [ ] **Step 2: Create Step 1 — account creation**

Create `app/parceiros/cadastro/page.tsx`:

```tsx
'use client'

import { useState, type FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { WizardSteps } from './_components/WizardSteps'

export default function CadastroStep1Page() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const claimSlug = searchParams.get('claim')

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()

    // Sign up
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password: senha,
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (!authData.user) {
      setError('Erro ao criar conta. Tente novamente.')
      setLoading(false)
      return
    }

    // Create profile with partner role
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        auth_user_id: authData.user.id,
        role: 'partner',
      }, { onConflict: 'auth_user_id' })

    if (profileError) {
      setError('Erro ao criar perfil. Tente novamente.')
      setLoading(false)
      return
    }

    // Create partner record
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .insert({
        name: nome,
        auth_user_id: authData.user.id,
        status: 'pending',
        submitted_at: new Date().toISOString(),
        active: false,
      })
      .select('id')
      .single()

    if (partnerError || !partner) {
      setError('Erro ao registrar parceiro. Tente novamente.')
      setLoading(false)
      return
    }

    // Store partner_id in sessionStorage for next steps
    sessionStorage.setItem('onboarding_partner_id', partner.id)
    if (claimSlug) sessionStorage.setItem('onboarding_claim_slug', claimSlug)

    router.push('/parceiros/cadastro/tipo')
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--sand)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 1.5rem 2rem' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/" style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', textDecoration: 'none' }}>
            Acalanto Tours
          </Link>
        </div>

        <div style={{ background: 'white', borderRadius: '20px', padding: '2.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
          <WizardSteps current={1} />

          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Crie sua conta</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            Comece com e-mail, senha e o nome do seu negócio.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            <div>
              <label className="form-label">Nome do negócio *</label>
              <input
                type="text"
                value={nome}
                onChange={e => setNome(e.target.value)}
                required
                placeholder="Ex: Pousada do Cais, João Fotografia"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">E-mail *</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Senha *</label>
              <input
                type="password"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                required
                minLength={8}
                placeholder="Mínimo 8 caracteres"
                className="form-input"
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
              disabled={loading}
              style={{ padding: '1rem', fontSize: '1rem', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Criando conta...' : 'Continuar'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1.5rem' }}>
            Já tem conta?{' '}
            <Link href="/conta/login" style={{ color: 'var(--ocean-mid)', fontWeight: 600, textDecoration: 'none' }}>
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Create Step 2 — choose type**

Create `app/parceiros/cadastro/tipo/page.tsx`:

```tsx
'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { WizardSteps } from '../_components/WizardSteps'

const types = [
  {
    value: 'fotografia',
    label: 'Fotógrafo',
    desc: 'Fotografia profissional de passeios e retratos em Paraty',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
        <circle cx="12" cy="13" r="4"/>
      </svg>
    ),
  },
  {
    value: 'hospedagem',
    label: 'Hospedagem',
    desc: 'Pousada, hotel ou Airbnb próximo ao pier de Paraty',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    value: 'jeep',
    label: 'Jeep / Transfer',
    desc: 'Transfer aeroporto/rodoviária e passeios de jeep pela região',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="2"/>
        <path d="M16 8h4l3 3v5h-7V8z"/>
        <circle cx="5.5" cy="18.5" r="2.5"/>
        <circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
  },
  {
    value: 'guia',
    label: 'Guia de Turismo',
    desc: 'Experiências culturais, gastronômicas e históricas em Paraty',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87"/>
        <path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
  },
]

export default function CadastroTipoPage() {
  const router = useRouter()

  function choose(value: string) {
    sessionStorage.setItem('onboarding_type', value)
    router.push('/parceiros/cadastro/anuncio')
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--sand)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 1.5rem 2rem' }}>
      <div style={{ width: '100%', maxWidth: '560px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/" style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', textDecoration: 'none' }}>
            Acalanto Tours
          </Link>
        </div>

        <div style={{ background: 'white', borderRadius: '20px', padding: '2.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
          <WizardSteps current={2} />
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Qual é o seu tipo de negócio?</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            Isso define o formulário do seu anúncio.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {types.map(({ value, label, desc, icon }) => (
              <button
                key={value}
                onClick={() => choose(value)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  background: 'var(--sand)', border: '1.5px solid var(--border)',
                  borderRadius: '14px', padding: '1.125rem 1.25rem',
                  cursor: 'pointer', textAlign: 'left', width: '100%',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--ocean-mid)'
                  ;(e.currentTarget as HTMLButtonElement).style.background = '#fff'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'
                  ;(e.currentTarget as HTMLButtonElement).style.background = 'var(--sand)'
                }}
              >
                <div style={{ color: 'var(--ocean-mid)', flexShrink: 0 }}>{icon}</div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{label}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', lineHeight: 1.5 }}>{desc}</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ marginLeft: 'auto', flexShrink: 0 }}>
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 4: Create Step 3 — listing form (dynamic by type)**

Create `app/parceiros/cadastro/anuncio/page.tsx`:

```tsx
'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { WizardSteps } from '../_components/WizardSteps'

type ListingType = 'fotografia' | 'hospedagem' | 'jeep' | 'guia'

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60)
    + '-' + Math.random().toString(36).slice(2, 7)
}

export default function CadastroAnuncioPage() {
  const router = useRouter()
  const [type, setType] = useState<ListingType | null>(null)
  const [partnerId, setPartnerId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priceLabel, setPriceLabel] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [instagram, setInstagram] = useState('')

  // Type-specific
  const [especialidade, setEspecialidade] = useState('')
  const [hotelType, setHotelType] = useState('pousada')
  const [maxGuests, setMaxGuests] = useState('')
  const [amenities, setAmenities] = useState<string[]>([])
  const [servicoTipo, setServicoTipo] = useState('')
  const [capacidade, setCapacidade] = useState('')
  const [lingua, setLingua] = useState('')

  useEffect(() => {
    const t = sessionStorage.getItem('onboarding_type') as ListingType | null
    const pid = sessionStorage.getItem('onboarding_partner_id')
    if (!t || !pid) { router.push('/parceiros/cadastro'); return }
    setType(t)
    setPartnerId(pid)
  }, [router])

  const amenityOptions = ['Piscina', 'Estacionamento', 'Café da manhã', 'Wi-Fi', 'Ar-condicionado', 'Pet-friendly', 'Academia', 'Churrasqueira']

  function toggleAmenity(a: string) {
    setAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!type || !partnerId) return
    setLoading(true)
    setError('')

    const supabase = createClient()

    const metadata: Record<string, unknown> = { whatsapp }
    if (type === 'fotografia') { metadata.especialidade = especialidade; metadata.instagram = instagram }
    if (type === 'hospedagem') { metadata.hotel_type = hotelType; metadata.max_guests = maxGuests; metadata.amenities = amenities }
    if (type === 'jeep') { metadata.servico_tipo = servicoTipo; metadata.capacidade = capacidade }
    if (type === 'guia') { metadata.lingua = lingua; metadata.instagram = instagram }

    const { error: listingError } = await supabase
      .from('partner_listings')
      .insert({
        partner_id: partnerId,
        type,
        title,
        slug: slugify(title),
        description,
        price_label: priceLabel,
        metadata,
        status: 'pending',
      })

    if (listingError) {
      setError('Erro ao salvar anúncio. Tente novamente.')
      setLoading(false)
      return
    }

    router.push('/parceiros/cadastro/aguardando')
  }

  if (!type) return null

  const inputStyle: React.CSSProperties = { width: '100%', padding: '0.8125rem 1rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.9375rem', fontFamily: 'inherit', outline: 'none', background: 'white', boxSizing: 'border-box' }
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }

  const typeLabels: Record<ListingType, string> = {
    fotografia: 'Fotógrafo',
    hospedagem: 'Hospedagem',
    jeep: 'Jeep / Transfer',
    guia: 'Guia de Turismo',
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--sand)', padding: '5rem 1.5rem 2rem' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/" style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', textDecoration: 'none' }}>
            Acalanto Tours
          </Link>
        </div>

        <div style={{ background: 'white', borderRadius: '20px', padding: '2.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
          <WizardSteps current={3} />
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Seu anúncio</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
            Tipo: <strong>{typeLabels[type]}</strong>
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            <div>
              <label style={labelStyle}>Título do anúncio *</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Ex: Pousada Canto do Mar" style={inputStyle}/>
            </div>
            <div>
              <label style={labelStyle}>Descrição *</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={4} placeholder="Conte sobre seu serviço, localização, diferenciais..." style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}/>
            </div>
            <div>
              <label style={labelStyle}>Preço (texto livre)</label>
              <input type="text" value={priceLabel} onChange={e => setPriceLabel(e.target.value)} placeholder="Ex: A partir de R$150/pessoa" style={inputStyle}/>
            </div>
            <div>
              <label style={labelStyle}>WhatsApp para contato</label>
              <input type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="5524999999999" style={inputStyle}/>
            </div>

            {/* Type-specific fields */}
            {type === 'fotografia' && (
              <>
                <div>
                  <label style={labelStyle}>Especialidade</label>
                  <input type="text" value={especialidade} onChange={e => setEspecialidade(e.target.value)} placeholder="Ex: Fotografia de viagem, retratos, casamentos" style={inputStyle}/>
                </div>
                <div>
                  <label style={labelStyle}>Instagram</label>
                  <input type="text" value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="@seuperfil" style={inputStyle}/>
                </div>
              </>
            )}

            {type === 'hospedagem' && (
              <>
                <div>
                  <label style={labelStyle}>Tipo de hospedagem</label>
                  <select value={hotelType} onChange={e => setHotelType(e.target.value)} style={inputStyle}>
                    <option value="pousada">Pousada</option>
                    <option value="hotel">Hotel</option>
                    <option value="airbnb">Airbnb / Temporada</option>
                    <option value="hostel">Hostel</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Máximo de hóspedes</label>
                  <input type="number" value={maxGuests} onChange={e => setMaxGuests(e.target.value)} min="1" placeholder="Ex: 10" style={inputStyle}/>
                </div>
                <div>
                  <label style={labelStyle}>Comodidades</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.375rem' }}>
                    {amenityOptions.map(a => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => toggleAmenity(a)}
                        style={{
                          padding: '0.35rem 0.875rem', borderRadius: '999px', fontSize: '0.8rem', cursor: 'pointer',
                          background: amenities.includes(a) ? 'var(--ocean-mid)' : 'var(--sand)',
                          color: amenities.includes(a) ? 'white' : 'var(--text-primary)',
                          border: `1.5px solid ${amenities.includes(a) ? 'var(--ocean-mid)' : 'var(--border)'}`,
                          fontWeight: 500,
                        }}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {type === 'jeep' && (
              <>
                <div>
                  <label style={labelStyle}>Tipo de serviço</label>
                  <input type="text" value={servicoTipo} onChange={e => setServicoTipo(e.target.value)} placeholder="Ex: Transfer aeroporto, Jeep Tour Cunha" style={inputStyle}/>
                </div>
                <div>
                  <label style={labelStyle}>Capacidade do veículo</label>
                  <input type="text" value={capacidade} onChange={e => setCapacidade(e.target.value)} placeholder="Ex: 6 passageiros" style={inputStyle}/>
                </div>
              </>
            )}

            {type === 'guia' && (
              <>
                <div>
                  <label style={labelStyle}>Idiomas</label>
                  <input type="text" value={lingua} onChange={e => setLingua(e.target.value)} placeholder="Ex: Português, Inglês, Espanhol" style={inputStyle}/>
                </div>
                <div>
                  <label style={labelStyle}>Instagram</label>
                  <input type="text" value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="@seuperfil" style={inputStyle}/>
                </div>
              </>
            )}

            {error && (
              <p style={{ color: '#dc2626', fontSize: '0.875rem', background: '#fef2f2', padding: '0.75rem 1rem', borderRadius: '8px', margin: 0 }}>{error}</p>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ padding: '1rem', fontSize: '1rem', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Enviando...' : 'Enviar para análise'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 5: Create Step 4 — waiting page**

Create `app/parceiros/cadastro/aguardando/page.tsx`:

```tsx
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Cadastro enviado — Acalanto Tours',
}

export default function CadastroAguardandoPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--sand)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 1.5rem' }}>
      <div style={{ maxWidth: '480px', textAlign: 'center' }}>
        <div style={{
          width: '5rem', height: '5rem',
          background: 'linear-gradient(135deg, var(--ocean-mid), var(--sunset))',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 2rem',
          boxShadow: '0 8px 30px rgba(146,23,77,0.3)',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>

        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
          Cadastro enviado!
        </h1>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '1rem', marginBottom: '2.5rem' }}>
          Nossa equipe vai analisar seu cadastro e responder em até <strong style={{ color: 'var(--text-primary)' }}>24 horas</strong>. Quando aprovado, seu anúncio aparecerá automaticamente na plataforma.
        </p>

        <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem', border: '1px solid var(--border)', textAlign: 'left' }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>O que acontece agora:</p>
          {[
            'Nossa equipe recebe e analisa seu cadastro',
            'Aprovado em até 24h (dias úteis)',
            'Seu anúncio vai ao ar automaticamente',
            'Você recebe uma confirmação via e-mail',
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.625rem' }}>
              <span style={{
                width: '1.25rem', height: '1.25rem', flexShrink: 0,
                background: 'var(--ocean-mid)', color: 'white', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.65rem', fontWeight: 700, marginTop: '1px',
              }}>{i + 1}</span>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>{step}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/conta/parceiro" className="btn-primary" style={{ padding: '0.875rem 1.75rem' }}>
            Ir para meu painel
          </Link>
          <Link href="/" className="btn-outline" style={{ padding: '0.875rem 1.75rem' }}>
            Voltar ao início
          </Link>
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 6: Commit all onboarding pages**

```bash
git add app/parceiros/
git commit -m "feat(onboarding): add partner registration wizard (4 steps: account, type, listing, waiting)"
```

---

## Task 4: Hotelaria marketplace

**Files:**
- Replace: `app/hotelaria/page.tsx`
- Create: `app/hotelaria/[slug]/page.tsx`
- Create: `lib/partner-listings.ts`

- [ ] **Step 1: Create shared server helpers**

Create `lib/partner-listings.ts`:

```ts
import { createClient } from '@/lib/supabase/server'

export type Listing = {
  id: string
  partner_id: string
  type: string
  title: string
  slug: string
  description: string | null
  price_label: string | null
  cover_image: string | null
  gallery: string[]
  metadata: Record<string, unknown>
  status: string
  active: boolean
  created_at: string
}

export async function getApprovedListings(type: string): Promise<Listing[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('partner_listings')
    .select('*')
    .eq('type', type)
    .eq('status', 'approved')
    .eq('active', true)
    .order('created_at', { ascending: false })
  return (data as Listing[]) ?? []
}

export async function getListingBySlug(slug: string): Promise<Listing | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('partner_listings')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'approved')
    .eq('active', true)
    .single()
  return (data as Listing) ?? null
}

export async function getPartnerByAuthUser(authUserId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('partners')
    .select('id, name, type, status, rejection_reason, auth_user_id')
    .eq('auth_user_id', authUserId)
    .single()
  return data
}
```

- [ ] **Step 2: Replace hotelaria listing page**

Replace `app/hotelaria/page.tsx` with:

```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { getApprovedListings } from '@/lib/partner-listings'

export const metadata: Metadata = {
  title: 'Hospedagem em Paraty — Acalanto Tours',
  description: 'Pousadas, hotéis e Airbnbs parceiros próximos ao pier de Paraty. Curadoria Acalanto Tours.',
}

export const dynamic = 'force-dynamic'

function AmenityTag({ label }: { label: string }) {
  return (
    <span style={{
      display: 'inline-block', background: '#f0fdf4', color: '#166534',
      border: '1px solid #bbf7d0', borderRadius: '999px',
      fontSize: '0.7rem', fontWeight: 600, padding: '0.15rem 0.6rem',
    }}>{label}</span>
  )
}

export default async function HotelariaPage() {
  const listings = await getApprovedListings('hospedagem')

  return (
    <main style={{ padding: '5rem 0 4rem' }}>
      {/* Header */}
      <section style={{ background: 'var(--sand)', padding: '3rem 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <span style={{
            display: 'inline-block', fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: '#059669',
            border: '1px solid #059669', padding: '0.3rem 0.85rem',
            borderRadius: '999px', marginBottom: '0.875rem',
          }}>
            Hospedagem em Paraty
          </span>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', marginBottom: '0.75rem' }}>
            Pousadas e hotéis parceiros
          </h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: '520px', lineHeight: 1.65 }}>
            Hospedagens selecionadas próximas ao pier de Paraty. Todos os parceiros são verificados pela equipe Acalanto.
          </p>
        </div>
      </section>

      <div className="container" style={{ paddingTop: '3rem' }}>
        {listings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 1.5rem' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Nenhuma hospedagem disponível no momento. Seja o primeiro parceiro!
            </p>
            <Link href="/parceiros/cadastro?onboarding_type=hospedagem" className="btn-primary">
              Cadastrar minha hospedagem
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {listings.map(listing => {
              const meta = listing.metadata as Record<string, unknown>
              const amenities = (meta.amenities as string[] | undefined) ?? []
              const hotelType = (meta.hotel_type as string | undefined) ?? 'hospedagem'

              return (
                <Link
                  key={listing.id}
                  href={`/hotelaria/${listing.slug}`}
                  className="card"
                  style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
                >
                  {/* Cover image */}
                  <div style={{
                    height: '200px', background: 'linear-gradient(135deg, #059669, #0d9488)',
                    position: 'relative', overflow: 'hidden',
                  }}>
                    {listing.cover_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={listing.cover_image} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,0.5)' }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                        </svg>
                      </div>
                    )}
                    <span style={{
                      position: 'absolute', top: '0.875rem', left: '0.875rem',
                      background: '#059669', color: 'white',
                      fontSize: '0.7rem', fontWeight: 700, padding: '0.25rem 0.625rem',
                      borderRadius: '999px', textTransform: 'capitalize',
                    }}>
                      {hotelType}
                    </span>
                  </div>

                  <div style={{ padding: '1.25rem' }}>
                    <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.125rem', marginBottom: '0.375rem' }}>
                      {listing.title}
                    </h3>
                    {listing.price_label && (
                      <p style={{ color: '#059669', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                        {listing.price_label}
                      </p>
                    )}
                    {listing.description && (
                      <p className="line-clamp-2" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '0.875rem' }}>
                        {listing.description}
                      </p>
                    )}
                    {amenities.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                        {amenities.slice(0, 3).map(a => <AmenityTag key={a} label={a}/>)}
                        {amenities.length > 3 && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                            +{amenities.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* CTA for new partners */}
        <div style={{ textAlign: 'center', marginTop: '4rem', padding: '2.5rem', background: 'var(--sand)', borderRadius: '20px', border: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9375rem' }}>
            Tem uma hospedagem em Paraty? Junte-se à plataforma.
          </p>
          <Link href="/parceiros/cadastro" className="btn-outline">
            Cadastrar minha hospedagem
          </Link>
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Create hotelaria [slug] page**

Create `app/hotelaria/[slug]/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getListingBySlug } from '@/lib/partner-listings'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const listing = await getListingBySlug(slug)
  if (!listing) return { title: 'Hospedagem não encontrada' }
  return {
    title: `${listing.title} — Hospedagem em Paraty · Acalanto Tours`,
    description: listing.description ?? `Hospedagem em Paraty: ${listing.title}.`,
  }
}

export default async function HotelariaSlugPage({ params }: Props) {
  const { slug } = await params
  const listing = await getListingBySlug(slug)
  if (!listing) notFound()

  const meta = listing.metadata as Record<string, unknown>
  const whatsapp = meta.whatsapp as string | undefined
  const amenities = (meta.amenities as string[] | undefined) ?? []
  const hotelType = (meta.hotel_type as string | undefined) ?? 'hospedagem'
  const maxGuests = meta.max_guests as string | undefined

  const waUrl = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=Olá! Vi sua hospedagem na Acalanto Tours: ${listing.title}. Gostaria de mais informações.`
    : null

  return (
    <main style={{ padding: '5rem 0 4rem' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <Link href="/hotelaria" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.375rem', marginBottom: '2rem' }}>
          ← Todas as hospedagens
        </Link>

        {/* Cover */}
        <div style={{ height: '320px', background: 'linear-gradient(135deg, #059669, #0d9488)', borderRadius: '20px', marginBottom: '2rem', overflow: 'hidden', position: 'relative' }}>
          {listing.cover_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={listing.cover_image} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,0.5)' }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '3rem', alignItems: 'start' }}>
          <div>
            <span style={{ display: 'inline-block', background: '#059669', color: 'white', fontSize: '0.7rem', fontWeight: 700, padding: '0.25rem 0.75rem', borderRadius: '999px', marginBottom: '0.875rem', textTransform: 'capitalize' }}>
              {hotelType}
            </span>
            <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', marginBottom: '0.75rem' }}>
              {listing.title}
            </h1>
            {listing.price_label && (
              <p style={{ color: '#059669', fontWeight: 700, fontSize: '1.125rem', marginBottom: '1.5rem' }}>
                {listing.price_label}
              </p>
            )}
            {listing.description && (
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.75, fontSize: '0.9375rem', marginBottom: '2rem' }}>
                {listing.description}
              </p>
            )}
            {amenities.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.875rem' }}>Comodidades</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {amenities.map(a => (
                    <span key={a} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.4rem 0.75rem', fontSize: '0.875rem', color: '#166534', fontWeight: 500 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {maxGuests && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Capacidade: até {maxGuests} hóspedes
              </p>
            )}
          </div>

          {/* CTA sidebar */}
          <div style={{ position: 'sticky', top: '90px', background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
            <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.125rem', marginBottom: '0.5rem' }}>Falar com o responsável</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Verifique disponibilidade e faça sua reserva diretamente.
            </p>
            {waUrl ? (
              <a href={waUrl} target="_blank" rel="noreferrer" className="btn-primary" style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', padding: '0.9375rem', background: '#059669', boxShadow: '0 4px 20px rgba(5,150,105,0.3)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Contato via WhatsApp
              </a>
            ) : (
              <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5524999627968'}?text=Olá, tenho interesse na hospedagem ${listing.title} que vi na Acalanto Tours.`} target="_blank" rel="noreferrer" className="btn-primary" style={{ display: 'flex', justifyContent: 'center', padding: '0.9375rem', background: '#059669', boxShadow: '0 4px 20px rgba(5,150,105,0.3)' }}>
                Entrar em contato
              </a>
            )}
          </div>
        </div>

        {/* Claim flow CTA */}
        <div style={{ marginTop: '3rem', padding: '1.25rem 1.5rem', background: 'var(--sand)', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Este é o seu negócio?</p>
          <Link href={`/parceiros/cadastro?claim=${listing.slug}`} style={{ color: 'var(--ocean-mid)', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none' }}>
            Reivindique esta página →
          </Link>
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/partner-listings.ts app/hotelaria/
git commit -m "feat(hotelaria): full marketplace grid + individual listing page + claim flow CTA"
```

---

## Task 5: Expand admin panel for listing approvals

**Files:**
- Read then modify: `app/admin/parceiros/page.tsx`

- [ ] **Step 1: Read the current admin parceiros page**

```bash
cat app/admin/parceiros/page.tsx
```

- [ ] **Step 2: Add pending listings tab**

The admin parceiros page shows partner registrations. Expand it to also show `partner_listings` pending approval.

Add a second section to the page (after the existing partners table), using a server-side query:

```tsx
// Add to the server component after existing partner query:
const { data: pendingListings } = await supabase
  .from('partner_listings')
  .select('id, title, type, slug, status, created_at, partner_id')
  .eq('status', 'pending')
  .order('created_at', { ascending: true })
```

And render a separate card section:

```tsx
{/* Pending listings */}
<div style={{ background: 'white', borderRadius: '1.25rem', overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', marginTop: '2rem' }}>
  <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
    <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.125rem', color: 'var(--ocean-deep)', margin: 0 }}>
      Anúncios aguardando aprovação ({pendingListings?.length ?? 0})
    </h2>
  </div>
  {(!pendingListings || pendingListings.length === 0) ? (
    <div style={{ padding: '2rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum anúncio pendente.</div>
  ) : (
    pendingListings.map(l => (
      <div key={l.id} style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 600, marginBottom: '0.2rem' }}>{l.title}</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Tipo: {l.type} · Slug: {l.slug}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.625rem' }}>
          <form action={`/api/admin/listings/${l.id}/approve`} method="POST">
            <button type="submit" style={{ background: '#059669', color: 'white', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
              Aprovar
            </button>
          </form>
          <form action={`/api/admin/listings/${l.id}/reject`} method="POST">
            <button type="submit" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
              Rejeitar
            </button>
          </form>
        </div>
      </div>
    ))
  )}
</div>
```

- [ ] **Step 3: Create approve/reject API routes**

Create `app/api/admin/listings/[id]/approve/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('auth_user_id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { error } = await supabase
    .from('partner_listings')
    .update({ status: 'approved' })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.redirect(new URL('/admin/parceiros', _req.url))
}
```

Create `app/api/admin/listings/[id]/reject/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('auth_user_id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { error } = await supabase
    .from('partner_listings')
    .update({ status: 'rejected' })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.redirect(new URL('/admin/parceiros', req.url))
}
```

- [ ] **Step 4: Commit**

```bash
git add app/admin/parceiros/page.tsx app/api/admin/listings/
git commit -m "feat(admin): add listing approval queue with approve/reject API routes"
```

---

## Task 6: Fix partner dashboard + add listing CRUD

**Files:**
- Modify: `app/conta/parceiro/page.tsx`
- Create: `app/conta/parceiro/anuncios/page.tsx`

- [ ] **Step 1: Fix partner lookup in dashboard**

In `app/conta/parceiro/page.tsx`, the current query uses `.eq('active', true)` without filtering by auth_user_id. Replace the partner query (around line 28):

Replace:
```tsx
const { data: partner } = await supabase
  .from('partners')
  .select('id, name, type')
  .eq('active', true)
  .maybeSingle()
```

With:
```tsx
const { data: partner } = await supabase
  .from('partners')
  .select('id, name, type, status, rejection_reason')
  .eq('auth_user_id', user.id)
  .maybeSingle()
```

Also add a status banner below the header in the returned JSX, after the stats section:

```tsx
{/* Status banner */}
{partner?.status === 'pending' && (
  <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
    <span style={{ fontSize: '1.25rem' }}>⏳</span>
    <div>
      <p style={{ fontWeight: 600, marginBottom: '0.2rem' }}>Cadastro em análise</p>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Nossa equipe analisa em até 24h. Você receberá uma confirmação em breve.</p>
    </div>
  </div>
)}
{partner?.status === 'rejected' && (
  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
    <p style={{ fontWeight: 600, color: '#dc2626', marginBottom: '0.35rem' }}>Cadastro não aprovado</p>
    {partner.rejection_reason && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{partner.rejection_reason}</p>}
    <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
      <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5524999627968'}`} style={{ color: 'var(--ocean-mid)', fontWeight: 600 }} target="_blank" rel="noreferrer">
        Fale conosco pelo WhatsApp
      </a>
    </p>
  </div>
)}
```

Add a link to the anuncios page below the existing content:

```tsx
{partner?.status === 'approved' && (
  <Link
    href="/conta/parceiro/anuncios"
    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--ocean-mid)', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem', marginTop: '1rem' }}
  >
    Gerenciar meus anúncios →
  </Link>
)}
```

- [ ] **Step 2: Create anuncios CRUD page**

Create `app/conta/parceiro/anuncios/page.tsx`:

```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getPartnerByAuthUser } from '@/lib/partner-listings'

export const dynamic = 'force-dynamic'

export default async function ParceiroAnunciosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/conta/login')

  const partner = await getPartnerByAuthUser(user.id)
  if (!partner) redirect('/conta')

  const { data: listings } = await supabase
    .from('partner_listings')
    .select('*')
    .eq('partner_id', partner.id)
    .order('created_at', { ascending: false })

  const statusColor: Record<string, string> = {
    pending: '#f59e0b',
    approved: '#059669',
    rejected: '#dc2626',
  }
  const statusLabel: Record<string, string> = {
    pending: 'Em análise',
    approved: 'Publicado',
    rejected: 'Rejeitado',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--sand)', padding: '2rem 0' }}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <Link href="/conta/parceiro" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textDecoration: 'none' }}>
              ← Painel do parceiro
            </Link>
            <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.875rem', color: 'var(--ocean-deep)', marginTop: '0.5rem' }}>
              Meus anúncios
            </h1>
          </div>
        </div>

        {(!listings || listings.length === 0) ? (
          <div style={{ background: 'white', borderRadius: '1.25rem', padding: '4rem 2rem', textAlign: 'center', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Você ainda não tem anúncios. Crie o primeiro agora.</p>
            <Link href="/parceiros/cadastro/anuncio" className="btn-primary">
              Criar anúncio
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {(listings as Array<{ id: string; title: string; type: string; status: string; price_label?: string; rejection_reason?: string }>).map(l => (
              <div key={l.id} style={{ background: 'white', borderRadius: '1rem', padding: '1.25rem 1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
                    <p style={{ fontWeight: 700, fontSize: '1rem', margin: 0 }}>{l.title}</p>
                    <span style={{
                      background: `${statusColor[l.status]}18`,
                      color: statusColor[l.status],
                      border: `1px solid ${statusColor[l.status]}44`,
                      borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700,
                      padding: '0.15rem 0.625rem',
                    }}>
                      {statusLabel[l.status] ?? l.status}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
                    {l.type}{l.price_label ? ` · ${l.price_label}` : ''}
                  </p>
                  {l.status === 'rejected' && l.rejection_reason && (
                    <p style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.375rem' }}>Motivo: {l.rejection_reason}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/conta/parceiro/page.tsx app/conta/parceiro/anuncios/page.tsx lib/partner-listings.ts
git commit -m "feat(partner-dashboard): fix partner lookup, add status banner, add anuncios CRUD page"
```

---

## Task 7: Build + push + monitor

- [ ] **Step 1: Run TypeScript check**

```bash
npx tsc --noEmit
```

Fix any type errors before proceeding.

- [ ] **Step 2: Run build**

```bash
npm run build
```

Expected: successful build with no errors.

- [ ] **Step 3: Push**

```bash
git push origin master
```

- [ ] **Step 4: Monitor Vercel deploy**

Spawn background monitoring agent for the acalanto-tours Vercel project. Poll until status = READY. On failure, read build logs and fix.
