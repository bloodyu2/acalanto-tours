'use client'

import { useState } from 'react'
import HotelSheet, { type SheetListing } from './HotelSheet'
import type { AccommodationRoom } from '@/lib/types/database'

function fmtCents(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

interface Props {
  listing: SheetListing
  rooms: AccommodationRoom[]
}

export default function HotelPageClient({ listing, rooms }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [defaultRoom, setDefaultRoom] = useState<AccommodationRoom | null>(null)

  function openForRoom(room: AccommodationRoom) {
    setDefaultRoom(room)
    setSheetOpen(true)
  }

  if (rooms.length === 0) return null

  return (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '1rem' }}>
          Tipos de quarto
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {rooms.map(room => (
            <div
              key={room.id}
              style={{ background: 'white', borderRadius: '14px', padding: '1.25rem', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}
            >
              <div style={{ flex: 1, minWidth: '180px' }}>
                <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.0625rem', fontWeight: 700, marginBottom: '0.25rem' }}>{room.name}</p>
                {room.description && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', lineHeight: 1.5 }}>{room.description}</p>
                )}
                {room.amenities.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                    {room.amenities.slice(0, 4).map(a => (
                      <span key={a} style={{ fontSize: '0.7rem', background: '#e0f2fe', color: '#0369a1', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{a}</span>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--ocean-deep)', marginBottom: '0.375rem' }}>
                  {fmtCents(room.price_per_night_cents)}<span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)' }}>/noite</span>
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.625rem' }}>
                  Máx {room.max_guests} hóspedes
                </p>
                <button
                  type="button"
                  onClick={() => openForRoom(room)}
                  className="btn-primary"
                  style={{ padding: '0.625rem 1.25rem', fontSize: '0.875rem' }}
                >
                  Reservar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {sheetOpen && (
        <HotelSheet
          listing={listing}
          onClose={() => setSheetOpen(false)}
          defaultRoom={defaultRoom}
          prefetchedRooms={rooms}
        />
      )}
    </>
  )
}
