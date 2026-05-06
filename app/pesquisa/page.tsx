export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase/server'
import { verifyNpsToken, isNpsExpired } from '@/lib/nps'
import NpsSurveyForm from '@/components/nps/NpsSurveyForm'

interface PageProps {
  searchParams: Promise<{ t?: string; b?: string }>
}

function ErrorCard({ message }: { message: string }) {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        background: 'var(--sand)',
      }}
    >
      <div
        className="card"
        style={{ maxWidth: '480px', width: '100%', textAlign: 'center', padding: '2rem' }}
      >
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>{message}</p>
      </div>
    </main>
  )
}

export default async function PesquisaPage({ searchParams }: PageProps) {
  const params = await searchParams
  const token = params.t
  const bookingId = params.b

  if (!token || !bookingId) {
    return (
      <ErrorCard message="Link invalido. Solicite um novo link pelo email." />
    )
  }

  const supabase = await createAdminClient()

  const { data: survey } = await supabase
    .from('nps_surveys')
    .select('id, token, token_expires, submitted_at, booking_id')
    .eq('booking_id', bookingId)
    .maybeSingle()

  if (!survey) {
    return (
      <ErrorCard message="Link invalido. Solicite um novo link pelo email." />
    )
  }

  if (survey.submitted_at) {
    return (
      <ErrorCard message="Voce ja respondeu esta pesquisa. Obrigado!" />
    )
  }

  const expiresAt = new Date(survey.token_expires)

  if (isNpsExpired(expiresAt) || !verifyNpsToken(token, bookingId, expiresAt)) {
    return (
      <ErrorCard message="Este link expirou ou e invalido." />
    )
  }

  const { data: booking } = await supabase
    .from('bookings')
    .select('customer_name')
    .eq('id', bookingId)
    .maybeSingle()

  const customerName = booking?.customer_name ?? ''

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        background: 'var(--sand)',
      }}
    >
      <div
        className="card"
        style={{ maxWidth: '540px', width: '100%', padding: '2rem' }}
      >
        <div style={{ marginBottom: '1.5rem' }}>
          <h1
            style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '1.75rem',
              color: 'var(--ocean-deep)',
              marginBottom: '0.5rem',
            }}
          >
            Como foi sua experiencia?
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Sua opiniao e muito importante para melhorar nossos passeios.
          </p>
        </div>

        <NpsSurveyForm
          bookingId={bookingId}
          token={token}
          customerName={customerName}
        />
      </div>
    </main>
  )
}
