import { requireSuperAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'
import PermissionsTable from './PermissionsTable'

export const dynamic = 'force-dynamic'

export default async function ConfiguracoesPage() {
  await requireSuperAdmin()
  const sb = await createAdminClient()
  const { data: perms } = await sb
    .from('admin_role_permissions')
    .select('role, vertical, enabled, priority')
    .order('role')
    .order('vertical')

  return (
    <div style={{ padding: '2rem', maxWidth: '900px' }}>
      <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--ocean-deep)', margin: '0 0 0.5rem' }}>
        Configurações
      </h1>
      <p style={{ color: 'var(--text-muted)', margin: '0 0 2rem' }}>
        Defina o que cada role pode vender no PDV.
      </p>
      <PermissionsTable rows={perms ?? []} />
    </div>
  )
}
