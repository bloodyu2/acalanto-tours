import { createClient } from '@/lib/supabase/server'

export type Listing = {
  id: string
  partner_id: string
  type: string
  title: string
  slug: string
  description: string | null
  price_label: string | null
  cover_image: string | null
  gallery: string[]
  metadata: Record<string, unknown>
  status: string
  active: boolean
  created_at: string
  updated_at: string
}

export async function getApprovedListings(type: string): Promise<Listing[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('partner_listings')
    .select('*')
    .eq('type', type)
    .eq('status', 'approved')
    .eq('active', true)
    .order('created_at', { ascending: false })
  return (data as Listing[]) ?? []
}

export async function getListingBySlug(slug: string): Promise<Listing | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('partner_listings')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'approved')
    .eq('active', true)
    .single()
  return data as Listing | null
}

export async function getPartnerByAuthUser(authUserId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('partners')
    .select('*')
    .eq('auth_user_id', authUserId)
    .single()
  return data
}

export async function getListingsByPartnerId(partnerId: string): Promise<Listing[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('partner_listings')
    .select('*')
    .eq('partner_id', partnerId)
    .order('created_at', { ascending: false })
  return (data as Listing[]) ?? []
}
