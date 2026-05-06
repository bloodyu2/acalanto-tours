import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('title, summary')
    .eq('slug', slug)
    .single()
  if (!data) return {}
  return {
    title: `${data.title} | Acalanto Tours`,
    description: data.summary ?? undefined,
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: post, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!post || error) notFound()

  const publishedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <>
      <style>{`
        .prose-content h2 { font-size: 1.375rem; font-weight: 700; margin: 1.5rem 0 0.5rem }
        .prose-content h3 { font-size: 1.125rem; font-weight: 600; margin: 1.25rem 0 0.5rem }
        .prose-content p { margin-bottom: 1rem; line-height: 1.7 }
        .prose-content ul, .prose-content ol { padding-left: 1.5rem; margin-bottom: 1rem }
        .prose-content li { margin-bottom: 0.25rem }
        .prose-content a { color: var(--ocean-mid); text-decoration: underline }
        .prose-content img { max-width: 100%; border-radius: 8px; margin: 1rem 0 }
      `}</style>

      <main style={{ maxWidth: '760px', margin: '0 auto', padding: '2rem 1rem' }}>
        <Link
          href="/blog"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            color: 'var(--ocean-mid)',
            textDecoration: 'none',
            fontSize: '0.9rem',
            marginBottom: '1.5rem',
          }}
        >
          ← Voltar para o blog
        </Link>

        {post.cover_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover_url}
            alt={post.title}
            style={{
              width: '100%',
              height: '360px',
              objectFit: 'cover',
              borderRadius: '12px',
              marginBottom: '1.5rem',
              display: 'block',
            }}
          />
        )}

        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '2rem',
            fontWeight: 700,
            color: 'var(--ocean-deep)',
            lineHeight: 1.3,
            marginBottom: '0.5rem',
          }}
        >
          {post.title}
        </h1>

        {publishedDate && (
          <p
            style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              marginBottom: '2rem',
            }}
          >
            {publishedDate}
          </p>
        )}

        <article>
          <div
            className="prose-content"
            dangerouslySetInnerHTML={{ __html: post.content ?? '' }}
          />
        </article>

        <section
          style={{
            background: 'var(--sand-warm)',
            borderRadius: '12px',
            padding: '2rem',
            textAlign: 'center',
            marginTop: '3rem',
          }}
        >
          <p
            style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: 'var(--ocean-deep)',
              marginBottom: '1rem',
            }}
          >
            Pronto para conhecer Paraty?
          </p>
          <a href="/" className="btn-primary">
            Ver passeios
          </a>
        </section>
      </main>
    </>
  )
}
