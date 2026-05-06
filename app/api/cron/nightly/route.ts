import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createNpsSurveyData } from '@/lib/nps'
import { sendEmail } from '@/lib/resend'
import { npsEmailHtml, npsEmailText } from '@/lib/emails/nps'

export const dynamic = 'force-dynamic'

// Called nightly at 01:00 UTC by Vercel Cron (vercel.json)
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://acalantotours.com.br'

  // Find bookings where tour_date was 2 days ago, status=confirmed, no NPS sent yet
  const twoDaysAgo = new Date()
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
  const targetDate = twoDaysAgo.toISOString().slice(0, 10)

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('id, customer_name, customer_email, adults, children, boats(name)')
    .eq('tour_date', targetDate)
    .eq('status', 'confirmed')
    .not('customer_email', 'is', null)

  if (error) {
    console.error('[cron/nightly] bookings fetch error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  let sent = 0
  let skipped = 0

  for (const booking of (bookings ?? [])) {
    // Check if NPS already sent
    const { data: existing } = await supabase
      .from('nps_surveys')
      .select('id')
      .eq('booking_id', booking.id)
      .maybeSingle()

    if (existing) { skipped++; continue }

    // Create NPS survey record
    const { token, token_expires } = createNpsSurveyData(booking.id)

    const { error: insertErr } = await supabase
      .from('nps_surveys')
      .insert({ booking_id: booking.id, token_expires })

    if (insertErr) { skipped++; continue }

    // Send email
    const surveyUrl = `${siteUrl}/pesquisa?t=${token}&b=${booking.id}`
    const boatName = (booking.boats as { name: string } | null)?.name ?? 'escuna'

    await sendEmail({
      to: booking.customer_email,
      subject: 'Como foi seu passeio? Conta pra gente!',
      html: npsEmailHtml(booking.customer_name ?? 'Cliente', boatName, surveyUrl),
      text: npsEmailText(booking.customer_name ?? 'Cliente', boatName, surveyUrl),
    }).catch(err => console.error('[cron/nightly] send NPS email error:', err))

    sent++
  }

  return NextResponse.json({ ok: true, sent, skipped })
}
