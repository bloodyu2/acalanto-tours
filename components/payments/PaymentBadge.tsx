import type { ReactNode } from 'react'

export type PaymentBrand = 'pix' | 'visa' | 'mastercard' | 'elo' | 'amex' | 'hipercard'

interface Props {
  brand: PaymentBrand
  size?: number
  className?: string
}

/**
 * SVGs de alta fidelidade baseados nos brand guidelines oficiais públicos:
 *   • PIX:  Banco Central do Brasil — bcb.gov.br/estabilidadefinanceira/spb (logomark + cor #32BCAD)
 *   • Visa: visabrand.com — wordmark italic em fundo Visa Blue (#1A1F71) com swoosh dourado
 *   • Mastercard: brand.mastercard.com — dois círculos sobrepostos (#EB001B + #F79E1B) com interseção #FF5F00
 *   • Elo: bandeira ELO — "e" multicolor (amarelo #FFCB05, azul #00A3DA, vermelho #EF4123) em fundo preto
 *   • Amex: americanexpress.com — wordmark em fundo Amex Blue (#006FCF)
 *   • Hipercard: itau.com.br/hipercard — wordmark em fundo vermelho (#C2272D)
 *
 * Para 100% de fidelidade visual / produção marketing, baixar os .svg
 * oficiais dos portais de marca acima e substituir cada entry abaixo.
 * Estes desenhos cobrem o caso "reconhecimento imediato pelo cliente".
 */

const SVGS: Record<PaymentBrand, { aspect: number; content: ReactNode }> = {
  // PIX — logomark do BCB: 4 chevrons formando um diamante central, em verde-pix (#32BCAD)
  pix: {
    aspect: 2.6,
    content: (
      <>
        {/* Logomark: 4 triângulos com cantos arredondados formando o "moinho" do PIX */}
        <g transform="translate(2, 2) scale(0.875)" fill="#32BCAD">
          {/* Quadrado central (rotacionado 45°) */}
          <path d="M16 6 L26 16 L16 26 L6 16 Z" />
          {/* 4 chevrons radiais — top */}
          <path d="M16 6 L13 3 L19 3 Z" />
          {/* bottom */}
          <path d="M16 26 L13 29 L19 29 Z" />
          {/* left */}
          <path d="M6 16 L3 13 L3 19 Z" />
          {/* right */}
          <path d="M26 16 L29 13 L29 19 Z" />
        </g>
        {/* Wordmark "Pix" */}
        <text
          x="44"
          y="22"
          fontFamily="'Helvetica Neue', Arial, sans-serif"
          fontWeight="700"
          fontSize="16"
          fill="#32BCAD"
          letterSpacing="-0.5"
        >
          Pix
        </text>
      </>
    ),
  },

  // VISA — fundo azul, wordmark italic + swoosh dourado
  visa: {
    aspect: 1.55,
    content: (
      <>
        <rect width="100%" height="100%" rx="3" fill="#1A1F71" />
        {/* Wordmark "VISA" italic */}
        <text
          x="50%"
          y="64%"
          textAnchor="middle"
          fontFamily="'Helvetica Neue', Arial Black, sans-serif"
          fontWeight="900"
          fontSize="13"
          fill="white"
          fontStyle="italic"
          letterSpacing="0.5"
        >
          VISA
        </text>
        {/* Swoosh dourado da Visa (curva sob o "V") */}
        <path
          d="M 12 24 Q 25 23 38 24"
          stroke="#F7B600"
          strokeWidth="1.5"
          fill="none"
          opacity="0.95"
        />
      </>
    ),
  },

  // MASTERCARD — dois círculos sobrepostos com interseção visível
  mastercard: {
    aspect: 1.55,
    content: (
      <>
        <rect width="100%" height="100%" rx="3" fill="#16161D" />
        {/* Círculo vermelho */}
        <circle cx="40%" cy="50%" r="22%" fill="#EB001B" />
        {/* Círculo laranja */}
        <circle cx="60%" cy="50%" r="22%" fill="#F79E1B" />
        {/* Interseção — laranja-escuro */}
        <path
          d="M 0 0"
          fill="#FF5F00"
        />
        {/* Faixa central de interseção via clip — fazemos com elipse menor */}
        <ellipse cx="50%" cy="50%" rx="9%" ry="22%" fill="#FF5F00" />
        {/* Wordmark "mastercard" abaixo */}
        <text
          x="50%"
          y="92%"
          textAnchor="middle"
          fontFamily="'Helvetica Neue', Arial, sans-serif"
          fontWeight="600"
          fontSize="6"
          fill="white"
          letterSpacing="0.3"
        >
          mastercard
        </text>
      </>
    ),
  },

  // ELO — fundo preto, "elo" wordmark + 3 dots coloridos (amarelo/azul/vermelho)
  elo: {
    aspect: 1.55,
    content: (
      <>
        <rect width="100%" height="100%" rx="3" fill="#000000" />
        {/* "e" multicolor estilizado: 3 quadrantes em amarelo / azul / vermelho */}
        <g transform="translate(8, 8)">
          <circle cx="8" cy="8" r="7" fill="none" stroke="white" strokeWidth="2" />
          {/* 3 arcos coloridos sobrepostos (simplificação do mark oficial) */}
          <path d="M 8 1 A 7 7 0 0 1 15 8" stroke="#FFCB05" strokeWidth="2.5" fill="none" />
          <path d="M 15 8 A 7 7 0 0 1 8 15" stroke="#00A3DA" strokeWidth="2.5" fill="none" />
          <path d="M 8 15 A 7 7 0 0 1 1 8" stroke="#EF4123" strokeWidth="2.5" fill="none" />
        </g>
        {/* Wordmark "elo" */}
        <text
          x="58%"
          y="64%"
          textAnchor="middle"
          fontFamily="'Helvetica Neue', Arial Black, sans-serif"
          fontWeight="900"
          fontSize="13"
          fill="white"
          letterSpacing="-0.5"
        >
          elo
        </text>
      </>
    ),
  },

  // AMEX — fundo azul Amex, wordmark "AMERICAN EXPRESS" em duas linhas
  amex: {
    aspect: 1.55,
    content: (
      <>
        <rect width="100%" height="100%" rx="3" fill="#006FCF" />
        <text
          x="50%"
          y="48%"
          textAnchor="middle"
          fontFamily="'Helvetica Neue', Arial Black, sans-serif"
          fontWeight="900"
          fontSize="6.5"
          fill="white"
          letterSpacing="0.4"
        >
          AMERICAN
        </text>
        <text
          x="50%"
          y="80%"
          textAnchor="middle"
          fontFamily="'Helvetica Neue', Arial Black, sans-serif"
          fontWeight="900"
          fontSize="6.5"
          fill="white"
          letterSpacing="0.4"
        >
          EXPRESS
        </text>
      </>
    ),
  },

  // HIPERCARD — fundo vermelho, wordmark "Hipercard" + barra branca
  hipercard: {
    aspect: 1.55,
    content: (
      <>
        <rect width="100%" height="100%" rx="3" fill="#B3131B" />
        {/* Wordmark */}
        <text
          x="50%"
          y="62%"
          textAnchor="middle"
          fontFamily="'Helvetica Neue', Arial, sans-serif"
          fontWeight="700"
          fontSize="9"
          fill="white"
          fontStyle="italic"
          letterSpacing="-0.3"
        >
          Hipercard
        </text>
        {/* Acento branco abaixo (referência ao logo oficial) */}
        <path
          d="M 16 28 L 35 28"
          stroke="white"
          strokeWidth="1.2"
          opacity="0.7"
        />
      </>
    ),
  },
}

export function PaymentBadge({ brand, size = 32, className }: Props) {
  const def = SVGS[brand]
  const width = Math.round(size * def.aspect)
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
      {def.content}
    </svg>
  )
}

export const ALL_PAYMENT_BRANDS: PaymentBrand[] = ['pix', 'visa', 'mastercard', 'elo', 'amex', 'hipercard']
