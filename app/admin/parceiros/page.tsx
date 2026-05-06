import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AdminParceirosPage() {
  const supabase = await createAdminClient()

  const [{ data: partners }, { data: candidacies }] = await Promise.all([
    supabase.from('partners').select('*').order('name'),
    supabase.from('contacts').select('*').eq('source', 'candidatura-parceiro').order('created_at', { ascending: false }).limit(50),
  ])

  const typeLabels: Record<string, string> = {
    boat: 'Embarcacao', photo: 'Fotografia', jeep: 'Jeep',
    guide: 'Guia', transfer: 'Transfer', hotel: 'Hotel', other: 'Outro',
  }
  const typeIcons: Record<string, string> = {
    boat: '⛵', photo: '📸', jeep: '🚙', guide: '🧭', transfer: '🚐', hotel: '🏨', other: '🔹',
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--ocean-deep)' }}>Parceiros</h1>
      </div>

      {/* Partners grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '3rem' }}>
        {partners?.map(p => (
          <div key={p.id} style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div>
                <p style={{ fontWeight: 700, color: 'var(--ocean-deep)', fontSize: '1rem' }}>{p.name}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--ocean-mid)', marginTop: '0.2rem' }}>
                  {typeIcons[p.type] || ''} {typeLabels[p.type] || p.type}
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.75rem' }}>
              <span style={{ color: 'var(--sunset)', fontSize: '1rem' }}>★</span>
              <span style={{ fontWeight: 700, color: 'var(--ocean-deep)' }}>{Number(p.internal_rating).toFixed(1)}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>avaliacao interna</span>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {p.email && <span>Email: {p.email}</span>}
              {p.phone && <span>Tel: {p.phone}</span>}
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

      {/* Candidacies section */}
      <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', color: 'var(--ocean-deep)', marginBottom: '1rem' }}>
        Contatos de interesse ({(candidacies ?? []).length})
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 0.875 + 'rem', marginBottom: '1.25rem' }}>
        Mensagens recebidas via formulario de candidatura de parceiro.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {(candidacies ?? []).map(c => (
          <div key={c.id} style={{
            background: 'white', borderRadius: '1rem', padding: '1.25rem 1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            borderLeft: '4px solid var(--ocean-mid)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div>
                <p style={{ fontWeight: 700, color: 'var(--ocean-deep)' }}>{c.name}</p>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {c.email && <span>Email: {c.email}</span>}
                  {c.phone && <span>Tel: {c.phone}</span>}
                </div>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {new Date(c.created_at!).toLocaleDateString('pt-BR')}
              </span>
            </div>
            {c.message && <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{c.message}</p>}
          </div>
        ))}
        {(!candidacies || candidacies.length === 0) && (
          <div style={{ background: 'white', borderRadius: '1rem', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Nenhuma candidatura recebida ainda.
          </div>
        )}
      </div>
    </div>
  )
}
