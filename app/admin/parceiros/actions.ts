'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'

export async function approveListing(listingId: string) {
  const supabase = await createAdminClient()
  const { error } = await supabase
    .from('partner_listings')
    .update({ status: 'approved', updated_at: new Date().toISOString() })
    .eq('id', listingId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/parceiros')
}

export async function rejectListing(listingId: string, reason: string) {
  const supabase = await createAdminClient()
  const { error } = await supabase
    .from('partner_listings')
    .update({ status: 'rejected', rejection_reason: reason, updated_at: new Date().toISOString() })
    .eq('id', listingId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/parceiros')
}

export async function approvePartnerClaim(partnerId: string) {
  const supabase = await createAdminClient()
  const { error } = await supabase
    .from('partners')
    .update({ status: 'approved' })
    .eq('id', partnerId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/parceiros')
}

export async function rejectPartnerClaim(partnerId: string, reason: string) {
  const supabase = await createAdminClient()
  const { error } = await supabase
    .from('partners')
    .update({ status: 'rejected', rejection_reason: reason })
    .eq('id', partnerId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/parceiros')
}
