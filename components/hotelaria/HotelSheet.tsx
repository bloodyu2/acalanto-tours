'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useCart } from '@/components/cart/CartProvider'
import type { AccommodationRoom } from '@/lib/types/database'

export type SheetListing = {
  id: string
  slug: string
  title: string
  description: string | null
  cover_image: string | null
  price_label: string | null
  whatsapp_number: string | null
  metadata: Record<string, unknown>
}

function fmtCents(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function getTodayISO() { return new Date().toISOString().split('T')[0] }

function addDays(iso: string, n: number) {
  const d = new Date(iso)
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

function diffDays(from: string, to: string) {
  return Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86400000)
}

interface Props {
  listing: SheetListing | null
  onClose: () => void
  defaultRoom?: AccommodationRoom | null
  prefetchedRooms?: AccommodationRoom[]
}

export default function HotelSheet({ listing, onClose, defaultRoom, prefetchedRooms }: Props) {
  const { addItem, openCart } = useCart()
  const tomorrow = addDays(getTodayISO(), 1)
  const dayAfter = addDays(getTodayISO(), 2)

  const [rooms, setRooms] = useState<AccommodationRoom[]>(prefetchedRooms ?? [])
  const [loadingRooms, setLoadingRooms] = useState(!prefetchedRooms || prefetchedRooms.length === 0)
  const [selectedRoom, setSelectedRoom] = useState<AccommodationRoom | null>(defaultRoom ?? null)
  const [blockedDates, setBlockedDates] = useState<string[]>([])
  const [checkIn, setCheckIn] = useState(tomorrow)
  const [checkOut, setCheckOut] = useState(dayAfter)
  const [guests, setGuests] = useState(2)

  // Fetch rooms when listing opens (unless prefetched)
  useEffect(() => {
    if (!listing) return
    if (prefetchedRooms && prefetchedRooms.length > 0) {
      setRooms(prefetchedRooms)
      setLoadingRooms(false)
      return
    }
    setLoadingRooms(true)
    const supabase = createClient()
    supabase
      .from('accommodation_rooms')
      .select('*')
      .eq('listing_id', listing.id)
      .eq('active', true)
      .order('display_order')
      .then(({ data }) => {
        setRooms(data ?? [])
        setLoadingRooms(false)
      })
  }, [listing?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Pre-select defaultRoom when provided
  useEffect(() => {
    if (defaultRoom) setSelectedRoom(defaultRoom)
  }, [defaultRoom?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch blocked dates when room selected
  useEffect(() => {
    if (!selectedRoom || !listing) return
    const supabase = createClient()
    supabase
      .from('accommodation_availability')
      .select('date')
      .eq('listing_id', listing.id)
      .or(`room_id.eq.${selectedRoom.id},room_id.is.null`)
      .neq('status', 'available')
      .then(({ data }) => setBlockedDates((data ?? []).map(r => r.date)))
  }, [selectedRoom?.id, listing?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ESC + body scroll lock
  useEffect(() => {
    if (!listing) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [listing, onClose])

  if (!listing) return null

  const minNights = selectedRoom?.min_nights ?? 1
  const maxGuests = selectedRoom?.max_guests ?? 10
  const pricePerNight = selectedRoom?.price_per_night_cents ?? 0
  const extraGuestPrice = selectedRoom?.price_extra_guest_cents ?? 0
  const nights = Math.max(0, diffDays(checkIn, checkOut))
  const extraGuests = Math.max(0, guests - 2)
  const totalCents = nights * pricePerNight + nights * extraGuests * extraGuestPrice

  const blockedSet = new Set(blockedDates)
  function hasConflict() {
    for (let i = 0; i < nights; i++) {
      if (blockedSet.has(addDays(checkIn, i))) return true
    }
    return false
  }

  const tooFewNights = nights > 0 && nights < minNights
  const conflict = nights > 0 && hasConflict()
  const canBook = !!selectedRoom && nights >= minNights && !conflict && checkOut > checkIn

  function handleCheckInChange(val: string) {
    setCheckIn(val)
    if (val >= checkOut) setCheckOut(addDays(val, minNights))
  }

  function handleBook() {
    if (!canBook || !selectedRoom) return
    addItem({
      id: `${listing!.id}-${selectedRoom.id}-${checkIn}`,
      type: 'hospedagem',
      name: `${listing!.title} — ${selectedRoom.name}`,
      date: checkIn,
      checkIn,
      checkOut,
      nights,
      guests,
      adults: guests,
      children: 0,
      priceAdultCents: 0,
      priceChildCents: 0,
      pricePerNightCents: pricePerNight,
      accommodationListingId: listing!.id,
      accommodationRoomId: selectedRoom.id,
    })
    openCart()
    onClose()
  }

  const hotelType = (listing.metadata.hotel_type as string) ?? ''
  const hotelTypeLabel: Record<string, string> = { pousada: 'Pousada', hotel: 'Hotel', airbnb: 'Airbnb' }

  return (
    <>
      {/* Overlay */}
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40, backdropFilter: 'blur(2px)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={listing.title}
        style={{
          position: 'fixed', inset: '0 0 0 auto',
          width: '100%', maxWidth: '480px',
          background: 'white', zIndex: 50,
          display: 'flex', flexDirection: 'column',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.15)',
          overflowY: 'auto',
        }}
      >
        {/* Header — sticky */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.15rem' }}>
              Hospedagem{hotelTypeLabel[hotelType] ? ` · ${hotelTypeLabel[hotelType]}` : ''}
            </p>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', color: 'var(--ocean-deep)', margin: 0 }}>
              {listing.title}
            </h2>
          </div>
          <button onClick={onClose} aria-label="Fechar"
            style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--border)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Cover */}
        {listing.cover_image && (
          <div style={{ height: '180px', overflow: 'hidden', flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={listing.cover_image} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        {/* Body */}
        <div style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Room selector */}
          <div>
            <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1rem', color: 'var(--ocean-deep)', marginBottom: '0.75rem' }}>
              Escolha o quarto
            </h3>
            {loadingRooms ? (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {[1, 2].map(i => (
                  <div key={i} style={{ flex: 1, height: '80px', background: '#f3f4f6', borderRadius: '10px' }} />
                ))}
              </div>
            ) : rooms.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Nenhum quarto cadastrado.{' '}
                <a href={`/hotelaria/${listing.slug}`} style={{ color: 'var(--ocean-mid)', fontWeight: 600 }}>Ver página completa</a>
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {rooms.map(room => {
                  const active = selectedRoom?.id === room.id
                  return (
                    <button
                      key={room.id}
                      type="button"
                      onClick={() => setSelectedRoom(room)}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '0.875rem 1rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'left',
                        border: `2px solid ${active ? 'var(--ocean-mid)' : 'var(--border)'}`,
                        background: active ? '#e0f2fe' : 'white',
                        transition: 'border-color 0.15s, background 0.15s',
                      }}
                    >
                      <div>
                        <p style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.15rem', color: 'var(--text-primary)' }}>{room.name}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Máx {room.max_guests} hóspedes · mín {room.min_nights} noite{room.min_nights > 1 ? 's' : ''}
                        </p>
                      </div>
                      <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '1rem', fontWeight: 700, color: 'var(--ocean-deep)', whiteSpace: 'nowrap', marginLeft: '0.75rem' }}>
                        {fmtCents(room.price_per_night_cents)}<span style={{ fontSize: '0.75rem', fontWeight: 400 }}>/noite</span>
                      </p>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Dates */}
          {selectedRoom && (
            <div>
              <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1rem', color: 'var(--ocean-deep)', marginBottom: '0.75rem' }}>Datas</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>Check-in</label>
                  <input type="date" value={checkIn} min={tomorrow} onChange={e => handleCheckInChange(e.target.value)}
                    style={{ width: '100%', padding: '0.625rem 0.5rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>Check-out</label>
                  <input type="date" value={checkOut} min={addDays(checkIn, minNights)} onChange={e => setCheckOut(e.target.value)}
                    style={{ width: '100%', padding: '0.625rem 0.5rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem', boxSizing: 'border-box' }} />
                </div>
              </div>
            </div>
          )}

          {/* Guests */}
          {selectedRoom && (
            <div>
              <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1rem', color: 'var(--ocean-deep)', marginBottom: '0.75rem' }}>Hóspedes</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button type="button" onClick={() => setGuests(g => Math.max(1, g - 1))}
                  style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--border)', background: 'white', cursor: 'pointer', fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                <span style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', fontWeight: 700, minWidth: '2rem', textAlign: 'center' }}>{guests}</span>
                <button type="button" onClick={() => setGuests(g => Math.min(maxGuests, g + 1))}
                  style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--border)', background: 'white', cursor: 'pointer', fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
              </div>
            </div>
          )}

          {/* Validation messages */}
          {tooFewNights && <p style={{ fontSize: '0.8125rem', color: '#ef4444' }}>Mínimo de {minNights} noite{minNights > 1 ? 's' : ''}</p>}
          {conflict && <p style={{ fontSize: '0.8125rem', color: '#ef4444' }}>Período com datas indisponíveis</p>}

          {/* Price summary */}
          {canBook && (
            <div style={{ background: 'var(--sand)', borderRadius: '8px', padding: '0.875rem 1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                <span>{fmtCents(pricePerNight)} × {nights} noite{nights > 1 ? 's' : ''}</span>
                <span>{fmtCents(pricePerNight * nights)}</span>
              </div>
              {extraGuests > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  <span>+{extraGuests} hóspede extra × {nights} noite{nights > 1 ? 's' : ''}</span>
                  <span>{fmtCents(extraGuestPrice * extraGuests * nights)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--ocean-deep)', paddingTop: '0.5rem', borderTop: '1px solid var(--border)', marginTop: '0.5rem' }}>
                <span>Total</span>
                <span>{fmtCents(totalCents)}</span>
              </div>
            </div>
          )}

          {/* CTA */}
          <button
            type="button"
            onClick={handleBook}
            disabled={!canBook}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', fontSize: '1rem', padding: '1rem', opacity: !canBook ? 0.5 : 1, cursor: !canBook ? 'not-allowed' : 'pointer' }}
          >
            Adicionar ao carrinho
          </button>

          <a
            href={`/hotelaria/${listing.slug}`}
            style={{ display: 'block', textAlign: 'center', fontSize: '0.875rem', color: 'var(--ocean-mid)', fontWeight: 600, textDecoration: 'none', paddingBottom: '1rem' }}
          >
            Ver página completa →
          </a>
        </div>
      </div>
    </>
  )
}
