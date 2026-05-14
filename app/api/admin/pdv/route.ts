import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'
import {
  createOrFindCustomer,
  createCharge,
  getPixQrCode,
} from '@/lib/asaas/client'
import { getAdminUser } from '@/lib/admin-auth'
import { BOAT_PHOTOGRAPHER_ADDON_CENTS } from '@/lib/constants'
import { getEnabledVerticals, type Vertical } from '@/lib/pdv/role-permissions'

export const dynamic = 'force-dynamic'

const PdvSchema = z.object({
  boat_id: z.string().uuid(),
  tour_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  adults: z.number().int().min(1).max(50),
  children: z.number().int().min(0).max(50).default(0),
  photographer_addon: z.boolean().default(false),
  customer_name: z.string().min(2),
  customer_email: z.string().email(),
  customer_phone: z.string().optional().nullable(),
  customer_cpf: z.string().optional().nullable(),
  billing_type: z.enum(['PIX', 'CREDIT_CARD']),
  credit_card: z.object({
    holderName: z.string(),
    number: z.string(),
    expiryMonth: z.string(),
    expiryYear: z.string(),
    ccv: z.string(),
  }).optional(),
  credit_card_holder: z.object({
    name: z.string(),
    email: z.string(),
    cpfCnpj: z.string(),
    postalCode: z.string(),
    addressNumber: z.string(),
    phone: z.string(),
  }).optional(),
  vertical: z.enum(['passeio', 'fotografia', 'servico', 'hospedagem']).optional(),
})

function onlyDigits(s: string | null | undefined): string {
  return (s ?? '').replace(/\D+/g, '')
}

export async function POST(req: Request) {
  const adminUser = await getAdminUser()
  if (!adminUser || !['super_admin', 'pdv', 'tripulacao', 'fotografo'].includes(adminUser.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parsed = PdvSchema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const {
    boat_id, tour_date, adults, children, photographer_addon,
    customer_name, customer_email, customer_phone, customer_cpf,
    billing_type, credit_card, credit_card_holder, vertical,
  } = parsed.data

  // Validate vertical permission before querying database (fail fast)
  if (vertical) {
    const enabled = await getEnabledVerticals(adminUser.role)
    if (!enabled.some(e => e.vertical === vertical)) {
      return NextResponse.json(
        { error: `Role ${adminUser.role} não pode vender ${vertical}` },
        { status: 403 }
      )
    }
  }

  const supabase = await createAdminClient()

  const { data: boat, error: boatError } = await supabase
    .from('boats')
    .select('id, name, price_adult, price_child, commission_pct, partner_id')
    .eq('id', boat_id)
    .maybeSingle()

  if (boatError || !boat) {
    return NextResponse.json({ error: 'Barco não encontrado' }, { status: 404 })
  }

  const totalCents =
    adults * (boat.price_adult ?? 11000) +
    children * (boat.price_child ?? Math.round((boat.price_adult ?? 11000) / 2)) +
    (photographer_addon ? BOAT_PHOTOGRAPHER_ADDON_CENTS : 0)
  const totalValue = totalCents / 100
  // boats.commission_pct = % that goes to the partner.
  // bookings.commission_rate = % that Acalanto retains. Convert: 100 - partnerPct.
  const partnerPct = boat.commission_pct ?? 70
  const commissionRate = Math.max(0, Math.min(100, 100 - partnerPct))

  const cpf = onlyDigits(customer_cpf) || '00000000000'

  let asaasCustomerId: string | null = null
  let chargeId: string | null = null
  let paymentUrl: string | null = null
  let pixQrCode: string | null = null
  let pixCopyPaste: string | null = null
  let asaasError: string | null = null

  try {
    asaasCustomerId = await createOrFindCustomer({
      name: customer_name,
      email: customer_email,
      cpfCnpj: cpf,
      phone: onlyDigits(customer_phone) || undefined,
    })

    const charge = await createCharge({
      customer: asaasCustomerId,
      billingType: billing_type,
      value: totalValue,
      dueDate: tour_date,
      description: `PDV — ${adults}A${children > 0 ? ` ${children}C` : ''} — ${tour_date}`,
      externalReference: `pdv_${Date.now()}`,
      ...(billing_type === 'CREDIT_CARD' && credit_card && credit_card_holder
        ? { creditCard: credit_card, creditCardHolderInfo: credit_card_holder }
        : {}),
    })

    chargeId = charge.id
    paymentUrl = charge.invoiceUrl ?? null

    if (billing_type === 'PIX') {
      const qr = await getPixQrCode(charge.id)
      pixQrCode = qr ? `data:image/png;base64,${qr.encodedImage}` : null
      pixCopyPaste = qr?.payload ?? null
    }
  } catch (e) {
    asaasError = e instanceof Error ? e.message : String(e)
    console.error('[pdv] asaas error:', asaasError)
  }

  const isCashLike = !chargeId
  const { data: newBooking, error: insertError } = await supabase
    .from('bookings')
    .insert({
      boat_id,
      tour_date,
      adults,
      children,
      total_cents: totalCents,
      customer_name,
      customer_email,
      customer_phone: customer_phone ?? null,
      status: isCashLike ? 'confirmed' : 'pending',
      payment_status: isCashLike ? 'confirmed' : 'pending',
      payment_method: billing_type,
      vertical: 'passeio',
      commission_rate: commissionRate,
      asaas_payment_id: chargeId,
      asaas_customer_id: asaasCustomerId,
      payment_url: paymentUrl,
      pix_qr_code: pixQrCode,
      pix_copy_paste: pixCopyPaste,
      photographer_package_id: photographer_addon ? 'addon' : null,
      notes: `PDV — vendido por ${adminUser.email ?? adminUser.id}${asaasError ? ` (ASAAS off: ${asaasError.slice(0, 80)})` : ''}`,
      paid_at: isCashLike ? new Date().toISOString() : null,
    })
    .select('id')
    .single()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({
    bookingId: newBooking.id,
    totalCents,
    billingType: billing_type,
    paymentUrl,
    pixQrCode,
    pixCopyPaste,
    asaasChargeId: chargeId,
    boatPartnerId: boat.partner_id,
    asaasError,
  })
}
