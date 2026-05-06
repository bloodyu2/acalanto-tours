import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ background: 'var(--ocean-deep)', color: 'rgba(255,255,255,0.85)' }}>
      {/* Wave top */}
      <div style={{ width: '100%', overflow: 'hidden', lineHeight: 0, transform: 'rotate(180deg)' }}>
        <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '60px' }}>
          <path d="M0,30 C360,60 1080,0 1440,30 L1440,0 L0,0 Z" fill="white" />
        </svg>
      </div>

      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>

          {/* Brand */}
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.5rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>
              Acalanto Tours
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.6)', marginBottom: '1.25rem' }}>
              Tudo para seu turismo em Paraty: passeios de escuna, fotografia profissional, hospedagem selecionada e serviços exclusivos.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.7)' }} aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5524999627968'}`} target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.7)' }} aria-label="WhatsApp">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Vertente: Passeios */}
          <div>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.45)', marginBottom: '1rem', fontFamily: 'var(--font-jakarta)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 17l1-4h16l1 4"/><path d="M5 17l-1 4h16l-1-4"/><path d="M7 13V9a5 5 0 0110 0v4"/>
              </svg>
              Passeios
            </h4>
            {[
              { href: '/passeios', label: 'Todos os passeios' },
              { href: '/passeios/ilha-rasa-iv', label: 'Ilha Rasa IV' },
              { href: '/passeios/ilha-rasa-v', label: 'Ilha Rasa V' },
              { href: '/passeios/tania', label: 'Tânia' },
              { href: '/passeios/soberano', label: 'Soberano' },
            ].map(({ href, label }) => (
              <Link key={href} href={href} style={{ display: 'block', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '0.45rem', transition: 'color 0.2s' }}>
                {label}
              </Link>
            ))}
          </div>

          {/* Vertente: Fotografia + Hospedagem */}
          <div>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.45)', marginBottom: '1rem', fontFamily: 'var(--font-jakarta)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              Fotografia
            </h4>
            {[
              { href: '/fotografia', label: 'Pacotes de fotografia' },
              { href: '/fotografia', label: 'Foto a bordo' },
              { href: '/seja-parceiro', label: 'Fotógrafo parceiro' },
            ].map(({ href, label }) => (
              <Link key={label} href={href} style={{ display: 'block', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '0.45rem', transition: 'color 0.2s' }}>
                {label}
              </Link>
            ))}

            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.45)', marginBottom: '0.75rem', marginTop: '1.5rem', fontFamily: 'var(--font-jakarta)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              Hospedagem
            </h4>
            <Link href="/hotelaria" style={{ display: 'block', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '0.45rem' }}>
              Pousadas e hotéis parceiros
            </Link>
          </div>

          {/* Vertente: Serviços */}
          <div>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.45)', marginBottom: '1rem', fontFamily: 'var(--font-jakarta)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 20h20"/><path d="M5 20V10.5a7.5 7.5 0 0115 0V20"/><path d="M12 3v5"/>
              </svg>
              Serviços
            </h4>
            {[
              { href: '/servicos', label: 'Todos os serviços' },
              { href: '/servicos', label: 'Lancha privativa' },
              { href: '/servicos', label: 'Passeio de jeep' },
              { href: '/servicos', label: 'Transfer' },
            ].map(({ href, label }) => (
              <Link key={label} href={href} style={{ display: 'block', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '0.45rem', transition: 'color 0.2s' }}>
                {label}
              </Link>
            ))}

            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.45)', marginBottom: '0.75rem', marginTop: '1.5rem', fontFamily: 'var(--font-jakarta)' }}>
              Empresa
            </h4>
            {[
              { href: '/quem-somos', label: 'Quem somos' },
              { href: '/seja-parceiro', label: 'Seja parceiro' },
              { href: '/#contato', label: 'Contato' },
            ].map(({ href, label }) => (
              <Link key={href} href={href} style={{ display: 'block', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '0.45rem', transition: 'color 0.2s' }}>
                {label}
              </Link>
            ))}
          </div>

        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.4)' }}>
          <span>© {new Date().getFullYear()} Acalanto Tours · Paraty, RJ · Todos os direitos reservados.</span>
          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
            <Link href="/privacidade" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.8125rem' }}>
              Privacidade
            </Link>
            <Link href="/termos" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.8125rem' }}>
              Termos de Uso
            </Link>
            <Link href="/cancelamento" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.8125rem' }}>
              Cancelamento
            </Link>
            <a href="https://balaio.net" target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>
              Feito com ♥ pela Balaio Digital
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
