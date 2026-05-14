import Link from 'next/link'

interface Props {
  /** Pergunta principal — ex: "Tem uma pousada ou hotel em Paraty?" */
  question: string
  /** Subtexto opcional — ex: "Estamos selecionando os melhores parceiros..." */
  subtitle?: string
  /** Texto do CTA principal — ex: "Cadastre-se como parceiro" */
  ctaLabel?: string
  /** "small" pra usar em rodapé de lista, "large" pra empty states */
  variant?: 'small' | 'large'
}

export default function PartnerCTA({
  question,
  subtitle,
  ctaLabel = 'Cadastre-se como parceiro',
  variant = 'small',
}: Props) {
  const isLarge = variant === 'large'
  return (
    <div style={{
      marginTop: isLarge ? '2rem' : '3rem',
      textAlign: 'center',
      padding: isLarge ? '2.5rem 1.5rem' : '2rem 1.5rem',
      background: isLarge
        ? 'linear-gradient(135deg, var(--ocean-deep) 0%, var(--ocean-mid) 100%)'
        : 'white',
      borderRadius: '16px',
      border: isLarge ? 'none' : '1px solid var(--border)',
      color: isLarge ? 'white' : undefined,
    }}>
      <h3 style={{
        fontFamily: 'var(--font-playfair)',
        fontSize: isLarge ? 'clamp(1.4rem, 4vw, 1.8rem)' : '1.15rem',
        color: isLarge ? 'white' : 'var(--ocean-deep)',
        marginBottom: subtitle ? '0.5rem' : '1rem',
        lineHeight: 1.3,
      }}>
        {question}
      </h3>
      {subtitle && (
        <p style={{
          color: isLarge ? 'rgba(255,255,255,0.85)' : 'var(--text-muted)',
          fontSize: '0.95rem',
          marginBottom: '1.25rem',
          lineHeight: 1.6,
          maxWidth: '480px',
          margin: '0 auto 1.25rem',
        }}>
          {subtitle}
        </p>
      )}
      <Link
        href="/seja-parceiro"
        className={isLarge ? '' : 'btn-primary'}
        style={isLarge ? {
          display: 'inline-flex',
          background: 'var(--sunset)',
          color: 'var(--ocean-deep)',
          padding: '0.85rem 2rem',
          borderRadius: '12px',
          fontWeight: 700,
          textDecoration: 'none',
          fontSize: '0.95rem',
        } : {
          display: 'inline-flex',
          fontSize: '0.9rem',
          padding: '0.75rem 1.75rem',
        }}
      >
        {ctaLabel}
      </Link>
    </div>
  )
}
