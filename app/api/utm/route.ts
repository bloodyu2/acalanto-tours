import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { partner_slug, utm_source, utm_medium, utm_campaign, session_id } = body as {
      partner_slug?: string
      utm_source?: string
      utm_medium?: string
      utm_campaign?: string
      session_id?: string
    }

    const supabase = await createAdminClient()
    const { error } = await supabase.from('utm_events').insert({
      partner_slug: partner_slug ?? null,
      utm_source: utm_source ?? null,
      utm_medium: utm_medium ?? null,
      utm_campaign: utm_campaign ?? null,
      session_id: session_id ?? null,
    })

    if (error) {
      console.error('[utm] insert error:', error)
      return NextResponse.json({ error: 'Erro ao registrar evento.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[utm] unexpected error:', err)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
