import React from 'react'
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

  const navItems: { href: string; label: string; icon: React.ReactNode }[] = [
    { href: '/parceiros/dashboard', label: 'Visão geral', icon: '◈' },
    { href: '/parceiros/dashboard/reservas', label: 'Reservas', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> },
    { href: '/parceiros/dashboard/financeiro', label: 'Financeiro', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
    ...(partner?.type === 'hospedagem' ? [{ href: '/parceiros/dashboard/disponibilidade', label: 'Disponibilidade', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> }] : []),
    { href: '/parceiros/dashboard/perfil', label: 'Perfil', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  ]

  return (
    <div className="parceiro-layout" style={{ display: 'flex', minHeight: '100vh', fontFamily: 'var(--font-jakarta)' }}>
      <style>{`
        @media (max-width: 767px) {
          .parceiro-sidebar { width: 100% !important; flex-direction: row !important; align-items: center; flex-wrap: wrap; }
          .parceiro-sidebar nav { display: flex !important; flex-direction: row !important; overflow-x: auto; flex: unset !important; padding: 0 !important; }
          .parceiro-sidebar nav a { padding: 0.75rem 1rem !important; font-size: 0.8rem !important; flex-direction: column; gap: 0.25rem !important; text-align: center; }
          .parceiro-layout { flex-direction: column !important; }
        }
      `}</style>
      {/* Sidebar */}
      <aside className="parceiro-sidebar" style={{
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
