import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json() as { nome?: string; email?: string; senha?: string }
  const { nome, email, senha } = body

  if (!nome || !email || !senha) {
    return NextResponse.json({ error: 'nome, email e senha são obrigatórios' }, { status: 400 })
  }

  const admin = await createAdminClient()

  // Create auth user via admin (bypasses RLS on subsequent DB operations)
  const { data: { user }, error: createError } = await admin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: false, // Supabase sends confirmation email automatically
  })

  if (createError) {
    const msg = createError.message.includes('already been registered')
      ? 'Este e-mail já está cadastrado.'
      : createError.message
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  if (!user) {
    return NextResponse.json({ error: 'Erro ao criar conta. Tente novamente.' }, { status: 500 })
  }

  // Create profile with partner role (admin client bypasses RLS)
  const { error: profileError } = await admin.from('profiles').upsert({
    auth_user_id: user.id,
    role: 'partner',
  }, { onConflict: 'auth_user_id' })

  if (profileError) {
    return NextResponse.json({ error: 'Erro ao criar perfil.' }, { status: 500 })
  }

  // Create partner record
  const { data: partner, error: partnerError } = await admin
    .from('partners')
    .insert({
      name: nome,
      email,
      auth_user_id: user.id,
      status: 'pending',
      submitted_at: new Date().toISOString(),
      active: false,
    })
    .select('id')
    .single()

  if (partnerError || !partner) {
    return NextResponse.json({ error: 'Erro ao registrar parceiro.' }, { status: 500 })
  }

  return NextResponse.json({ partnerId: partner.id })
}
