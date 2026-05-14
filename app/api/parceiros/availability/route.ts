import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('partner_id')
    .eq('auth_user_id', user.id)
    .single()
  if (!profile?.partner_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { listingId, date, status } = body as { listingId: string; date: string; status: 'available' | 'blocked' }

  if (!listingId || !date || !status) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // Verify the listing belongs to this partner
  const { data: listing } = await supabase
    .from('partner_listings')
    .select('id')
    .eq('id', listingId)
    .eq('partner_id', profile.partner_id)
    .single()
  if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await supabase
    .from('accommodation_availability')
    .upsert({
      listing_id: listingId,
      date,
      status,
      source: 'manual',
    }, { onConflict: 'listing_id,date' })

  return NextResponse.json({ ok: true })
}
