import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin-auth'

export async function POST(req: Request) {
  const adminUser = await getAdminUser()
  if (!adminUser || adminUser.role !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createAdminClient()
  const body = await req.json() as {
    name: string; type: string; email: string;
    phone?: string; notes?: string; internal_rating?: number
  }
  const { name, type, email, phone, notes, internal_rating } = body

  if (!name || !type || !email) {
    return NextResponse.json({ error: 'name, type e email são obrigatórios' }, { status: 400 })
  }

  const { data: partner, error: partnerError } = await supabase
    .from('partners')
    .insert({ name, type, email, phone: phone || null, notes: notes || null, internal_rating: internal_rating ?? null, active: true })
    .select()
    .single()

  if (partnerError) {
    return NextResponse.json({ error: partnerError.message }, { status: 400 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/parceiros/dashboard&type=invite`,
  })

  if (inviteError) {
    return NextResponse.json({ partner, inviteError: inviteError.message }, { status: 207 })
  }

  return NextResponse.json({ partner })
}
