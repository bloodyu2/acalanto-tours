import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/admin-auth'

export async function POST(req: NextRequest) {
  try {
    await requireSuperAdmin()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { description, valueCents, pixKey } = await req.json()

  if (!description || !valueCents || !pixKey) {
    return NextResponse.json({ error: 'description, valueCents, pixKey são obrigatórios' }, { status: 400 })
  }

  const apiKey = process.env.ASAAS_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'ASAAS_API_KEY não configurada' }, { status: 500 })

  const response = await fetch('https://api.asaas.com/v3/transfers', {
    method: 'POST',
    headers: {
      'access_token': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      value: valueCents / 100,
      pixAddressKey: pixKey,
      pixAddressKeyType: 'EVP',
      description,
      scheduleDate: new Date().toISOString().split('T')[0],
    }),
  })

  const data = await response.json()
  if (!response.ok) {
    return NextResponse.json({ error: data.errors?.[0]?.description || 'Erro ASAAS' }, { status: 500 })
  }
  return NextResponse.json({ transfer: data })
}
