'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: 'Início', icon: (active: boolean) => (
    <svg fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline strokeLinecap="round" strokeLinejoin="round" points="9 22 9 12 15 12 15 22"/>
    </svg>
  )},
  { href: '/passeios', label: 'Passeios', icon: (active: boolean) => (
    <svg fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 17h18M3 17a9 9 0 0 1 9-9 9 9 0 0 1 9 9M8 17V9.5"/>
    </svg>
  )},
  { href: '/fotografia', label: 'Foto', icon: (active: boolean) => (
    <svg fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 0 2-2l2-3h10l2 3a2 2 0 0 0 2 2v11z"/>
      <circle cx="12" cy="13" r="4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )},
  { href: '/conta', label: 'Conta', icon: (active: boolean) => (
    <svg fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )},
]

export default function MobileBottomNav() {
  const pathname = usePathname()
  return (
    <nav className="mobile-bottom-nav" aria-label="Navegação principal mobile">
      {navItems.map(({ href, label, icon }) => {
        const active = pathname === href || (href !== '/' && pathname.startsWith(href))
        return (
          <Link key={href} href={href} className={`mobile-bottom-nav-item${active ? ' active' : ''}`}>
            {icon(active)}
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
