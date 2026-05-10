import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createTransfer } from '@/lib/asaas/client'
import { getAdminUser } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminUser = await getAdminUser()
  if (!adminUser || adminUser.role !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const supabase = await createAdminClient()

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('id, total_cents, commission_rate, payment_status, boats(partner_id)')
    .eq('id', id)
    .maybeSingle()

  if (bookingError || !booking) {
    return NextResponse.json({ error: 'Reserva não encontrada' }, { status: 404 })
  }
  if (!['confirmed', 'received'].includes(booking.payment_status ?? '')) {
    return NextResponse.json({ error: 'Pagamento não confirmado ainda' }, { status: 400 })
  }

  const boatData = booking.boats as { partner_id: string | null } | null
  if (!boatData?.partner_id) {
    return NextResponse.json({ error: 'Barco sem parceiro associado' }, { status: 400 })
  }

  const { data: partner } = await supabase
    .from('partners')
    .select('id, name, asaas_wallet_id')
    .eq('id', boatData.partner_id)
    .maybeSingle()

  if (!partner?.asaas_wallet_id) {
    return NextResponse.json(
      { error: 'Parceiro sem wallet ASAAS configurada' },
      { status: 400 }
    )
  }

  const commissionRate = booking.commission_rate ?? 0.30
  const partnerCents = Math.round(booking.total_cents * (1 - commissionRate))
  const partnerValue = partnerCents / 100

  if (partnerValue <= 0) {
    return NextResponse.json({ error: 'Valor de repasse inválido' }, { status: 400 })
  }

  let transfer
  try {
    transfer = await createTransfer({
      value: partnerValue,
      walletId: partner.asaas_wallet_id,
      description: `Repasse reserva ${id.slice(0, 8)} — ${partner.name}`,
    })
  } catch (e) {
    return NextResponse.json(
      { error: `Falha ASAAS: ${e instanceof Error ? e.message : String(e)}` },
      { status: 502 }
    )
  }

  // Per-booking transfer tracking lives in the booking notes for now; the
  // payouts table is monthly-aggregated and a future migration can split that.
  await supabase
    .from('bookings')
    .update({
      notes: `[transfer ${transfer.id} status=${transfer.status ?? '?'} valor=${partnerValue.toFixed(2)} parceiro=${partner.name}]`,
    })
    .eq('id', id)

  return NextResponse.json({
    transfer,
    partnerName: partner.name,
    partnerValueCents: partnerCents,
    partnerValueFormatted: partnerValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }),
  })
}
