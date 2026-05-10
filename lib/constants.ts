export const SITE_NAME = 'Acalanto Tours'
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://acalanto.com.br'
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5524999627968'
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? ''

// Mon–Sat (0=Sun,1=Mon,...,6=Sat)
export const OPERATING_DAYS = [1, 2, 3, 4, 5, 6]
export const BOOKING_ADVANCE_MIN_DAYS = 1
export const BOOKING_ADVANCE_MAX_DAYS = 90

export const FEATURE_LABELS: Record<string, string> = {
  'pet-friendly': '🐾 Pet Friendly',
  'kids': '👶 Kids',
  'escorregador': '🛝 Escorregador',
  'familiar': '👨‍👩‍👧 Familiar',
  'premium': '⭐ Premium',
  'ofuro': '♨️ Ofurô',
  'gastronomia': '🍽️ Gastronomia',
  'cultural': '🎬 Cultural',
  'contemplativa': '🧘 Contemplativa',
}

export const CANCELLATION_POLICY =
  'Cancelamento gratuito até 24h antes do passeio. Em caso de mau tempo, reagendamento sem custo.'
