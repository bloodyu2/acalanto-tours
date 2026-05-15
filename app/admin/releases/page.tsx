import { requireSuperAdmin } from '@/lib/admin-auth'
import { ReleasesClient } from './releases-client'

export default async function ReleasesPage() {
  await requireSuperAdmin()
  return <ReleasesClient />
}
