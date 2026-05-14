export function buildWhatsappLink(opts: {
  phone: string | null
  bookingId: string
  boatName: string | null
  tourDate: string | null
  adults: number
  children: number
  totalCents: number
  pdfUrl?: string
}): string | null {
  if (!opts.phone) return null
  const digits = opts.phone.replace(/\D+/g, '')
  if (digits.length < 10) return null
  const fmt = (c: number) => (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const msg = [
    '✅ Sua reserva está confirmada!',
    '',
    `🎫 Reserva: ${opts.bookingId.slice(0, 8)}`,
    opts.boatName ? `⚓ ${opts.boatName}` : '',
    opts.tourDate ? `📅 ${opts.tourDate}` : '',
    `👥 ${opts.adults} adulto${opts.adults !== 1 ? 's' : ''}${opts.children ? ` + ${opts.children} criança${opts.children !== 1 ? 's' : ''}` : ''}`,
    `💰 Total: ${fmt(opts.totalCents)}`,
    opts.pdfUrl ? `\nComprovante: ${opts.pdfUrl}` : '',
    '\nQualquer dúvida, fale com a gente!',
  ].filter(Boolean).join('\n')
  return `https://wa.me/${digits.startsWith('55') ? digits : `55${digits}`}?text=${encodeURIComponent(msg)}`
}
