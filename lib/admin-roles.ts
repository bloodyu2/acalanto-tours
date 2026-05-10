// Client-safe role types and navigation map. No server imports here.
// Keep this file separate from lib/admin-auth.ts because admin-auth.ts uses
// next/headers (Server Component only) and Client Components cannot import it.

export type AdminRole = 'super_admin' | 'pdv' | 'tripulacao' | 'fotografo'

export const ROLE_NAV: Record<AdminRole, string[]> = {
  super_admin: [
    '/admin',
    '/admin/negocio',
    '/admin/reservas',
    '/admin/vendas',
    '/admin/capacidade',
    '/admin/repasses',
    '/admin/contatos',
    '/admin/nps',
    '/admin/parceiros',
    '/admin/depoimentos',
    '/admin/blog',
    '/admin/roadmap',
    '/admin/apresentacoes',
    '/admin/identidade',
  ],
  pdv: ['/admin/vendas'],
  tripulacao: ['/admin/capacidade', '/admin/reservas'],
  fotografo: ['/admin/capacidade'],
}

export function canAccessRoute(role: AdminRole, pathname: string): boolean {
  const allowed = ROLE_NAV[role] ?? []
  return allowed.some(r => pathname === r || pathname.startsWith(r + '/'))
}
