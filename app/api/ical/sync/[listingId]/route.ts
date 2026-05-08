import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { parseICalDates } from '@/lib/ical/parse'

export const dynamic = 'force-dynamic'

interface Params { params: Promise<{ listingId: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { listingId } = await params
  const supabase = await createAdminClient()

  // Fetch iCal sources for this listing
  const { data: sources } = await supabase
    .from('ical_sources')
    .select('id, url')
    .eq('listing_id', listingId)
    .eq('direction', 'import')
    .eq('active', true)

  if (!sources || sources.length === 0) {
    return NextResponse.json({ synced: 0 })
  }

  let totalUpserted = 0

  for (const source of sources) {
    try {
      const res = await fetch(source.url, { next: { revalidate: 0 } })
      if (!res.ok) continue
      const icalText = await res.text()
      const dates = parseICalDates(icalText)

      if (dates.length === 0) continue

      const rows = dates.map(date => ({
        listing_id: listingId,
        date,
        status: 'blocked' as const,
        source: 'ical' as const,
      }))

      const { error } = await supabase
        .from('accommodation_availability')
        .upsert(rows, { onConflict: 'listing_id,date', ignoreDuplicates: false })

      if (!error) totalUpserted += rows.length

      // Update sync status
      await supabase
        .from('ical_sources')
        .update({ last_synced_at: new Date().toISOString(), sync_status: 'ok' })
        .eq('id', source.id)
    } catch (err) {
      await supabase
        .from('ical_sources')
        .update({ sync_status: 'error', error_message: String(err) })
        .eq('id', source.id)
    }
  }

  return NextResponse.json({ synced: totalUpserted })
}
