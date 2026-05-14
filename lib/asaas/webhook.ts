import crypto from 'crypto'
import type { AsaasWebhookPayload } from './types'

export function validateWebhookToken(request: Request): boolean {
  const token = request.headers.get('asaas-access-token')
  const expected = process.env.ASAAS_WEBHOOK_TOKEN
  if (!expected || !token) return false
  const tokenBuf = Buffer.from(token, 'utf8')
  const expectedBuf = Buffer.from(expected, 'utf8')
  if (tokenBuf.length !== expectedBuf.length) return false
  return crypto.timingSafeEqual(tokenBuf, expectedBuf)
}

export function parseWebhookPayload(body: unknown): AsaasWebhookPayload {
  return body as AsaasWebhookPayload
}
