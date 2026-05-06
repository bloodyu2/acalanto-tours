export const dynamic = 'force-static'

type Status = 'done' | 'in_progress' | 'pending' | 'blocked'

interface Task {
  id: string
  area: string
  title: string
  description: string
  status: Status
  priority: 'alta' | 'média' | 'baixa'
  eta?: string
  notes?: string
}

const tasks: Task[] = [
  // ✅ Concluído
  {
    id: '1',
    area: 'Infra',
    title: 'Deploy inicial no Vercel',
    description: 'Next.js 16 + Supabase + domínio configurado',
    status: 'done',
    priority: 'alta',
    eta: 'Maio 2026',
  },
  {
    id: '2',
    area: 'Passeios',
    title: 'Catálogo de escunas + booking widget',
    description: 'Página por barco, seletor de adultos/crianças, data, carrinho e checkout Infinity Pay',
    status: 'done',
    priority: 'alta',
    eta: 'Maio 2026',
  },
  {
    id: '3',
    area: 'Hospedagem',
    title: 'Catálogo de pousadas + booking widget',
    description: 'Página por pousada, seletor de datas (check-in/out), hóspedes, disponibilidade via iCal',
    status: 'done',
    priority: 'alta',
    eta: 'Maio 2026',
  },
  {
    id: '4',
    area: 'Serviços',
    title: 'Catálogo de serviços + booking inline',
    description: 'Lancha privativa, jeep, fotografia, transfer — seletor de data/pessoas, carrinho',
    status: 'done',
    priority: 'alta',
    eta: 'Maio 2026',
  },
  {
    id: '5',
    area: 'iCal',
    title: 'Sincronização de calendário (exportação)',
    description: 'Feed .ics por pousada, botões Google Calendar / Apple Calendar na página de hospedagem',
    status: 'done',
    priority: 'média',
    eta: 'Maio 2026',
  },
  {
    id: '6',
    area: 'Admin',
    title: 'Painel admin base',
    description: 'Dashboard KPIs, reservas, capacidade, repasses, contatos, NPS, parceiros, depoimentos',
    status: 'done',
    priority: 'alta',
    eta: 'Maio 2026',
  },
  {
    id: '7',
    area: 'Segurança',
    title: 'Hardening OWASP',
    description: 'CSP, X-Frame, rate limiting, server-side price validation, EVOLUCOES_PASSWORD server-only',
    status: 'done',
    priority: 'alta',
    eta: 'Maio 2026',
  },

  // 🔄 Em andamento / Próximo
  {
    id: '8',
    area: 'Pagamentos',
    title: 'Todos os métodos de pagamento (Pix + Cartão + Apple/Google Pay)',
    description: 'InfinityPay hosted checkout já suporta todos os métodos — ajustar webhook para captura de método usado, mostrar no admin',
    status: 'in_progress',
    priority: 'alta',
    eta: 'Jun 2026',
    notes: 'InfinityPay NÃO tem split nativo. Ver tarefa #9.',
  },
  {
    id: '9',
    area: 'Pagamentos',
    title: 'Split de pagamento por parceiro',
    description: 'Repasse automático para cada parceiro (pousada, barco, serviço) no momento do pagamento. Requer processador com split nativo (Asaas / iugu / Pagar.me) OU automação via Pix após receber.',
    status: 'blocked',
    priority: 'alta',
    eta: 'A definir',
    notes: 'BLOQUEADO — InfinityPay não tem API de split. Decisão pendente: trocar processador ou split manual pós-recebimento.',
  },
  {
    id: '10',
    area: 'Admin',
    title: 'Painel financeiro por parceiro',
    description: 'Cada parceiro vê suas vendas, comissões retidas, repasses pendentes e histórico. Admin vê tudo consolidado e por parceiro.',
    status: 'pending',
    priority: 'alta',
    eta: 'Jun/Jul 2026',
    notes: 'Depende da decisão do split (#9).',
  },
  {
    id: '11',
    area: 'Parceiros',
    title: 'Portal do parceiro (login próprio)',
    description: 'Parceiro acessa /parceiros/dashboard — vê reservas dos seus produtos, agenda, financeiro, uploads de fotos.',
    status: 'pending',
    priority: 'alta',
    eta: 'Jul 2026',
  },
  {
    id: '12',
    area: 'Pagamentos',
    title: 'Definir porcentagens de comissão por categoria',
    description: 'Passeios próprios: Acalanto 100%. Pousadas parceiras: % a definir. Barcos parceiros: % a definir. Serviços: % a definir.',
    status: 'pending',
    priority: 'alta',
    eta: 'A definir (decisão do cliente)',
    notes: 'Aguardando definição das porcentagens.',
  },
  {
    id: '13',
    area: 'iCal',
    title: 'iCal bidirecional — importação de reservas externas',
    description: 'Sincronizar bloqueios de datas de Airbnb/Booking.com via cron que importa iCal de parceiros.',
    status: 'in_progress',
    priority: 'média',
    eta: 'Jun 2026',
    notes: 'Endpoint /api/ical/sync/[listingId] já existe. Falta UI no admin para o parceiro cadastrar a URL do calendário externo.',
  },
  {
    id: '14',
    area: 'SEO',
    title: 'SEO completo + Google Search Console',
    description: 'sitemap.xml, robots.txt, JSON-LD por página, meta descriptions, imagens WebP',
    status: 'pending',
    priority: 'média',
    eta: 'Jun 2026',
  },
  {
    id: '15',
    area: 'Marketing',
    title: 'GTM + GA4 + Consent Mode v2',
    description: 'Google Tag Manager configurado, eventos de conversão (reserva iniciada, checkout concluído), funil.',
    status: 'pending',
    priority: 'média',
    eta: 'Jun 2026',
  },
  {
    id: '16',
    area: 'Conteúdo',
    title: 'Migração de conteúdo do WordPress',
    description: 'Fotos das escunas, textos das páginas, depoimentos reais, galeria por barco.',
    status: 'pending',
    priority: 'alta',
    eta: 'A definir',
    notes: 'Aguarda entrega de assets do cliente.',
  },
  {
    id: '17',
    area: 'Infra',
    title: 'Domínio definitivo + SSL',
    description: 'Apontar domínio final (acalantoturismo.com.br ou similar) no Vercel.',
    status: 'pending',
    priority: 'alta',
    eta: 'A definir',
    notes: 'Aguarda decisão do cliente sobre nome do domínio.',
  },
  {
    id: '18',
    area: 'Fotografia',
    title: 'Página de fotografia completa',
    description: 'Portfolio, pacotes de ensaio, galeria, booking inline.',
    status: 'pending',
    priority: 'média',
    eta: 'Jul 2026',
  },
  {
    id: '19',
    area: 'NPS',
    title: 'Cron NPS + emails automáticos pós-passeio',
    description: 'Cron noturno já existe. Testar em produção e validar emails chegando.',
    status: 'in_progress',
    priority: 'baixa',
    eta: 'Jun 2026',
  },
]

const statusConfig: Record<Status, { label: string; color: string; bg: string }> = {
  done:        { label: 'Concluído',    color: '#16a34a', bg: '#dcfce7' },
  in_progress: { label: 'Em andamento', color: '#d97706', bg: '#fef3c7' },
  pending:     { label: 'Pendente',     color: '#6b7280', bg: '#f3f4f6' },
  blocked:     { label: 'Bloqueado',    color: '#dc2626', bg: '#fee2e2' },
}

const priorityConfig: Record<string, { color: string }> = {
  alta:  { color: '#dc2626' },
  média: { color: '#d97706' },
  baixa: { color: '#6b7280' },
}

const areas = [...new Set(tasks.map(t => t.area))]

function StatusBadge({ status }: { status: Status }) {
  const cfg = statusConfig[status]
  return (
    <span style={{
      display: 'inline-block',
      padding: '0.2rem 0.625rem',
      borderRadius: '999px',
      fontSize: '0.75rem',
      fontWeight: 600,
      color: cfg.color,
      background: cfg.bg,
      whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </span>
  )
}

const done = tasks.filter(t => t.status === 'done').length
const total = tasks.length
const pct = Math.round((done / total) * 100)

export default function RoadmapPage() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1000px' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: '#0f172a', marginBottom: '0.375rem' }}>
          Roadmap do Projeto
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          Acalanto Turismo — v2 Next.js
        </p>
        {/* Progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ flex: 1, height: '8px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: '#16a34a', borderRadius: '999px', transition: 'width 0.4s' }}/>
          </div>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#16a34a', whiteSpace: 'nowrap' }}>
            {done}/{total} ({pct}%)
          </span>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '2rem' }}>
        {(Object.entries(statusConfig) as [Status, typeof statusConfig[Status]][]).map(([k, v]) => (
          <span key={k} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: '#475569' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: v.color, display: 'inline-block' }}/>
            {v.label}
          </span>
        ))}
      </div>

      {/* Tasks by area */}
      {areas.map(area => {
        const areaTasks = tasks.filter(t => t.area === area)
        return (
          <div key={area} style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '0.75rem' }}>
              {area}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {areaTasks.map(task => (
                <div key={task.id} style={{
                  background: 'white',
                  border: `1px solid ${task.status === 'blocked' ? '#fca5a5' : '#e2e8f0'}`,
                  borderRadius: '10px',
                  padding: '1rem 1.25rem',
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: '0.75rem',
                  alignItems: 'start',
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#0f172a' }}>{task.title}</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: priorityConfig[task.priority].color }}>
                        ↑ {task.priority}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8375rem', color: '#64748b', margin: '0 0 0.375rem' }}>{task.description}</p>
                    {task.notes && (
                      <p style={{ fontSize: '0.8rem', color: task.status === 'blocked' ? '#dc2626' : '#d97706', margin: 0, fontStyle: 'italic' }}>
                        ⚠ {task.notes}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.375rem' }}>
                    <StatusBadge status={task.status} />
                    {task.eta && (
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>{task.eta}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      <p style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '2rem' }}>
        Última atualização: maio 2026
      </p>
    </div>
  )
}
