import { createAdminClient } from '@/lib/supabase/server'
import { formatCents } from '@/lib/booking/pricing'

export const dynamic = 'force-dynamic'

export default async function AdminReservasPage() {
  const supabase = await createAdminClient()
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, boats(name)')
    .order('created_at', { ascending: false })
    .limit(100)

  const statusColors: Record<string, string> = {
    pending: '#805ad5',
    whatsapp_initiated: '#d69e2e',
    confirmed: '#38a169',
    cancelled: '#e53e3e',
    no_show: '#a0aec0',
  }
  const statusLabels: Record<string, string> = {
    pending: 'Aguardando pagto',
    whatsapp_initiated: 'Iniciada WA',
    confirmed: 'Confirmada',
    cancelled: 'Cancelada',
    no_show: 'No-show',
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--ocean-deep)', marginBottom: '1.5rem' }}>
        Reservas
      </h1>

      <div style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead style={{ background: 'var(--sand)' }}>
              <tr>
                {['Embarcação','Data','Adultos','Crianças','Total','Cliente','Status','Criado em'].map(h => (
                  <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 700, color: 'var(--ocean-deep)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings?.map((b, i) => (
                <tr key={b.id} style={{ borderTop: '1px solid var(--border)', background: i % 2 === 0 ? 'white' : '#fafbfc' }}>
                  <td style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--ocean-deep)' }}>
                    {(b.boats as { name: string } | null)?.name || '—'}
                  </td>
                  <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap' }}>{b.tour_date}</td>
                  <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>{b.adults}</td>
                  <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>{b.children}</td>
                  <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--sunset)', whiteSpace: 'nowrap' }}>
                    {formatCents(b.total_cents)}
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>{b.customer_name || '—'}</td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <span style={{ background: `${statusColors[b.status]}20`, color: statusColors[b.status], fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '999px' }}>
                      {statusLabels[b.status] || b.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(b.created_at!).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
              {(!bookings || bookings.length === 0) && (
                <tr><td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhuma reserva ainda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
