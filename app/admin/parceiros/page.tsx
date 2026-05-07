import { createAdminClient } from '@/lib/supabase/server'
import ApprovalTabs from './ApprovalTabs'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const BoatIco = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20a2 2 0 002 2h16a2 2 0 002-2"/><path d="M4 20l4-12h8l4 12"/><line x1="12" y1="2" x2="12" y2="8"/><path d="M8 8h8"/></svg>)
const PhotoIco = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>)
const JeepIco = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v9a2 2 0 01-2 2h-2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>)
const CompassIco = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>)
const VanIco = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>)
const HouseIco = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>)
const DotIco = () => (<svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor"><circle cx="4" cy="4" r="3"/></svg>)

export default async function AdminParceirosPage() {
  const supabase = await createAdminClient()

  const [
    { data: partners },
    { data: candidacies },
    { data: pendingListings },
    { data: pendingClaims },
  ] = await Promise.all([
    supabase.from('partners').select('*').order('name'),
    supabase.from('contacts').select('*').eq('source', 'candidatura-parceiro').order('created_at', { ascending: false }).limit(50),
    supabase
      .from('partner_listings')
      .select('id, title, slug, type, status, created_at, partner_id, partners(name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false }),
    supabase
      .from('partners')
      .select('id, name, type, submitted_at, claimed_by, status')
      .not('claimed_by', 'is', null)
      .eq('status', 'pending')
      .order('submitted_at', { ascending: false }),
  ])

  const typeLabels: Record<string, string> = {
    boat: 'Embarcacao', photo: 'Fotografia', jeep: 'Jeep',
    guide: 'Guia', transfer: 'Transfer', hotel: 'Hotel', other: 'Outro',
  }
  const typeIconNodes: Record<string, React.ReactNode> = {
    boat: <BoatIco />, photo: <PhotoIco />, jeep: <JeepIco />, guide: <CompassIco />, transfer: <VanIco />, hotel: <HouseIco />, other: <DotIco />,
  }

  // Normalize listings for client component
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const listings = (pendingListings ?? []).map((l: any) => ({
    id: l.id,
    title: l.title,
    slug: l.slug,
    type: l.type,
    status: l.status,
    created_at: l.created_at,
    partner_name: l.partners?.name ?? '—',
  }))

  const claims = (pendingClaims ?? []).map(c => ({
    id: c.id,
    name: c.name,
    type: c.type,
    submitted_at: c.submitted_at,
    claimed_by: c.claimed_by,
    status: c.status,
  }))

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--ocean-deep)' }}>Parceiros</h1>
        <Link href="/admin/parceiros/novo" className="btn-primary" style={{ textDecoration: 'none', padding: '0.625rem 1.25rem', fontSize: '0.875rem' }}>
          + Novo Parceiro
        </Link>
      </div>

      {/* Partners grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '3rem' }}>
        {partners?.map(p => (
          <div key={p.id} style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div>
                <p style={{ fontWeight: 700, color: 'var(--ocean-deep)', fontSize: '1rem' }}>{p.name}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--ocean-mid)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  {typeIconNodes[p.type] || null} {typeLabels[p.type] || p.type}
                </p>
              </div>
              <span style={{
                background: p.active ? '#38a16920' : '#a0aec020',
                color: p.active ? '#38a169' : '#a0aec0',
                fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: '999px',
              }}>
                {p.active ? 'Ativo' : 'Inativo'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.75rem' }}>
              <span style={{ color: 'var(--sunset)', fontSize: '1rem' }}>★</span>
              <span style={{ fontWeight: 700, color: 'var(--ocean-deep)' }}>{Number(p.internal_rating).toFixed(1)}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>avaliação interna</span>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {p.email && <span>Email: {p.email}</span>}
              {p.phone && <span>Tel: {p.phone}</span>}
              {p.notes && <span style={{ fontStyle: 'italic', marginTop: '0.375rem' }}>&ldquo;{p.notes}&rdquo;</span>}
            </div>
            <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
              <Link href={`/admin/parceiros/${p.id}`} style={{ fontSize: '0.8rem', color: 'var(--ocean-mid)', fontWeight: 600, textDecoration: 'none' }}>
                Editar →
              </Link>
            </div>
          </div>
        ))}
        {(!partners || partners.length === 0) && (
          <div style={{ background: 'white', borderRadius: '1rem', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Nenhum parceiro cadastrado ainda.
          </div>
        )}
      </div>

      {/* Approval Queues */}
      <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', color: 'var(--ocean-deep)', marginBottom: '1rem' }}>
        Fila de Aprovacao
      </h2>
      <ApprovalTabs listings={listings} claims={claims} />

      {/* Candidacies section */}
      <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', color: 'var(--ocean-deep)', marginBottom: '1rem', marginTop: '3rem' }}>
        Contatos de interesse ({(candidacies ?? []).length})
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 0.875 + 'rem', marginBottom: '1.25rem' }}>
        Mensagens recebidas via formulario de candidatura de parceiro.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {(candidacies ?? []).map(c => (
          <div key={c.id} style={{
            background: 'white', borderRadius: '1rem', padding: '1.25rem 1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            borderLeft: '4px solid var(--ocean-mid)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div>
                <p style={{ fontWeight: 700, color: 'var(--ocean-deep)' }}>{c.name}</p>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {c.email && <span>Email: {c.email}</span>}
                  {c.phone && <span>Tel: {c.phone}</span>}
                </div>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {new Date(c.created_at!).toLocaleDateString('pt-BR')}
              </span>
            </div>
            {c.message && <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{c.message}</p>}
          </div>
        ))}
        {(!candidacies || candidacies.length === 0) && (
          <div style={{ background: 'white', borderRadius: '1rem', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Nenhuma candidatura recebida ainda.
          </div>
        )}
      </div>
    </div>
  )
}
