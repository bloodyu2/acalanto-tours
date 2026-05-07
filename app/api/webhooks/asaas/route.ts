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

  const { error } = await supabase
    .from('bookings')
    .update(update)
    .eq('asaas_payment_id', payload.payment.id)

  if (error) {
    console.error('[webhook/asaas] DB update error:', error)
    // Return 200 so ASAAS does not retry — issue will be investigated from logs
  }

  return NextResponse.json({ received: true })
}
