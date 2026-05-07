import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') ?? '/conta'

  if (code) {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.exchangeCodeForSession(code)

    const type = url.searchParams.get('type')
    if (type === 'recovery') {
      return NextResponse.redirect(new URL('/auth/reset-password', request.url))
    }
    if (type === 'invite') {
      return NextResponse.redirect(new URL('/auth/invite', request.url))
    }

    if (session?.user) {
      const user = session.user
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: partner } = await (supabase.from('partners') as any)
        .select('id')
        .eq('email', user.email!)
        .is('auth_user_id', null)
        .maybeSingle()

      if (partner) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('partners') as any)
          .update({ auth_user_id: user.id })
          .eq('id', partner.id)

        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('auth_user_id', user.id)
          .maybeSingle()

        if (!existing) {
          await supabase.from('profiles').insert({
            auth_user_id: user.id,
            role: 'partner',
            partner_id: partner.id,
          })
        }
      }
    }
  }

  return NextResponse.redirect(new URL(next, request.url))
}
