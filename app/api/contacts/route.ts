import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, phone, message, source } = body as {
      name?: string
      phone?: string
      message?: string
      source?: string
    }

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Nome e obrigatorio.' }, { status: 400 })
    }
    if (!phone || !phone.trim()) {
      return NextResponse.json({ error: 'Telefone e obrigatorio.' }, { status: 400 })
    }

    const supabase = await createAdminClient()
    const { error } = await supabase.from('contacts').insert({
      name: name.trim(),
      phone: phone.trim(),
      message: message?.trim() || null,
      source: source || 'site',
      read: false,
    })

    if (error) {
      console.error('[contacts] insert error:', error)
      return NextResponse.json({ error: 'Erro ao salvar. Tente novamente.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[contacts] unexpected error:', err)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
