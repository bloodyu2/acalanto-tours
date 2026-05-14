// app/api/admin/pdv/[id]/status/route.ts
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getAdminUser } from '@/lib/admin-auth'
import { getCharge } from '@/lib/asaas/client'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminUser = await getAdminUser()
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const sb = await createAdminClient()
  const { data: booking } = await sb
    .from('bookings')
    .select('id, payment_status, asaas_payment_id, paid_at, sold_by_user_id')
    .eq('id', id)
    .maybeSingle()

  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (adminUser.role !== 'super_admin' && booking.sold_by_user_id !== adminUser.id) {
    return NextResponse.json({ error: 'Forbidden — esta venda foi feita por outro usuário' }, { status: 403 })
  }

  let paymentStatus = (booking.payment_status ?? 'pending').toLowerCase()

  // Side-effect: se DB ainda diz pending mas ASAAS já tem received/confirmed, sincronizar.
  if (paymentStatus === 'pending' && booking.asaas_payment_id) {
    try {
      const charge = await getCharge(booking.asaas_payment_id)
      const remote = (charge.status ?? '').toLowerCase()
      if (['received', 'confirmed'].includes(remote) && remote !== paymentStatus) {
        await sb.from('bookings').update({
          payment_status: remote,
          status: 'confirmed',
          paid_at: new Date().toISOString(),
        }).eq('id', id)
        paymentStatus = remote
      }
    } catch { /* swallow — polling tenta de novo em 3s */ }
  }

  return NextResponse.json({ paymentStatus, paidAt: booking.paid_at })
}
