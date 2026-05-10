import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getCharge } from '@/lib/asaas/client'
import { getAdminUser } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

const STATUS_MAP: Record<string, string> = {
  pending: 'pending',
  awaiting_payment: 'pending',
  received: 'received',
  received_in_cash: 'received',
  confirmed: 'confirmed',
  overdue: 'overdue',
  refunded: 'refunded',
  refund_requested: 'refunded',
  chargeback_requested: 'refunded',
  chargeback_dispute: 'refunded',
}

export async function POST() {
  const adminUser = await getAdminUser()
  if (!adminUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createAdminClient()

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('id, asaas_payment_id, payment_status, status')
    .not('asaas_payment_id', 'is', null)
    .in('payment_status', ['pending', 'overdue', 'awaiting_payment'])
    .limit(100)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  if (!bookings || bookings.length === 0) {
    return NextResponse.json({ updated: 0, checked: 0 })
  }

  const errors: Array<{ id: string; error: string }> = []
  let updated = 0

  await Promise.all(
    bookings.map(async (b) => {
      try {
        const charge = await getCharge(b.asaas_payment_id!)
        const raw = (charge.status ?? '').toLowerCase()
        const mapped = STATUS_MAP[raw] ?? raw

        if (mapped !== b.payment_status) {
          const isPaid = mapped === 'confirmed' || mapped === 'received'
          await supabase
            .from('bookings')
            .update({
              payment_status: mapped,
              ...(isPaid ? { status: 'confirmed', paid_at: new Date().toISOString() } : {}),
            })
            .eq('id', b.id)
          updated++
        }
      } catch (e) {
        errors.push({ id: b.id, error: e instanceof Error ? e.message : String(e) })
      }
    })
  )

  return NextResponse.json({ checked: bookings.length, updated, errors })
}
