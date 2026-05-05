import { createAdminClient } from '@/lib/supabase/server'

export default async function AdminContatosPage() {
  const supabase = await createAdminClient()
  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--ocean-deep)', marginBottom: '1.5rem' }}>
        Mensagens
      </h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {contacts?.map(c => (
          <div key={c.id} style={{
            background: 'white', borderRadius: '1rem', padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            border: `1px solid ${c.read ? 'var(--border)' : 'var(--ocean-light)'}`,
            borderLeft: `4px solid ${c.read ? 'var(--border)' : 'var(--ocean-mid)'}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
              <div>
                <p style={{ fontWeight: 700, color: 'var(--ocean-deep)' }}>{c.name}</p>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {c.email && <span>✉️ {c.email}</span>}
                  {c.phone && <span>📞 {c.phone}</span>}
                </div>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {new Date(c.created_at!).toLocaleDateString('pt-BR')}
              </span>
            </div>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{c.message}</p>
          </div>
        ))}
        {(!contacts || contacts.length === 0) && (
          <div style={{ background: 'white', borderRadius: '1rem', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Nenhuma mensagem ainda.
          </div>
        )}
      </div>
    </div>
  )
}
