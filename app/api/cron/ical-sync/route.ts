import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()

  // Get all listings with active iCal import sources
  const { data: sources } = await supabase
    .from('ical_sources')
    .select('listing_id')
    .eq('direction', 'import')
    .eq('active', true)

  if (!sources || sources.length === 0) {
    return NextResponse.json({ synced: 0 })
  }

  const listingIds = [...new Set(sources.map((s: { listing_id: string }) => s.listing_id))]
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://acalantoturismo.com.br'
  let total = 0

  for (const id of listingIds) {
    try {
      const res = await fetch(`${baseUrl}/api/ical/sync/${id}`, {
        method: 'POST',
        headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
      })
      if (res.ok) {
        const json = await res.json() as { synced?: number }
        total += json.synced ?? 0
      }
    } catch {
      // continue
    }
  }

  return NextResponse.json({ synced: total, listings: listingIds.length })
}
