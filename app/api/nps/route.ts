import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyNpsToken, isNpsExpired } from '@/lib/nps'

export async function POST(req: NextRequest) {
  let body: { booking_id?: unknown; token?: unknown; score?: unknown; comment?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body invalido' }, { status: 400 })
  }

  const { booking_id, token, score, comment } = body

  // Validate required fields
  if (!booking_id || typeof booking_id !== 'string') {
    return NextResponse.json({ error: 'booking_id obrigatorio' }, { status: 400 })
  }
  if (!token || typeof token !== 'string') {
    return NextResponse.json({ error: 'token obrigatorio' }, { status: 400 })
  }
  if (score === undefined || score === null || typeof score !== 'number' || score < 0 || score > 10 || !Number.isInteger(score)) {
    return NextResponse.json({ error: 'score deve ser inteiro entre 0 e 10' }, { status: 400 })
  }

  const supabase = await createAdminClient()

  const { data: survey } = await supabase
    .from('nps_surveys')
    .select('id, token, token_expires, submitted_at')
    .eq('booking_id', booking_id)
    .maybeSingle()

  if (!survey) {
    return NextResponse.json({ error: 'Pesquisa nao encontrada' }, { status: 404 })
  }

  if (survey.submitted_at) {
    return NextResponse.json({ error: 'Ja respondido' }, { status: 409 })
  }

  const expiresAt = new Date(survey.token_expires)

  if (isNpsExpired(expiresAt) || !verifyNpsToken(token, booking_id, expiresAt)) {
    return NextResponse.json({ error: 'Token invalido ou expirado' }, { status: 401 })
  }

  const { error: updateError } = await supabase
    .from('nps_surveys')
    .update({
      score,
      comment: typeof comment === 'string' ? comment : null,
      submitted_at: new Date().toISOString(),
    })
    .eq('id', survey.id)

  if (updateError) {
    return NextResponse.json({ error: 'Erro ao salvar resposta' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
