import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AdminParceirosPage() {
  const supabase = await createAdminClient()
  const { data: partners } = await supabase
    .from('partners')
    .select('*')
    .order('name')

  const typeLabels: Record<string, string> = {
    boat: '⛵ Embarcação', photo: '📸 Fotografia', jeep: '🚙 Jeep',
    guide: '🧭 Guia', transfer: '🚐 Transfer', hotel: '🏨 Hotel', other: '🔹 Outro',
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--ocean-deep)' }}>Parceiros</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {partners?.map(p => (
          <div key={p.id} style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div>
                <p style={{ fontWeight: 700, color: 'var(--ocean-deep)', fontSize: '1rem' }}>{p.name}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--ocean-mid)', marginTop: '0.2rem' }}>
                  {typeLabels[p.type] || p.type}
                </p>
              </div>
              <span style={{
                background: p.active ? '#38a16920' : '#a0aec020',
                color: p.active ? '#38a169' : '#a0aec0',
                fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: '999px',
              }}>
                {p.active ? 'Ativo' : 'Inativo'}
              </span>
            </div>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.75rem' }}>
              <span style={{ color: 'var(--sunset)', fontSize: '1rem' }}>★</span>
              <span style={{ fontWeight: 700, color: 'var(--ocean-deep)' }}>{Number(p.internal_rating).toFixed(1)}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>avaliação interna</span>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {p.email && <span>✉️ {p.email}</span>}
              {p.phone && <span>📞 {p.phone}</span>}
              {p.notes && <span style={{ fontStyle: 'italic', marginTop: '0.375rem' }}>"{p.notes}"</span>}
            </div>
          </div>
        ))}
        {(!partners || partners.length === 0) && (
          <div style={{ background: 'white', borderRadius: '1rem', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Nenhum parceiro cadastrado ainda.
          </div>
        )}
      </div>
    </div>
  )
}
