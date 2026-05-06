'use client'

import { useState, useTransition } from 'react'
import { approveListing, rejectListing, approvePartnerClaim, rejectPartnerClaim } from './actions'

type Listing = {
  id: string
  title: string
  slug: string
  type: string
  status: string
  created_at: string
  partner_name: string
}

type Claim = {
  id: string
  name: string
  type: string
  submitted_at: string | null
  claimed_by: string | null
  status: string
}

type Props = {
  listings: Listing[]
  claims: Claim[]
}

const typeLabels: Record<string, string> = {
  boat: 'Embarcacao', photo: 'Fotografia', jeep: 'Jeep',
  guide: 'Guia', transfer: 'Transfer', hotel: 'Hotel',
  hospedagem: 'Hospedagem', restaurante: 'Restaurante', other: 'Outro',
}

function getPreviewHref(listing: Listing) {
  if (listing.type === 'hospedagem' || listing.type === 'hotel') {
    return `/hotelaria/${listing.slug}`
  }
  return `/parceiros/${listing.slug}`
}

export default function ApprovalTabs({ listings, claims }: Props) {
  const [activeTab, setActiveTab] = useState<'listings' | 'claims'>('listings')
  const [rejectModalListing, setRejectModalListing] = useState<Listing | null>(null)
  const [rejectModalClaim, setRejectModalClaim] = useState<Claim | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [isPending, startTransition] = useTransition()
  const [feedbackMsg, setFeedbackMsg] = useState('')

  function showFeedback(msg: string) {
    setFeedbackMsg(msg)
    setTimeout(() => setFeedbackMsg(''), 3000)
  }

  function handleApproveListing(listing: Listing) {
    startTransition(async () => {
      try {
        await approveListing(listing.id)
        showFeedback(`Anuncio "${listing.title}" aprovado.`)
      } catch (e) {
        showFeedback('Erro ao aprovar. Tente novamente.')
      }
    })
  }

  function openRejectListing(listing: Listing) {
    setRejectReason('')
    setRejectModalListing(listing)
    setRejectModalClaim(null)
  }

  function openRejectClaim(claim: Claim) {
    setRejectReason('')
    setRejectModalClaim(claim)
    setRejectModalListing(null)
  }

  function handleConfirmRejectListing() {
    if (!rejectModalListing) return
    startTransition(async () => {
      try {
        await rejectListing(rejectModalListing.id, rejectReason)
        showFeedback(`Anuncio "${rejectModalListing.title}" rejeitado.`)
        setRejectModalListing(null)
      } catch (e) {
        showFeedback('Erro ao rejeitar. Tente novamente.')
      }
    })
  }

  function handleApproveClaim(claim: Claim) {
    startTransition(async () => {
      try {
        await approvePartnerClaim(claim.id)
        showFeedback(`Claim de "${claim.name}" aprovado.`)
      } catch (e) {
        showFeedback('Erro ao aprovar claim. Tente novamente.')
      }
    })
  }

  function handleConfirmRejectClaim() {
    if (!rejectModalClaim) return
    startTransition(async () => {
      try {
        await rejectPartnerClaim(rejectModalClaim.id, rejectReason)
        showFeedback(`Claim de "${rejectModalClaim.name}" rejeitado.`)
        setRejectModalClaim(null)
      } catch (e) {
        showFeedback('Erro ao rejeitar claim. Tente novamente.')
      }
    })
  }

  const tabStyle = (active: boolean) => ({
    padding: '0.5rem 1.25rem',
    borderRadius: '0.5rem',
    fontWeight: active ? 700 : 500,
    fontSize: '0.875rem',
    background: active ? '#0A3D5C' : 'transparent',
    color: active ? '#F5EDD8' : '#0A3D5C',
    border: active ? 'none' : '1px solid #0A3D5C',
    cursor: 'pointer',
    transition: 'all 0.15s',
  } as React.CSSProperties)

  return (
    <>
      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <button style={tabStyle(activeTab === 'listings')} onClick={() => setActiveTab('listings')}>
          Anuncios Pendentes {listings.length > 0 && <span style={{ background: '#F4A623', color: 'white', borderRadius: '999px', padding: '0 0.4rem', fontSize: '0.75rem', marginLeft: '0.35rem' }}>{listings.length}</span>}
        </button>
        <button style={tabStyle(activeTab === 'claims')} onClick={() => setActiveTab('claims')}>
          Claims Pendentes {claims.length > 0 && <span style={{ background: '#F4A623', color: 'white', borderRadius: '999px', padding: '0 0.4rem', fontSize: '0.75rem', marginLeft: '0.35rem' }}>{claims.length}</span>}
        </button>
      </div>

      {/* Feedback toast */}
      {feedbackMsg && (
        <div style={{ background: '#0A3D5C', color: '#F5EDD8', padding: '0.75rem 1.25rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
          {feedbackMsg}
        </div>
      )}

      {/* Anuncios Pendentes */}
      {activeTab === 'listings' && (
        <>
          {listings.length === 0 ? (
            <div style={{ background: 'white', borderRadius: '1rem', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Nenhum anuncio pendente de aprovacao.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <thead>
                  <tr style={{ background: '#0A3D5C', color: '#F5EDD8' }}>
                    <th style={thStyle}>Titulo</th>
                    <th style={thStyle}>Tipo</th>
                    <th style={thStyle}>Parceiro</th>
                    <th style={thStyle}>Enviado em</th>
                    <th style={thStyle}>Preview</th>
                    <th style={thStyle}>Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((l, i) => (
                    <tr key={l.id} style={{ background: i % 2 === 0 ? 'white' : '#F5EDD820', borderBottom: '1px solid #eee' }}>
                      <td style={tdStyle}>{l.title}</td>
                      <td style={tdStyle}>{typeLabels[l.type] || l.type}</td>
                      <td style={tdStyle}>{l.partner_name}</td>
                      <td style={tdStyle}>{new Date(l.created_at).toLocaleDateString('pt-BR')}</td>
                      <td style={tdStyle}>
                        <a href={getPreviewHref(l)} target="_blank" rel="noopener noreferrer"
                          style={{ color: '#1A6B8A', textDecoration: 'underline', fontSize: '0.8rem' }}>
                          Ver anuncio ↗
                        </a>
                      </td>
                      <td style={{ ...tdStyle, display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleApproveListing(l)}
                          disabled={isPending}
                          style={btnStyle('#38a169')}
                        >
                          Aprovar
                        </button>
                        <button
                          onClick={() => openRejectListing(l)}
                          disabled={isPending}
                          style={btnStyle('#e53e3e')}
                        >
                          Rejeitar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Claims Pendentes */}
      {activeTab === 'claims' && (
        <>
          {claims.length === 0 ? (
            <div style={{ background: 'white', borderRadius: '1rem', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Nenhum claim pendente de verificacao.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <thead>
                  <tr style={{ background: '#0A3D5C', color: '#F5EDD8' }}>
                    <th style={thStyle}>Parceiro</th>
                    <th style={thStyle}>Tipo</th>
                    <th style={thStyle}>Solicitado em</th>
                    <th style={thStyle}>Claimed by (user ID)</th>
                    <th style={thStyle}>Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.map((c, i) => (
                    <tr key={c.id} style={{ background: i % 2 === 0 ? 'white' : '#F5EDD820', borderBottom: '1px solid #eee' }}>
                      <td style={tdStyle}>{c.name}</td>
                      <td style={tdStyle}>{typeLabels[c.type] || c.type}</td>
                      <td style={tdStyle}>{c.submitted_at ? new Date(c.submitted_at).toLocaleDateString('pt-BR') : '—'}</td>
                      <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '0.75rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.claimed_by}
                      </td>
                      <td style={{ ...tdStyle, display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleApproveClaim(c)}
                          disabled={isPending}
                          style={btnStyle('#38a169')}
                        >
                          Aprovar
                        </button>
                        <button
                          onClick={() => openRejectClaim(c)}
                          disabled={isPending}
                          style={btnStyle('#e53e3e')}
                        >
                          Rejeitar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Reject Modal for Listing */}
      {rejectModalListing && (
        <RejectModal
          title={`Rejeitar anuncio: "${rejectModalListing.title}"`}
          reason={rejectReason}
          onChangeReason={setRejectReason}
          onConfirm={handleConfirmRejectListing}
          onCancel={() => setRejectModalListing(null)}
          isPending={isPending}
        />
      )}

      {/* Reject Modal for Claim */}
      {rejectModalClaim && (
        <RejectModal
          title={`Rejeitar claim de: "${rejectModalClaim.name}"`}
          reason={rejectReason}
          onChangeReason={setRejectReason}
          onConfirm={handleConfirmRejectClaim}
          onCancel={() => setRejectModalClaim(null)}
          isPending={isPending}
        />
      )}
    </>
  )
}

function RejectModal({ title, reason, onChangeReason, onConfirm, onCancel, isPending }: {
  title: string
  reason: string
  onChangeReason: (v: string) => void
  onConfirm: () => void
  onCancel: () => void
  isPending: boolean
}) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: 'white', borderRadius: '1rem', padding: '2rem',
        width: '100%', maxWidth: '480px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      }}>
        <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.125rem', color: '#0A3D5C', marginBottom: '1rem' }}>
          {title}
        </h3>
        <label style={{ fontSize: '0.875rem', color: '#0A3D5C', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
          Motivo da rejeicao (opcional)
        </label>
        <textarea
          value={reason}
          onChange={e => onChangeReason(e.target.value)}
          placeholder="Descreva o motivo para o parceiro..."
          rows={4}
          style={{
            width: '100%', padding: '0.75rem', borderRadius: '0.5rem',
            border: '1px solid #cbd5e0', fontSize: '0.875rem',
            resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box',
          }}
        />
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} disabled={isPending} style={btnStyle('#718096')}>
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={isPending} style={btnStyle('#e53e3e')}>
            {isPending ? 'Rejeitando...' : 'Confirmar Rejeicao'}
          </button>
        </div>
      </div>
    </div>
  )
}

const thStyle: React.CSSProperties = {
  padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem',
  fontWeight: 700, letterSpacing: '0.05em',
}

const tdStyle: React.CSSProperties = {
  padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#2d3748', verticalAlign: 'middle',
}

function btnStyle(bg: string): React.CSSProperties {
  return {
    background: bg, color: 'white', border: 'none',
    borderRadius: '0.375rem', padding: '0.35rem 0.85rem',
    fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
    opacity: 1, transition: 'opacity 0.15s',
  }
}
