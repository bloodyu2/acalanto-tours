// components/admin/pdv/usePaymentStatus.ts
'use client'
import { useEffect, useRef, useState } from 'react'

interface UsePaymentStatusResult {
  status: 'pending' | 'received' | 'confirmed' | 'overdue' | 'error'
  elapsedSec: number
  canConfirmManually: boolean
}

const POLL_INTERVAL_MS = 3000
const MANUAL_BUTTON_AFTER_SEC = 30

export function usePaymentStatus(bookingId: string | null): UsePaymentStatusResult {
  const [status, setStatus] = useState<UsePaymentStatusResult['status']>('pending')
  const [elapsedSec, setElapsedSec] = useState(0)
  const startedAt = useRef<number | null>(null)
  const finished = useRef(false)

  useEffect(() => {
    if (!bookingId) return
    finished.current = false
    startedAt.current = Date.now()

    const poll = async () => {
      if (finished.current) return
      try {
        const r = await fetch(`/api/admin/pdv/${bookingId}/status`, { cache: 'no-store' })
        const d = await r.json()
        const s = (d.paymentStatus ?? 'pending').toLowerCase() as UsePaymentStatusResult['status']
        setStatus(s)
        if (['received', 'confirmed'].includes(s)) {
          finished.current = true
          return
        }
      } catch {
        setStatus('error')
      }
      setTimeout(poll, POLL_INTERVAL_MS)
    }
    poll()

    const tick = setInterval(() => {
      if (startedAt.current) setElapsedSec(Math.floor((Date.now() - startedAt.current) / 1000))
    }, 1000)

    return () => { finished.current = true; clearInterval(tick) }
  }, [bookingId])

  return {
    status,
    elapsedSec,
    canConfirmManually: elapsedSec >= MANUAL_BUTTON_AFTER_SEC && !['received', 'confirmed'].includes(status),
  }
}
