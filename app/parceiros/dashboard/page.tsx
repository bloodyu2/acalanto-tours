import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

function fmtCents(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default async function ParceiroDashboardPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/parceiros/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('partner_id')
    .eq('auth_user_id', session.user.id)
    .single()

  const partnerId = profile?.partner_id
  if (!partnerId) redirect('/parceiros/login')

  const now = new Date()
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

  const { data: monthBookings } = await supabase
    .from('bookings')
    .select('id, total_cents, status, customer_name, tour_date, vertical, created_at')
    .eq('partner_id', partnerId)
    .gte('created_at', monthStart)
    .order('created_at', { ascending: false })

  const bookings = monthBookings ?? []
  const confirmedBookings = bookings.filter(b => ['confirmed', 'paid'].includes(b.status))
  const grossRevenue = confirmedBookings.reduce((s, b) => s + (b.total_cents ?? 0), 0)

  const { data: pendingPayout } = await supabase
    .from('payouts')
    .select('net_cents')
    .eq('partner_id', partnerId)
    .eq('status', 'pending')
  const pendingTotal = (pendingPayout ?? []).reduce((s, p) => s + (p.net_cents ?? 0), 0)

  const { data: recentBookings } = await supabase
    .from('bookings')
    .select('id, customer_name, tour_date, vertical, total_cents, status, created_at')
    .eq('partner_id', partnerId)
    .order('created_at', { ascending: false })
    .limit(5)

  const kpis = [
    { label: 'Reservas este mês', value: String(bookings.length), sub: `${confirmedBookings.length} confirmadas` },
    { label: 'Receita bruta (mês)', value: fmtCents(grossRevenue), sub: 'vendas confirmadas' },
    { label: 'Repasse pendente', value: fmtCents(pendingTotal), sub: 'a receber da Acalanto' },
  ]

  const statusLabel: Record<string, { text: string; color: string }> = {
    pending: { text: 'Pendente', color: '#d97706' },
    confirmed: { text: 'Confirmada', color: '#16a34a' },
    paid: { text: 'Pago', color: '#16a34a' },
    cancelled: { text: 'Cancelada', color: '#dc2626' },
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px' }}>
      <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: '#0f172a', marginBottom: '0.25rem' }}>
        Visão Geral
      </h1>
      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Resumo do mês atual
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        {kpis.map(k => (
          <div key={k.label} style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
            <p style={{ margin: '0 0 0.375rem', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k.label}</p>
            <p style={{ margin: '0 0 0.25rem', fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', fontFamily: 'var(--font-playfair)' }}>{k.value}</p>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>{k.sub}</p>
          </div>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Últimas reservas</h2>
        </div>
        {(recentBookings ?? []).length === 0 ? (
          <p style={{ padding: '2rem', color: '#94a3b8', textAlign: 'center' }}>Nenhuma reserva ainda.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Cliente', 'Data', 'Tipo', 'Valor', 'Status'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(recentBookings ?? []).map((b, i) => {
                const st = statusLabel[b.status] ?? { text: b.status, color: '#64748b' }
                return (
                  <tr key={b.id} style={{ borderTop: i > 0 ? '1px solid #f1f5f9' : undefined }}>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#0f172a' }}>{b.customer_name ?? '—'}</td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#64748b' }}>{b.tour_date ?? '—'}</td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#64748b', textTransform: 'capitalize' }}>{b.vertical ?? '—'}</td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>{fmtCents(b.total_cents ?? 0)}</td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{ display: 'inline-block', padding: '0.2rem 0.625rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, color: st.color, background: `${st.color}18` }}>
                        {st.text}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
