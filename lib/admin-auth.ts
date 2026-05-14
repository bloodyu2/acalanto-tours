// Server-only helpers. Do NOT import this from a Client Component — it pulls
// in next/headers via the supabase server client.
import { createAdminClient, createClient } from '@/lib/supabase/server'
import type { AdminRole } from './admin-roles'

export { ROLE_NAV, canAccessRoute, type AdminRole } from './admin-roles'

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

  if (superAdminEmails.length === 0) {
    console.error('[admin-auth] SUPER_ADMIN_EMAILS is not configured — access denied as a security precaution')
    return null
  }

  return null
}

export async function requireSuperAdmin() {
  const u = await getAdminUser()
  if (!u || u.role !== 'super_admin') {
    const { redirect } = await import('next/navigation')
    redirect('/admin')
  }
  return u
}
