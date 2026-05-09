import nodemailer from 'nodemailer'

function createTransport() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(iso: string) {
  if (!iso) return ''
  try {
    const [y, m, d] = iso.split('-')
    return `${d}/${m}/${y}`
  } catch { return iso }
}

interface BookingEmailItem {
  name: string
  type: string
  date?: string
  checkIn?: string
  checkOut?: string
  adults?: number
  children?: number
  nights?: number
  guests?: number
  pricingType?: string
  groupSize?: number
  totalCents: number
}

export interface BookingEmailPayload {
  bookingId: string
  customerName: string
  customerEmail: string
  billingType: 'PIX' | 'CREDIT_CARD' | 'BOLETO' | 'DEBIT_CARD'
  totalCents: number
  items: BookingEmailItem[]
  paymentUrl?: string | null
  pixCopyPaste?: string | null
}

function itemDetail(item: BookingEmailItem): string {
  if (item.type === 'hospedagem') {
    return `${item.nights} noite${item.nights !== 1 ? 's' : ''} · ${item.guests} hóspede${(item.guests ?? 1) !== 1 ? 's' : ''} · ${formatDate(item.checkIn ?? item.date ?? '')} → ${formatDate(item.checkOut ?? '')}`
  }
  if (item.type === 'servico' && item.pricingType === 'per_group') {
    return `Grupo de ${item.groupSize ?? item.adults} pessoas · ${formatDate(item.date ?? '')}`
  }
  const adults = item.adults ?? 0
  const children = item.children ?? 0
  return `${adults} adulto${adults !== 1 ? 's' : ''}${children > 0 ? ` · ${children} criança${children !== 1 ? 's' : ''}` : ''} · ${formatDate(item.date ?? '')}`
}

function paymentSection(payload: BookingEmailPayload): string {
  const { billingType, paymentUrl, pixCopyPaste } = payload

  if (billingType === 'PIX') {
    return `
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:20px;margin:20px 0;">
        <p style="font-weight:700;color:#166534;margin:0 0 10px;">Pague via PIX</p>
        ${pixCopyPaste ? `
          <p style="color:#166534;font-size:13px;margin:0 0 8px;">Copie e cole o código no app do seu banco:</p>
          <div style="background:white;border:1px solid #bbf7d0;border-radius:6px;padding:10px;font-family:monospace;font-size:12px;word-break:break-all;color:#166534;">
            ${pixCopyPaste}
          </div>
        ` : `
          <p style="color:#166534;font-size:13px;margin:0;">O código PIX foi gerado — acesse seu e-mail de cobrança ou consulte o app da sua instituição financeira.</p>
        `}
        <p style="color:#166534;font-size:12px;margin:10px 0 0;">O pagamento PIX é confirmado automaticamente em segundos.</p>
      </div>
    `
  }

  if (billingType === 'BOLETO' && paymentUrl) {
    return `
      <div style="background:#fefce8;border:1px solid #fef08a;border-radius:10px;padding:20px;margin:20px 0;">
        <p style="font-weight:700;color:#854d0e;margin:0 0 10px;">Boleto bancário gerado</p>
        <p style="color:#854d0e;font-size:13px;margin:0 0 12px;">Pague em qualquer banco, lotérica ou app bancário até a data de vencimento.</p>
        <a href="${paymentUrl}" style="display:inline-block;background:#854d0e;color:white;text-decoration:none;padding:10px 20px;border-radius:6px;font-weight:700;font-size:14px;">
          Abrir boleto
        </a>
      </div>
    `
  }

  if (billingType === 'CREDIT_CARD' || billingType === 'DEBIT_CARD') {
    return `
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:20px;margin:20px 0;">
        <p style="font-weight:700;color:#166534;margin:0 0 6px;">✓ Pagamento aprovado no cartão</p>
        <p style="color:#166534;font-size:13px;margin:0;">O débito de <strong>${formatBRL(payload.totalCents)}</strong> foi processado com sucesso.</p>
      </div>
    `
  }

  return ''
}

function buildHtml(payload: BookingEmailPayload): string {
  const {
    bookingId, customerName, billingType, totalCents, items,
  } = payload

  const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5524999627968'
  const waLink = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Olá! Tenho uma dúvida sobre minha reserva #${bookingId.slice(0, 8).toUpperCase()}`)}`
  const contactEmail = process.env.SMTP_FROM ?? 'reservas@acalantoturismo.com'

  const methodLabel: Record<string, string> = {
    PIX: 'PIX',
    CREDIT_CARD: 'Cartão de crédito',
    BOLETO: 'Boleto bancário',
    DEBIT_CARD: 'Débito online',
  }

  const itemRows = items.map(item => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;">
        <p style="font-weight:600;color:#0A3D5C;margin:0 0 3px;font-size:14px;">${item.name}</p>
        <p style="color:#6b7280;font-size:12px;margin:0;">${itemDetail(item)}</p>
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:700;color:#0A3D5C;font-size:14px;white-space:nowrap;vertical-align:top;">
        ${formatBRL(item.totalCents)}
      </td>
    </tr>
  `).join('')

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Confirmação de Reserva — Acalanto Turismo</title></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0A3D5C 0%,#1A6B8A 100%);border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;">
            <p style="color:rgba(255,255,255,0.7);font-size:11px;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 8px;">Acalanto Turismo · Paraty, RJ</p>
            <h1 style="color:white;font-size:26px;font-weight:700;margin:0 0 6px;">Reserva Confirmada!</h1>
            <p style="color:rgba(255,255,255,0.75);font-size:14px;margin:0;">Pedido <strong>#${bookingId.slice(0, 8).toUpperCase()}</strong></p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:white;padding:36px 40px;">

            <p style="color:#374151;font-size:15px;margin:0 0 24px;">Olá, <strong>${customerName}</strong>! Sua reserva foi recebida com sucesso.</p>

            <!-- Payment method badge -->
            <p style="font-size:13px;color:#6b7280;margin:0 0 4px;">Forma de pagamento</p>
            <p style="font-weight:700;color:#0A3D5C;font-size:15px;margin:0 0 24px;">${methodLabel[billingType] ?? billingType}</p>

            ${paymentSection(payload)}

            <!-- Items -->
            <h2 style="font-size:15px;font-weight:700;color:#0A3D5C;margin:28px 0 12px;padding-bottom:8px;border-bottom:2px solid #F5EDD8;">Itens da reserva</h2>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${itemRows}
              <tr>
                <td style="padding:14px 0 0;font-weight:700;font-size:16px;color:#0A3D5C;">Total</td>
                <td style="padding:14px 0 0;text-align:right;font-weight:700;font-size:18px;color:#F4A623;">${formatBRL(totalCents)}</td>
              </tr>
            </table>

            <!-- Next steps -->
            <h2 style="font-size:15px;font-weight:700;color:#0A3D5C;margin:28px 0 12px;padding-bottom:8px;border-bottom:2px solid #F5EDD8;">Próximos passos</h2>
            <table cellpadding="0" cellspacing="0" width="100%">
              ${[
                billingType === 'PIX' ? 'Efetue o pagamento PIX com o código acima' : billingType === 'BOLETO' ? 'Pague o boleto até a data de vencimento para confirmar sua reserva' : 'Guarde o comprovante de pagamento do cartão',
                'Nossa equipe entrará em contato para confirmar os detalhes da sua experiência',
                'No dia do passeio, compareça ao ponto de embarque com 15 minutos de antecedência',
              ].map((step, i) => `
                <tr>
                  <td style="width:28px;vertical-align:top;padding:4px 10px 12px 0;">
                    <div style="width:24px;height:24px;border-radius:50%;background:#1A6B8A;color:white;text-align:center;line-height:24px;font-size:12px;font-weight:700;">${i + 1}</div>
                  </td>
                  <td style="padding:4px 0 12px;font-size:13px;color:#374151;line-height:1.5;">${step}</td>
                </tr>
              `).join('')}
            </table>

            <!-- Contact -->
            <div style="background:#F5EDD8;border-radius:10px;padding:20px;margin:24px 0 0;">
              <p style="font-weight:700;color:#0A3D5C;margin:0 0 8px;font-size:14px;">Precisa de ajuda?</p>
              <p style="color:#374151;font-size:13px;margin:0 0 12px;line-height:1.5;">Nossa equipe está disponível para responder qualquer dúvida sobre sua reserva.</p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-right:12px;">
                    <a href="${waLink}" style="display:inline-block;background:#25D366;color:white;text-decoration:none;padding:9px 16px;border-radius:6px;font-weight:700;font-size:13px;">
                      WhatsApp
                    </a>
                  </td>
                  <td>
                    <a href="mailto:${contactEmail}" style="display:inline-block;background:#0A3D5C;color:white;text-decoration:none;padding:9px 16px;border-radius:6px;font-weight:700;font-size:13px;">
                      E-mail
                    </a>
                  </td>
                </tr>
              </table>
            </div>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#0A3D5C;border-radius:0 0 12px 12px;padding:24px 40px;text-align:center;">
            <p style="color:rgba(255,255,255,0.9);font-weight:700;font-size:14px;margin:0 0 4px;">Acalanto Turismo</p>
            <p style="color:rgba(255,255,255,0.6);font-size:12px;margin:0 0 12px;">Paraty, Rio de Janeiro · acalantoturismo.com</p>
            <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0;">Este e-mail foi enviado automaticamente. Para dúvidas, use os botões acima.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>

</body>
</html>`
}

export async function sendBookingConfirmation(payload: BookingEmailPayload): Promise<void> {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[email] SMTP not configured — skipping confirmation email')
    return
  }

  const transport = createTransport()
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER

  const methodLabel: Record<string, string> = {
    PIX: 'PIX',
    CREDIT_CARD: 'Cartão de crédito',
    BOLETO: 'Boleto bancário',
    DEBIT_CARD: 'Débito online',
  }

  await transport.sendMail({
    from: `"Acalanto Turismo" <${from}>`,
    to:   payload.customerEmail,
    subject: `Reserva confirmada #${payload.bookingId.slice(0, 8).toUpperCase()} — Acalanto Turismo`,
    text: [
      `Olá, ${payload.customerName}!`,
      '',
      `Sua reserva foi confirmada. Pedido: #${payload.bookingId.slice(0, 8).toUpperCase()}`,
      `Forma de pagamento: ${methodLabel[payload.billingType] ?? payload.billingType}`,
      `Total: ${formatBRL(payload.totalCents)}`,
      '',
      'Itens:',
      ...payload.items.map(i => `  - ${i.name}: ${formatBRL(i.totalCents)}`),
      '',
      payload.billingType === 'PIX' && payload.pixCopyPaste
        ? `Código PIX: ${payload.pixCopyPaste}`
        : '',
      payload.billingType === 'BOLETO' && payload.paymentUrl
        ? `Link do boleto: ${payload.paymentUrl}`
        : '',
      '',
      'Acalanto Turismo — Paraty, RJ',
      'acalantoturismo.com',
    ].filter(Boolean).join('\n'),
    html: buildHtml(payload),
  })
}
