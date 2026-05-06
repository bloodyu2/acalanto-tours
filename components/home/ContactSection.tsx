'use client'

import { useState } from 'react'

export default function ContactSection() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setStatus('ok')
        setForm({ name: '', phone: '', email: '', message: '' })
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <section id="contato" style={{ padding: '5rem 0', background: 'white' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
          {/* Left */}
          <div>
            <span className="section-tag">Fale Conosco</span>
            <h2 className="section-title">Pronto para navegar?</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: '2rem', fontSize: '1.0625rem' }}>
              Entre em contato e tire suas dúvidas. Nossa equipe responde rapidamente pelo WhatsApp ou e-mail.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {[
                { icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>), title: 'Localização', desc: 'Paraty, Rio de Janeiro. Costa Verde.' },
                { icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>), title: 'WhatsApp', desc: 'Resposta rápida, seg a sáb.' },
                { icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>), title: 'E-mail', desc: 'contato@acalantotours.com.br' },
              ].map(({ icon, title, desc }) => (
                <div key={title} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{
                    width: '3rem', height: '3rem', borderRadius: '0.75rem',
                    background: 'rgba(26,107,138,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, color: 'var(--ocean-mid)',
                  }}>
                    {icon}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: 'var(--ocean-deep)', marginBottom: '0.2rem', fontSize: '0.9375rem' }}>{title}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <div style={{
            background: 'white', borderRadius: '1.5rem',
            boxShadow: '0 8px 40px rgba(10,61,92,0.1)',
            padding: '2rem', border: '1px solid var(--border)',
          }}>
            {status === 'ok' ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ marginBottom: '1rem', color: 'var(--ocean-mid)', display: 'flex', justifyContent: 'center' }}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
                <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.375rem', color: 'var(--ocean-deep)', marginBottom: '0.5rem' }}>
                  Mensagem enviada!
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Entraremos em contato em breve. Obrigado!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Nome *</label>
                  <input className="form-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Seu nome" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Telefone</label>
                    <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="(24) 9 9999-9999" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">E-mail</label>
                    <input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@exemplo.com" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Mensagem *</label>
                  <textarea className="form-input" required rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Como podemos ajudar?" style={{ resize: 'vertical' }} />
                </div>
                {status === 'error' && (
                  <p style={{ color: '#e53e3e', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                    Erro ao enviar. Tente novamente ou use o WhatsApp.
                  </p>
                )}
                <button type="submit" className="btn-primary" disabled={status === 'sending'} style={{ width: '100%', justifyContent: 'center' }}>
                  {status === 'sending' ? 'Enviando...' : 'Enviar Mensagem'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  )
}
