'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RoadmapTask } from '@/lib/types/database'
import type { Database } from '@/lib/types/database'

type RoadmapInsert = Database['public']['Tables']['roadmap_tasks']['Insert']

const STATUS_OPTIONS = ['done', 'in_progress', 'pending', 'blocked'] as const
const PRIORITY_OPTIONS = ['alta', 'média', 'baixa'] as const

const STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  done:        { bg: '#dcfce7', color: '#166534', label: '✓ Concluído' },
  in_progress: { bg: '#fef9c3', color: '#854d0e', label: '⟳ Em andamento' },
  pending:     { bg: '#f1f5f9', color: '#475569', label: '○ Pendente' },
  blocked:     { bg: '#fee2e2', color: '#991b1b', label: '✕ Bloqueado' },
}

const PRIORITY_COLORS: Record<string, { bg: string; color: string }> = {
  alta:  { bg: '#fee2e2', color: '#991b1b' },
  média: { bg: '#fef9c3', color: '#854d0e' },
  baixa: { bg: '#f1f5f9', color: '#475569' },
}

// Seed data migrated from the hardcoded array — only inserted if table is empty
const SEED_TASKS: RoadmapInsert[] = [
  { area: 'Infra',       title: 'Deploy inicial no Vercel',                     description: 'Next.js 16 + Supabase + domínio configurado',                                                                                  status: 'done',        priority: 'alta',  sort_order: 0,  notes: null, eta: 'Maio 2026' },
  { area: 'Passeios',    title: 'Catálogo de escunas + booking widget',          description: 'Página por barco, seletor de adultos/crianças, data, carrinho e checkout Infinity Pay',                                         status: 'done',        priority: 'alta',  sort_order: 1,  notes: null, eta: 'Maio 2026' },
  { area: 'Hospedagem',  title: 'Catálogo de pousadas + booking widget',         description: 'Página por pousada, seletor de datas (check-in/out), hóspedes, disponibilidade via iCal',                                      status: 'done',        priority: 'alta',  sort_order: 2,  notes: null, eta: 'Maio 2026' },
  { area: 'Serviços',    title: 'Catálogo de serviços + booking inline',         description: 'Lancha privativa, jeep, fotografia, transfer — seletor de data/pessoas, carrinho',                                             status: 'done',        priority: 'alta',  sort_order: 3,  notes: null, eta: 'Maio 2026' },
  { area: 'iCal',        title: 'Sincronização de calendário (exportação)',      description: 'Feed .ics por pousada, botões Google Calendar / Apple Calendar na página de hospedagem',                                       status: 'done',        priority: 'média', sort_order: 4,  notes: null, eta: 'Maio 2026' },
  { area: 'Admin',       title: 'Painel admin base',                             description: 'Dashboard KPIs, reservas, capacidade, repasses, contatos, NPS, parceiros, depoimentos',                                       status: 'done',        priority: 'alta',  sort_order: 5,  notes: null, eta: 'Maio 2026' },
  { area: 'Segurança',   title: 'Hardening OWASP',                               description: 'CSP, X-Frame, rate limiting, server-side price validation, EVOLUCOES_PASSWORD server-only',                                   status: 'done',        priority: 'alta',  sort_order: 6,  notes: null, eta: 'Maio 2026' },
  { area: 'Pagamentos',  title: 'Integração ASAAS — PIX, cartão, boleto, débito', description: 'Checkout ASAAS com os 4 métodos de pagamento, CPF obrigatório (hash SHA-256), webhook de confirmação, booking insert automático.', status: 'done',        priority: 'alta',  sort_order: 7,  notes: 'API keys do ASAAS pendentes (Gustavo). Ambiente sandbox configurado. Ativar com ASAAS_ENVIRONMENT=production.', eta: 'Mai 2026' },
  { area: 'Pagamentos',  title: 'Split de pagamento por parceiro (ASAAS)',        description: 'Repasse automático para cada parceiro via ASAAS split[] no momento do pagamento. Configuração por parceiro: asaas_wallet_id + commission_pct.', status: 'pending',     priority: 'alta',  sort_order: 8,  notes: 'Aguarda KYC aprovado + subcontas criadas no ASAAS. Ativar com ASAAS_SPLIT_ENABLED=true.', eta: 'Jun/Jul 2026' },
  { area: 'Admin',       title: 'Painel financeiro por parceiro',                description: 'Cada parceiro vê suas vendas, comissões retidas, repasses pendentes e histórico. Admin vê tudo consolidado e por parceiro.',   status: 'pending',     priority: 'alta',  sort_order: 9,  notes: 'Depende da decisão do split.', eta: 'Jun/Jul 2026' },
  { area: 'Parceiros',   title: 'Portal do parceiro (login próprio)',            description: 'Parceiro acessa /parceiros/dashboard — vê reservas dos seus produtos, agenda, financeiro, uploads de fotos.',                  status: 'pending',     priority: 'alta',  sort_order: 10, notes: null, eta: 'Jul 2026' },
  { area: 'Pagamentos',  title: 'Definir porcentagens de comissão por categoria', description: 'Passeios próprios: Acalanto 100%. Pousadas parceiras: % a definir. Barcos parceiros: % a definir. Serviços: % a definir.',   status: 'pending',     priority: 'alta',  sort_order: 11, notes: 'Aguardando definição das porcentagens.', eta: 'A definir' },
  { area: 'iCal',        title: 'iCal bidirecional — importação de reservas externas', description: 'Sincronizar bloqueios de datas de Airbnb/Booking.com via cron que importa iCal de parceiros.',                         status: 'in_progress', priority: 'média', sort_order: 12, notes: 'Endpoint /api/ical/sync/[listingId] já existe. Falta UI no admin para o parceiro cadastrar a URL do calendário externo.', eta: 'Jun 2026' },
  { area: 'SEO',         title: 'SEO completo + Google Search Console',          description: 'sitemap.xml, robots.txt, JSON-LD por página, meta descriptions, imagens WebP',                                                status: 'pending',     priority: 'média', sort_order: 13, notes: null, eta: 'Jun 2026' },
  { area: 'Marketing',   title: 'GTM + GA4 + Consent Mode v2',                  description: 'Google Tag Manager configurado, eventos de conversão (reserva iniciada, checkout concluído), funil.',                         status: 'pending',     priority: 'média', sort_order: 14, notes: null, eta: 'Jun 2026' },
  { area: 'Conteúdo',    title: 'Migração de conteúdo do WordPress',             description: 'Fotos das escunas, textos das páginas, depoimentos reais, galeria por barco.',                                                 status: 'pending',     priority: 'alta',  sort_order: 15, notes: 'Aguarda entrega de assets do cliente.', eta: 'A definir' },
  { area: 'Infra',       title: 'Domínio definitivo + SSL',                      description: 'Apontar domínio final (acalantoturismo.com.br ou similar) no Vercel.',                                                        status: 'pending',     priority: 'alta',  sort_order: 16, notes: 'Aguarda decisão do cliente sobre nome do domínio.', eta: 'A definir' },
  { area: 'Fotografia',  title: 'Página de fotografia completa',                 description: 'Portfolio, pacotes de ensaio, galeria, booking inline.',                                                                       status: 'pending',     priority: 'média', sort_order: 17, notes: null, eta: 'Jul 2026' },
  { area: 'NPS',         title: 'Cron NPS + emails automáticos pós-passeio',     description: 'Cron noturno já existe. Testar em produção e validar emails chegando.',                                                       status: 'in_progress', priority: 'baixa', sort_order: 18, notes: null, eta: 'Jun 2026' },
  { area: 'Email',       title: 'Configurar SMTP GoDaddy no Vercel',              description: 'Adicionar env vars no Vercel: SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM. Usar contato@acalantoturismo.com. Testar email de confirmação de reserva.', status: 'pending', priority: 'alta',  sort_order: 19, notes: 'GoDaddy: SMTP_HOST=smtpout.secureserver.net, SMTP_PORT=465, SMTP_SECURE=true, SMTP_USER=contato@acalantoturismo.com, SMTP_FROM=contato@acalantoturismo.com', eta: 'Mai 2026' },
  { area: 'Email',       title: 'Migrar envio de email para Resend',               description: 'Substituir nodemailer/SMTP por Resend API. Verificar domínio acalantoturismo.com no Resend (1 registro DNS TXT). Trocar lib/email/mailer.ts para usar SDK do Resend.', status: 'pending', priority: 'baixa', sort_order: 20, notes: 'Plano: Jun/Jul 2026. Resend gratuito: 3.000 emails/mês.', eta: 'Jul 2026' },
  { area: 'Pagamentos',  title: 'Cartão de crédito direto via ASAAS',              description: 'Checkout já coleta dados do cartão (número, validade, CVV, CEP, número do endereço). Integrar campos creditCard + creditCardHolderInfo no POST /api/checkout. Testar em sandbox.', status: 'pending', priority: 'alta', sort_order: 21, notes: 'Campos do formulário já implementados. Falta passar os dados para a API do ASAAS e testar aprovação/recusa.', eta: 'Jun 2026' },
  { area: 'UX',          title: 'Botão "Voltar ao site" na tela de confirmação',   description: 'Na tela pós-pagamento, adicionar CTA secundário "Explorar mais passeios" que leva para /passeios, além do botão já existente.', status: 'done', priority: 'baixa', sort_order: 22, notes: null, eta: 'Mai 2026' },
]

export default function AdminRoadmapPage() {
  const [tasks, setTasks] = useState<RoadmapTask[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadTasks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadTasks() {
    setLoading(true)
    const { data, error } = await supabase
      .from('roadmap_tasks')
      .select('*')
      .order('sort_order')

    if (error) { console.error(error); setLoading(false); return }

    if (!data || data.length === 0) {
      // Seed on first load
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: seeded } = await (supabase as any)
        .from('roadmap_tasks')
        .insert(SEED_TASKS)
        .select('*')
        .order('sort_order')
      setTasks((seeded as RoadmapTask[]) ?? [])
    } else {
      setTasks(data)
    }
    setLoading(false)
  }

  async function updateTask(id: string, changes: Partial<RoadmapTask>) {
    setSaving(id)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('roadmap_tasks').update({ ...changes, updated_at: new Date().toISOString() }).eq('id', id)
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...changes } : t))
    setSaving(null)
  }

  async function deleteTask(id: string) {
    if (!confirm('Remover esta tarefa?')) return
    await supabase.from('roadmap_tasks').delete().eq('id', id)
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  async function addTask() {
    setAdding(true)
    const newTask: RoadmapInsert = {
      area: 'Geral',
      title: 'Nova tarefa',
      description: null,
      status: 'pending',
      priority: 'média',
      eta: null,
      notes: null,
      sort_order: tasks.length,
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any).from('roadmap_tasks').insert(newTask).select('*').single() as { data: RoadmapTask | null }
    if (data) setTasks(prev => [...prev, data])
    setAdding(false)
  }

  const areas = Array.from(new Set(tasks.map(t => t.area))).sort()
  const stats = {
    total: tasks.length,
    done: tasks.filter(t => t.status === 'done').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    blocked: tasks.filter(t => t.status === 'blocked').length,
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '900px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--ocean-deep)', margin: 0 }}>
          Roadmap
        </h1>
        <button
          onClick={addTask}
          disabled={adding}
          style={{ padding: '0.5rem 1.25rem', background: 'var(--ocean-mid)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}
        >
          {adding ? 'Adicionando…' : '+ Nova tarefa'}
        </button>
      </div>

      {/* Progress summary */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div style={{ background: 'white', borderRadius: '10px', padding: '0.75rem 1.25rem', border: '1px solid var(--border)', fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Total: </span><strong>{stats.total}</strong>
        </div>
        <div style={{ background: '#dcfce7', borderRadius: '10px', padding: '0.75rem 1.25rem', fontSize: '0.875rem', color: '#166534' }}>
          ✓ Concluídas: <strong>{stats.done}</strong>
        </div>
        <div style={{ background: '#fef9c3', borderRadius: '10px', padding: '0.75rem 1.25rem', fontSize: '0.875rem', color: '#854d0e' }}>
          ⟳ Em andamento: <strong>{stats.in_progress}</strong>
        </div>
        {stats.blocked > 0 && (
          <div style={{ background: '#fee2e2', borderRadius: '10px', padding: '0.75rem 1.25rem', fontSize: '0.875rem', color: '#991b1b' }}>
            ✕ Bloqueadas: <strong>{stats.blocked}</strong>
          </div>
        )}
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Carregando…</p>
      ) : (
        areas.map(area => (
          <div key={area} style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              {area}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {tasks.filter(t => t.area === area).map(task => (
                <TaskRow
                  key={task.id}
                  task={task}
                  saving={saving === task.id}
                  onUpdate={(changes) => updateTask(task.id, changes)}
                  onDelete={() => deleteTask(task.id)}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

function TaskRow({
  task, saving, onUpdate, onDelete
}: {
  task: RoadmapTask
  saving: boolean
  onUpdate: (changes: Partial<RoadmapTask>) => void
  onDelete: () => void
}) {
  const [editingTitle, setEditingTitle] = useState(false)
  const [editingNotes, setEditingNotes] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)
  const notesRef = useRef<HTMLTextAreaElement>(null)
  const statusStyle = STATUS_COLORS[task.status] ?? STATUS_COLORS.pending
  const priorityStyle = PRIORITY_COLORS[task.priority] ?? PRIORITY_COLORS['média']

  // suppress unused-variable warnings for refs used via autoFocus pattern
  void titleRef
  void notesRef

  return (
    <div style={{
      background: 'white', borderRadius: '10px', padding: '0.875rem 1rem',
      border: '1px solid var(--border)', opacity: saving ? 0.7 : 1,
      display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
    }}>
      {/* Status dropdown */}
      <select
        value={task.status}
        onChange={e => onUpdate({ status: e.target.value })}
        style={{
          background: statusStyle.bg, color: statusStyle.color,
          border: 'none', borderRadius: '6px', padding: '0.25rem 0.5rem',
          fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', flexShrink: 0,
        }}
      >
        {STATUS_OPTIONS.map(s => (
          <option key={s} value={s}>{STATUS_COLORS[s]?.label ?? s}</option>
        ))}
      </select>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Title */}
        {editingTitle ? (
          <input
            ref={titleRef}
            defaultValue={task.title}
            autoFocus
            onBlur={e => { onUpdate({ title: e.target.value }); setEditingTitle(false) }}
            onKeyDown={e => { if (e.key === 'Enter') { onUpdate({ title: (e.target as HTMLInputElement).value }); setEditingTitle(false) } }}
            style={{ width: '100%', fontWeight: 600, fontSize: '0.9375rem', border: '1px solid var(--ocean-mid)', borderRadius: '4px', padding: '0.125rem 0.375rem' }}
          />
        ) : (
          <p
            onClick={() => setEditingTitle(true)}
            style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: '0.25rem', cursor: 'text', textDecoration: task.status === 'done' ? 'line-through' : 'none', color: task.status === 'done' ? 'var(--text-muted)' : 'var(--text-primary)' }}
          >
            {task.title}
          </p>
        )}

        {task.description && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>{task.description}</p>
        )}

        {/* Notes */}
        {editingNotes ? (
          <textarea
            ref={notesRef}
            defaultValue={task.notes ?? ''}
            autoFocus
            rows={2}
            onBlur={e => { onUpdate({ notes: e.target.value || null }); setEditingNotes(false) }}
            style={{ width: '100%', fontSize: '0.8125rem', border: '1px solid var(--ocean-mid)', borderRadius: '4px', padding: '0.25rem 0.375rem', resize: 'vertical' }}
          />
        ) : task.notes ? (
          <p
            onClick={() => setEditingNotes(true)}
            style={{ fontSize: '0.8125rem', color: '#92400e', background: '#fef3c7', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'text', marginTop: '0.25rem' }}
          >
            📝 {task.notes}
          </p>
        ) : (
          <button
            onClick={() => setEditingNotes(true)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', padding: 0, marginTop: '0.125rem' }}
          >
            + nota
          </button>
        )}
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.375rem', flexShrink: 0 }}>
        {/* Priority */}
        <select
          value={task.priority}
          onChange={e => onUpdate({ priority: e.target.value })}
          style={{
            background: priorityStyle.bg, color: priorityStyle.color,
            border: 'none', borderRadius: '6px', padding: '0.2rem 0.4rem',
            fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer',
          }}
        >
          {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>

        {/* Area edit */}
        <input
          defaultValue={task.area}
          onBlur={e => { if (e.target.value !== task.area) onUpdate({ area: e.target.value }) }}
          style={{ width: '80px', fontSize: '0.7rem', border: '1px solid var(--border)', borderRadius: '4px', padding: '0.125rem 0.25rem', color: 'var(--text-muted)', textAlign: 'center' }}
        />

        {/* Delete */}
        <button
          onClick={onDelete}
          style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', fontSize: '0.75rem', padding: 0 }}
        >
          remover
        </button>
      </div>
    </div>
  )
}
