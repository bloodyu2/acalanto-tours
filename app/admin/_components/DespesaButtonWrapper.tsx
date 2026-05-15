'use client'
import { useState } from 'react'
import DespesaModal from './DespesaModal'

export default function DespesaButtonWrapper() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          padding: '0.625rem 1.25rem', borderRadius: '0.625rem',
          background: 'var(--ocean-deep)', color: 'white',
          border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem',
        }}
      >
        💸 Nova despesa
      </button>
      {open && <DespesaModal onClose={() => setOpen(false)} />}
    </>
  )
}
