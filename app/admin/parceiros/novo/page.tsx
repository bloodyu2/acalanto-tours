'use client'

import { useState } from 'react'
import Link from 'next/link'
import { InviteTab } from './_components/InviteTab'
import { AssistidoTab } from './_components/AssistidoTab'

type Tab = 'invite' | 'assistido'

const tabStyle = (active: boolean): React.CSSProperties => ({
  padding: '0.5rem 1rem',
  fontSize: '0.875rem',
  fontWeight: active ? 600 : 400,
  color: active ? 'var(--ocean-deep, #0A3D5C)' : 'var(--text-muted, #64748b)',
  borderBottom: active ? '2px solid var(--ocean-mid, #1A6B8A)' : '2px solid transparent',
  background: 'none',
  border: 'none',
  borderBottomStyle: 'solid',
  borderBottomWidth: '2px',
  borderBottomColor: active ? 'var(--ocean-mid, #1A6B8A)' : 'transparent',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
})

export default function NovoParceiroPage() {
  const [tab, setTab] = useState<Tab>('invite')

  return (
    <div style={{ padding: '2rem', maxWidth: '600px' }}>
      <Link href="/admin/parceiros" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none' }}>← Parceiros</Link>
      <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--ocean-deep)', margin: '0.5rem 0 1rem' }}>Novo Parceiro</h1>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
        <button style={tabStyle(tab === 'invite')} onClick={() => setTab('invite')}>
          Convidar por e-mail
        </button>
        <button style={tabStyle(tab === 'assistido')} onClick={() => setTab('assistido')}>
          Cadastro assistido
        </button>
      </div>

      {tab === 'invite' && <InviteTab />}
      {tab === 'assistido' && <AssistidoTab />}
    </div>
  )
}
