import { createAdminClient } from '@/lib/supabase/server'
import { formatCents } from '@/lib/booking/pricing'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

const statusLabels: Record<string, string> = {
  pending: 'Aguardando pagamento',
  whatsapp_initiated: 'Iniciada pelo WhatsApp',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  no_show: 'No-show',
}

const statusColors: Record<string, string> = {
  pending: '#805ad5',
  whatsapp_initiated: '#d69e2e',
  confirmed: '#38a169',
  cancelled: '#e53e3e',
  no_show: '#a0aec0',
}

const paymentStatusLabels: Record<string, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  received: 'Recebido',
  refunded: 'Estornado',
  overdue: 'Vencido',
}

export default async function ReservaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createAdminClient()
  const { data: b } = await supabase
    .from('bookings')
    .select('*, boats(name, slug)')
    .eq('id', id)
    .maybeSingle()

  if (!b) notFound()

  const status = b.status as string
  const paymentStatus = b.payment_status as string

  const rows: [string, string][] = [
    ['Embarcação', (b.boats as { name: string } | null)?.name ?? '—'],
    ['Data do passeio', b.tour_date ?? '—'],
    ['Adultos', String(b.adults ?? 0)],
    ['Crianças', String(b.children ?? 0)],
    ['Total', formatCents(b.total_cents)],
    ['Comissão Acalanto (bruta, inclui 6% Balaio)', `${Math.round(b.commission_rate ?? 0)}%`],
    ['Cliente', b.customer_name ?? '—'],
    ['E-mail', b.customer_email ?? '—'],
    ['Telefone', b.customer_phone ?? '—'],
    ['Método de pagamento', b.payment_method ?? '—'],
    ['Status do pagamento', paymentStatusLabels[paymentStatus] ?? paymentStatus ?? '—'],
    ['ID ASAAS', b.asaas_payment_id ?? '—'],
    ['Pago em', b.paid_at ? new Date(b.paid_at).toLocaleString('pt-BR') : '—'],
    ['Campanha UTM', b.utm_campaign ?? '—'],
    ['Criado em', new Date(b.created_at!).toLocaleString('pt-BR')],
  ]

  return (
    <div style={{ padding: '2rem', maxWidth: '640px' }}>
      <Link href="/admin/reservas" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none' }}>← Reservas</Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '0.5rem 0 1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--ocean-deep)', margin: 0 }}>
          Reserva
        </h1>
        <span style={{
          background: `${statusColors[status] ?? '#6b7280'}20`,
          color: statusColors[status] ?? '#6b7280',
          fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.75rem', borderRadius: '999px',
        }}>
          {statusLabels[status] ?? status}
        </span>
      </div>

      <div style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <dl style={{ margin: 0 }}>
          {rows.map(([label, value], i) => (
            <div key={label} style={{
              display: 'flex', justifyContent: 'space-between', gap: '1rem',
              padding: '0.875rem 1.25rem',
              borderTop: i === 0 ? 'none' : '1px solid var(--border)',
              background: i % 2 === 0 ? 'white' : '#fafbfc',
            }}>
              <dt style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-jakarta)', flexShrink: 0 }}>{label}</dt>
              <dd style={{
                margin: 0,
                fontSize: '0.9rem',
                fontFamily: 'var(--font-jakarta)',
                fontWeight: label === 'Total' ? 700 : 400,
                color: label === 'Total' ? 'var(--sunset)' : '#1a202c',
                textAlign: 'right',
                wordBreak: 'break-all',
              }}>
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {b.notes && (
        <div style={{ marginTop: '1.25rem', background: 'white', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: '1.25rem' }}>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1rem', color: 'var(--ocean-deep)', margin: '0 0 0.5rem' }}>Observações</h2>
          <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '0.9rem', color: '#374151', margin: 0 }}>{b.notes}</p>
        </div>
      )}

      {b.payment_url && (
        <div style={{ marginTop: '1.25rem' }}>
          <a
            href={b.payment_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              background: 'var(--ocean-mid, #1A6B8A)',
              color: '#fff',
              padding: '0.625rem 1.25rem',
              borderRadius: '0.625rem',
              fontFamily: 'var(--font-jakarta)',
              fontWeight: 600,
              fontSize: '0.875rem',
              textDecoration: 'none',
            }}
          >
            Ver comprovante de pagamento ↗
          </a>
        </div>
      )}
    </div>
  )
}
