import { requireSuperAdmin } from '@/lib/admin-auth'
import { RoadmapClient } from './roadmap-client'

export default async function RoadmapPage() {
  await requireSuperAdmin()
  return <RoadmapClient />
}
