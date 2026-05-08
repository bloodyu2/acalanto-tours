import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { parseICalDates } from '@/lib/ical/parse'

export const dynamic = 'force-dynamic'

interface Params { params: Promise<{ listingId: string }> }

export async function POST(_req: NextRequest, { params }: Params) {
  const { listingId } = await params

  // 1. Validate session
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // 2. Verify listing belongs to this partner
  const { data: listing } = await supabase
    .from('partner_listings')
    .select('id, partner_id')
    .eq('id', listingId)
    .single()

  if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: partner } = await supabase
    .from('partners')
    .select('id')
    .eq('id', listing.partner_id)
    .eq('auth_user_id', user.id)
    .single()

  if (!partner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // 3. Run sync with admin client (bypasses RLS for upsert)
  const admin = await createAdminClient()

  const { data: sources } = await admin
    .from('ical_sources')
    .select('id, url, label')
    .eq('listing_id', listingId)
    .eq('direction', 'import')
    .eq('active', true)

  if (!sources || sources.length === 0) {
    return NextResponse.json({ synced: 0, sources: 0 })
  }

  let totalUpserted = 0

  for (const source of sources) {
    try {
      const res = await fetch(source.url, { next: { revalidate: 0 } })
      if (!res.ok) {
        await admin.from('ical_sources')
          .update({ sync_status: 'error', error_message: `HTTP ${res.status}` })
          .eq('id', source.id)
        continue
      }
      const icalText = await res.text()
      const dates = parseICalDates(icalText)
      if (dates.length === 0) continue

      const rows = dates.map(date => ({
        listing_id: listingId,
        date,
        status: 'blocked' as const,
        source: 'ical' as const,
      }))

      const { error } = await admin
        .from('accommodation_availability')
        .upsert(rows, { onConflict: 'listing_id,date', ignoreDuplicates: false })

      if (!error) totalUpserted += rows.length

      await admin.from('ical_sources')
        .update({ last_synced_at: new Date().toISOString(), sync_status: 'ok', error_message: null })
        .eq('id', source.id)
    } catch (err) {
      await admin.from('ical_sources')
        .update({ sync_status: 'error', error_message: String(err) })
        .eq('id', source.id)
    }
  }

  return NextResponse.json({ synced: totalUpserted, sources: sources.length })
}
