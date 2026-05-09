import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'
import { createOrFindCustomer, createCharge, getPixQrCode } from '@/lib/asaas/client'
import { buildSplit, type CartItemWithPartner } from '@/lib/asaas/split'
import { hashCpf, isValidCpf, cleanCpf } from '@/lib/crypto/cpf'
import type { AsaasBillingType } from '@/lib/asaas/types'
import type { Database } from '@/lib/types/database'
import { sendBookingConfirmation } from '@/lib/email/mailer'

type BookingInsert = Database['public']['Tables']['bookings']['Insert']

const CheckoutSchema = z.object({
  billingType: z.enum(['PIX', 'CREDIT_CARD', 'BOLETO', 'DEBIT_CARD']),
  customer: z.object({
    name:  z.string().min(3).max(120),
    email: z.string().email(),
    phone: z.string().min(10).max(20),
    cpf:   z.string().refine(isValidCpf, { message: 'CPF inválido' }),
  }),
  items: z.array(z.object({
    id:                       z.string(),
    type:                     z.enum(['passeio', 'fotografia', 'servico', 'hospedagem']),
    name:                     z.string(),
    date:                     z.string().optional(),
    adults:                   z.number().int().min(0).default(0),
    children:                 z.number().int().min(0).default(0),
    priceAdultCents:          z.number().int().min(0),
    priceChildCents:          z.number().int().min(0).default(0),
    boatId:                   z.string().optional(),
    photographerPackageId:    z.string().optional(),
    serviceId:                z.string().optional(),
    pricingType:              z.enum(['per_person', 'per_group']).optional(),
    groupSize:                z.number().optional(),
    accommodationListingId:   z.string().optional(),
    accommodationRoomId:      z.string().optional(),
    checkIn:                  z.string().optional(),
    checkOut:                 z.string().optional(),
    nights:                   z.number().optional(),
    guests:                   z.number().optional(),
    pricePerNightCents:       z.number().optional(),
    partnerWalletId:          z.string().optional(),
    commissionPct:            z.number().optional(),
  })).min(1),
})

type CheckoutItem = z.infer<typeof CheckoutSchema>['items'][0]

function calcItemCents(item: CheckoutItem): number {
  if (item.type === 'hospedagem') {
    return (item.pricePerNightCents ?? 0) * (item.nights ?? 1)
  }
  if (item.type === 'servico' && item.pricingType === 'per_group') {
    return item.priceAdultCents
  }
  return item.priceAdultCents * (item.adults ?? 0) + item.priceChildCents * (item.children ?? 0)
}

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = CheckoutSchema.safeParse(body)
  if (!parsed.success) {
    const msgs = parsed.error.issues.map(i => i.message).join(', ')
    return NextResponse.json({ error: msgs || 'Dados inválidos' }, { status: 400 })
  }

  const { billingType, customer, items } = parsed.data
  const customerName  = customer.name
  const customerEmail = customer.email
  const customerPhone = customer.phone
  const cpf           = customer.cpf

  // Server-side price recalculation — never trust client total
  const totalCents = items.reduce((sum, item) => sum + calcItemCents(item), 0)
  const totalBRL   = totalCents / 100

  const supabase = await createAdminClient()

  try {
    // 1. Create or find ASAAS customer (raw CPF only goes here — never to DB)
    const asaasCustomerId = await createOrFindCustomer({
      name:    customerName,
      cpfCnpj: cleanCpf(cpf),
      email:   customerEmail,
      phone:   customerPhone.replace(/\D/g, ''),
    })

    // 2. Due date: today for PIX/card, +3 business days for boleto
    const dueDate = new Date()
    if (billingType === 'BOLETO') dueDate.setDate(dueDate.getDate() + 3)
    const dueDateStr = dueDate.toISOString().split('T')[0]

    // 3. Description from cart item names
    const description = items.map(i => i.name).join(' + ')

    // 3b. Lookup commission_pct server-side — nunca confiar no valor do cliente.
    // commission_pct = % que o PARCEIRO recebe.  Acalanto fica com (100 - commission_pct)%.
    const UUID_RE    = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const primaryItem = items[0]
    const boatId      = primaryItem.boatId && UUID_RE.test(primaryItem.boatId) ? primaryItem.boatId : null

    let commissionPct = 70 // baseline: Acalanto fica com 30%
    if (boatId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: boat } = await (supabase as any)
        .from('boats')
        .select('commission_pct')
        .eq('id', boatId)
        .maybeSingle() as { data: { commission_pct: number } | null; error: unknown }
      if (boat?.commission_pct != null) commissionPct = boat.commission_pct
    } else if (primaryItem.serviceId && UUID_RE.test(primaryItem.serviceId)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: svc } = await (supabase as any)
        .from('services')
        .select('commission_pct')
        .eq('id', primaryItem.serviceId)
        .maybeSingle() as { data: { commission_pct: number } | null; error: unknown }
      if (svc?.commission_pct != null) commissionPct = svc.commission_pct
    } else if (
      primaryItem.type === 'fotografia' &&
      primaryItem.photographerPackageId &&
      UUID_RE.test(primaryItem.photographerPackageId)
    ) {
      // fotografiaPackage → partner → commission_pct
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: pkg } = await (supabase as any)
        .from('photographer_packages')
        .select('partner_id')
        .eq('id', primaryItem.photographerPackageId)
        .maybeSingle() as { data: { partner_id: string } | null; error: unknown }
      if (pkg?.partner_id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: partner } = await (supabase as any)
          .from('partners')
          .select('commission_pct')
          .eq('id', pkg.partner_id)
          .maybeSingle() as { data: { commission_pct: number } | null; error: unknown }
        if (partner?.commission_pct != null) commissionPct = partner.commission_pct
      }
    }

    // 4. Server-side lookup do asaas_wallet_id do parceiro (nunca confiar no cliente)
    // Fotografia: photographerPackageId → photographer_packages.partner_id → partners.asaas_wallet_id
    // Serviço:    serviceId            → services.partner_id             → partners.asaas_wallet_id
    const walletByItem = new Map<number, string>() // index → partnerWalletId

    for (let idx = 0; idx < items.length; idx++) {
      const item = items[idx]
      let partnerId: string | null = null

      if (item.type === 'fotografia' && item.photographerPackageId && UUID_RE.test(item.photographerPackageId)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: pkg } = await (supabase as any)
          .from('photographer_packages')
          .select('partner_id')
          .eq('id', item.photographerPackageId)
          .maybeSingle() as { data: { partner_id: string } | null; error: unknown }
        partnerId = pkg?.partner_id ?? null
      } else if (item.type === 'servico' && item.serviceId && UUID_RE.test(item.serviceId)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: svc } = await (supabase as any)
          .from('services')
          .select('partner_id')
          .eq('id', item.serviceId)
          .maybeSingle() as { data: { partner_id: string | null } | null; error: unknown }
        partnerId = svc?.partner_id ?? null
      }

      if (partnerId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: partner } = await (supabase as any)
          .from('partners')
          .select('asaas_wallet_id')
          .eq('id', partnerId)
          .maybeSingle() as { data: { asaas_wallet_id: string | null } | null; error: unknown }
        if (partner?.asaas_wallet_id) {
          walletByItem.set(idx, partner.asaas_wallet_id)
        }
      }
    }

    // 4b. Build items array with wallet IDs and commission_pct for split
    const itemsWithCommission: CartItemWithPartner[] = items.map((item, idx) => {
      const partnerWalletId = walletByItem.get(idx)
      const base = item as CartItemWithPartner
      if (idx === 0) {
        return { ...base, commissionPct, ...(partnerWalletId ? { partnerWalletId } : {}) }
      }
      return partnerWalletId ? { ...base, partnerWalletId } : base
    })
    const split = buildSplit(itemsWithCommission)

    // 5. Create ASAAS charge
    const charge = await createCharge({
      customer:          asaasCustomerId,
      billingType:       billingType as AsaasBillingType,
      value:             totalBRL,
      dueDate:           dueDateStr,
      description,
      split,
    })

    // 5b. For PIX, fetch QR code separately (not returned in charge creation)
    let pixQrCodeData: { encodedImage: string; payload: string } | null = null
    if (billingType === 'PIX') {
      pixQrCodeData = await getPixQrCode(charge.id)
    }

    // 6. Hash CPF — raw CPF never touches the DB
    const cpfHash = hashCpf(cpf)

    // 7. Determine primary date for the booking row (primaryItem/boatId já definidos acima)
    const tourDate = primaryItem.date ?? primaryItem.checkIn ?? new Date().toISOString().split('T')[0]

    // 8. Insert booking
    const bookingPayload: BookingInsert = {
      boat_id:                  boatId,
      tour_date:                tourDate,
      adults:                   items.reduce((s, i) => s + (i.adults ?? 0), 0),
      children:                 items.reduce((s, i) => s + (i.children ?? 0), 0),
      total_cents:              totalCents,
      customer_name:            customerName,
      customer_email:           customerEmail,
      customer_phone:           customerPhone,
      cpf_hash:                 cpfHash,
      asaas_payment_id:         charge.id,
      asaas_customer_id:        asaasCustomerId,
      payment_method:           billingType,
      payment_status:           'pending',
      payment_url:              charge.invoiceUrl ?? charge.bankSlipUrl,
      pix_qr_code:              pixQrCodeData?.encodedImage ?? null,
      pix_copy_paste:           pixQrCodeData?.payload ?? null,
      accommodation_room_id:    primaryItem.accommodationRoomId ?? null,
      check_out:                primaryItem.checkOut ?? null,
      status:                   'pending',
      vertical:                 primaryItem.type,
      commission_rate:          100 - commissionPct, // % que a Acalanto retém
      notes:                    null,
      photographer_package_id:  primaryItem.photographerPackageId ?? null,
      utm_campaign:             null,
      paid_at:                  null,
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: booking, error: bookingError } = await (supabase as any)
      .from('bookings')
      .insert(bookingPayload)
      .select('id')
      .single() as { data: { id: string } | null; error: Error | null }

    if (bookingError || !booking) throw bookingError ?? new Error('Booking insert returned null')

    // 9. Send confirmation email (fire-and-forget — never block the response)
    sendBookingConfirmation({
      bookingId:    booking.id,
      customerName:  customerName,
      customerEmail: customerEmail,
      billingType:   billingType as 'PIX' | 'CREDIT_CARD' | 'BOLETO' | 'DEBIT_CARD',
      totalCents,
      items: items.map(i => ({
        name:        i.name,
        type:        i.type,
        date:        i.date,
        checkIn:     i.checkIn,
        checkOut:    i.checkOut,
        adults:      i.adults,
        children:    i.children,
        nights:      i.nights,
        guests:      i.guests,
        pricingType: i.pricingType,
        groupSize:   i.groupSize,
        totalCents:  (() => {
          if (i.type === 'hospedagem') return (i.pricePerNightCents ?? 0) * (i.nights ?? 1)
          if (i.type === 'servico' && i.pricingType === 'per_group') return i.priceAdultCents
          return i.priceAdultCents * (i.adults ?? 0) + i.priceChildCents * (i.children ?? 0)
        })(),
      })),
      paymentUrl:   charge.invoiceUrl ?? charge.bankSlipUrl ?? null,
      pixCopyPaste: pixQrCodeData?.payload ?? null,
    }).catch(err => console.error('[email] failed to send booking confirmation:', err))

    return NextResponse.json({
      bookingId:    booking.id,
      billingType,
      totalCents,
      paymentUrl:   charge.invoiceUrl ?? charge.bankSlipUrl,
      pixQrCode:    pixQrCodeData?.encodedImage ?? null,
      pixCopyPaste: pixQrCodeData?.payload ?? null,
    })

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[checkout] error message:', msg)
    return NextResponse.json(
      { error: 'Erro ao processar pagamento. Tente novamente.' },
      { status: 500 }
    )
  }
}
