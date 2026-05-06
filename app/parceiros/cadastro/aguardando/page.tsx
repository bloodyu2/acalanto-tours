import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Cadastro em análise — Acalanto Tours',
}

export default function CadastroAguardandoPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--sand)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 1.5rem 2rem' }}>
      <div style={{ width: '100%', maxWidth: '480px', textAlign: 'center' }}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '3rem 2.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
          <div style={{ width: '4rem', height: '4rem', background: 'linear-gradient(135deg, var(--ocean-mid), var(--sunset))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>

          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', marginBottom: '0.75rem' }}>
            Cadastro enviado!
          </h1>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1.5rem', fontSize: '0.9375rem' }}>
            Seu anúncio está em análise. Nossa equipe retorna em até <strong>24 horas</strong>. Você pode acompanhar o status no seu painel.
          </p>

          <div style={{ background: 'var(--sand)', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '2rem', textAlign: 'left' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Em caso de dúvidas, entre em contato pelo{' '}
              <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5524999627968'}`} style={{ color: 'var(--ocean-mid)', fontWeight: 600 }}>
                WhatsApp
              </a>.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link href="/conta/parceiro" className="btn-primary" style={{ padding: '0.875rem', textAlign: 'center', textDecoration: 'none' }}>
              Ir para meu painel
            </Link>
            <Link href="/" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textDecoration: 'none' }}>
              Voltar para o início
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
