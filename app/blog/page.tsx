export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Blog | Acalanto Tours',
  description: 'Dicas, roteiros e histórias do litoral de Paraty para quem ama o mar.',
}

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'

export default async function BlogPage() {
  const supabase = await createClient()

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('id, slug, title, summary, cover_url, published_at')
    .eq('published', true)
    .order('published_at', { ascending: false })

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
      <header style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <h1
          style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '2.25rem',
            fontWeight: 700,
            color: 'var(--ocean-deep)',
            marginBottom: '0.5rem',
          }}
        >
          Blog Acalanto
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.0625rem' }}>
          Dicas, roteiros e histórias do litoral de Paraty
        </p>
      </header>

      {!posts || posts.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '4rem 1rem',
            color: 'var(--text-muted)',
            fontSize: '1rem',
          }}
        >
          Nenhum artigo publicado ainda. Volte em breve!
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {posts.map((post) => (
            <article
              key={post.id}
              style={{
                border: '1px solid var(--border)',
                borderRadius: '0.75rem',
                overflow: 'hidden',
                background: '#fff',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {post.cover_url && (
                <div style={{ position: 'relative', height: '180px', flexShrink: 0 }}>
                  <Image
                    src={post.cover_url}
                    alt={post.title ?? ''}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 640px) 100vw, 420px"
                  />
                </div>
              )}

              <div
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  flex: 1,
                }}
              >
                <h2
                  style={{
                    fontFamily: 'var(--font-playfair)',
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    color: 'var(--ocean-deep)',
                    margin: 0,
                    lineHeight: 1.35,
                  }}
                >
                  {post.title}
                </h2>

                {post.published_at && (
                  <time
                    dateTime={post.published_at}
                    style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}
                  >
                    {new Date(post.published_at).toLocaleDateString('pt-BR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </time>
                )}

                {post.summary && (
                  <p
                    style={{
                      fontSize: '0.9375rem',
                      color: 'var(--text-muted)',
                      margin: 0,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {post.summary}
                  </p>
                )}

                <div style={{ marginTop: 'auto', paddingTop: '0.75rem' }}>
                  <Link
                    href={`/blog/${post.slug}`}
                    style={{
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      color: 'var(--ocean-deep)',
                      textDecoration: 'none',
                    }}
                  >
                    Ler artigo →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}
