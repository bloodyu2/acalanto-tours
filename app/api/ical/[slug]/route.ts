import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface Params { params: Promise<{ slug: string }> }

function formatICalDate(dateStr: string): string {
  // dateStr: "2025-06-15" → "20250615"
  return dateStr.replace(/-/g, '')
}

function escapeICalText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: listing } = await supabase
    .from('partner_listings')
    .select('id, title, slug')
    .eq('slug', slug)
    .eq('category', 'hospedagem')
    .single()

  if (!listing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { data: bookedRows } = await supabase
    .from('accommodation_availability')
    .select('date')
    .eq('listing_id', listing.id)
    .eq('status', 'booked')
    .eq('source', 'acalanto')

  const now = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z'
  const calName = escapeICalText(`${listing.title} — Acalanto Turismo`)
  const prodId = `-//Acalanto Turismo//${listing.slug}//PT`

  const events = (bookedRows ?? []).map((row: { date: string }) => {
    const dateStr = formatICalDate(row.date)
    // Next day for DTEND (all-day event is exclusive end)
    const d = new Date(row.date)
    d.setDate(d.getDate() + 1)
    const nextDateStr = formatICalDate(d.toISOString().split('T')[0])
    return [
      'BEGIN:VEVENT',
      `DTSTART;VALUE=DATE:${dateStr}`,
      `DTEND;VALUE=DATE:${nextDateStr}`,
      `SUMMARY:Reservado — ${escapeICalText(listing.title)}`,
      `UID:acalanto-${listing.id}-${row.date}@acalantoturismo.com.br`,
      `DTSTAMP:${now}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
    ].join('\r\n')
  })

  const ical = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:${prodId}`,
    `X-WR-CALNAME:${calName}`,
    'X-WR-TIMEZONE:America/Sao_Paulo',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n')

  return new NextResponse(ical, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${listing.slug}.ics"`,
      'Cache-Control': 'no-cache, no-store',
    },
  })
}
