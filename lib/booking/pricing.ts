import type { Boat } from '@/lib/types/database'

export interface PassengerCount {
  adults: number
  children: number
}

export function calculateTotal(boat: Boat, passengers: PassengerCount): number {
  return boat.price_adult * passengers.adults + boat.price_child * passengers.children
}

export function formatCents(cents: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
}

export function getChildPriceLabel(boat: Boat): string {
  return `Grátis até ${boat.child_free_until_age} anos · Meia (${formatCents(boat.price_child)}) de ${boat.child_free_until_age + 1} a ${boat.child_half_until_age} anos`
}
