import { createAdminClient } from '@/lib/supabase/server'
import { getAdminUser, canAccessRoute } from '@/lib/admin-auth'
import { redirect } from 'next/navigation'
import ReservasClient from '@/components/admin/ReservasClient'
import type { ReservaRow } from '@/components/admin/ReservaViewModal'

export const dynamic = 'force-dynamic'

interface BookingJoin {
  id: string
  boat_id: string | null
  tour_date: string | null
  adults: number
  children: number
  total_cents: number
  customer_name: string | null
  customer_email: string | null
  customer_phone: string | null
  status: string
  notes: string | null
  vertical: string
  photographer_package_id: string | null
  utm_campaign: string | null
  commission_rate: number
  paid_at: string | null
  asaas_payment_id: string | null
  payment_method: string | null
  payment_status: string
  created_at: string
  boats: { name: string | null; partner_id: string | null } | null
}

export default async function AdminReservasPage() {
  const adminUser = await getAdminUser()
  if (!adminUser) redirect('/admin/login')
  if (!canAccessRoute(adminUser.role, '/admin/reservas')) redirect('/admin')

  const supabase = await createAdminClient()
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, boats(name, partner_id)')
    .order('created_at', { ascending: false })
    .limit(100)

  const rawBookings = (bookings ?? []) as unknown as BookingJoin[]

  // Lookup partner names + wallets for the partner_ids referenced by boats
  const partnerIds = Array.from(
    new Set(rawBookings.map(b => b.boats?.partner_id).filter((x): x is string => !!x))
  )
  let partnerMap: Record<string, { name: string; wallet: string | null }> = {}
  if (partnerIds.length > 0) {
    const { data: partners } = await supabase
      .from('partners')
      .select('id, name, asaas_wallet_id')
      .in('id', partnerIds)
    partnerMap = Object.fromEntries(
      (partners ?? []).map(p => [p.id, { name: p.name, wallet: p.asaas_wallet_id }])
    )
  }

  const rows: ReservaRow[] = rawBookings.map(b => {
    const partnerId = b.boats?.partner_id ?? null
    const partner = partnerId ? partnerMap[partnerId] : null
    return {
      id: b.id,
      boat_name: b.boats?.name ?? null,
      partner_name: partner?.name ?? null,
      partner_wallet_id: partner?.wallet ?? null,
      tour_date: b.tour_date,
      adults: b.adults,
      children: b.children,
      total_cents: b.total_cents,
      commission_rate: b.commission_rate ?? 0.30,
      customer_name: b.customer_name,
      customer_email: b.customer_email,
      customer_phone: b.customer_phone,
      status: b.status,
      payment_status: b.payment_status,
      payment_method: b.payment_method,
      asaas_payment_id: b.asaas_payment_id,
      paid_at: b.paid_at,
      photographer_package_id: b.photographer_package_id,
      notes: b.notes,
      vertical: b.vertical,
      utm_campaign: b.utm_campaign,
      created_at: b.created_at,
    }
  })

  return (
    <div style={{ padding: '2rem' }}>
      <ReservasClient bookings={rows} canPayPartner={adminUser.role === 'super_admin'} />
    </div>
  )
}
