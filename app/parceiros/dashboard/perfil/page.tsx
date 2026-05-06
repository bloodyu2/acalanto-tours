import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PerfilForm from './_components/PerfilForm'

export default async function ParceiroPerfilPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/parceiros/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('partner_id')
    .eq('auth_user_id', session.user.id)
    .single()
  if (!profile?.partner_id) redirect('/parceiros/login')

  const { data: partner } = await supabase
    .from('partners')
    .select('id, name, email, phone, type')
    .eq('id', profile.partner_id)
    .single()

  const { data: partnerPage } = await supabase
    .from('partner_pages')
    .select('id, slug, headline, bio, instagram_url, whatsapp_number, cover_image')
    .eq('partner_id', profile.partner_id)
    .maybeSingle()

  return (
    <div style={{ padding: '2rem', maxWidth: '700px' }}>
      <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: '#0f172a', marginBottom: '0.25rem' }}>
        Perfil
      </h1>
      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Suas informações públicas no site da Acalanto
      </p>
      <PerfilForm partner={partner ?? null} partnerPage={partnerPage ?? null} />
    </div>
  )
}
