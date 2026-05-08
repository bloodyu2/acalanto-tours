'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { createSubconta, disableSubconta } from '@/lib/asaas/client'

export async function approveListing(listingId: string) {
  const supabase = await createAdminClient()

  // 1. Fetch listing to get partner_id
  const { data: listing, error: listingFetchError } = await supabase
    .from('partner_listings')
    .select('partner_id')
    .eq('id', listingId)
    .single()
  if (listingFetchError || !listing) throw new Error('Listing not found')

  // 2. Fetch partner fiscal data
  const { data: partner, error: partnerFetchError } = await supabase
    .from('partners')
    .select('id, name, email, asaas_wallet_id, asaas_account_id, cpf_cnpj, birth_date, mobile_phone, address, address_number, province, postal_code')
    .eq('id', listing.partner_id)
    .single()
  if (partnerFetchError || !partner) throw new Error('Partner not found')

  // 3. Create ASAAS subconta only if not already created
  if (!partner.asaas_wallet_id) {
    if (!partner.cpf_cnpj || !partner.birth_date || !partner.mobile_phone || !partner.address || !partner.address_number || !partner.province || !partner.postal_code) {
      throw new Error('Parceiro não preencheu os dados fiscais obrigatórios.')
    }

    const subconta = await createSubconta({
      name:          partner.name,
      email:         partner.email ?? `parceiro+${partner.id}@acalanto.com.br`,
      cpfCnpj:       partner.cpf_cnpj,
      birthDate:     partner.birth_date,
      mobilePhone:   partner.mobile_phone,
      address:       partner.address,
      addressNumber: partner.address_number,
      province:      partner.province,
      postalCode:    partner.postal_code,
    })

    const { error: walletError } = await supabase
      .from('partners')
      .update({
        asaas_wallet_id:  subconta.walletId,
        asaas_account_id: subconta.id,
      })
      .eq('id', partner.id)
    if (walletError) throw new Error(`Erro ao salvar walletId: ${walletError.message}`)
  }

  // 4. Approve the listing
  const { error } = await supabase
    .from('partner_listings')
    .update({ status: 'approved', updated_at: new Date().toISOString() })
    .eq('id', listingId)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/parceiros')
}

export async function rejectListing(listingId: string, reason: string) {
  const supabase = await createAdminClient()

  // 1. Fetch listing to get partner_id
  const { data: listing, error: listingFetchError } = await supabase
    .from('partner_listings')
    .select('partner_id')
    .eq('id', listingId)
    .single()
  if (listingFetchError || !listing) throw new Error('Listing not found')

  // 2. Fetch partner's ASAAS account ID
  const { data: partner } = await supabase
    .from('partners')
    .select('id, asaas_account_id')
    .eq('id', listing.partner_id)
    .single()

  // 3. Disable ASAAS subconta if it exists
  if (partner?.asaas_account_id) {
    await disableSubconta(partner.asaas_account_id)
    await supabase
      .from('partners')
      .update({ asaas_wallet_id: null, asaas_account_id: null })
      .eq('id', partner.id)
  }

  // 4. Reject the listing
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
