import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PaymentBadge } from '@/components/payments/PaymentBadge'

describe('PaymentBadge', () => {
  it.each(['pix', 'visa', 'mastercard', 'elo', 'amex', 'hipercard'] as const)(
    'renders %s badge with aria-label',
    (brand) => {
      render(<PaymentBadge brand={brand} />)
      expect(screen.getByLabelText(new RegExp(brand, 'i'))).toBeInTheDocument()
    }
  )

  it('respects size prop', () => {
    const { container } = render(<PaymentBadge brand="pix" size={48} />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('height', '48')
  })
})
