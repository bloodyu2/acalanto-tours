import { createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function createService(formData: FormData) {
  'use server'
  const supabase = await createAdminClient()
  const pricingType = formData.get('pricing_type') as 'per_person' | 'per_group'
  const ppRaw = formData.get('price_cents_per_person') as string
  const pgRaw = formData.get('price_cents_group') as string

  await supabase.from('services').insert({
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    description: (formData.get('description') as string) || null,
    pricing_type: pricingType,
    price_cents_per_person: pricingType === 'per_person' && ppRaw ? Math.round(Number(ppRaw) * 100) : null,
    price_cents_group: pricingType === 'per_group' && pgRaw ? Math.round(Number(pgRaw) * 100) : null,
    price_label: (formData.get('price_label') as string) || null,
    capacity_max: formData.get('capacity_max') ? Number(formData.get('capacity_max')) : null,
    cover_image: (formData.get('cover_image') as string) || null,
    active: formData.get('active') === 'on',
    display_order: Number(formData.get('display_order') || 99),
  })
  redirect('/admin/negocio/servicos')
}

export default function NovoServicoPage() {
  return (
    <div style={{ padding: '2rem', maxWidth: '640px' }}>
      <Link href="/admin/negocio/servicos" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none' }}>← Serviços</Link>
      <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--ocean-deep)', margin: '0.5rem 0 1.5rem' }}>Novo Serviço</h1>
      <form action={createService} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div className="form-group">
          <label className="form-label">Nome *</label>
          <input className="form-input" name="name" required placeholder="ex: Passeio de Jeep" />
        </div>
        <div className="form-group">
          <label className="form-label">Slug * (URL)</label>
          <input className="form-input" name="slug" required placeholder="ex: passeio-de-jeep" />
        </div>
        <div className="form-group">
          <label className="form-label">Descrição</label>
          <textarea className="form-input" name="description" rows={3} style={{ resize: 'vertical' }} />
        </div>
        <div className="form-group">
          <label className="form-label">Tipo de precificação *</label>
          <select className="form-input" name="pricing_type" required>
            <option value="per_person">Por pessoa</option>
            <option value="per_group">Por grupo</option>
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Preço por pessoa (R$)</label>
            <input className="form-input" name="price_cents_per_person" type="number" step="0.01" placeholder="80.00" />
          </div>
          <div className="form-group">
            <label className="form-label">Preço por grupo (R$)</label>
            <input className="form-input" name="price_cents_group" type="number" step="0.01" placeholder="500.00" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Label de preço (exibição)</label>
          <input className="form-input" name="price_label" placeholder="ex: A partir de R$ 80" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Capacidade máx.</label>
            <input className="form-input" name="capacity_max" type="number" placeholder="ex: 8" />
          </div>
          <div className="form-group">
            <label className="form-label">Ordem de exibição</label>
            <input className="form-input" name="display_order" type="number" defaultValue="99" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Imagem de capa (URL)</label>
          <input className="form-input" name="cover_image" type="url" placeholder="https://..." />
        </div>
        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="checkbox" name="active" defaultChecked /> Ativo
          </label>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="submit" className="btn-primary">Criar Serviço</button>
          <Link href="/admin/negocio/servicos" className="btn-outline" style={{ textDecoration: 'none' }}>Cancelar</Link>
        </div>
      </form>
    </div>
  )
}
