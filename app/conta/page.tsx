import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  completed: 'Concluida',
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  confirmed: '#10b981',
  cancelled: '#ef4444',
  completed: '#6366f1',
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default async function ContaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/conta/login')
  }

  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, tour_date, adults, children, status, boat_id, boats(name)')
    .eq('customer_email', user.email!)
    .order('created_at', { ascending: false })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--sand)', padding: '2rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.875rem', color: 'var(--ocean-deep)', marginBottom: '0.25rem' }}>
              Minha conta
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user.email}</p>
          </div>
          <a
            href="/api/auth/signout"
            style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textDecoration: 'none', border: '1.5px solid var(--border)', borderRadius: '0.625rem', padding: '0.5rem 1rem', background: 'white' }}
          >
            Sair
          </a>
        </div>

        {/* Bookings */}
        <div style={{ background: 'white', borderRadius: '1.25rem', overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.125rem', color: 'var(--ocean-deep)', margin: 0 }}>
              Minhas reservas
            </h2>
          </div>

          {!bookings || bookings.length === 0 ? (
            <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
              <div style={{ marginBottom: '0.75rem', color: 'var(--ocean-mid)' }}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20a2 2 0 002 2h16a2 2 0 002-2"/><path d="M4 20l4-12h8l4 12"/><line x1="12" y1="2" x2="12" y2="8"/><path d="M8 8h8"/></svg></div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Voce ainda nao tem reservas. Explore os passeios.
              </p>
              <Link href="/escunas" className="btn-primary" style={{ display: 'inline-flex' }}>
                Ver passeios
              </Link>
            </div>
          ) : (
            <div>
              {bookings.map((b) => {
                const boatName = (b.boats as { name: string } | null)?.name
                const status = b.status ?? 'pending'
                const pax = `${b.adults} adulto${b.adults !== 1 ? 's' : ''}${b.children ? ` + ${b.children} crianca${b.children !== 1 ? 's' : ''}` : ''}`
                return (
                  <div key={b.id} style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '180px' }}>
                      <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                        {boatName ?? 'Passeio de escuna'}
                      </p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {b.tour_date ? formatDate(b.tour_date) : 'Data a confirmar'} &middot; {pax}
                      </p>
                    </div>
                    <span style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      padding: '0.25rem 0.75rem',
                      borderRadius: '999px',
                      background: `${STATUS_COLORS[status]}20`,
                      color: STATUS_COLORS[status] ?? '#6366f1',
                    }}>
                      {STATUS_LABELS[status] ?? status}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
