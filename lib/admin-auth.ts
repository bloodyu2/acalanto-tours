import { createAdminClient, createClient } from '@/lib/supabase/server'

export type AdminRole = 'super_admin' | 'pdv' | 'tripulacao' | 'fotografo'

export interface AdminUser {
  id: string
  email: string | null
  role: AdminRole
  display_name: string | null
}

export async function getAdminUser(): Promise<AdminUser | null> {
  const session = await createClient()
  const { data: { user } } = await session.auth.getUser()
  if (!user) return null

  const superAdminEmails = (process.env.SUPER_ADMIN_EMAILS ?? '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)

  if (user.email && superAdminEmails.includes(user.email.toLowerCase())) {
    return { id: user.id, email: user.email, role: 'super_admin', display_name: null }
  }

  const admin = await createAdminClient()
  const { data } = await admin
    .from('admin_users')
    .select('role, display_name')
    .eq('id', user.id)
    .maybeSingle()

  if (data) {
    return {
      id: user.id,
      email: user.email ?? null,
      role: data.role as AdminRole,
      display_name: data.display_name,
    }
  }

  // Fallback: when SUPER_ADMIN_EMAILS is not yet configured, any authenticated
  // admin user gets super_admin to preserve the legacy "any auth = full access"
  // behaviour. Set SUPER_ADMIN_EMAILS in Vercel to tighten this.
  if (superAdminEmails.length === 0) {
    return { id: user.id, email: user.email ?? null, role: 'super_admin', display_name: null }
  }

  return null
}

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
