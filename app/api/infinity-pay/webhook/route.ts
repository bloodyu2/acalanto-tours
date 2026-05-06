import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/resend'
import { confirmationEmailHtml, confirmationEmailText } from '@/lib/emails/confirmation'

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
        .from('payments')
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
        const bookingId = paymentData.booking_id
        await supabase
          .from('bookings')
          .update({ status: 'confirmed', paid_at: now })
          .eq('id', bookingId)

        // Block dates for service/accommodation bookings
        const { data: bookingForDates } = await supabase
          .from('bookings')
          .select('service_id, accommodation_listing_id, tour_date, check_in, check_out')
          .eq('id', bookingId)
          .single()
        if (bookingForDates?.service_id && bookingForDates.tour_date) {
          await supabase.from('service_availability').upsert(
            { service_id: bookingForDates.service_id, date: bookingForDates.tour_date, available: false },
            { onConflict: 'service_id,date' }
          )
        }
        if (bookingForDates?.accommodation_listing_id && bookingForDates.check_in && bookingForDates.check_out) {
          const rows: { listing_id: string; date: string; status: string; source: string }[] = []
          const d = new Date(bookingForDates.check_in)
          const end = new Date(bookingForDates.check_out)
          while (d < end) {
            rows.push({ listing_id: bookingForDates.accommodation_listing_id, date: d.toISOString().split('T')[0], status: 'booked', source: 'acalanto' })
            d.setDate(d.getDate() + 1)
          }
          if (rows.length > 0) {
            await supabase.from('accommodation_availability').upsert(rows, { onConflict: 'listing_id,date' })
          }
        }

        // Fetch booking for confirmation email
        const { data: booking } = await supabase
          .from('bookings')
          .select('customer_name, customer_email, tour_date, adults, children, boats(name), payments(amount_cents)')
          .eq('id', bookingId)
          .single()

        if (booking?.customer_email) {
          const boatName = (booking.boats as { name: string } | null)?.name ?? 'escuna'
          const totalCents = (booking.payments as { amount_cents: number }[] | null)?.[0]?.amount_cents ?? 0
          const tourDateFormatted = booking.tour_date
            ? new Date(booking.tour_date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
            : 'a confirmar'

          await sendEmail({
            to: booking.customer_email,
            subject: 'Reserva confirmada - Acalanto Turismo',
            html: confirmationEmailHtml({
              customerName: booking.customer_name ?? 'Cliente',
              tourDate: tourDateFormatted,
              boatName,
              adults: booking.adults ?? 0,
              children: booking.children ?? 0,
              totalCents,
            }),
            text: confirmationEmailText({
              customerName: booking.customer_name ?? 'Cliente',
              tourDate: tourDateFormatted,
              boatName,
              adults: booking.adults ?? 0,
              children: booking.children ?? 0,
              totalCents,
            }),
          }).catch(err => console.error('[webhook] confirmation email error:', err))
        }
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ ok: true }, { status: 200 })
  }
}
