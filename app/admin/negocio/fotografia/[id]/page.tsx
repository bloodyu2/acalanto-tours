import { createAdminClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import ImageUploader from '@/components/admin/ImageUploader'
import GalleryManager from '@/components/admin/GalleryManager'

export const dynamic = 'force-dynamic'

async function updatePackage(id: string, formData: FormData) {
  'use server'
  const supabase = await createAdminClient()
  const includesRaw = (formData.get('includes') as string) || ''
  const includes = includesRaw.split('\n').map(s => s.trim()).filter(Boolean)
  const priceRaw = formData.get('price_cents') as string

  await supabase.from('photographer_packages').update({
    partner_id: formData.get('partner_id') as string,
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || null,
    price_label: (formData.get('price_label') as string) || null,
    price_cents: priceRaw ? Math.round(Number(priceRaw) * 100) : null,
    duration_label: (formData.get('duration_label') as string) || null,
    cover_image: (formData.get('cover_image') as string) || null,
    includes,
    active: formData.get('active') === 'on',
    display_order: Number(formData.get('display_order') || 99),
  }).eq('id', id)
  redirect('/admin/negocio/fotografia')
}

export default async function EditPacotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createAdminClient()
  const [{ data: pkg }, { data: partners }, { data: galleryImages }] = await Promise.all([
    supabase.from('photographer_packages').select('*').eq('id', id).single(),
    supabase.from('partners').select('id, name').eq('active', true),
    supabase.from('gallery').select('id, url, alt_text, display_order').eq('photographer_package_id', id).order('display_order'),
  ])
  if (!pkg) notFound()

  const update = updatePackage.bind(null, id)
  const includesStr = (pkg.includes ?? []).join('\n')

  return (
    <div style={{ padding: '2rem', maxWidth: '640px' }}>
      <Link href="/admin/negocio/fotografia" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none' }}>← Fotografia</Link>
      <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--ocean-deep)', margin: '0.5rem 0 1.5rem' }}>Editar: {pkg.name}</h1>
      <form action={update} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div className="form-group">
          <label className="form-label">Parceiro (fotógrafo) *</label>
          <select className="form-input" name="partner_id" required defaultValue={pkg.partner_id}>
            {(partners ?? []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Nome do pacote *</label>
          <input className="form-input" name="name" required defaultValue={pkg.name} />
        </div>
        <div className="form-group">
          <label className="form-label">Descrição</label>
          <textarea className="form-input" name="description" rows={3} style={{ resize: 'vertical' }} defaultValue={pkg.description ?? ''} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Preço (R$)</label>
            <input className="form-input" name="price_cents" type="number" step="0.01" defaultValue={pkg.price_cents ? pkg.price_cents / 100 : ''} />
          </div>
          <div className="form-group">
            <label className="form-label">Label de preço</label>
            <input className="form-input" name="price_label" defaultValue={pkg.price_label ?? ''} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Duração estimada</label>
          <input className="form-input" name="duration_label" defaultValue={pkg.duration_label ?? ''} />
        </div>
        <div className="form-group">
          <label className="form-label">O que inclui (um item por linha)</label>
          <textarea className="form-input" name="includes" rows={4} style={{ resize: 'vertical' }} defaultValue={includesStr} />
        </div>
        <ImageUploader name="cover_image" currentUrl={pkg.cover_image} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Ordem de exibição</label>
            <input className="form-input" name="display_order" type="number" defaultValue={pkg.display_order} />
          </div>
          <div className="form-group" style={{ paddingTop: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" name="active" defaultChecked={pkg.active} /> Ativo
            </label>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="submit" className="btn-primary">Salvar Alterações</button>
          <Link href="/admin/negocio/fotografia" className="btn-outline" style={{ textDecoration: 'none' }}>Cancelar</Link>
        </div>
      </form>

      {/* Gallery — managed independently */}
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginTop: '1.5rem' }}>
        <GalleryManager entityField="photographer_package_id" entityId={id} initialImages={galleryImages ?? []} label="Portfólio de fotos" />
      </div>
    </div>
  )
}
