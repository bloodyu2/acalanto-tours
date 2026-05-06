import crypto from 'crypto'

const SECRET = process.env.REVIEW_HMAC_SECRET ?? 'dev-secret'

export function generateNpsToken(bookingId: string, expiresAt: Date): string {
  const payload = `${bookingId}:${expiresAt.getTime()}`
  return crypto.createHmac('sha256', SECRET).update(payload).digest('hex')
}

export function verifyNpsToken(token: string, bookingId: string, expiresAt: Date): boolean {
  const expected = generateNpsToken(bookingId, expiresAt)
  if (token.length !== expected.length) return false
  try {
    return crypto.timingSafeEqual(Buffer.from(token, 'hex'), Buffer.from(expected, 'hex'))
  } catch {
    return false
  }
}

export function isNpsExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt
}

// Used by admin to create survey records when sending NPS emails
export function createNpsSurveyData(bookingId: string): { token: string; token_expires: string } {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  const token = generateNpsToken(bookingId, expiresAt)
  return { token, token_expires: expiresAt.toISOString() }
}
