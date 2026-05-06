import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

function fmtCents(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default async function ParceiroReservasPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/parceiros/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('partner_id')
    .eq('auth_user_id', session.user.id)
    .single()
  if (!profile?.partner_id) redirect('/parceiros/login')

  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, customer_name, customer_email, customer_phone, tour_date, vertical, adults, children, total_cents, status, commission_rate, notes, created_at')
    .eq('partner_id', profile.partner_id)
    .order('created_at', { ascending: false })

  const statusLabel: Record<string, { text: string; color: string }> = {
    pending: { text: 'Pendente', color: '#d97706' },
    confirmed: { text: 'Confirmada', color: '#16a34a' },
    paid: { text: 'Pago', color: '#16a34a' },
    cancelled: { text: 'Cancelada', color: '#dc2626' },
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1100px' }}>
      <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: '#0f172a', marginBottom: '0.25rem' }}>
        Reservas
      </h1>
      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Todas as reservas vinculadas ao seu perfil
      </p>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {(bookings ?? []).length === 0 ? (
          <p style={{ padding: '3rem', color: '#94a3b8', textAlign: 'center' }}>Nenhuma reserva ainda.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Data', 'Cliente', 'Contato', 'Tipo', 'Pessoas', 'Valor', 'Comissão', 'Status'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(bookings ?? []).map((b, i) => {
                  const st = statusLabel[b.status] ?? { text: b.status, color: '#64748b' }
                  const commissionCents = Math.round((b.total_cents ?? 0) * (b.commission_rate ?? 30) / 100)
                  const netCents = (b.total_cents ?? 0) - commissionCents
                  return (
                    <tr key={b.id} style={{ borderTop: i > 0 ? '1px solid #f1f5f9' : undefined }}>
                      <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap' }}>{b.tour_date ?? '—'}</td>
                      <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#0f172a' }}>{b.customer_name ?? '—'}</td>
                      <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: '#64748b' }}>
                        {b.customer_phone && <div>{b.customer_phone}</div>}
                        {b.customer_email && <div style={{ fontSize: '0.75rem' }}>{b.customer_email}</div>}
                      </td>
                      <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: '#64748b', textTransform: 'capitalize' }}>{b.vertical ?? '—'}</td>
                      <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: '#64748b' }}>{(b.adults ?? 0) + (b.children ?? 0)} pax</td>
                      <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap' }}>{fmtCents(b.total_cents ?? 0)}</td>
                      <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                        <div style={{ color: '#dc2626' }}>-{fmtCents(commissionCents)} ({b.commission_rate}%)</div>
                        <div style={{ color: '#16a34a', fontWeight: 600 }}>={fmtCents(netCents)}</div>
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <span style={{ display: 'inline-block', padding: '0.2rem 0.625rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, color: st.color, background: `${st.color}18`, whiteSpace: 'nowrap' }}>
                          {st.text}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
