// tests/pdv/split-applied.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const { createChargeMock, createOrFindCustomerMock, getPixQrCodeMock, createCheckoutMock } = vi.hoisted(() => ({
  createChargeMock: vi.fn(),
  createOrFindCustomerMock: vi.fn().mockResolvedValue('cust_123'),
  getPixQrCodeMock: vi.fn().mockResolvedValue({ encodedImage: 'AAAA', payload: '0002...' }),
  createCheckoutMock: vi.fn().mockResolvedValue({ id: 'co1', url: 'https://checkout.asaas.com/co1', status: 'PENDING' }),
}))

vi.mock('@/lib/asaas/client', () => ({
  createOrFindCustomer: createOrFindCustomerMock,
  createCharge: createChargeMock,
  getPixQrCode: getPixQrCodeMock,
  createCheckout: createCheckoutMock,
}))

vi.mock('@/lib/admin-auth', () => ({
  getAdminUser: async () => ({ id: 'u1', email: 'u@a.com', role: 'super_admin' }),
}))

vi.mock('@/lib/pdv/role-permissions', () => ({
  getEnabledVerticals: async () => [
    { vertical: 'passeio', priority: 100 },
    { vertical: 'fotografia', priority: 90 },
    { vertical: 'servico', priority: 80 },
    { vertical: 'hospedagem', priority: 70 },
  ],
}))

vi.mock('@/lib/supabase/server', () => {
  const boat = { id: 'b1b1b1b1-0000-0000-0000-000000000001', name: 'Test', price_adult: 10000, price_child: 5000, commission_pct: 70, partner_id: 'p1', partners: { name: 'Partner', asaas_wallet_id: 'wallet_partner' } }
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
        boat_id: 'b1b1b1b1-0000-0000-0000-000000000001', tour_date: '2026-06-01', adults: 2, children: 0,
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

  it('with photographer_addon=true, partner gets fixedValue excluding addon, Balaio gets percentage of total', async () => {
    const req = new Request('http://test', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        boat_id: 'b1b1b1b1-0000-0000-0000-000000000001', tour_date: '2026-06-01', adults: 2, children: 0,
        photographer_addon: true,   // ← addon R$250 (25000 cents)
        customer_name: 'Foo', customer_email: 'foo@b.com',
        billing_type: 'PIX',
      }),
    })
    await POST(req)
    const call = createChargeMock.mock.calls[0][0]
    const split = call.split
    expect(split).toBeDefined()

    // Adults×price_adult = 2 × 10000 = 20000 cents = R$200 boat base.
    // Addon = BOAT_PHOTOGRAPHER_ADDON_CENTS = 25000 cents = R$250.
    // Total to ASAAS = R$450.
    // Partner gets 70% × R$200 = R$140 (fixedValue, NOT percentage).
    // Balaio gets 6% of R$450 total (percentualValue 6).
    const partnerEntry = split.find((s: any) => s.walletId === 'wallet_partner')
    expect(partnerEntry).toBeDefined()
    expect(partnerEntry.fixedValue).toBe(140)
    expect(partnerEntry.percentualValue).toBeUndefined()

    const balaioEntry = split.find((s: any) => s.walletId === '00000000-0000-0000-0000-000000000001')
    expect(balaioEntry).toBeDefined()
    expect(balaioEntry.percentualValue).toBe(6)
  })
})
