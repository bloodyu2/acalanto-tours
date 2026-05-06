import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AdminBlogPage() {
  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('id, slug, title, published, published_at, created_at')
    .order('created_at', { ascending: false })

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--text-primary)', margin: 0 }}>Blog</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {posts?.length ?? 0} artigo{posts?.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/admin/blog/novo"
          style={{
            padding: '0.625rem 1.25rem', background: 'var(--ocean-deep)', color: 'white',
            borderRadius: '0.625rem', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600,
          }}
        >
          + Novo artigo
        </Link>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--sand)' }}>
              {['Título', 'Slug', 'Status', 'Publicado em', ''].map(h => (
                <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {posts?.map(post => (
              <tr key={post.id} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.9375rem', color: 'var(--text-primary)', fontWeight: 500 }}>{post.title}</td>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{post.slug}</td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <span style={{
                    padding: '0.25rem 0.625rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600,
                    background: post.published ? '#dcfce7' : '#fef9c3',
                    color: post.published ? '#166534' : '#854d0e',
                  }}>
                    {post.published ? 'Publicado' : 'Rascunho'}
                  </span>
                </td>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  {post.published_at ? new Date(post.published_at).toLocaleDateString('pt-BR') : '—'}
                </td>
                <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                  <Link
                    href={`/admin/blog/${post.id}`}
                    style={{ color: 'var(--ocean-mid)', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 500 }}
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
            {!posts?.length && (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  Nenhum artigo criado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
