'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useCart } from './CartProvider'

interface Pkg {
  id: string
  name: string
  price_cents: number
  price_label: string | null
  cover_image: string | null
  tagline: string | null
}

interface Props {
  cartItemId: string
  selectedPackageId?: string
}

export default function PhotographerPicker({ cartItemId, selectedPackageId }: Props) {
  const { updateItem } = useCart()
  const [packages, setPackages] = useState<Pkg[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('photographer_packages')
      .select('id, name, price_cents, price_label, cover_image, tagline')
      .eq('active', true)
      .order('price_cents', { ascending: true })
      .then(({ data }) => {
        setPackages(data ?? [])
        setLoading(false)
      })
  }, [])

  function select(pkg: Pkg) {
    updateItem(cartItemId, {
      photographerPackageId: pkg.id,
      providerId: pkg.id,
      providerName: pkg.name,
      priceAdultCents: pkg.price_cents,
      name: `Fotografia — ${pkg.name}`,
    })
  }

  if (loading) {
    return (
      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
        Carregando fotógrafos...
      </p>
    )
  }

  return (
    <div style={{ marginTop: '0.75rem' }}>
      <p style={{
        fontSize: '0.6875rem',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        fontFamily: 'var(--font-mono)',
        color: 'var(--text-muted)',
        marginBottom: '0.5rem',
      }}>
        Escolha o fotógrafo
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {packages.map(pkg => {
          const isSelected = pkg.id === selectedPackageId
          return (
            <button
              key={pkg.id}
              onClick={() => select(pkg)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.625rem 0.75rem',
                border: `1.5px solid ${isSelected ? 'var(--ocean-mid)' : 'var(--border)'}`,
                borderRadius: '8px',
                background: isSelected ? 'rgba(26,107,138,0.06)' : 'white',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              {/* Avatar */}
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                overflow: 'hidden',
                flexShrink: 0,
                background: 'var(--sand)',
              }}>
                {pkg.cover_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={pkg.cover_image}
                    alt={pkg.name}
                    width={36}
                    height={36}
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    onError={e => {
                      const t = e.currentTarget
                      t.style.display = 'none'
                    }}
                  />
                ) : null}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                  {pkg.name}
                </div>
                {pkg.tagline && (
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {pkg.tagline}
                  </div>
                )}
              </div>

              {/* Price */}
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--ocean-deep)', flexShrink: 0 }}>
                {pkg.price_cents > 0
                  ? (pkg.price_cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                  : pkg.price_label ?? 'Consultar'}
              </div>

              {/* Check mark */}
              {isSelected && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ocean-mid)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
