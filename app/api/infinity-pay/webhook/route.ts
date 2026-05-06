import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()

    // HMAC verification
    const webhookSecret = process.env.INFINITY_PAY_WEBHOOK_SECRET
    if (webhookSecret) {
      const signature = req.headers.get('x-infinity-signature') || ''
      const expected = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex')
      if (signature !== expected) {
        console.warn('Infinity Pay webhook: invalid signature')
        return NextResponse.json({ ok: false }, { status: 200 })
      }
    } else {
      console.warn('INFINITY_PAY_WEBHOOK_SECRET not set — skipping HMAC check (dev mode)')
    }

    const body = JSON.parse(rawBody)
    const { reference: paymentId, status } = body

    if (!paymentId) {
      return NextResponse.json({ ok: true })
    }

    if (status === 'paid') {
      const supabase = await createAdminClient()
      const now = new Date().toISOString()

      // Update payment
      const { data: paymentData, error: payErr } = await supabase
        .from('acalanto_payments')
        .update({ status: 'paid', paid_at: now, raw_webhook: body })
        .eq('id', paymentId)
        .select('booking_id')
        .single()

      if (payErr) {
        console.error('Webhook: error updating payment', payErr)
        return NextResponse.json({ ok: true })
      }

      // Update booking
      if (paymentData?.booking_id) {
        await supabase
          .from('acalanto_bookings')
          .update({ status: 'confirmed', paid_at: now })
          .eq('id', paymentData.booking_id)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ ok: true }, { status: 200 })
  }
}
