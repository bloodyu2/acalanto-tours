import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function ParceiroDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/parceiros/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, partner_id, partners(name, type)')
    .eq('auth_user_id', session.user.id)
    .single()

  if (!profile || profile.role !== 'partner' || !profile.partner_id) {
    redirect('/parceiros/login')
  }

  const partner = Array.isArray(profile.partners)
    ? profile.partners[0]
    : profile.partners as { name: string; type: string } | null

  const navItems = [
    { href: '/parceiros/dashboard', label: 'Visão geral', icon: '◈' },
    { href: '/parceiros/dashboard/reservas', label: 'Reservas', icon: '📋' },
    { href: '/parceiros/dashboard/financeiro', label: 'Financeiro', icon: '💰' },
    ...(partner?.type === 'hospedagem' ? [{ href: '/parceiros/dashboard/disponibilidade', label: 'Disponibilidade', icon: '📅' }] : []),
    { href: '/parceiros/dashboard/perfil', label: 'Perfil', icon: '👤' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'var(--font-jakarta)' }}>
      {/* Sidebar */}
      <aside style={{
        width: '240px',
        background: 'var(--ocean-deep)',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{ padding: '1.5rem 1.5rem 1rem' }}>
          <div style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.125rem', fontWeight: 700, color: 'white', marginBottom: '0.2rem' }}>
            {partner?.name ?? 'Parceiro'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Portal do Parceiro
          </div>
        </div>
        <nav style={{ flex: 1, padding: '0.5rem 0' }}>
          {navItems.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1.5rem',
                color: 'rgba(255,255,255,0.75)',
                textDecoration: 'none',
                fontSize: '0.9rem',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Link href="/" style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', textDecoration: 'none', marginBottom: '0.75rem' }}>
            ← Ver site
          </Link>
          <form action="/api/auth/signout" method="post">
            <button type="submit" style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.875rem', padding: 0 }}>
              Sair
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, background: '#f7f9fc', overflow: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
