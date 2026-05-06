'use client'

import { useEffect } from 'react'

export default function UtmTracker() {
  useEffect(() => {
    const search = window.location.search
    if (!search) return

    const params = new URLSearchParams(search)
    const utm_source = params.get('utm_source') ?? ''
    const utm_medium = params.get('utm_medium') ?? ''
    const utm_campaign = params.get('utm_campaign') ?? ''

    if (!utm_source && !utm_medium && !utm_campaign) return

    // Persist campaign in sessionStorage and cookie (7 days)
    if (utm_campaign) {
      try {
        sessionStorage.setItem('utm_campaign', utm_campaign)
      } catch {
        // sessionStorage not available
      }
      document.cookie = `utm_campaign=${utm_campaign}; max-age=604800; path=/`
    }

    // Reuse stable session ID for consistent funnel attribution
    let session_id: string
    try {
      session_id = sessionStorage.getItem('utm_session_id') ?? crypto.randomUUID()
      sessionStorage.setItem('utm_session_id', session_id)
    } catch {
      session_id = crypto.randomUUID()
    }

    fetch('/api/utm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        partner_slug: utm_campaign || null,
        utm_source: utm_source || null,
        utm_medium: utm_medium || null,
        utm_campaign: utm_campaign || null,
        session_id,
      }),
    }).catch(() => {
      // Non-critical: ignore network errors
    })
  }, [])

  return null
}
