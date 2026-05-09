import { createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FEATURE_LABELS } from '@/lib/constants'
import Link from 'next/link'
import ImageUploader from '@/components/admin/ImageUploader'

export const dynamic = 'force-dynamic'

async function createBoat(formData: FormData) {
  'use server'
  const supabase = await createAdminClient()
  const features = formData.getAll('features') as string[]
  const itineraryRaw = (formData.get('itinerary') as string) || '[]'
  let itinerary: unknown[] = []
  try { itinerary = JSON.parse(itineraryRaw) } catch { itinerary = [] }

  await supabase.from('boats').insert({
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    tagline: (formData.get('tagline') as string) || null,
    description: (formData.get('description') as string) || null,
    departure_time: formData.get('departure_time') as string,
    duration_hours: Number(formData.get('duration_hours')),
    price_adult: Math.round(Number(formData.get('price_adult')) * 100),
    price_child: Math.round(Number(formData.get('price_child')) * 100),
    capacity_max: Number(formData.get('capacity_max')),
    capacity_min: Number(formData.get('capacity_min') || 1),
    child_free_until_age: Number(formData.get('child_free_until_age') || 5),
    child_half_until_age: Number(formData.get('child_half_until_age') || 12),
    cover_image: (formData.get('cover_image') as string) || null,
    features,
    itinerary,
    active: formData.get('active') === 'on',
    display_order: Number(formData.get('display_order') || 99),
  })
  redirect('/admin/negocio/escunas')
}

export default function NovaEscunaPage() {
  return (
    <div style={{ padding: '2rem', maxWidth: '720px' }}>
      <Link href="/admin/negocio/escunas" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none' }}>← Escunas</Link>
      <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--ocean-deep)', margin: '0.5rem 0 1.5rem' }}>Nova Escuna</h1>
      <form action={createBoat} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div className="form-group">
          <label className="form-label">Nome *</label>
          <input className="form-input" name="name" required placeholder="ex: Ilha Rasa IV" />
        </div>
        <div className="form-group">
          <label className="form-label">Slug * (URL)</label>
          <input className="form-input" name="slug" required placeholder="ex: ilha-rasa-iv" />
        </div>
        <div className="form-group">
          <label className="form-label">Tagline</label>
          <input className="form-input" name="tagline" placeholder="Uma frase curta de destaque" />
        </div>
        <div className="form-group">
          <label className="form-label">Descrição</label>
          <textarea className="form-input" name="description" rows={4} style={{ resize: 'vertical' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Horário de saída *</label>
            <input className="form-input" name="departure_time" type="time" required defaultValue="10:30" />
          </div>
          <div className="form-group">
            <label className="form-label">Duração (horas) *</label>
            <input className="form-input" name="duration_hours" type="number" step="0.5" required defaultValue="5" />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Preço Adulto (R$) *</label>
            <input className="form-input" name="price_adult" type="number" step="0.01" required defaultValue="110" />
          </div>
          <div className="form-group">
            <label className="form-label">Preço Criança (R$) *</label>
            <input className="form-input" name="price_child" type="number" step="0.01" required defaultValue="55" />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Cap. máx *</label>
            <input className="form-input" name="capacity_max" type="number" required defaultValue="40" />
          </div>
          <div className="form-group">
            <label className="form-label">Cap. mín</label>
            <input className="form-input" name="capacity_min" type="number" defaultValue="1" />
          </div>
          <div className="form-group">
            <label className="form-label">Grátis até (anos)</label>
            <input className="form-input" name="child_free_until_age" type="number" defaultValue="5" />
          </div>
          <div className="form-group">
            <label className="form-label">Meia até (anos)</label>
            <input className="form-input" name="child_half_until_age" type="number" defaultValue="12" />
          </div>
        </div>
        <ImageUploader name="cover_image" />
        <div className="form-group">
          <label className="form-label">Destaques</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
            {Object.entries(FEATURE_LABELS).map(([key, label]) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                <input type="checkbox" name="features" value={key} /> {label}
              </label>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Roteiro (JSON)</label>
          <textarea className="form-input" name="itinerary" rows={4} style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '0.82rem' }}
            placeholder={'[{"stop":"Ilha dos Cocos","minutes":40},{"stop":"Praia da Lula","minutes":60}]'} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Array de objetos com &quot;stop&quot; e &quot;minutes&quot;</span>
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
          <button type="submit" className="btn-primary">Criar Escuna</button>
          <Link href="/admin/negocio/escunas" className="btn-outline" style={{ textDecoration: 'none' }}>Cancelar</Link>
        </div>
      </form>
    </div>
  )
}
