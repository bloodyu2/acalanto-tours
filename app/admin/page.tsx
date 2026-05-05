import { createAdminClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const supabase = createAdminClient()
  const [
    { count: bookings },
    { count: contacts },
    { count: testimonials },
    { count: partners },
  ] = await Promise.all([
    supabase.from('bookings').select('*', { count: 'exact', head: true }),
    supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('read', false),
    supabase.from('testimonials').select('*', { count: 'exact', head: true }).eq('approved', false),
    supabase.from('partners').select('*', { count: 'exact', head: true }).eq('active', true),
  ])

  const stats = [
    { icon: '📅', label: 'Reservas totais', value: bookings ?? 0, color: 'var(--ocean-mid)' },
    { icon: '📧', label: 'Contatos não lidos', value: contacts ?? 0, color: '#e53e3e' },
    { icon: '💬', label: 'Depoimentos pendentes', value: testimonials ?? 0, color: 'var(--sunset)' },
    { icon: '🤝', label: 'Parceiros ativos', value: partners ?? 0, color: '#38a169' },
  ]

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--ocean-deep)', marginBottom: '0.25rem' }}>
        Dashboard
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Bem-vindo ao painel de administração Acalanto Tours.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {stats.map(({ icon, label, value, color }) => (
          <div key={label} style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color, marginBottom: '0.25rem' }}>{value}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', color: 'var(--ocean-deep)', marginBottom: '1rem' }}>
          Ações rápidas
        </h2>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {[
            { href: '/admin/reservas', label: 'Ver reservas' },
            { href: '/admin/depoimentos', label: 'Moderar depoimentos' },
            { href: '/admin/parceiros', label: 'Gerenciar parceiros' },
            { href: '/admin/contatos', label: 'Ver mensagens' },
          ].map(({ href, label }) => (
            <a key={href} href={href} className="btn-outline" style={{ fontSize: '0.875rem', padding: '0.625rem 1.25rem' }}>
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
