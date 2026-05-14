import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'
import { renderBookingReceipt } from '@/lib/pdf/booking-receipt'
import { sendReceipt } from '@/lib/email/send-receipt'
import { buildWhatsappLink } from '@/lib/whatsapp'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminUser = await getAdminUser()
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const sb = await createAdminClient()
  const { data: b } = await sb
    .from('bookings')
    .select('id, customer_name, customer_email, customer_phone, tour_date, total_cents, adults, children, payment_method, paid_at, boats(name)')
    .eq('id', id)
    .maybeSingle()

  if (!b) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const boatName = Array.isArray(b.boats) ? (b.boats[0] as { name: string } | undefined)?.name ?? null : (b.boats as { name: string } | null)?.name ?? null

  const pdf = await renderBookingReceipt({
    id: b.id,
    customerName: b.customer_name ?? 'Cliente',
    customerEmail: b.customer_email ?? '',
    tourDate: b.tour_date,
    boatName,
    adults: b.adults ?? 0,
    children: b.children ?? 0,
    totalCents: b.total_cents,
    paymentMethod: b.payment_method,
    paidAt: b.paid_at,
  })

  // Upload PDF to Supabase storage
  const path = `comprovantes/${id}.pdf`
  const { error: upErr } = await sb.storage.from('images').upload(path, pdf, {
    contentType: 'application/pdf',
    upsert: true,
    cacheControl: '2678400',
  })
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })
  const { data: signed } = await sb.storage.from('images').createSignedUrl(path, 60 * 60 * 24 * 30)
  const pdfUrl = signed?.signedUrl ?? null

  // Email
  if (b.customer_email) {
    try { await sendReceipt({ to: b.customer_email, bookingId: id, pdfBuffer: pdf }) }
    catch (e) { console.error('[notify] email error:', e) }
  }

  // WhatsApp link
  const whatsappLink = buildWhatsappLink({
    phone: b.customer_phone,
    bookingId: id,
    boatName,
    tourDate: b.tour_date,
    adults: b.adults ?? 0,
    children: b.children ?? 0,
    totalCents: b.total_cents,
    pdfUrl: pdfUrl ?? undefined,
  })

  return NextResponse.json({ pdfUrl, whatsappLink })
}
