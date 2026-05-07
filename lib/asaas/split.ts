import type { AsaasSplitItem } from './types'
import type { CartItem } from '@/components/cart/CartProvider'

export interface CartItemWithPartner extends CartItem {
  partnerWalletId?: string
  commissionPct?: number
}

export function buildSplit(items: CartItemWithPartner[]): AsaasSplitItem[] | undefined {
  if (!process.env.ASAAS_SPLIT_ENABLED) return undefined

  const splits: AsaasSplitItem[] = []
  for (const item of items) {
    if (!item.partnerWalletId) continue
    splits.push({
      walletId: item.partnerWalletId,
      percentualValue: item.commissionPct ?? 90,
    })
  }
  return splits.length > 0 ? splits : undefined
}
