# Cart Improvements + Copy Fixes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** (1) Add a "Continuar comprando" button to `CartDrawer`. (2) Show Pix / Cartão / Boleto payment method options in the cart footer even without the InfinityPay API connected yet. (3) Fix the "Reserva pelo WhatsApp" item in `app/quem-somos/page.tsx` so it no longer claims "sem formulário longo nem cadastro obrigatório" without clarifying this only applies to customers (not partners).

**Architecture:** All changes are in existing files — no new files, no DB changes.

**Tech Stack:** Next.js 16, inline CSS, React (project convention)

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `components/cart/CartDrawer.tsx` | Modify | "Continuar comprando" + payment method badges |
| `app/quem-somos/page.tsx` | Modify | Fix WhatsApp copy to scope it to customers |

---

### Task 1: Cart — "Continuar comprando" button + payment methods display

**Files:**
- Modify: `components/cart/CartDrawer.tsx`

**Context:** The current `CartDrawer.tsx` footer (when items exist) has: Total row → "Ir para o Checkout" button → small "Pagamento seguro via Pix" text. We need to add (a) a secondary "Continuar comprando" button below the checkout CTA, and (b) a row of payment method icons/labels (Pix, Cartão de crédito, Boleto) above the footer note.

- [ ] **Step 1: Read the current footer block**

Read `components/cart/CartDrawer.tsx` lines 138–165 to confirm the exact current structure before editing.

- [ ] **Step 2: Replace the footer `{items.length > 0 && (...)}` block**

Find this block (lines ~138–161) in `components/cart/CartDrawer.tsx`:

```tsx
{/* Footer */}
{items.length > 0 && (
  <div style={{
    padding: '1.25rem 1.5rem',
    borderTop: '1px solid var(--border)',
    flexShrink: 0,
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
      <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Total</span>
      <span style={{ fontWeight: 700, fontSize: '1.125rem', fontFamily: 'var(--font-playfair)' }}>
        {formatBRL(totalCents)}
      </span>
    </div>
    <button
      className="btn-primary"
      style={{ width: '100%', justifyContent: 'center' }}
      onClick={() => { closeCart(); router.push('/checkout') }}
    >
      Ir para o Checkout
    </button>
    <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
      Pagamento seguro via Pix
    </p>
  </div>
)}
```

Replace with:

```tsx
{/* Footer */}
{items.length > 0 && (
  <div style={{
    padding: '1.25rem 1.5rem',
    borderTop: '1px solid var(--border)',
    flexShrink: 0,
  }}>
    {/* Total */}
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
      <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Total</span>
      <span style={{ fontWeight: 700, fontSize: '1.125rem', fontFamily: 'var(--font-playfair)' }}>
        {formatBRL(totalCents)}
      </span>
    </div>

    {/* Checkout CTA */}
    <button
      className="btn-primary"
      style={{ width: '100%', justifyContent: 'center', marginBottom: '0.625rem' }}
      onClick={() => { closeCart(); router.push('/checkout') }}
    >
      Ir para o Checkout
    </button>

    {/* Continue shopping */}
    <button
      type="button"
      onClick={closeCart}
      style={{
        width: '100%',
        padding: '0.75rem',
        background: 'white',
        border: '1.5px solid var(--border)',
        borderRadius: '0.875rem',
        fontSize: '0.9rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
        cursor: 'pointer',
        marginBottom: '1rem',
      }}
    >
      Continuar comprando
    </button>

    {/* Payment methods */}
    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.875rem', marginBottom: '0.625rem' }}>
      <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '0.625rem', textAlign: 'center' }}>
        Formas de pagamento
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        {/* Pix */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.375rem',
          padding: '0.375rem 0.75rem', borderRadius: '6px',
          background: '#f0fdf4', border: '1px solid #bbf7d0',
          fontSize: '0.75rem', fontWeight: 600, color: '#166534',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.354 2.646a.9.9 0 011.292 0l2.354 2.354 2.354-2.354a.9.9 0 011.292 0l3.708 3.708a.9.9 0 010 1.292L19.646 10 22 12.354a.9.9 0 010 1.292L18.354 17a.9.9 0 01-1.292 0L14.708 14.646 12.354 17a.9.9 0 01-1.292 0L8.708 14.646 6.354 17a.9.9 0 01-1.292 0L1.354 13.646a.9.9 0 010-1.292L3.708 10 1.354 7.646a.9.9 0 010-1.292L5.062 2.646a.9.9 0 011.292 0L8.708 5l2.354-2.354z"/>
          </svg>
          Pix
        </div>
        {/* Cartão de crédito */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.375rem',
          padding: '0.375rem 0.75rem', borderRadius: '6px',
          background: '#eff6ff', border: '1px solid #bfdbfe',
          fontSize: '0.75rem', fontWeight: 600, color: '#1e40af',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2"/>
            <line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
          Cartão
        </div>
        {/* Boleto */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.375rem',
          padding: '0.375rem 0.75rem', borderRadius: '6px',
          background: '#fefce8', border: '1px solid #fef08a',
          fontSize: '0.75rem', fontWeight: 600, color: '#854d0e',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="3" height="18"/><rect x="8" y="3" width="1" height="18"/>
            <rect x="11" y="3" width="3" height="18"/><rect x="16" y="3" width="1" height="18"/>
            <rect x="19" y="3" width="2" height="18"/>
          </svg>
          Boleto
        </div>
      </div>
    </div>

    <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>
      Pagamento 100% seguro via Infinity Pay
    </p>
  </div>
)}
```

- [ ] **Step 3: Commit**

```bash
git add components/cart/CartDrawer.tsx
git commit -m "feat(cart): continuar comprando button + payment method badges"
```

---

### Task 2: Fix "Porque a Acalanto" copy — scope claim to customers only

**Files:**
- Modify: `app/quem-somos/page.tsx`

**Context:** Line 86 in `app/quem-somos/page.tsx` has an item with `desc: 'Sem formulário longo nem cadastro obrigatório. Manda mensagem e a gente resolve.'`. This claim is only true for end customers booking a passeio — partners and businesses do need to register. The copy must be updated to scope it to customers.

- [ ] **Step 1: Update the item description**

In `app/quem-somos/page.tsx`, find the exact string:

```ts
title: 'Reserva pelo WhatsApp', desc: 'Sem formulário longo nem cadastro obrigatório. Manda mensagem e a gente resolve.'
```

Replace `desc` with:

```ts
title: 'Reserva sem burocracia', desc: 'Para os viajantes: sem formulário longo nem cadastro obrigatório. Escolheu o passeio, manda mensagem e a gente resolve.'
```

- [ ] **Step 2: Commit**

```bash
git add app/quem-somos/page.tsx
git commit -m "fix(copy): scope no-signup claim to travelers only in quem-somos"
```

---

## Self-Review

**Spec coverage:**
- "Continuar comprando" button ✅ (Task 1)
- Payment methods display (Pix, Cartão, Boleto) ✅ (Task 1) — shown as badges regardless of API status
- Fix "sem formulário longo" copy ✅ (Task 2)

**Placeholder scan:** No TBDs. All code is complete and production-ready.

**Note on Boleto barcode SVG:** The inline SVG for Boleto is a simplified barcode-like icon using rectangles — it's decorative only and doesn't need to be a real barcode.

**Note on "Continuar comprando":** This simply calls `closeCart()` — no navigation needed. The user is already on the page they came from.
