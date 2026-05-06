import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'

async function createPost(formData: FormData) {
  'use server'
  const title = formData.get('title') as string
  const slug = formData.get('slug') as string
  const summary = formData.get('summary') as string
  const cover_url = formData.get('cover_url') as string
  const content = formData.get('content') as string
  const published = formData.get('published') as string

  const supabase = await createAdminClient()
  const { error } = await supabase.from('blog_posts').insert({
    title,
    slug,
    summary: summary || null,
    cover_url: cover_url || null,
    content,
    published: published === 'on',
    published_at: published === 'on' ? new Date().toISOString() : null,
  })

  if (error) throw error
  redirect('/admin/blog')
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.8125rem',
  fontWeight: 600,
  color: 'var(--text-muted)',
  marginBottom: '0.375rem',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.625rem 0.875rem',
  border: '1px solid var(--border)',
  borderRadius: '0.5rem',
  fontSize: '0.9375rem',
  color: 'var(--text-primary)',
  background: 'white',
  outline: 'none',
  boxSizing: 'border-box',
}

const fieldStyle: React.CSSProperties = {
  marginBottom: '1.5rem',
}

export default function AdminBlogNovoPage() {
  return (
    <div style={{ padding: '2rem', maxWidth: '48rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <a
          href="/admin/blog"
          style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.75rem' }}
        >
          ← Voltar para blog
        </a>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--text-primary)', margin: 0 }}>
          Novo artigo
        </h1>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--border)', padding: '2rem' }}>
        <form action={createPost}>
          <div style={fieldStyle}>
            <label htmlFor="title" style={labelStyle}>Título *</label>
            <input id="title" name="title" type="text" required style={inputStyle} placeholder="Ex: Praias imperdíveis em Paraty" />
          </div>

          <div style={fieldStyle}>
            <label htmlFor="slug" style={labelStyle}>Slug *</label>
            <input
              id="slug"
              name="slug"
              type="text"
              required
              pattern="[a-z0-9\-]+"
              style={{ ...inputStyle, fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}
              placeholder="praias-imperdiveis-paraty"
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Apenas letras minúsculas, números e hífens.
            </p>
          </div>

          <div style={fieldStyle}>
            <label htmlFor="summary" style={labelStyle}>Resumo</label>
            <textarea
              id="summary"
              name="summary"
              rows={2}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.5' }}
              placeholder="Breve descrição exibida na listagem do blog"
            />
          </div>

          <div style={fieldStyle}>
            <label htmlFor="cover_url" style={labelStyle}>URL da capa</label>
            <input id="cover_url" name="cover_url" type="url" style={inputStyle} placeholder="https://..." />
          </div>

          <div style={fieldStyle}>
            <label htmlFor="content" style={labelStyle}>Conteúdo (HTML) *</label>
            <textarea
              id="content"
              name="content"
              rows={20}
              required
              style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.6', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}
              placeholder="<p>Conteúdo do artigo em HTML...</p>"
            />
          </div>

          <div style={{ ...fieldStyle, display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '2rem' }}>
            <input id="published" name="published" type="checkbox" style={{ width: '1rem', height: '1rem', cursor: 'pointer' }} />
            <label htmlFor="published" style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', cursor: 'pointer', marginBottom: 0 }}>
              Publicar imediatamente
            </label>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button
              type="submit"
              className="btn-primary"
              style={{ padding: '0.625rem 1.5rem', background: 'var(--ocean-deep)', color: 'white', border: 'none', borderRadius: '0.625rem', fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Criar artigo
            </button>
            <a
              href="/admin/blog"
              style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', textDecoration: 'none' }}
            >
              Cancelar
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
