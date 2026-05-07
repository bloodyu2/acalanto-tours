import { createAdminClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const PARTNER_TYPES = [
  { value: 'boat', label: 'Embarcação' },
  { value: 'photo', label: 'Fotografia' },
  { value: 'jeep', label: 'Jeep' },
  { value: 'guide', label: 'Guia Turístico' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'hotel', label: 'Hotel / Pousada' },
  { value: 'other', label: 'Outro' },
]

async function updatePartner(id: string, formData: FormData) {
  'use server'
  const supabase = await createAdminClient()
  await supabase.from('partners').update({
    name: formData.get('name') as string,
    type: formData.get('type') as string,
    email: (formData.get('email') as string) || null,
    phone: (formData.get('phone') as string) || null,
    notes: (formData.get('notes') as string) || null,
    internal_rating: formData.get('internal_rating') ? Number(formData.get('internal_rating')) : null,
    active: formData.get('active') === 'on',
    asaas_wallet_id: (formData.get('asaas_wallet_id') as string) || null,
    commission_pct: formData.get('commission_pct') ? Number(formData.get('commission_pct')) : 90,
  }).eq('id', id)
  redirect('/admin/parceiros')
}

export default async function EditParceiroPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createAdminClient()
  const { data: partner } = await supabase.from('partners').select('*').eq('id', id).single()
  if (!partner) notFound()

  const update = updatePartner.bind(null, id)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const authUserId = (partner as any).auth_user_id as string | null

  return (
    <div style={{ padding: '2rem', maxWidth: '600px' }}>
      <Link href="/admin/parceiros" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none' }}>← Parceiros</Link>
      <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--ocean-deep)', margin: '0.5rem 0 1.5rem' }}>
        Editar: {partner.name}
      </h1>
      {authUserId && (
        <div style={{ background: '#f0fff4', border: '1px solid #c6f6d5', borderRadius: '8px', padding: '0.625rem 1rem', color: '#276749', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
          ✓ Conta de acesso vinculada — parceiro pode acessar o portal
        </div>
      )}
      {!authUserId && partner.email && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '0.625rem 1rem', color: '#92400e', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
          ⏳ Convite pendente — o parceiro ainda não aceitou o convite
        </div>
      )}
      <form action={update} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div className="form-group">
          <label className="form-label">Nome *</label>
          <input className="form-input" name="name" required defaultValue={partner.name} />
        </div>
        <div className="form-group">
          <label className="form-label">Tipo *</label>
          <select className="form-input" name="type" required defaultValue={partner.type}>
            {PARTNER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">E-mail</label>
          <input className="form-input" name="email" type="email" defaultValue={partner.email ?? ''} />
        </div>
        <div className="form-group">
          <label className="form-label">Telefone</label>
          <input className="form-input" name="phone" defaultValue={partner.phone ?? ''} />
        </div>
        <div className="form-group">
          <label className="form-label">Avaliação interna (0–5)</label>
          <input className="form-input" name="internal_rating" type="number" min="0" max="5" step="0.1" defaultValue={partner.internal_rating ?? ''} />
        </div>
        <div className="form-group">
          <label className="form-label">Notas internas</label>
          <textarea className="form-input" name="notes" rows={3} style={{ resize: 'vertical' }} defaultValue={partner.notes ?? ''} />
        </div>
        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="checkbox" name="active" defaultChecked={partner.active} /> Ativo
          </label>
        </div>

        {/* ── Configuração de Pagamento ASAAS ── */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', marginTop: '0.25rem' }}>
          <p style={{ fontWeight: 600, color: 'var(--ocean-deep)', marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Configuração de Pagamento ASAAS
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">ASAAS Wallet ID</label>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <input className="form-input" name="asaas_wallet_id" type="text" placeholder="wallet_xxxxxxxxxxxxxxxx" defaultValue={(partner as any).asaas_wallet_id ?? ''} />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                ID da carteira ASAAS do parceiro para recebimento de comissões via split.
              </p>
            </div>
            <div className="form-group">
              <label className="form-label">Comissão do parceiro (%)</label>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <input className="form-input" name="commission_pct" type="number" min="1" max="99" step="1" defaultValue={(partner as any).commission_pct ?? 90} />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Percentual repassado ao parceiro (padrão: 90%). O restante fica com a Acalanto Tours.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="submit" className="btn-primary">Salvar Alterações</button>
          <Link href="/admin/parceiros" className="btn-outline" style={{ textDecoration: 'none' }}>Cancelar</Link>
        </div>
      </form>
    </div>
  )
}
