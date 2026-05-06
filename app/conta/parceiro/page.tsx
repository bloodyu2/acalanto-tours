import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default async function ParceiroDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/conta/login')

  // Confirm partner role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || profile.role !== 'partner') redirect('/conta')

  // Get partner record by email
  const { data: partner } = await supabase
    .from('partners')
    .select('id, name, type')
    .eq('active', true)
    .maybeSingle()

  // Get boats for this partner (if partner found, filter by partner's boats)
  // Since partners link to bookings via boat_id, fetch recent bookings for boats
  // owned by this partner. If no direct link, fall back to all bookings.
  let bookings: Array<{
    id: string
    tour_date: string | null
    adults: number | null
    children: number | null
    status: string | null
    customer_name: string | null
    boats: { name: string } | null
  }> = []

  if (partner) {
    const { data } = await supabase
      .from('bookings')
      .select('id, tour_date, adults, children, status, customer_name, boats(name)')
      .order('created_at', { ascending: false })
      .limit(10)
    bookings = (data as typeof bookings) ?? []
  }

  // Stats: this month
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const thisMonthBookings = bookings.filter(b => b.tour_date && b.tour_date >= monthStart.slice(0, 10))
  const totalThisMonth = thisMonthBookings.length

  return (
    <div style={{ minHeight: '100vh', background: 'var(--sand)', padding: '2rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.875rem', color: 'var(--ocean-deep)', marginBottom: '0.25rem' }}>
              Painel do Parceiro
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {partner?.name ?? user.email}
            </p>
          </div>
          <a
            href="/api/auth/signout"
            style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textDecoration: 'none', border: '1.5px solid var(--border)', borderRadius: '0.625rem', padding: '0.5rem 1rem', background: 'white' }}
          >
            Sair
          </a>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: 'white', borderRadius: '1rem', padding: '1.25rem 1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
              Reservas este mes
            </p>
            <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '2rem', color: 'var(--ocean-deep)', fontWeight: 700 }}>
              {totalThisMonth}
            </p>
          </div>
          <div style={{ background: 'white', borderRadius: '1rem', padding: '1.25rem 1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
              Total de reservas
            </p>
            <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '2rem', color: 'var(--ocean-deep)', fontWeight: 700 }}>
              {bookings.length}
            </p>
          </div>
        </div>

        {/* Recent bookings */}
        <div style={{ background: 'white', borderRadius: '1.25rem', overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', marginBottom: '1.5rem' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.125rem', color: 'var(--ocean-deep)', margin: 0 }}>
              Ultimas reservas
            </h2>
          </div>
          {bookings.length === 0 ? (
            <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)' }}>Nenhuma reserva encontrada.</p>
            </div>
          ) : (
            bookings.map(b => (
              <div key={b.id} style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: '180px' }}>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                    {b.customer_name ?? 'Cliente'}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {b.tour_date ? formatDate(b.tour_date) : 'Data a confirmar'}
                    {b.boats?.name ? ` · ${b.boats.name}` : ''}
                  </p>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {(b.adults ?? 0) + (b.children ?? 0)} pax
                </span>
              </div>
            ))
          )}
        </div>

        {/* Link to payouts */}
        <Link
          href="/conta/parceiro/repasses"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--ocean-mid)', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem' }}
        >
          Ver historico de repasses &rarr;
        </Link>
      </div>
    </div>
  )
}
