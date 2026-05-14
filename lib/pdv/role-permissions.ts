// lib/pdv/role-permissions.ts
import { createAdminClient } from '@/lib/supabase/server'
import type { AdminRole } from '@/lib/admin-roles'

export type Vertical = 'passeio' | 'fotografia' | 'servico' | 'hospedagem'

export interface EnabledVertical {
  vertical: Vertical
  priority: number
}

export async function getEnabledVerticals(role: AdminRole): Promise<EnabledVertical[]> {
  const sb = await createAdminClient()
  const { data, error } = await sb
    .from('admin_role_permissions')
    .select('vertical, priority')
    .eq('role', role)
    .eq('enabled', true)
    .order('priority', { ascending: false })

  if (error || !data) return []
  return data as EnabledVertical[]
}
