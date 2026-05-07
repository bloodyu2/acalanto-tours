import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import ServicosPageClient from '@/components/services/ServicosPageClient'
import type { ServiceProvider } from '@/lib/types/database'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Serviços',
  description: 'Além das escunas: lancha privativa, fotografia profissional, passeio de jeep e transfer em Paraty.',
}

export default async function ServicosPage() {
  const supabase = await createClient()
  const { data: services } = await supabase
    .from('acalanto_services')
    .select('id, slug, name, description, price_label, pricing_type, price_cents_per_person, price_cents_group, capacity_max')
    .eq('active', true)
    .order('display_order')

  // Pre-fetch unavailability for all services (small dataset)
  const allIds = (services ?? []).map((s: { id: string }) => s.id)
  let unavailableMap: Record<string, string[]> = {}
  if (allIds.length > 0) {
    const { data: unavailRows } = await supabase
      .from('service_availability')
      .select('service_id, date')
      .in('service_id', allIds)
      .eq('available', false)
    if (unavailRows) {
      unavailableMap = unavailRows.reduce((acc: Record<string, string[]>, row: { service_id: string; date: string }) => {
        if (!acc[row.service_id]) acc[row.service_id] = []
        acc[row.service_id].push(row.date)
        return acc
      }, {})
    }
  }

  // Fetch providers per service
  const { data: providerRows } = await supabase
    .from('service_providers')
    .select('id, service_id, partner_id, notes, display_order, partner:partners(id, name, description, whatsapp_number)')
    .order('display_order', { ascending: true })

  const providersMap: Record<string, ServiceProvider[]> = {}
  for (const row of providerRows ?? []) {
    const sid = (row as unknown as { service_id: string }).service_id
    if (!sid) continue
    if (!providersMap[sid]) providersMap[sid] = []
    providersMap[sid].push(row as unknown as ServiceProvider)
  }

  return (
    <>
      <section style={{ background: 'linear-gradient(135deg, var(--ocean-deep) 0%, var(--ocean-mid) 100%)', padding: '5rem 0 3rem', position: 'relative' }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, lineHeight: 0 }}>
          <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '60px' }}>
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="white" />
          </svg>
        </div>
        <div className="container" style={{ position: 'relative' }}>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'white', marginBottom: '0.5rem' }}>Serviços</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.125rem' }}>Complete seu itinerário em Paraty</p>
        </div>
      </section>

      <section style={{ padding: '4rem 0 5rem' }}>
        <div className="container">
          <ServicosPageClient
            services={services ?? []}
            unavailableMap={unavailableMap}
            providersMap={providersMap}
          />
        </div>
      </section>
    </>
  )
}
