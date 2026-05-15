import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/admin-auth'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    await requireSuperAdmin()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const body = await req.json()
  const { fullName, document, email, businessType, tier, pixKey, pixKeyType } = body

  if (!fullName || !document || !email || !businessType || !pixKey) {
    return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
  }

  const supabase = await createClient()
  const commissionRate = tier === 'tier1' ? 15 : 30

  const { data: partner, error: partnerError } = await supabase
    .from('partners')
    .insert({
      name: fullName,
      document,
      email,
      business_type: businessType,
      commission_rate: commissionRate,
      pix_key: pixKey,
      pix_key_type: pixKeyType,
      status: 'active',
    })
    .select()
    .single()

  if (partnerError) {
    return NextResponse.json({ error: partnerError.message }, { status: 500 })
  }

  return NextResponse.json({ partner })
}
