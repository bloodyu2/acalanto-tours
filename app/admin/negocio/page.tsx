import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AdminNegocioPage() {
  const supabase = await createAdminClient()
  const [
    { count: boatsCount },
    { count: servicesCount },
    { count: pkgsCount },
    { count: partnersCount },
  ] = await Promise.all([
    supabase.from('boats').select('*', { count: 'exact', head: true }),
    supabase.from('services').select('*', { count: 'exact', head: true }),
    supabase.from('photographer_packages').select('*', { count: 'exact', head: true }),
    supabase.from('partners').select('*', { count: 'exact', head: true }),
  ])

  const sections = [
    { href: '/admin/negocio/escunas', label: 'Escunas', count: boatsCount ?? 0, desc: 'Passeios de barco', color: 'var(--ocean-mid)' },
    { href: '/admin/negocio/servicos', label: 'Serviços', count: servicesCount ?? 0, desc: 'Jeep, transfer, guia, etc.', color: '#D97706' },
    { href: '/admin/negocio/fotografia', label: 'Fotografia', count: pkgsCount ?? 0, desc: 'Pacotes fotográficos', color: '#8B5CF6' },
    { href: '/admin/parceiros', label: 'Parceiros', count: partnersCount ?? 0, desc: 'Estabelecimentos cadastrados', color: '#059669' },
  ]

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--ocean-deep)', marginBottom: '0.5rem' }}>
        Estabelecimentos
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Gerencie todos os produtos e parceiros da plataforma.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {sections.map(({ href, label, count, desc, color }) => (
          <Link key={href} href={href} style={{ textDecoration: 'none' }}>
            <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderTop: `4px solid ${color}` }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color, marginBottom: '0.25rem' }}>{count}</div>
              <div style={{ fontWeight: 700, color: 'var(--ocean-deep)', marginBottom: '0.25rem' }}>{label}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
