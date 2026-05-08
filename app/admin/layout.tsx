'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { ReactNode } from 'react'

const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
)
const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const AnchorNavIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="3"/><line x1="12" y1="8" x2="12" y2="22"/>
    <path d="M5 12H2a10 10 0 0020 0h-3"/>
  </svg>
)
const MoneyNavIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
  </svg>
)
const MailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
)
const StarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)
const HandshakeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.42 4.58a5.4 5.4 0 00-7.65 0l-.77.78-.77-.78a5.4 5.4 0 00-7.65 7.65l1.06 1.06L12 21.23l7.36-7.94 1.06-1.06a5.4 5.4 0 000-7.65z"/>
  </svg>
)
const ChatIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
  </svg>
)
const RoadmapIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
)
const BlogIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
  </svg>
)
const BriefcaseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/>
    <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
  </svg>
)
const SlidesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
)
const PaletteIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/>
    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>
    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 011.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
  </svg>
)

const navItems: Array<{ href: string; label: string; icon: ReactNode }> = [
  { href: '/admin', label: 'Dashboard', icon: <DashboardIcon /> },
  { href: '/admin/negocio', label: 'Negócios', icon: <BriefcaseIcon /> },
  { href: '/admin/reservas', label: 'Reservas', icon: <CalendarIcon /> },
  { href: '/admin/capacidade', label: 'Capacidade', icon: <AnchorNavIcon /> },
  { href: '/admin/repasses', label: 'Repasses', icon: <MoneyNavIcon /> },
  { href: '/admin/contatos', label: 'Contatos', icon: <MailIcon /> },
  { href: '/admin/nps', label: 'NPS', icon: <StarIcon /> },
  { href: '/admin/parceiros', label: 'Parceiros', icon: <HandshakeIcon /> },
  { href: '/admin/depoimentos', label: 'Depoimentos', icon: <ChatIcon /> },
  { href: '/admin/blog', label: 'Blog', icon: <BlogIcon /> },
  { href: '/admin/roadmap',       label: 'Roadmap',          icon: <RoadmapIcon /> },
  { href: '/admin/apresentacoes', label: 'Apresentações',    icon: <SlidesIcon /> },
  { href: '/admin/identidade',    label: 'Identidade Visual', icon: <PaletteIcon /> },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  // Stable ref so createClient() isn't called on every render
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current

  useEffect(() => {
    // onAuthStateChange fires immediately with current session state —
    // more reliable than getSession() alone right after login
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace('/admin/login')
      } else {
        setAuthed(true)
      }
    })
    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Close sidebar on route change (mobile)
  useEffect(() => { setSidebarOpen(false) }, [pathname])

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

  const SidebarContent = () => (
    <>
      <div style={{ padding: '1.5rem 1.5rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.125rem', fontWeight: 700, color: 'white', marginBottom: '0.25rem' }}>
            Acalanto Turismo
          </div>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Painel Admin
          </div>
        </div>
        {/* Close button — only visible on mobile via CSS */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="admin-sidebar-close"
          aria-label="Fechar menu"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', padding: '0.25rem', display: 'none' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
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
    </>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'var(--font-jakarta)', flexDirection: 'column' }}>

      {/* Mobile top bar */}
      <div className="admin-mobile-header">
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir menu"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', padding: '0.375rem', display: 'flex', alignItems: 'center' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <span style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, fontSize: '1rem', color: 'white' }}>
          Acalanto Admin
        </span>
        <div style={{ width: 34 }} /> {/* spacer */}
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Overlay */}
        <div
          className={`admin-sidebar-overlay${sidebarOpen ? ' open' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Sidebar */}
        <aside
          className={`admin-sidebar${sidebarOpen ? ' open' : ''}`}
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          <SidebarContent />
        </aside>

        {/* Main */}
        <main className="admin-main" style={{ flex: 1, background: '#f7f9fc', overflow: 'auto', padding: '2rem' }}>
          {children}
        </main>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .admin-sidebar-close { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
