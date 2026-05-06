import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface Params { params: Promise<{ listingId: string }> }

function parseICalDates(icalText: string): string[] {
  const dates: string[] = []
  const lines = icalText.replace(/\r\n/g, '\n').split('\n')
  let inEvent = false
  let dtstart: string | null = null
  let dtend: string | null = null

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') { inEvent = true; dtstart = null; dtend = null }
    if (!inEvent) continue
    if (line.startsWith('DTSTART') && !dtstart) {
      const val = line.split(':').slice(1).join(':').replace(/\D/g, '').slice(0, 8)
      if (val.length === 8) dtstart = `${val.slice(0,4)}-${val.slice(4,6)}-${val.slice(6,8)}`
    }
    if (line.startsWith('DTEND') && !dtend) {
      const val = line.split(':').slice(1).join(':').replace(/\D/g, '').slice(0, 8)
      if (val.length === 8) dtend = `${val.slice(0,4)}-${val.slice(4,6)}-${val.slice(6,8)}`
    }
    if (line === 'END:VEVENT' && dtstart) {
      // Expand date range to individual nights
      const start = new Date(dtstart)
      const end = dtend ? new Date(dtend) : new Date(dtstart)
      const d = new Date(start)
      while (d < end) {
        dates.push(d.toISOString().split('T')[0])
        d.setDate(d.getDate() + 1)
      }
      if (dtend === null) dates.push(dtstart)
      inEvent = false
    }
  }
  return dates
}

export async function POST(req: NextRequest, { params }: Params) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { listingId } = await params
  const supabase = await createClient()

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
    } catch {
      await supabase
        .from('ical_sources')
        .update({ sync_status: 'error' })
        .eq('id', source.id)
    }
  }

  return NextResponse.json({ synced: totalUpserted })
}
