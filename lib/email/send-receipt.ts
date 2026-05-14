import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
})

export async function sendReceipt(opts: {
  to: string
  bookingId: string
  pdfBuffer: Buffer
}) {
  return transporter.sendMail({
    from: `"Acalanto Turismo" <${process.env.SMTP_FROM ?? 'reservas@acalantoturismo.com'}>`,
    to: opts.to,
    subject: `Sua reserva está confirmada — ${opts.bookingId.slice(0, 8)}`,
    text: `Olá! Sua reserva está confirmada. O comprovante está em anexo. Qualquer dúvida, fale com a gente. — Equipe Acalanto`,
    attachments: [{ filename: `comprovante-${opts.bookingId.slice(0,8)}.pdf`, content: opts.pdfBuffer }],
  })
}
