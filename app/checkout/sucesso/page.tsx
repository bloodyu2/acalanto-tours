import Link from 'next/link'

interface Props {
  searchParams: Promise<{ booking_id?: string }>
}

export default async function CheckoutSucessoPage({ searchParams }: Props) {
  const params = await searchParams
  const bookingId = params.booking_id

  return (
    <main style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '480px' }}>
        {/* Checkmark icon */}
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: '#D1FAE5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '2rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
          Pagamento confirmado!
        </h1>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: '0.5rem' }}>
          Sua reserva foi registrada. Voce recebera um email de confirmacao em breve.
        </p>
        {bookingId && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontFamily: 'var(--font-mono)' }}>
            Reserva: {bookingId}
          </p>
        )}

        <Link href="/passeios" className="btn-primary">
          Ver passeios
        </Link>
      </div>
    </main>
  )
}
