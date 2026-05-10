import { createAdminClient } from '@/lib/supabase/server'
import { getAdminUser, canAccessRoute } from '@/lib/admin-auth'
import { redirect } from 'next/navigation'
import PdvWizard, { type PdvBoat } from '@/components/admin/pdv/PdvWizard'

export const dynamic = 'force-dynamic'

export default async function VendasPage() {
  const adminUser = await getAdminUser()
  if (!adminUser) redirect('/admin/login')
  if (!canAccessRoute(adminUser.role, '/admin/vendas')) redirect('/admin')

  const supabase = await createAdminClient()
  const { data: boats } = await supabase
    .from('boats')
    .select('id, name, price_adult, price_child, slug')
    .eq('active', true)
    .order('name')

  const boatList: PdvBoat[] = (boats ?? []).map(b => ({
    id: b.id,
    name: b.name,
    price_adult: b.price_adult ?? 11000,
    price_child: b.price_child ?? Math.round((b.price_adult ?? 11000) / 2),
    slug: b.slug,
  }))

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--ocean-deep)', marginBottom: '0.5rem' }}>
        PDV — Nova Venda Presencial
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
        Venda diretamente em campo. O cliente paga por PIX ou cartão.
      </p>
      <PdvWizard boats={boatList} />
    </div>
  )
}
