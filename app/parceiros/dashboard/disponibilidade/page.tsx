import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AvailabilityCalendarEditor from './_components/AvailabilityCalendarEditor'

export default async function ParceiroDisponibilidadePage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/parceiros/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('partner_id')
    .eq('auth_user_id', session.user.id)
    .single()
  if (!profile?.partner_id) redirect('/parceiros/login')

  const { data: listings } = await supabase
    .from('partner_listings')
    .select('id, title, slug')
    .eq('partner_id', profile.partner_id)
    .eq('type', 'accommodation')
    .order('title')

  if (!listings || listings.length === 0) {
    return (
      <div style={{ padding: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: '#0f172a', marginBottom: '1rem' }}>
          Disponibilidade
        </h1>
        <p style={{ color: '#64748b' }}>Nenhuma hospedagem cadastrada ainda. Entre em contato com a equipe Acalanto.</p>
      </div>
    )
  }

  const listingIds = listings.map(l => l.id)
  const { data: avail } = await supabase
    .from('accommodation_availability')
    .select('listing_id, date, status')
    .in('listing_id', listingIds)

  const availMap: Record<string, Record<string, string>> = {}
  for (const row of avail ?? []) {
    if (!availMap[row.listing_id]) availMap[row.listing_id] = {}
    availMap[row.listing_id][row.date] = row.status
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '900px' }}>
      <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: '#0f172a', marginBottom: '0.25rem' }}>
        Disponibilidade
      </h1>
      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Clique em uma data para alternar entre disponível e bloqueado.
      </p>
      {listings.map(listing => (
        <AvailabilityCalendarEditor
          key={listing.id}
          listing={listing}
          initialAvail={availMap[listing.id] ?? {}}
        />
      ))}
    </div>
  )
}
