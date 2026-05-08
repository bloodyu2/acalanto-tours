import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'
import { createOrFindCustomer, createCharge } from '@/lib/asaas/client'
import { buildSplit, type CartItemWithPartner } from '@/lib/asaas/split'
import { hashCpf, isValidCpf, cleanCpf } from '@/lib/crypto/cpf'
import type { AsaasBillingType } from '@/lib/asaas/types'
import type { Database } from '@/lib/types/database'

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

    // 4. Optional split (inactive until ASAAS_SPLIT_ENABLED env var is set)
    const split = buildSplit(items as CartItemWithPartner[])

    // 5. Create ASAAS charge
    const charge = await createCharge({
      customer:          asaasCustomerId,
      billingType:       billingType as AsaasBillingType,
      value:             totalBRL,
      dueDate:           dueDateStr,
      description,
      split,
    })

    // 6. Hash CPF — raw CPF never touches the DB
    const cpfHash = hashCpf(cpf)

    // 7. Determine primary date and boatId for the booking row
    const primaryItem = items[0]
    const tourDate = primaryItem.date ?? primaryItem.checkIn ?? new Date().toISOString().split('T')[0]
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const boatId  = primaryItem.boatId && UUID_RE.test(primaryItem.boatId) ? primaryItem.boatId : null

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
      pix_qr_code:              charge.pixQrCode?.encodedImage ?? null,
      pix_copy_paste:           charge.pixQrCode?.payload ?? null,
      accommodation_room_id:    primaryItem.accommodationRoomId ?? null,
      check_out:                primaryItem.checkOut ?? null,
      status:                   'pending',
      vertical:                 primaryItem.type,
      commission_rate:          10,
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

    return NextResponse.json({
      bookingId:    booking.id,
      billingType,
      totalCents,
      paymentUrl:   charge.invoiceUrl ?? charge.bankSlipUrl,
      pixQrCode:    charge.pixQrCode?.encodedImage ?? null,
      pixCopyPaste: charge.pixQrCode?.payload ?? null,
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
