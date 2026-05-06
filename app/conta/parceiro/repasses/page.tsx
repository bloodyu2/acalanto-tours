import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

function formatCents(cents: number | null) {
  if (cents == null) return 'R$ --'
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatMonth(period: string | null) {
  if (!period) return '--'
  // period_month is typically 'YYYY-MM'
  const [year, month] = period.split('-')
  const date = new Date(Number(year), Number(month) - 1, 1)
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

export default async function RepassesPage() {
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

  // Get partner
  const { data: partner } = await supabase
    .from('partners')
    .select('id, name')
    .eq('active', true)
    .maybeSingle()

  // Fetch payouts
  let payouts: Array<{
    id: string
    period_month: string | null
    gross_cents: number | null
    commission_cents: number | null
    net_cents: number | null
    status: string | null
    paid_at: string | null
  }> = []

  if (partner) {
    const { data } = await supabase
      .from('payouts')
      .select('id, period_month, gross_cents, commission_cents, net_cents, status, paid_at')
      .eq('partner_id', partner.id)
      .order('period_month', { ascending: false })
    payouts = (data as typeof payouts) ?? []
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--sand)', padding: '2rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link
            href="/conta/parceiro"
            style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            &larr; Painel
          </Link>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.875rem', color: 'var(--ocean-deep)', marginBottom: '0.25rem' }}>
              Historico de repasses
            </h1>
            {partner && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{partner.name}</p>}
          </div>
        </div>

        {/* Note */}
        <div style={{ background: 'white', borderRadius: '0.875rem', padding: '1rem 1.25rem', marginBottom: '1.5rem', borderLeft: '3px solid var(--ocean-mid)' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
            Os repasses sao calculados mensalmente e liberados ate o dia 10 do mes seguinte.
          </p>
        </div>

        {/* Payouts table */}
        <div style={{ background: 'white', borderRadius: '1.25rem', overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
          {payouts.length === 0 ? (
            <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)' }}>Nenhum repasse encontrado ainda.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--sand)' }}>
                    {['Periodo', 'Bruto', 'Liquido', 'Status', 'Data do pagamento'].map(col => (
                      <th key={col} style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payouts.map(p => {
                    const isPaid = p.status === 'paid'
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                          {formatMonth(p.period_month)}
                        </td>
                        <td style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                          {formatCents(p.gross_cents)}
                        </td>
                        <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--ocean-deep)', fontSize: '0.9rem' }}>
                          {formatCents(p.net_cents)}
                        </td>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <span style={{
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            padding: '0.25rem 0.75rem',
                            borderRadius: '999px',
                            background: isPaid ? '#10b98120' : '#f59e0b20',
                            color: isPaid ? '#10b981' : '#f59e0b',
                          }}>
                            {isPaid ? 'Pago' : 'Pendente'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                          {p.paid_at
                            ? new Date(p.paid_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                            : '-'}
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
    </div>
  )
}
