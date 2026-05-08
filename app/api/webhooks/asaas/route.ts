import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { validateWebhookToken, parseWebhookPayload } from '@/lib/asaas/webhook'

export async function POST(request: NextRequest) {
  if (!validateWebhookToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const payload = parseWebhookPayload(body)
  const supabase = await createAdminClient()

  const statusMap: Record<string, string> = {
    PAYMENT_RECEIVED:  'confirmed',
    PAYMENT_CONFIRMED: 'confirmed',
    PAYMENT_OVERDUE:   'overdue',
    PAYMENT_REFUNDED:  'refunded',
  }

  const newStatus = statusMap[payload.event]
  if (!newStatus) {
    return NextResponse.json({ received: true })
  }

  const update: Record<string, unknown> = { payment_status: newStatus }
  if (newStatus === 'confirmed') {
    update.paid_at = new Date().toISOString()
    update.status  = 'confirmed'
  }

  const { data: booking, error } = await supabase
    .from('bookings')
    .update(update)
    .eq('asaas_payment_id', payload.payment.id)
    .select('id, vertical, accommodation_room_id, tour_date, check_out')
    .single()

  if (error) {
    console.error('[webhook/asaas] DB update error:', error)
    return NextResponse.json({ received: true })
  }

  // Block accommodation dates when payment is confirmed
  if (
    newStatus === 'confirmed' &&
    booking?.vertical === 'hospedagem' &&
    booking.accommodation_room_id &&
    booking.tour_date &&
    booking.check_out
  ) {
    const { data: room } = await supabase
      .from('accommodation_rooms')
      .select('listing_id')
      .eq('id', booking.accommodation_room_id)
      .single()

    if (room) {
      const nights: { listing_id: string; room_id: string; date: string; status: string; source: string }[] = []
      const end = new Date(booking.check_out)
      const current = new Date(booking.tour_date) // tour_date = check_in

      while (current < end) {
        nights.push({
          listing_id: room.listing_id,
          room_id:    booking.accommodation_room_id,
          date:       current.toISOString().split('T')[0],
          status:     'booked',
          source:     'acalanto',
        })
        current.setDate(current.getDate() + 1)
      }

      if (nights.length > 0) {
        const { error: availError } = await supabase
          .from('accommodation_availability')
          .upsert(nights, { onConflict: 'room_id,date', ignoreDuplicates: false })

        if (availError) {
          console.error('[webhook/asaas] availability upsert error:', availError)
        }
      }
    }
  }

  return NextResponse.json({ received: true })
}
