import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    if (!rateLimit(`contact:${ip}`, 5, 60_000)) {
      return NextResponse.json({ error: 'Muitas requisições. Tente novamente em breve.' }, { status: 429 })
    }

    const body = await req.json()
    const { name, phone, email, message } = body as { name?: string; phone?: string; email?: string; message?: string }

    if (!name || !message) {
      return NextResponse.json({ error: 'Nome e mensagem são obrigatórios.' }, { status: 400 })
    }

    // Basic input length limits
    if (name.length > 200 || message.length > 5000 || (email && email.length > 200) || (phone && phone.length > 50)) {
      return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 })
    }

    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { error } = await supabase.from('contacts').insert({ name, phone, email, message })
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[contact]', err)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
