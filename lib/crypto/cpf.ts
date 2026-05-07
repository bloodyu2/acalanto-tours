import { createHmac } from 'crypto'

/** Strips formatting and returns only 11 digits */
export function cleanCpf(cpf: string): string {
  return cpf.replace(/\D/g, '')
}

/** Validates CPF check digits (returns false for all-same-digit CPFs too) */
export function isValidCpf(cpf: string): boolean {
  const c = cleanCpf(cpf)
  if (c.length !== 11) return false
  if (/^(\d)\1+$/.test(c)) return false

  const calc = (factor: number) => {
    let sum = 0
    for (let i = 0; i < factor - 1; i++) sum += parseInt(c[i]) * (factor - i)
    const rem = (sum * 10) % 11
    return rem === 10 || rem === 11 ? 0 : rem
  }
  return calc(10) === parseInt(c[9]) && calc(11) === parseInt(c[10])
}

/** HMAC-SHA256 of clean CPF. Never store raw CPF — only this hash goes to DB. */
export function hashCpf(cpf: string): string {
  const secret = process.env.CPF_HASH_SECRET
  if (!secret) throw new Error('CPF_HASH_SECRET env var is not set')
  return createHmac('sha256', secret).update(cleanCpf(cpf)).digest('hex')
}

/** Formats CPF for display: 000.000.000-00 */
export function formatCpf(cpf: string): string {
  const c = cleanCpf(cpf)
  return c.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}
