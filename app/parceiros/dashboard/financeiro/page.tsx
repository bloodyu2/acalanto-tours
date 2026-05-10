import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

function fmtCents(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default async function ParceiroFinanceiroPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/parceiros/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('partner_id')
    .eq('auth_user_id', session.user.id)
    .single()
  if (!profile?.partner_id) redirect('/parceiros/login')

  const partnerId = profile.partner_id

  const { data: paidBookings } = await supabase
    .from('bookings')
    .select('id, total_cents, commission_rate, tour_date, vertical, created_at')
    .eq('partner_id', partnerId)
    .in('status', ['confirmed', 'paid'])
    .order('created_at', { ascending: false })

  const allBookings = paidBookings ?? []
  const totalGross = allBookings.reduce((s, b) => s + (b.total_cents ?? 0), 0)
  const totalCommission = allBookings.reduce((s, b) => s + Math.round((b.total_cents ?? 0) * (b.commission_rate ?? 30) / 100), 0)
  const totalNet = totalGross - totalCommission

  const { data: payouts } = await supabase
    .from('payouts')
    .select('id, period_month, gross_cents, commission_cents, net_cents, status, paid_at, notes')
    .eq('partner_id', partnerId)
    .order('period_month', { ascending: false })

  const pendingNet = (payouts ?? []).filter(p => p.status === 'pending').reduce((s, p) => s + (p.net_cents ?? 0), 0)

  return (
    <div style={{ padding: '2rem', maxWidth: '900px' }}>
      <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: '#0f172a', marginBottom: '0.25rem' }}>
        Financeiro
      </h1>
      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Receita, comissões e repasses
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        {[
          { label: 'Receita bruta total', value: fmtCents(totalGross), color: '#0f172a' },
          { label: 'Comissão Acalanto', value: `-${fmtCents(totalCommission)}`, color: '#dc2626' },
          { label: 'Seu valor líquido', value: fmtCents(totalNet), color: '#16a34a' },
          { label: 'Repasse pendente', value: fmtCents(pendingNet), color: '#d97706' },
        ].map(k => (
          <div key={k.label} style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
            <p style={{ margin: '0 0 0.375rem', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k.label}</p>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: k.color, fontFamily: 'var(--font-playfair)' }}>{k.value}</p>
          </div>
        ))}
      </div>

      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '2rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.8rem', color: '#1e40af', lineHeight: 1.5 }}>
          <strong>ℹ️</strong> Lembre-se: você deve emitir nota fiscal no seu CNPJ para cada serviço prestado. Os valores aqui refletidos são brutos antes de impostos.
        </span>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: '2rem' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Histórico de repasses</h2>
        </div>
        {(payouts ?? []).length === 0 ? (
          <p style={{ padding: '2rem', color: '#94a3b8', textAlign: 'center' }}>Nenhum repasse registrado ainda.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Período', 'Bruto', 'Comissão', 'Líquido', 'Status', 'Pago em'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(payouts ?? []).map((p, i) => (
                <tr key={p.id} style={{ borderTop: i > 0 ? '1px solid #f1f5f9' : undefined }}>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#0f172a' }}>{p.period_month}</td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#64748b' }}>{fmtCents(p.gross_cents ?? 0)}</td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#dc2626' }}>-{fmtCents(p.commission_cents ?? 0)}</td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', fontWeight: 700, color: '#16a34a' }}>{fmtCents(p.net_cents ?? 0)}</td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <span style={{
                      display: 'inline-block', padding: '0.2rem 0.625rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                      color: p.status === 'paid' ? '#16a34a' : '#d97706',
                      background: p.status === 'paid' ? '#dcfce7' : '#fef3c7',
                    }}>
                      {p.status === 'paid' ? 'Pago' : 'Pendente'}
                    </span>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                    {p.paid_at ? new Date(p.paid_at).toLocaleDateString('pt-BR') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
        Os repasses são realizados manualmente pela equipe Acalanto Turismo. Em caso de dúvidas, entre em contato pelo WhatsApp.
      </p>
    </div>
  )
}
