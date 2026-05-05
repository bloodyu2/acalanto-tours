# Acalanto Tours — Phase 2: Marketplace Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Transformar o site WhatsApp-first de Phase 1 em um marketplace real — parceiros cadastram passeios, turistas reservam e pagam online, gestão de vagas em tempo real.

**Architecture:** Adicionar ao Next.js 16 existente: checkout Stripe (AbacatePay como alternativa BR), portal de parceiros com auth separado, sistema de slots/disponibilidade, reviews verificados pós-compra, dashboard de analytics.

**Tech Stack:** Phase 1 stack + Stripe (ou AbacatePay) + Supabase Realtime + Edge Functions para webhooks de pagamento.

**Pré-requisito:** Reunião com Gustavo (qua 07/05) para decidir gateway — AbacatePay (Pix nativo BR) vs Stripe (cartão internacional).

---

## Task 1: Schema de disponibilidade e slots

**Files:**
- Create: `supabase/migrations/003_availability.sql`

- [ ] **Step 1: Criar tabelas de disponibilidade**

```sql
-- Slots por data + embarcação
CREATE TABLE slots (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  boat_id     uuid NOT NULL REFERENCES boats(id),
  date        date NOT NULL,
  capacity    int NOT NULL DEFAULT 40,
  booked      int NOT NULL DEFAULT 0,
  blocked     boolean NOT NULL DEFAULT false,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(boat_id, date)
);

-- Reservas com status de pagamento
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS slot_id uuid REFERENCES slots(id),
  ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending'
    CHECK (payment_status IN ('pending','paid','cancelled','refunded')),
  ADD COLUMN IF NOT EXISTS payment_provider text,
  ADD COLUMN IF NOT EXISTS payment_id text,
  ADD COLUMN IF NOT EXISTS total_cents int;

-- RLS
ALTER TABLE slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "slots public read" ON slots FOR SELECT USING (true);
CREATE POLICY "slots admin write" ON slots FOR ALL USING (is_admin());
```

- [ ] **Step 2: Função de disponibilidade**

```sql
CREATE OR REPLACE FUNCTION get_available_slots(
  p_boat_id uuid,
  p_from date,
  p_to date
)
RETURNS TABLE(date date, available int)
LANGUAGE sql STABLE AS $$
  SELECT
    s.date,
    GREATEST(0, s.capacity - s.booked) as available
  FROM slots s
  WHERE s.boat_id = p_boat_id
    AND s.date BETWEEN p_from AND p_to
    AND s.blocked = false
  ORDER BY s.date;
$$;
```

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/003_availability.sql
git commit -m "feat(db): slots e disponibilidade por data"
```

---

## Task 2: Portal de Parceiros — Auth + Dashboard

**Files:**
- Create: `app/parceiros/` (route group separado do admin)
- Create: `app/parceiros/login/page.tsx`
- Create: `app/parceiros/dashboard/page.tsx`
- Create: `app/parceiros/layout.tsx`

- [ ] **Step 1: Layout do portal de parceiro**

```typescript
// app/parceiros/layout.tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'

export default function ParceiroLayout({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createBrowserClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session && pathname !== '/parceiros/login') {
        router.replace('/parceiros/login')
      } else {
        setReady(true)
      }
    })
  }, [supabase, router, pathname])

  if (!ready) return null
  return <>{children}</>
}
```

- [ ] **Step 2: Página de login do parceiro**

Reutilizar estrutura do `/admin/login/page.tsx` com branding diferente ("Portal do Parceiro").

- [ ] **Step 3: Dashboard do parceiro**

Mostrar:
- Reservas do parceiro (filtrado por `partner_id`)
- Calendário de disponibilidade dos seus barcos
- Receita do período (total pago)
- Botão "Bloquear data"

- [ ] **Step 4: Commit**

```bash
git add app/parceiros/
git commit -m "feat: portal de parceiros com auth e dashboard"
```

---

## Task 3: Integração de Pagamento — AbacatePay (Pix) ou Stripe

**Decisão necessária na reunião de quarta:** AbacatePay vs Stripe.

### Opção A — AbacatePay (recomendado para BR)
- Pix instantâneo
- Taxa menor que cartão
- SDK: `npm install abacatepay-nodejs-sdk`
- Webhook: `/api/webhooks/abacatepay`

### Opção B — Stripe
- Cartão de crédito nacional e internacional
- SDK: `npm install stripe`
- Webhook: `/api/webhooks/stripe`

**Files (independente da escolha):**
- Create: `app/api/checkout/route.ts` — cria sessão de pagamento
- Create: `app/api/webhooks/[provider]/route.ts` — recebe confirmação
- Create: `app/checkout/page.tsx` — página de checkout
- Create: `app/checkout/sucesso/page.tsx` — confirmação pós-pagamento

- [ ] **Step 1: API de checkout**

```typescript
// app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { boat_id, date, adults, children, name, phone } = await req.json()

  // 1. Verificar slot disponível
  const supabase = await createClient()
  const { data: slot } = await supabase
    .from('slots')
    .select('id, capacity, booked')
    .eq('boat_id', boat_id)
    .eq('date', date)
    .single()

  const total_pax = adults + children
  if (!slot || (slot.capacity - slot.booked) < total_pax) {
    return NextResponse.json({ error: 'Sem vagas disponíveis nesta data.' }, { status: 409 })
  }

  // 2. Criar reserva com status pending
  const { data: booking } = await supabase
    .from('bookings')
    .insert({ boat_id, slot_id: slot.id, adult_count: adults, child_count: children, name, phone, payment_status: 'pending' })
    .select()
    .single()

  // 3. Criar sessão de pagamento (AbacatePay ou Stripe — trocar aqui)
  // const session = await createPaymentSession({ booking, total_cents })

  return NextResponse.json({ booking_id: booking.id /*, payment_url: session.url */ })
}
```

- [ ] **Step 2: Webhook de confirmação de pagamento**

```typescript
// app/api/webhooks/[provider]/route.ts
// Quando pagamento confirmado:
// - UPDATE bookings SET payment_status = 'paid' WHERE payment_id = ...
// - UPDATE slots SET booked = booked + adult_count + child_count
// - Enviar confirmação por WhatsApp/email
```

- [ ] **Step 3: Commit**

```bash
git add app/api/checkout/ app/api/webhooks/ app/checkout/
git commit -m "feat: checkout flow + webhook de pagamento"
```

---

## Task 4: Reviews verificados pós-compra

**Files:**
- Create: `app/api/reviews/route.ts`
- Modify: `app/escunas/[slug]/page.tsx` — exibir reviews verificados
- Create: `components/reviews/ReviewCard.tsx`
- Create: `components/reviews/ReviewForm.tsx`

**Regra:** Só pode deixar review quem tem `booking.payment_status = 'paid'` para aquele barco.

- [ ] **Step 1: Tabela reviews com verificação**

```sql
-- Na migration 003 ou nova 004
ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS booking_id uuid REFERENCES bookings(id),
  ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false;

-- Trigger: marca verified = true se booking existe e está pago
CREATE OR REPLACE FUNCTION verify_review()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.booking_id IS NOT NULL THEN
    SELECT payment_status = 'paid' INTO NEW.verified
    FROM bookings WHERE id = NEW.booking_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER reviews_verify_on_insert
  BEFORE INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION verify_review();
```

- [ ] **Step 2: ReviewCard e ReviewForm componentes**

ReviewCard: avatar inicial, nome, data, estrelas (1–5), texto, badge "✓ Compra verificada" se `verified = true`.

ReviewForm: aparece na página da escuna se usuário tem booking pago para aquele barco.

- [ ] **Step 3: Commit**

```bash
git add app/api/reviews/ components/reviews/
git commit -m "feat: reviews verificados pós-compra"
```

---

## Task 5: Calendário de disponibilidade no BookingWidget

**Files:**
- Modify: `components/booking/BookingWidget.tsx` — buscar vagas reais

- [ ] **Step 1: Buscar disponibilidade real**

```typescript
// Dentro do BookingWidget (client component)
const [availability, setAvailability] = useState<Record<string, number>>({})

useEffect(() => {
  if (!boat.id) return
  fetch(`/api/availability?boat_id=${boat.id}&from=${startOfMonth}&to=${endOfNextMonth}`)
    .then(r => r.json())
    .then(setAvailability)
}, [boat.id])

// No date picker: desabilitar datas com available === 0
// Mostrar indicador visual de vagas: verde > 10, amarelo 1-10, vermelho 0
```

- [ ] **Step 2: API de disponibilidade**

```typescript
// app/api/availability/route.ts
// Chama get_available_slots(boat_id, from, to) do Supabase
// Retorna { [date]: available_seats }
```

- [ ] **Step 3: Commit**

```bash
git commit -m "feat: disponibilidade real no BookingWidget"
```

---

## Task 6: Admin — Gestão de slots e bloqueios de data

**Files:**
- Create: `app/admin/disponibilidade/page.tsx`
- Modify: `app/admin/layout.tsx` — adicionar nav item

- [ ] **Step 1: Página de disponibilidade no admin**

- Calendário por embarcação
- Clicar numa data: ver vagas, editar capacidade, bloquear/desbloquear
- Bulk: "Bloquear todos os domingos de junho"
- Gerar slots automáticos para o próximo mês

---

## Task 7: Email de confirmação (Edge Function)

**Files:**
- Create: `supabase/functions/send-booking-confirmation/index.ts`

- [ ] **Step 1: Edge Function com Resend**

```typescript
// Disparada pelo webhook de pagamento
// Envia email para turista com:
// - Nome do barco, data, horário de saída
// - Local de embarque (cais de Paraty + mapa)
// - O que levar
// - Contato de emergência (WhatsApp da empresa)
```

---

## Dependências e Bloqueadores

| Item | Bloqueador | Resolve quando |
|------|-----------|----------------|
| Gateway de pagamento | Decisão AbacatePay vs Stripe | Reunião qua 07/05 |
| WhatsApp número real | Confirmar com Gustavo | Reunião seg 05/05 |
| Portal de parceiros | Quais dados parceiros precisam ver | Reunião seg 05/05 |
| Fotos profissionais | Gustavo providenciar | A definir |
| Domínio acalantotours.com.br | Registrar / transferir DNS | Antes da entrega |

---

## Ordem de implementação recomendada

```
Task 1 (slots) → Task 5 (calendar widget) → Task 3 (checkout) → Task 2 (portal parceiro)
     ↓
Task 4 (reviews) → Task 6 (admin calendar) → Task 7 (email)
```

Tasks 1 e 5 primeiro: sem disponibilidade real o checkout não faz sentido.
Tasks 3 precisa da decisão de gateway (reunião qua).
Tasks 4, 6, 7 podem ser paralelizadas depois do checkout funcionar.
