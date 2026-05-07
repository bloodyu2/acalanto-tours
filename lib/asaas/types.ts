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
