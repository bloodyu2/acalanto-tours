import { getAdminUser, type AdminRole } from '@/lib/admin-auth'
import AdminLayoutClient from './_components/AdminLayoutClient'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let role: AdminRole | null = null
  let userName: string | null = null
  try {
    const adminUser = await getAdminUser()
    role = adminUser?.role ?? null
    userName = adminUser?.display_name ?? null
  } catch {
    // Not authenticated — the client layout will redirect to /admin/login.
  }

  return (
    <AdminLayoutClient role={role} userName={userName}>
      {children}
    </AdminLayoutClient>
  )
}
