import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AdminNpsPage() {
  const supabase = await createAdminClient()

  const { data: surveys } = await supabase
    .from('nps_surveys')
    .select('*, bookings(customer_name, tour_date)')
    .order('created_at', { ascending: false })
    .limit(200)

  const responded = (surveys ?? []).filter(s => s.submitted_at)
  const pending = (surveys ?? []).filter(s => !s.submitted_at)

  // NPS calculation
  const scores = responded.map(s => s.score as number).filter(s => s !== null)
  const promoters = scores.filter(s => s >= 9).length
  const passives = scores.filter(s => s >= 7 && s <= 8).length
  const detractors = scores.filter(s => s <= 6).length
  const total = scores.length
  const npsScore = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : null

  function scoreColor(score: number) {
    if (score >= 9) return '#38a169'
    if (score >= 7) return '#d69e2e'
    return '#e53e3e'
  }

  function scoreLabel(score: number) {
    if (score >= 9) return 'Promotor'
    if (score >= 7) return 'Passivo'
    return 'Detrator'
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--ocean-deep)', marginBottom: '0.25rem' }}>
        NPS
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Pesquisas de satisfacao pos-passeio.
      </p>

      {/* NPS Score panel */}
      {total > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
          <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: npsScore !== null && npsScore >= 50 ? '#38a169' : npsScore !== null && npsScore >= 0 ? '#d69e2e' : '#e53e3e', marginBottom: '0.25rem' }}>
              {npsScore !== null ? npsScore : '-'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>NPS Score</div>
          </div>
          <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#38a169', marginBottom: '0.25rem' }}>
              {total > 0 ? Math.round((promoters / total) * 100) : 0}%
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Promotores ({promoters})</div>
          </div>
          <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#d69e2e', marginBottom: '0.25rem' }}>
              {total > 0 ? Math.round((passives / total) * 100) : 0}%
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Passivos ({passives})</div>
          </div>
          <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#e53e3e', marginBottom: '0.25rem' }}>
              {total > 0 ? Math.round((detractors / total) * 100) : 0}%
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Detratores ({detractors})</div>
          </div>
          <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--ocean-mid)', marginBottom: '0.25rem' }}>
              {pending.length}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Aguardando</div>
          </div>
        </div>
      )}

      {/* Responded */}
      <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.15rem', color: 'var(--ocean-deep)', marginBottom: '1rem' }}>
        Respondidas ({responded.length})
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '2.5rem' }}>
        {responded.map(s => {
          const booking = s.bookings as { customer_name?: string; tour_date?: string } | null
          return (
            <div key={s.id} style={{ background: 'white', borderRadius: '1rem', padding: '1.25rem 1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
              <div style={{ textAlign: 'center', minWidth: 56 }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: scoreColor(s.score) }}>{s.score}</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: scoreColor(s.score), textTransform: 'uppercase' }}>{scoreLabel(s.score)}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>
                  <span>Cliente: <strong style={{ color: 'var(--ocean-deep)' }}>{booking?.customer_name || 'Anonimo'}</strong></span>
                  {booking?.tour_date && <span>Data: {booking.tour_date}</span>}
                  {s.submitted_at && <span>Respondido em: {new Date(s.submitted_at).toLocaleDateString('pt-BR')}</span>}
                </div>
                {s.comment && (
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5, fontStyle: 'italic' }}>
                    &quot;{s.comment}&quot;
                  </p>
                )}
              </div>
            </div>
          )
        })}
        {responded.length === 0 && (
          <div style={{ background: 'white', borderRadius: '1rem', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Nenhuma resposta ainda.
          </div>
        )}
      </div>

      {/* Pending */}
      {pending.length > 0 && (
        <>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.15rem', color: 'var(--ocean-deep)', marginBottom: '1rem' }}>
            Aguardando resposta ({pending.length})
          </h2>
          <div style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead style={{ background: 'var(--sand)' }}>
                  <tr>
                    {['Cliente', 'Data do passeio', 'Enviado em'].map(h => (
                      <th key={h} style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontWeight: 700, color: 'var(--ocean-deep)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pending.map((s, i) => {
                    const booking = s.bookings as { customer_name?: string; tour_date?: string } | null
                    return (
                      <tr key={s.id} style={{ borderTop: '1px solid var(--border)', background: i % 2 === 0 ? 'white' : '#fafbfc' }}>
                        <td style={{ padding: '0.875rem 1.25rem', color: 'var(--ocean-deep)' }}>{booking?.customer_name || 'Anonimo'}</td>
                        <td style={{ padding: '0.875rem 1.25rem' }}>{booking?.tour_date || '-'}</td>
                        <td style={{ padding: '0.875rem 1.25rem', color: 'var(--text-muted)' }}>
                          {s.sent_at ? new Date(s.sent_at).toLocaleDateString('pt-BR') : 'Nao enviado'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
