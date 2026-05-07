import type { AsaasWebhookPayload } from './types'

export function validateWebhookToken(request: Request): boolean {
  const token = request.headers.get('asaas-access-token')
  const expected = process.env.ASAAS_WEBHOOK_TOKEN
  if (!expected || !token) return false
  return token === expected
}

export function parseWebhookPayload(body: unknown): AsaasWebhookPayload {
  return body as AsaasWebhookPayload
}
