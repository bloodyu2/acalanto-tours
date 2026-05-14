import type { AsaasSplitItem } from './types'
import type { CartItem } from '@/components/cart/CartProvider'

/**
 * Modelo de split (atualizado 2026-05-13 após alinhamento com Acalanto):
 *
 *   100% da venda  =  partnerPct% prestador + 6% Balaio + (resto%) Acalanto
 *
 * A Balaio Digital recebe SEMPRE 6% do total bruto da venda — não 6% da fatia da
 * Acalanto, como estava antes. Esses 6% saem da retenção da Acalanto, ou seja,
 * o prestador continua recebendo `partnerPct`% intacto e quem absorve a Balaio
 * é a Acalanto.
 *
 * Exemplo: venda de R$ 100, comissão do prestador = 70%
 *   • Prestador:  R$ 70,00  (70%)
 *   • Balaio:     R$  6,00  ( 6% do total)
 *   • Acalanto:   R$ 24,00  (resto = 30% bruto − 6%)
 */
export const BALAIO_TOTAL_PCT = 6

export interface CartItemWithPartner extends CartItem {
  partnerWalletId?: string
  /** % que o PRESTADOR recebe (ex: 70 → Acalanto + Balaio ficam com 30%). */
  commissionPct?: number
}

export interface SplitCents {
  partnerCents: number
  balaioCents: number
  acalantoCents: number
}

/**
 * Calcula a divisão em centavos para um valor total e a comissão do prestador.
 * Usado tanto para a UI (calculadora, modal de admin) quanto para validação.
 *
 * Se `includeBalaio` for true, separa os 6% da Balaio; caso contrário, todo o
 * resto vai pra Acalanto (modelo antigo, antes da Balaio entrar como wallet).
 */
export function computeSplitCents(
  totalCents: number,
  partnerPct: number,
  includeBalaio = true
): SplitCents {
  const safePartner = Math.max(0, Math.min(100, partnerPct))
  const partnerCents = Math.round(totalCents * safePartner / 100)

  let balaioCents = 0
  if (includeBalaio) {
    // A Balaio só pode receber 6% se a fatia da Acalanto (total - prestador)
    // for pelo menos 6%. Caso contrário, Balaio fica zerada (fail-safe).
    const acalantoGrossPct = 100 - safePartner
    if (acalantoGrossPct >= BALAIO_TOTAL_PCT) {
      balaioCents = Math.round(totalCents * BALAIO_TOTAL_PCT / 100)
    }
  }

  const acalantoCents = totalCents - partnerCents - balaioCents
  return { partnerCents, balaioCents, acalantoCents }
}

/**
 * Monta o array de split para a cobrança ASAAS.
 *
 * Só é chamado quando ASAAS_SPLIT_ENABLED está definida. A conta principal
 * (Acalanto) recebe automaticamente o que sobra — só precisamos especificar
 * prestador e Balaio.
 */
export function buildSplit(items: CartItemWithPartner[]): AsaasSplitItem[] | undefined {
  if (!process.env.ASAAS_SPLIT_ENABLED) return undefined

  const balaioWalletId = process.env.ASAAS_BALAIO_WALLET_ID

  const splits: AsaasSplitItem[] = []

  for (const item of items) {
    if (!item.partnerWalletId) continue

    const partnerPct = item.commissionPct ?? 70

    // Guard: precisa sobrar pelo menos 6% pra Balaio. Se o parceiro pega
    // tudo (94%+), não dá pra fundar a Balaio — abortamos esse item.
    if (partnerPct + BALAIO_TOTAL_PCT > 100) continue

    splits.push({
      walletId: item.partnerWalletId,
      percentualValue: partnerPct,
    })

    if (balaioWalletId) {
      splits.push({
        walletId: balaioWalletId,
        percentualValue: BALAIO_TOTAL_PCT,
      })
    }
    // Acalanto (conta principal ASAAS) recebe o restante automaticamente.
  }

  return splits.length > 0 ? splits : undefined
}
