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
