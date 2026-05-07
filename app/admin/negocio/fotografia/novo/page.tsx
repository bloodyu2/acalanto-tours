import { createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function createPackage(formData: FormData) {
  'use server'
  const supabase = await createAdminClient()
  const includesRaw = (formData.get('includes') as string) || ''
  const includes = includesRaw.split('\n').map(s => s.trim()).filter(Boolean)
  const priceRaw = formData.get('price_cents') as string

  await supabase.from('photographer_packages').insert({
    partner_id: formData.get('partner_id') as string,
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    description: (formData.get('description') as string) || null,
    price_label: (formData.get('price_label') as string) || null,
    price_cents: priceRaw ? Math.round(Number(priceRaw) * 100) : null,
    duration_label: (formData.get('duration_label') as string) || null,
    cover_image: (formData.get('cover_image') as string) || null,
    includes,
    active: formData.get('active') === 'on',
    display_order: Number(formData.get('display_order') || 99),
  })
  redirect('/admin/negocio/fotografia')
}

export default async function NovoPacotePage() {
  const supabase = await createAdminClient()
  const { data: partners } = await supabase.from('partners').select('id, name').eq('active', true)

  return (
    <div style={{ padding: '2rem', maxWidth: '640px' }}>
      <Link href="/admin/negocio/fotografia" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none' }}>← Fotografia</Link>
      <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--ocean-deep)', margin: '0.5rem 0 1.5rem' }}>Novo Pacote</h1>
      <form action={createPackage} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div className="form-group">
          <label className="form-label">Parceiro (fotógrafo) *</label>
          <select className="form-input" name="partner_id" required>
            <option value="">Selecionar…</option>
            {(partners ?? []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Nome do pacote *</label>
          <input className="form-input" name="name" required placeholder="ex: Ensaio Casal" />
        </div>
        <div className="form-group">
          <label className="form-label">Slug * (URL)</label>
          <input className="form-input" name="slug" required placeholder="ex: ensaio-casal" />
        </div>
        <div className="form-group">
          <label className="form-label">Descrição</label>
          <textarea className="form-input" name="description" rows={3} style={{ resize: 'vertical' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Preço (R$)</label>
            <input className="form-input" name="price_cents" type="number" step="0.01" placeholder="800.00" />
          </div>
          <div className="form-group">
            <label className="form-label">Label de preço</label>
            <input className="form-input" name="price_label" placeholder="A partir de R$ 800" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Duração estimada</label>
          <input className="form-input" name="duration_label" placeholder="ex: 2 horas" />
        </div>
        <div className="form-group">
          <label className="form-label">O que inclui (um item por linha)</label>
          <textarea className="form-input" name="includes" rows={4} style={{ resize: 'vertical' }}
            placeholder={"30 fotos editadas\nEntrega em 7 dias\nArquivo digital em alta resolução"} />
        </div>
        <div className="form-group">
          <label className="form-label">Imagem de capa (URL)</label>
          <input className="form-input" name="cover_image" type="url" placeholder="https://..." />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Ordem de exibição</label>
            <input className="form-input" name="display_order" type="number" defaultValue="99" />
          </div>
          <div className="form-group" style={{ paddingTop: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" name="active" defaultChecked /> Ativo
            </label>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="submit" className="btn-primary">Criar Pacote</button>
          <Link href="/admin/negocio/fotografia" className="btn-outline" style={{ textDecoration: 'none' }}>Cancelar</Link>
        </div>
      </form>
    </div>
  )
}
