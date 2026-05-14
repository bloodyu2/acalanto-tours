import { describe, it, expect, vi } from 'vitest'

// Hoisted mocks
vi.mock('@/lib/asaas/client', () => ({
  createOrFindCustomer: vi.fn(async () => 'cust_1'),
  createCharge: vi.fn(async () => ({ id: 'ch1', invoiceUrl: 'http://x' })),
  getPixQrCode: vi.fn(async () => ({
    encodedImage: 'iVBORw0KGgoAAAANSUhEUgAA' + 'A'.repeat(1500),
    payload: '00020126580014BR.GOV.BCB.PIX0136...',
  })),
  createCheckout: vi.fn(async () => ({ id: 'co1', url: 'https://checkout.asaas.com/co1', status: 'PENDING' })),
}))

vi.mock('@/lib/asaas/split', () => ({
  buildSplit: vi.fn(() => ([
    { recipientId: '****', percentageValue: 70 },
  ])),
}))

vi.mock('@/lib/admin-auth', () => ({
  getAdminUser: vi.fn(async () => ({ id: 'u', email: 'u@a.com', role: 'super_admin' })),
}))

vi.mock('@/lib/pdv/role-permissions', () => ({
  getEnabledVerticals: vi.fn(async () => [
    { vertical: 'passeio', priority: 100 },
  ]),
}))

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: vi.fn(async () => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(() => Promise.resolve({
            data: {
              id: '550e8400-e29b-41d4-a716-446655440000',
              name: 'Test',
              price_adult: 10000,
              price_child: 5000,
              commission_pct: 70,
              partner_id: null,
              partners: null,
            },
            error: null,
          })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: { id: 'bk1' },
            error: null,
          })),
        })),
      })),
    })),
  })),
}))

import { POST } from '@/app/api/admin/pdv/route'

describe('POST /api/admin/pdv — PIX QR', () => {
  it('returns pixQrCode as valid data URL with substantial base64 payload', async () => {
    const req = new Request('http://test', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        boat_id: '550e8400-e29b-41d4-a716-446655440000',
        tour_date: '2026-06-01',
        adults: 1,
        children: 0,
        photographer_addon: false,
        customer_name: 'Test',
        customer_email: 't@b.com',
        billing_type: 'PIX',
      }),
    })
    const res = await POST(req)
    const body = await res.json()

    // Route returns camelCase
    const qrCode = body.pixQrCode
    const copyPaste = body.pixCopyPaste

    expect(qrCode).toBeTruthy()
    expect(qrCode).toMatch(/^data:image\/png;base64,/)
    // base64 payload >= 1000 chars (a real PNG, not a 1×1 stub)
    expect(qrCode.split(',')[1].length).toBeGreaterThan(1000)
    expect(copyPaste).toMatch(/^00020126/)
  })
})
