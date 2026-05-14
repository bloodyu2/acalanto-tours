'use server'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { requireSuperAdmin } from '@/lib/admin-auth'

export async function updatePermission(role: string, vertical: string, enabled: boolean, priority: number) {
  await requireSuperAdmin()
  const sb = await createAdminClient()
  const { error } = await sb
    .from('admin_role_permissions')
    .upsert(
      { role, vertical, enabled, priority, updated_at: new Date().toISOString() },
      { onConflict: 'role,vertical' }
    )
  if (error) throw new Error(error.message)
  revalidatePath('/admin/configuracoes')
}
