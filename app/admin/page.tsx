import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function formatCents(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const KpiCalendar = () => (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>)
const KpiCard = () => (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>)
const KpiClock = () => (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>)
const KpiStar = () => (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>)
const KpiMail = () => (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>)
const KpiChat = () => (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>)
const KpiHandshake = () => (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.42 4.58a5.4 5.4 0 00-7.65 0l-.77.78-.77-.78a5.4 5.4 0 00-7.65 7.65l1.06 1.06L12 21.23l7.36-7.94 1.06-1.06a5.4 5.4 0 000-7.65z"/></svg>)

export default async function AdminDashboard() {
  const supabase = await createAdminClient()

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [
    { count: totalBookings },
    { count: monthBookings },
    { count: pendingBookings },
    { count: contacts },
    { count: testimonials },
    { count: partners },
    { data: monthPayments },
    { data: npsData },
    { data: recentBookings },
    { data: recentContacts },
    { data: allPayments },
    { count: confirmedCount },
  ] = await Promise.all([
    supabase.from('bookings').select('*', { count: 'exact', head: true }),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).gte('created_at', monthStart),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).in('status', ['pending', 'whatsapp_initiated']),
    supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('read', false),
    supabase.from('testimonials').select('*', { count: 'exact', head: true }).eq('approved', false),
    supabase.from('partners').select('*', { count: 'exact', head: true }).eq('active', true),
    supabase.from('payments').select('amount_cents').eq('status', 'paid').gte('created_at', monthStart),
    supabase.from('nps_surveys').select('score').not('score', 'is', null),
    supabase.from('bookings').select('*, boats(name)').order('created_at', { ascending: false }).limit(5),
    supabase.from('contacts').select('*').order('created_at', { ascending: false }).limit(5),
    supabase.from('payments').select('amount_cents').eq('status', 'paid'),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).in('status', ['confirmed', 'paid']),
  ])

  const revenueMonth = (monthPayments ?? []).reduce((sum, p) => sum + (p.amount_cents ?? 0), 0)
  const revenueAllTime = (allPayments ?? []).reduce((sum, p) => sum + (p.amount_cents ?? 0), 0)
  const ticketMedio = confirmedCount && confirmedCount > 0 ? Math.round(revenueAllTime / confirmedCount) : 0

  const scores = (npsData ?? []).map(s => s.score as number)
  const promoters = scores.filter(s => s >= 9).length
  const detractors = scores.filter(s => s <= 6).length
  const npsScore = scores.length > 0 ? Math.round(((promoters - detractors) / scores.length) * 100) : null

  const statusColors: Record<string, string> = {
    pending: '#805ad5',
    whatsapp_initiated: '#d69e2e',
    confirmed: '#38a169',
    cancelled: '#e53e3e',
    no_show: '#a0aec0',
    paid: '#3182ce',
  }
  const statusLabels: Record<string, string> = {
    pending: 'Aguardando pagto',
    whatsapp_initiated: 'Iniciada WA',
    confirmed: 'Confirmada',
    cancelled: 'Cancelada',
    no_show: 'No-show',
    paid: 'Paga',
  }

  const kpis = [
    { icon: <KpiCalendar />, label: 'Reservas totais', value: totalBookings ?? 0, sub: `${monthBookings ?? 0} este mês`, color: 'var(--ocean-mid)' },
    { icon: <KpiCard />, label: 'Receita este mês', value: formatCents(revenueMonth), sub: 'pagamentos confirmados', color: '#38a169' },
    { icon: <KpiCard />, label: 'Receita total acumulada', value: formatCents(revenueAllTime), sub: 'todos os pagamentos confirmados', color: '#059669' },
    { icon: <KpiCalendar />, label: 'Ticket médio', value: ticketMedio > 0 ? formatCents(ticketMedio) : '—', sub: 'por reserva confirmada', color: 'var(--ocean-mid)' },
    { icon: <KpiClock />, label: 'Reservas pendentes', value: pendingBookings ?? 0, sub: 'aguardando confirmação', color: '#d69e2e' },
    { icon: <KpiStar />, label: 'NPS médio', value: npsScore !== null ? npsScore : '-', sub: `${scores.length} respostas`, color: npsScore !== null && npsScore >= 50 ? '#38a169' : '#d69e2e' },
    { icon: <KpiMail />, label: 'Contatos não lidos', value: contacts ?? 0, sub: 'mensagens novas', color: '#e53e3e' },
    { icon: <KpiChat />, label: 'Depoimentos pendentes', value: testimonials ?? 0, sub: 'aguardando moderação', color: 'var(--sunset)' },
    { icon: <KpiHandshake />, label: 'Parceiros ativos', value: partners ?? 0, sub: '', color: 'var(--ocean-deep)' },
  ]

  return (
    <div style={{ padding: 'clamp(1rem, 4vw, 2rem)' }}>
      <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.35rem, 5vw, 1.75rem)', color: 'var(--ocean-deep)', marginBottom: '0.25rem' }}>
        Dashboard
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 'clamp(1.25rem, 4vw, 2rem)' }}>
        Bem-vindo ao painel de administração Acalanto Turismo.
      </p>

      {/* KPI cards — 2 cols mobile (>=288px), 3-5 cols desktop */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 'clamp(0.5rem, 2vw, 1.25rem)', marginBottom: 'clamp(1.5rem, 5vw, 2.5rem)' }}>
        {kpis.map(({ icon, label, value, sub, color }) => (
          <div key={label} style={{ background: 'white', borderRadius: '0.875rem', padding: 'clamp(0.875rem, 3vw, 1.5rem)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ marginBottom: '0.375rem', color: color }}>{icon}</div>
            <div style={{ fontSize: 'clamp(1.25rem, 5vw, 1.75rem)', fontWeight: 800, color, marginBottom: '0.2rem', lineHeight: 1.1, wordBreak: 'break-word' }}>{value}</div>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--ocean-deep)', marginBottom: '0.15rem' }}>{label}</div>
            {sub && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.35 }}>{sub}</div>}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'clamp(1rem, 3vw, 1.5rem)', marginBottom: '2rem' }}>
        {/* Recent bookings */}
        <div style={{ background: 'white', borderRadius: '0.875rem', padding: 'clamp(1rem, 3vw, 1.5rem)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.1rem', color: 'var(--ocean-deep)', marginBottom: '1rem' }}>
            Ultimas reservas
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {(recentBookings ?? []).map(b => {
              const boat = b.boats as { name: string } | null
              return (
                <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--ocean-deep)' }}>{boat?.name || 'Embarcacao'}</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{b.customer_name || 'Cliente'} - {b.tour_date}</p>
                  </div>
                  <span style={{ background: `${statusColors[b.status]}20`, color: statusColors[b.status], fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: '999px', whiteSpace: 'nowrap' }}>
                    {statusLabels[b.status] || b.status}
                  </span>
                </div>
              )
            })}
            {(!recentBookings || recentBookings.length === 0) && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Nenhuma reserva ainda.</p>
            )}
          </div>
          <a href="/admin/reservas" style={{ display: 'inline-block', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--ocean-mid)', textDecoration: 'none', fontWeight: 600 }}>
            Ver todas as reservas
          </a>
        </div>

        {/* Recent contacts */}
        <div style={{ background: 'white', borderRadius: '0.875rem', padding: 'clamp(1rem, 3vw, 1.5rem)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.1rem', color: 'var(--ocean-deep)', marginBottom: '1rem' }}>
            Ultimas mensagens
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {(recentContacts ?? []).map(c => (
              <div key={c.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--ocean-deep)' }}>{c.name}</p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(c.created_at!).toLocaleDateString('pt-BR')}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{c.message}</p>
              </div>
            ))}
            {(!recentContacts || recentContacts.length === 0) && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Nenhuma mensagem ainda.</p>
            )}
          </div>
          <a href="/admin/contatos" style={{ display: 'inline-block', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--ocean-mid)', textDecoration: 'none', fontWeight: 600 }}>
            Ver todas as mensagens
          </a>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.1rem', color: 'var(--ocean-deep)', marginBottom: '1rem' }}>
          Acoes rapidas
        </h2>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {[
            { href: '/admin/reservas', label: 'Ver reservas' },
            { href: '/admin/capacidade', label: 'Gerenciar capacidade' },
            { href: '/admin/repasses', label: 'Repasses' },
            { href: '/admin/nps', label: 'Ver NPS' },
            { href: '/admin/depoimentos', label: 'Moderar depoimentos' },
            { href: '/admin/parceiros', label: 'Gerenciar parceiros' },
            { href: '/admin/contatos', label: 'Ver mensagens' },
          ].map(({ href, label }) => (
            <a key={href} href={href} className="btn-outline" style={{ fontSize: '0.875rem', padding: '0.625rem 1.25rem' }}>
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
