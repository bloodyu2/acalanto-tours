'use client'

import { useState } from 'react'
import { useCart } from '@/components/cart/CartProvider'
import type { PhotographerPackage, Partner } from '@/lib/types/database'

type PackageWithPartner = PhotographerPackage & { partners: Pick<Partner, 'name'> | null }

interface PackageSelectorProps {
  packages: PackageWithPartner[]
}

export default function PackageSelector({ packages }: PackageSelectorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [added, setAdded] = useState(false)
  const { addItem } = useCart()

  if (packages.length === 0) {
    return null
  }

  const selected = packages.find(p => p.id === selectedId) ?? null

  function handleAdd() {
    if (!selected) return

    const utmCampaign =
      typeof window !== 'undefined'
        ? sessionStorage.getItem('utm_campaign')
        : null

    addItem({
      id: selected.id,
      type: 'fotografia',
      name: selected.name,
      date: '',
      adults: 1,
      children: 0,
      priceAdultCents: selected.price_cents ?? 0,
      priceChildCents: 0,
      photographerPackageId: selected.id,
      utmCampaign: utmCampaign ?? null,
    })

    setAdded(true)
    setTimeout(() => setAdded(false), 2500)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      <p style={{
        margin: '0 0 0.25rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
        fontSize: '0.9rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}>
        Adicionar fotografia
      </p>

      {packages.map(pkg => (
        <button
          key={pkg.id}
          onClick={() => setSelectedId(pkg.id === selectedId ? null : pkg.id)}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.875rem',
            padding: '1rem',
            border: pkg.id === selectedId
              ? '2px solid var(--vertical-fotografia)'
              : '1px solid var(--border)',
            borderRadius: '0.75rem',
            background: pkg.id === selectedId
              ? 'rgba(245, 158, 11, 0.06)'
              : 'white',
            cursor: 'pointer',
            textAlign: 'left',
            width: '100%',
            transition: 'border-color 0.15s, background 0.15s',
          }}
        >
          {/* Radio indicator */}
          <span style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            border: pkg.id === selectedId
              ? '6px solid var(--vertical-fotografia)'
              : '2px solid var(--border)',
            flexShrink: 0,
            marginTop: '0.1rem',
            transition: 'border 0.15s',
          }} />

          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 0.15rem', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
              {pkg.name}
            </p>
            {pkg.partners?.name && (
              <p style={{ margin: '0 0 0.25rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {pkg.partners.name}
              </p>
            )}
            {pkg.duration_label && (
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {pkg.duration_label}
              </p>
            )}
          </div>

          <span style={{
            fontFamily: 'var(--font-playfair)',
            fontWeight: 700,
            color: 'var(--ocean-deep)',
            fontSize: '1rem',
            flexShrink: 0,
          }}>
            {pkg.price_label ?? 'Consultar'}
          </span>
        </button>
      ))}

      <button
        onClick={handleAdd}
        disabled={!selected || added}
        style={{
          background: selected && !added ? 'var(--vertical-fotografia)' : 'var(--border)',
          color: selected && !added ? 'white' : 'var(--text-muted)',
          border: 'none',
          borderRadius: '0.625rem',
          padding: '0.75rem 1.25rem',
          fontWeight: 700,
          fontSize: '0.9rem',
          cursor: selected && !added ? 'pointer' : 'not-allowed',
          transition: 'background 0.2s, color 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
        }}
      >
        {added ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Adicionado ao carrinho
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
            {selected ? `Adicionar ${selected.name}` : 'Selecione um pacote'}
          </>
        )}
      </button>
    </div>
  )
}
