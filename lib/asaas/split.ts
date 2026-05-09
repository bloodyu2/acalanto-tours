import type { AsaasSplitItem } from './types'
import type { CartItem } from '@/components/cart/CartProvider'

export interface CartItemWithPartner extends CartItem {
  partnerWalletId?: string
  commissionPct?: number   // % que o PARCEIRO recebe (ex: 70 → Acalanto fica com 30%)
}

/**
 * Monta o array de split para a cobrança ASAAS.
 *
 * Só é chamado quando ASAAS_SPLIT_ENABLED está definida.
 *
 * Para cada item com partnerWalletId definido:
 *   - Parceiro recebe: commissionPct% (default 70%)
 *   - Balaio recebe:   6% da parte da Acalanto  (ex: se Acalanto fica 30%, Balaio leva 1,8%)
 *   - Acalanto (conta principal) fica com o restante: (100 - commissionPct) * 0,94
 */
export function buildSplit(items: CartItemWithPartner[]): AsaasSplitItem[] | undefined {
  if (!process.env.ASAAS_SPLIT_ENABLED) return undefined

  const balaioWalletId = process.env.ASAAS_BALAIO_WALLET_ID

  const splits: AsaasSplitItem[] = []

  for (const item of items) {
    if (!item.partnerWalletId) continue

    const partnerPct  = item.commissionPct ?? 70
    const acalantoPct = 100 - partnerPct
    // 6% da parte da Acalanto vai para a Balaio Digital
    const balaioPct   = parseFloat((acalantoPct * 0.06).toFixed(2))

    // Parceiro
    splits.push({
      walletId:       item.partnerWalletId,
      percentualValue: partnerPct,
    })

    // Balaio Digital (só se a wallet ID estiver configurada)
    if (balaioWalletId) {
      splits.push({
        walletId:       balaioWalletId,
        percentualValue: balaioPct,
      })
    }
    // Acalanto (conta principal ASAAS) recebe o restante automaticamente
  }

  return splits.length > 0 ? splits : undefined
}
