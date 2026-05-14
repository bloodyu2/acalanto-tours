// tests/pdv/split-applied.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const { createChargeMock, createOrFindCustomerMock, getPixQrCodeMock } = vi.hoisted(() => ({
  createChargeMock: vi.fn(),
  createOrFindCustomerMock: vi.fn().mockResolvedValue('cust_123'),
  getPixQrCodeMock: vi.fn().mockResolvedValue({ encodedImage: 'AAAA', payload: '0002...' }),
}))

vi.mock('@/lib/asaas/client', () => ({
  createOrFindCustomer: createOrFindCustomerMock,
  createCharge: createChargeMock,
  getPixQrCode: getPixQrCodeMock,
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
})
