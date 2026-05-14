import { requireSuperAdmin } from '@/lib/admin-auth'
import { IdentidadeContent } from './identidade-content'

export default async function IdentidadePage() {
  await requireSuperAdmin()
  return <IdentidadeContent />
}
