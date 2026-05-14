import type { ReactNode } from 'react'

export type PaymentBrand = 'pix' | 'visa' | 'mastercard' | 'elo' | 'amex' | 'hipercard'

interface Props {
  brand: PaymentBrand
  size?: number
  className?: string
}

// SVGs simplificados das marcas oficiais. Substituir por brand kits reais
// se o cliente exigir 100% fidelidade visual.
const SVGS: Record<PaymentBrand, ReactNode> = {
  pix: (
    <g fill="#32BCAD">
      <path d="M28 16l-8-8h-8l-8 8 8 8h8z" />
      <text x="50" y="20" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="14" fill="#32BCAD">PIX</text>
    </g>
  ),
  visa: (
    <g>
      <rect width="100%" height="100%" rx="4" fill="#1A1F71" />
      <text x="50%" y="62%" textAnchor="middle" fontFamily="Arial Black, sans-serif" fontSize="14" fill="white" fontStyle="italic">VISA</text>
    </g>
  ),
  mastercard: (
    <g>
      <rect width="100%" height="100%" rx="4" fill="white" />
      <circle cx="38%" cy="50%" r="28%" fill="#EB001B" />
      <circle cx="62%" cy="50%" r="28%" fill="#F79E1B" opacity="0.85" />
    </g>
  ),
  elo: (
    <g>
      <rect width="100%" height="100%" rx="4" fill="black" />
      <text x="50%" y="62%" textAnchor="middle" fontFamily="Arial Black, sans-serif" fontSize="14" fill="white">ELO</text>
    </g>
  ),
  amex: (
    <g>
      <rect width="100%" height="100%" rx="4" fill="#2E77BC" />
      <text x="50%" y="62%" textAnchor="middle" fontFamily="Arial Black, sans-serif" fontSize="9" fill="white">AMERICAN EXPRESS</text>
    </g>
  ),
  hipercard: (
    <g>
      <rect width="100%" height="100%" rx="4" fill="#C2272D" />
      <text x="50%" y="62%" textAnchor="middle" fontFamily="Arial Black, sans-serif" fontSize="10" fill="white">Hipercard</text>
    </g>
  ),
}

export function PaymentBadge({ brand, size = 32, className }: Props) {
  const aspectRatio = brand === 'pix' ? 2 : 1.6
  const width = Math.round(size * aspectRatio)
  return (
    <svg
      role="img"
      aria-label={`Pagamento ${brand}`}
      width={width}
      height={size}
      viewBox={`0 0 ${width} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {SVGS[brand]}
    </svg>
  )
}

export const ALL_PAYMENT_BRANDS: PaymentBrand[] = ['pix', 'visa', 'mastercard', 'elo', 'amex', 'hipercard']
