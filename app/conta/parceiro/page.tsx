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

  // Get partner record for current user
  const { data: partner } = await supabase
    .from('partners')
    .select('id, name, type, status, rejection_reason')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  // Get boats belonging to this partner, then scope bookings to those boats
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
    // Boats are linked to partners via the `partner_id` column (if it exists)
    // or by matching partner email/name. Try partner_id first.
    const { data: boatRows } = await supabase
      .from('boats')
      .select('id')
      .eq('partner_id', partner.id)
    const boatIds = (boatRows ?? []).map((b: { id: string }) => b.id)

    if (boatIds.length > 0) {
      const { data } = await supabase
        .from('bookings')
        .select('id, tour_date, adults, children, status, customer_name, boats(name)')
        .in('boat_id', boatIds)
        .order('created_at', { ascending: false })
        .limit(10)
      bookings = (data as typeof bookings) ?? []
    }
  }

  // Stats: this month
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const thisMonthBookings = bookings.filter(b => b.tour_date && b.tour_date >= monthStart.slice(0, 10))
  const totalThisMonth = thisMonthBookings.length

  // No partner record found
  if (!partner) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--sand)', padding: '2rem 0' }}>
        <div className="container" style={{ maxWidth: '640px' }}>
          <div style={{ background: 'white', borderRadius: '1.25rem', padding: '2rem', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', textAlign: 'center' }}>
            <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.5rem', color: 'var(--ocean-deep)', marginBottom: '1rem' }}>
              Cadastro não encontrado
            </h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Complete seu cadastro para acessar o painel de parceiro.
            </p>
            <Link
              href="/parceiros/cadastro"
              style={{ display: 'inline-block', background: 'var(--ocean-deep)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.625rem', textDecoration: 'none', fontWeight: 600 }}
            >
              Completar cadastro
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--sand)', padding: '2rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.875rem', color: 'var(--ocean-deep)', marginBottom: '0.25rem' }}>
              Painel do Parceiro
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {partner.name ?? user.email}
            </p>
          </div>
          <a
            href="/api/auth/signout"
            style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textDecoration: 'none', border: '1.5px solid var(--border)', borderRadius: '0.625rem', padding: '0.5rem 1rem', background: 'white' }}
          >
            Sair
          </a>
        </div>

        {/* Status banner */}
        {partner.status === 'pending' && (
          <div style={{ background: '#fef9c3', border: '1px solid #fde047', borderRadius: '0.75rem', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ display: 'flex', alignItems: 'center' }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></span>
            <p style={{ color: '#854d0e', fontWeight: 500, margin: 0 }}>
              Cadastro em análise — retorno em até 24 horas
            </p>
          </div>
        )}
        {partner.status === 'rejected' && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '0.75rem', padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: partner.rejection_reason ? '0.5rem' : 0 }}>
              <span style={{ display: 'flex', alignItems: 'center' }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg></span>
              <p style={{ color: '#991b1b', fontWeight: 600, margin: 0 }}>
                Cadastro rejeitado
              </p>
            </div>
            {partner.rejection_reason && (
              <p style={{ color: '#b91c1c', margin: '0 0 0 2rem', fontSize: '0.9rem' }}>
                Motivo: {partner.rejection_reason}
              </p>
            )}
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: 'white', borderRadius: '1rem', padding: '1.25rem 1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
              Reservas este mês
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

        {/* Quick links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <Link
            href="/conta/parceiro/anuncios"
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'white', borderRadius: '1rem', padding: '1.25rem 1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', textDecoration: 'none', color: 'var(--ocean-deep)', fontWeight: 600, border: '1.5px solid transparent', transition: 'border-color 0.2s' }}
          >
            <span style={{ display: 'flex', alignItems: 'center' }}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg></span>
            <span>Meus Anúncios</span>
            <span style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>→</span>
          </Link>
          <Link
            href="/conta/parceiro/repasses"
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'white', borderRadius: '1rem', padding: '1.25rem 1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', textDecoration: 'none', color: 'var(--ocean-deep)', fontWeight: 600 }}
          >
            <span style={{ display: 'flex', alignItems: 'center' }}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg></span>
            <span>Histórico de repasses</span>
            <span style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>→</span>
          </Link>
        </div>

        {/* Recent bookings */}
        <div style={{ background: 'white', borderRadius: '1.25rem', overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', marginBottom: '1.5rem' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.125rem', color: 'var(--ocean-deep)', margin: 0 }}>
              Últimas reservas
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
      </div>
    </div>
  )
}
