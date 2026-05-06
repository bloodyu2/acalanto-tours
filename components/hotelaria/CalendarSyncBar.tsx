'use client'
import { useState } from 'react'

type Props = {
  slug: string
  siteUrl: string
}

export default function CalendarSyncBar({ slug, siteUrl }: Props) {
  const [copied, setCopied] = useState(false)
  const icalUrl = `${siteUrl}/api/ical/${slug}`
  const webcalUrl = icalUrl.replace(/^https?/, 'webcal')
  const googleUrl = `https://www.google.com/calendar/render?cid=${encodeURIComponent(icalUrl)}`

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(icalUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: select input
    }
  }

  return (
    <div style={{
      marginTop: '2rem',
      padding: '1.25rem',
      background: 'white',
      border: '1px solid var(--border)',
      borderRadius: '12px',
    }}>
      <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1rem', color: 'var(--ocean-deep)', marginBottom: '0.25rem' }}>
        Sincronizar disponibilidade
      </h3>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.5 }}>
        Assine o calendário de disponibilidade desta hospedagem.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem' }}>
        {/* Google Calendar */}
        <a
          href={googleUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.5rem 1rem', fontSize: '0.8125rem', fontWeight: 600,
            background: '#4285F4', color: 'white',
            borderRadius: '8px', textDecoration: 'none',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.5 3h-3V1.5h-1.5V3h-9V1.5H4.5V3H1.5A1.5 1.5 0 000 4.5v15A1.5 1.5 0 001.5 21h18a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3zm0 16.5h-18V9h18v10.5zM6 13.5h3v3H6z"/>
          </svg>
          Google Calendar
        </a>

        {/* Apple / iCal */}
        <a
          href={webcalUrl}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.5rem 1rem', fontSize: '0.8125rem', fontWeight: 600,
            background: 'white', color: 'var(--ocean-deep)',
            border: '1px solid var(--border)',
            borderRadius: '8px', textDecoration: 'none',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          Apple / iCal
        </a>

        {/* Download .ics */}
        <a
          href={`${icalUrl}`}
          download={`${slug}.ics`}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.5rem 1rem', fontSize: '0.8125rem', fontWeight: 600,
            background: 'white', color: 'var(--ocean-deep)',
            border: '1px solid var(--border)',
            borderRadius: '8px', textDecoration: 'none',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Baixar .ics
        </a>

        {/* Copy link */}
        <button
          onClick={handleCopy}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.5rem 1rem', fontSize: '0.8125rem', fontWeight: 600,
            background: copied ? '#dcfce7' : 'white',
            color: copied ? '#16a34a' : 'var(--ocean-deep)',
            border: '1px solid var(--border)',
            borderRadius: '8px', cursor: 'pointer',
            transition: 'background 0.2s',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {copied
              ? <><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>
              : <><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></>
            }
          </svg>
          {copied ? 'Copiado!' : 'Copiar link'}
        </button>
      </div>
    </div>
  )
}
