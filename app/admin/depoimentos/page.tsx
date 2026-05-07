import { createAdminClient } from '@/lib/supabase/server'
import TestimonialsActions from './TestimonialsActions'

export const dynamic = 'force-dynamic'

export default async function AdminDepoimentosPage() {
  const supabase = await createAdminClient()
  const { data: testimonials } = await supabase
    .from('testimonials')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--ocean-deep)', marginBottom: '1.5rem' }}>
        Depoimentos
      </h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {testimonials?.map(t => (
          <div key={t.id} style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div>
                <p style={{ fontWeight: 700, color: 'var(--ocean-deep)' }}>{t.author_name}</p>
                {t.author_city && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.author_city}</p>}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ color: 'var(--sunset)', fontSize: '0.875rem' }}>{'★'.repeat(t.rating || 5)}</span>
                <span style={{
                  background: t.approved ? '#38a16920' : '#d69e2e20',
                  color: t.approved ? '#38a169' : '#d69e2e',
                  fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: '999px',
                }}>
                  {t.approved ? 'Aprovado' : 'Pendente'}
                </span>
              </div>
            </div>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1rem', fontStyle: 'italic' }}>
              &ldquo;{t.content}&rdquo;
            </p>
            <TestimonialsActions id={t.id} approved={t.approved ?? false} />
          </div>
        ))}
        {(!testimonials || testimonials.length === 0) && (
          <div style={{ background: 'white', borderRadius: '1rem', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Nenhum depoimento ainda.
          </div>
        )}
      </div>
    </div>
  )
}
