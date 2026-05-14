export type AsaasBillingType = 'PIX' | 'CREDIT_CARD' | 'BOLETO' | 'DEBIT_CARD'

export interface AsaasCustomer {
  name: string
  cpfCnpj: string
  email?: string
  phone?: string
}

export interface AsaasSplitItem {
  walletId: string
  percentualValue?: number
  fixedValue?: number
}

export interface AsaasChargeRequest {
  customer: string
  billingType: AsaasBillingType
  value: number
  dueDate: string
  description?: string
  externalReference?: string
  split?: AsaasSplitItem[]
  creditCard?: {
    holderName: string
    number: string
    expiryMonth: string
    expiryYear: string
    ccv: string
  }
  creditCardHolderInfo?: {
    name: string
    cpfCnpj: string
    email: string
    phone: string
    postalCode: string
    addressNumber: string
  }
}

export interface AsaasCharge {
  id: string
  status: string
  billingType: AsaasBillingType
  value: number
  invoiceUrl: string | null
  bankSlipUrl: string | null
  pixQrCode?: {
    encodedImage: string
    payload: string
  }
}

export interface AsaasSubcontaRequest {
  name: string
  email: string
  cpfCnpj: string
  birthDate: string      // YYYY-MM-DD
  mobilePhone: string    // apenas dígitos
  address: string
  addressNumber: string
  province: string
  postalCode: string     // apenas dígitos
  companyType?: 'MEI' | 'LIMITED' | 'INDIVIDUAL' | 'ASSOCIATION'
}

export interface AsaasSubcontaResponse {
  id: string             // asaas account ID — salvar como asaas_account_id
  walletId: string       // salvar como asaas_wallet_id
  name: string
  email: string
}

export interface AsaasTransferRequest {
  value: number          // valor em R$ (ex: 245.00)
  walletId: string       // wallet ID do parceiro destino
  description?: string
}

export interface AsaasTransfer {
  id: string
  value: number
  status: 'PENDING' | 'DONE' | 'CANCELLED' | 'FAILED' | string
  transferDate?: string
  description?: string
}

export interface AsaasWebhookPayload {
  event: 'PAYMENT_RECEIVED' | 'PAYMENT_OVERDUE' | 'PAYMENT_REFUNDED' | 'PAYMENT_CONFIRMED'
  payment: {
    id: string
    externalReference: string | null
    status: string
    value: number
    billingType: AsaasBillingType
  }
}

// ASAAS Checkout API — POST /v3/checkouts
// Docs: https://docs.asaas.com/reference/checkout
// The response includes a `url` field with an embeddable link
// (ASAAS hosted card form — zero PCI scope for the merchant).
// If the API is unavailable or returns no URL, the caller falls back to
// invoiceUrl from a regular createCharge response.
export interface AsaasCheckoutRequest {
  name: string
  value: number
  dueDate: string
  billingTypes: Array<'CREDIT_CARD' | 'BOLETO' | 'PIX'>
  description?: string
  externalReference?: string
  successUrl?: string
  notificationEnabled?: boolean
}

export interface AsaasCheckoutResponse {
  id: string
  url: string           // URL embarcável em iframe (campo retornado pela API ASAAS)
  status: string
}
