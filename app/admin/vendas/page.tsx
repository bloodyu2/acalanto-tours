import { getAdminUser } from '@/lib/admin-auth'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { getEnabledVerticals } from '@/lib/pdv/role-permissions'
import PdvWizard from '@/components/admin/pdv/PdvWizard'
import type { PdvBoat } from '@/components/admin/pdv/PdvWizard'

export const dynamic = 'force-dynamic'

export default async function VendasPage() {
  const user = await getAdminUser()
  if (!user) redirect('/admin/login')

  const allowedRoles = ['super_admin', 'pdv', 'tripulacao', 'fotografo'] as const
  if (!allowedRoles.includes(user.role)) redirect('/admin')

  const verticals = await getEnabledVerticals(user.role)

  const sb = await createAdminClient()
  const [{ data: boats }, { data: photoPkgs }, { data: services }] = await Promise.all([
    sb.from('boats').select('id, name, slug, price_adult, price_child').eq('active', true).order('display_order'),
    sb.from('photographer_packages').select('id, name, slug, price_cents, cover_image').eq('active', true).order('display_order'),
    sb.from('services').select('id, name, slug, price_cents').eq('active', true).order('display_order'),
  ])

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--ocean-deep)', marginBottom: '1.5rem' }}>
        Nova venda
      </h1>
      <PdvWizard
        verticals={verticals}
        boats={(boats ?? []) as PdvBoat[]}
        photographers={photoPkgs ?? []}
        services={services ?? []}
        sellerRole={user.role}
      />
    </div>
  )
}
