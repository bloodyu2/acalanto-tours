// One-off setup of admin role test users + sample confirmed booking.
// Run: node --env-file=.env.local scripts/setup-test-data.mjs
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) throw new Error('Missing SUPABASE env')

const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })

const TEST_USERS = [
  { email: 'pdv-teste@acalanto.com', role: 'pdv', display: 'Vendedor Teste' },
  { email: 'tripulacao-teste@acalanto.com', role: 'tripulacao', display: 'Tripulação Teste' },
  { email: 'fotografo-teste@acalanto.com', role: 'fotografo', display: 'Fotógrafo Teste' },
]

async function probe(table) {
  const { error } = await sb.from(table).select('*', { count: 'exact', head: true })
  return error ? error.message : 'OK'
}

console.log('Probing tables…')
console.log('  admin_users:', await probe('admin_users'))
console.log('  bookings:   ', await probe('bookings'))
console.log('  boats:      ', await probe('boats'))

async function ensureUser({ email, role, display }) {
  // Try create
  const created = await sb.auth.admin.createUser({
    email,
    password: 'Teste@123',
    email_confirm: true,
    user_metadata: { display_name: display },
  })
  let id
  if (created.error && !/already.*registered/i.test(created.error.message)) {
    throw new Error(`createUser(${email}): ${created.error.message}`)
  }
  if (created.data?.user) {
    id = created.data.user.id
    console.log(`  + auth user ${email} created (${id})`)
  } else {
    // Find existing
    let page = 1
    while (page < 5) {
      const list = await sb.auth.admin.listUsers({ page, perPage: 200 })
      const u = list.data?.users?.find(u => u.email === email)
      if (u) { id = u.id; break }
      if ((list.data?.users?.length ?? 0) < 200) break
      page++
    }
    if (!id) throw new Error(`Could not find auth user for ${email}`)
    console.log(`  · auth user ${email} exists (${id})`)
  }
  // Upsert admin_users row
  const up = await sb.from('admin_users').upsert(
    { id, role, display_name: display },
    { onConflict: 'id' }
  )
  if (up.error) console.log(`  ! admin_users upsert(${email}): ${up.error.message}`)
  else console.log(`  ✓ admin_users role=${role} set for ${email}`)
  return id
}

console.log('\nCreating test users…')
for (const u of TEST_USERS) {
  try { await ensureUser(u) } catch (e) { console.log('  ! failed:', e.message) }
}

console.log('\nCreating test booking (confirmed)…')
const { data: boats } = await sb.from('boats').select('id, name, price_adult, commission_pct').limit(1)
const boat = boats?.[0]
if (!boat) {
  console.log('  ! No boat found — skipping booking')
} else {
  const totalCents = (boat.price_adult ?? 11000) * 2
  const tourDate = new Date(); tourDate.setDate(tourDate.getDate() + 7)
  const tourDateStr = tourDate.toISOString().slice(0, 10)
  const { data: existing } = await sb.from('bookings')
    .select('id').eq('customer_email', 'teste-confirmed@acalanto.com').limit(1)
  if (existing?.length) {
    console.log(`  · booking already exists (${existing[0].id})`)
  } else {
    const ins = await sb.from('bookings').insert({
      boat_id: boat.id,
      tour_date: tourDateStr,
      adults: 2,
      children: 0,
      total_cents: totalCents,
      customer_name: 'Cliente Teste Confirmado',
      customer_email: 'teste-confirmed@acalanto.com',
      customer_phone: '24999990000',
      status: 'confirmed',
      payment_status: 'confirmed',
      payment_method: 'PIX',
      vertical: 'passeio',
      commission_rate: Math.max(0, Math.min(100, 100 - (boat.commission_pct ?? 70))),
      asaas_payment_id: 'pay_test_' + Date.now(),
      paid_at: new Date().toISOString(),
      notes: 'Pedido fictício gerado por scripts/setup-test-data.mjs',
    }).select('id').single()
    if (ins.error) console.log('  ! booking insert error:', ins.error.message)
    else console.log(`  ✓ booking created (${ins.data.id}) on ${boat.name} — ${tourDateStr}`)
  }
}

console.log('\nDone.')
