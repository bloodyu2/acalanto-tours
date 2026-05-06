'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/reservas', label: 'Reservas', icon: '📅' },
  { href: '/admin/capacidade', label: 'Capacidade', icon: '⚓' },
  { href: '/admin/repasses', label: 'Repasses', icon: '💰' },
  { href: '/admin/contatos', label: 'Contatos', icon: '📧' },
  { href: '/admin/nps', label: 'NPS', icon: '⭐' },
  { href: '/admin/parceiros', label: 'Parceiros', icon: '🤝' },
  { href: '/admin/depoimentos', label: 'Depoimentos', icon: '💬' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace('/admin/login')
      } else {
        setAuthed(true)
      }
    })
  }, [supabase, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/admin/login')
  }

  if (pathname === '/admin/login') return <>{children}</>
  if (authed === null) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--text-muted)' }}>Verificando acesso…</p>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'var(--font-jakarta)' }}>
      {/* Sidebar */}
      <aside className="admin-sidebar" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem 1.5rem 1rem' }}>
          <div style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', fontWeight: 700, color: 'white', marginBottom: '0.25rem' }}>
            Acalanto Tours
          </div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Painel Admin
          </div>
        </div>
        <nav style={{ flex: 1, padding: '0.5rem 0' }}>
          {navItems.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className={`admin-nav-item ${pathname === href ? 'active' : ''}`}
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
          <button
            onClick={handleLogout}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.55)', cursor: 'pointer', fontSize: '0.875rem', padding: 0 }}
          >
            Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, background: '#f7f9fc', overflow: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
