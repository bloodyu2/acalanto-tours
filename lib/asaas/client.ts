import type { AsaasCustomer, AsaasChargeRequest, AsaasCharge, AsaasSubcontaRequest, AsaasSubcontaResponse } from './types'

function getBaseUrl(): string {
  return process.env.ASAAS_ENVIRONMENT === 'production'
    ? 'https://api.asaas.com/v3'
    : 'https://sandbox.asaas.com/api/v3'
}

function getApiKey(): string {
  const key = process.env.ASAAS_ENVIRONMENT === 'production'
    ? process.env.ASAAS_API_KEY
    : process.env.ASAAS_SANDBOX_API_KEY
  if (!key) throw new Error('ASAAS API key not configured')
  return key
}

async function asaasFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${getBaseUrl()}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'access_token': getApiKey(),
      ...options.headers,
    },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`ASAAS ${options.method ?? 'GET'} ${path} → ${res.status}: ${body}`)
  }
  return res.json()
}

export async function createOrFindCustomer(data: AsaasCustomer): Promise<string> {
  const search = await asaasFetch<{ data: Array<{ id: string }> }>(
    `/customers?cpfCnpj=${data.cpfCnpj}&limit=1`
  )
  if (search.data.length > 0) return search.data[0].id

  const customer = await asaasFetch<{ id: string }>('/customers', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return customer.id
}

export async function createCharge(data: AsaasChargeRequest): Promise<AsaasCharge> {
  return asaasFetch<AsaasCharge>('/payments', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function getCharge(id: string): Promise<AsaasCharge> {
  return asaasFetch<AsaasCharge>(`/payments/${id}`)
}

export async function getPixQrCode(paymentId: string): Promise<{ encodedImage: string; payload: string } | null> {
  try {
    return await asaasFetch<{ encodedImage: string; payload: string }>(`/payments/${paymentId}/pixQrCode`)
  } catch {
    return null
  }
}

export async function createSubconta(
  data: AsaasSubcontaRequest
): Promise<AsaasSubcontaResponse> {
  return asaasFetch<AsaasSubcontaResponse>('/accounts', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function disableSubconta(asaasAccountId: string): Promise<void> {
  await asaasFetch<unknown>(`/accounts/${asaasAccountId}/status`, {
    method: 'POST',
    body: JSON.stringify({ status: 'INACTIVE' }),
  })
}
