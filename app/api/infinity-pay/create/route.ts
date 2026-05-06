import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import type { CartItem } from '@/components/cart/CartProvider'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { items, customerName, customerEmail, customerPhone, utmCampaign } = body as {
      items: CartItem[]
      customerName: string
      customerEmail: string
      customerPhone: string
      utmCampaign?: string | null
    }

    if (!items?.length || !customerName || !customerEmail || !customerPhone) {
      return NextResponse.json({ error: 'Campos obrigatorios ausentes.' }, { status: 400 })
    }

    // Calculate total
    const totalAmountCents = items.reduce((sum, item) => {
      return sum + item.adults * item.priceAdultCents + item.children * item.priceChildCents
    }, 0)

    // Commission rate based on UTM
    const commissionRate = utmCampaign ? 15 : 30

    const supabase = await createAdminClient()

    // Use first item for booking record
    const firstItem = items[0]

    // Insert booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        boat_id: firstItem.boatId ?? null,
        tour_date: firstItem.date || null,
        adults: firstItem.adults,
        children: firstItem.children,
        total_cents: totalAmountCents,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        status: 'pending',
        vertical: firstItem.type,
        utm_campaign: utmCampaign ?? null,
        commission_rate: commissionRate,
      })
      .select('id')
      .single()

    if (bookingError || !booking) {
      console.error('Booking insert error:', bookingError)
      return NextResponse.json({ error: 'Erro ao criar reserva.' }, { status: 500 })
    }

    const bookingId = booking.id

    // Insert payment
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        booking_id: bookingId,
        amount_cents: totalAmountCents,
        status: 'pending',
        commission_rate: commissionRate,
        utm_campaign: utmCampaign ?? null,
      })
      .select('id')
      .single()

    if (paymentError || !payment) {
      console.error('Payment insert error:', paymentError)
      return NextResponse.json({ error: 'Erro ao criar pagamento.' }, { status: 500 })
    }

    const paymentId = payment.id

    // Build Infinity Pay redirect URL
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const payload = {
      amount: totalAmountCents,
      description: `Acalanto Turismo - ${items[0].name}`,
      reference: paymentId,
      customer: { name: customerName, email: customerEmail, phone: customerPhone },
      redirect_url: `${siteUrl}/checkout/sucesso?booking_id=${bookingId}`,
    }

    const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url')
    const infinityPayBase = process.env.NEXT_PUBLIC_INFINITY_PAY_REDIRECT_URL || 'https://checkout.infinitepay.io/pay'
    const redirectUrl = `${infinityPayBase}?data=${encoded}`

    return NextResponse.json({ redirectUrl, bookingId, paymentId })
  } catch (err) {
    console.error('Infinity Pay create error:', err)
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
  }
}
