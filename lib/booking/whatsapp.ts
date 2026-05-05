import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Boat } from '@/lib/types/database'
import type { PassengerCount } from './pricing'
import { calculateTotal, formatCents } from './pricing'
import { WHATSAPP_NUMBER } from '@/lib/constants'

export function buildWhatsAppUrl(boat: Boat, date: Date, passengers: PassengerCount): string {
  const total = calculateTotal(boat, passengers)
  const dateStr = format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR })

  const lines = [
    `Olá! Gostaria de reservar um passeio pela Acalanto Tours:`,
    `🚢 Escuna: ${boat.name}`,
    `📅 Data: ${dateStr}`,
    `👤 Adultos: ${passengers.adults}${passengers.children > 0 ? ` | 👶 Crianças: ${passengers.children}` : ''}`,
    `💰 Total estimado: ${formatCents(total)}`,
    ``,
    `Aguardo confirmação de disponibilidade!`,
  ]

  const text = encodeURIComponent(lines.join('\n'))
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`
}
