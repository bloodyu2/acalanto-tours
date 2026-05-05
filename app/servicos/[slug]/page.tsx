import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('services').select('name,description').eq('slug', slug).single()
  if (!data) return { title: 'Serviço não encontrado' }
  return { title: data.name, description: data.description || undefined }
}

export default async function ServicoPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: svc } = await supabase.from('services').select('*').eq('slug', slug).eq('active', true).single()
  if (!svc) notFound()

  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5524999999999'
  const waMsg = encodeURIComponent(`Olá! Tenho interesse no serviço "${svc.name}". Poderia me dar mais informações?`)

  return (
    <>
      <section style={{ background: 'linear-gradient(135deg, var(--ocean-deep) 0%, var(--ocean-mid) 100%)', padding: '5rem 0 3rem', position: 'relative' }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, lineHeight: 0 }}>
          <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '60px' }}>
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="white" />
          </svg>
        </div>
        <div className="container" style={{ position: 'relative' }}>
          <Link href="/servicos" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', textDecoration: 'none', display: 'block', marginBottom: '1rem' }}>← Todos os serviços</Link>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'white', marginBottom: '0.5rem' }}>{svc.name}</h1>
          {svc.price_label && <p style={{ color: 'var(--sunset)', fontWeight: 700, fontSize: '1.25rem' }}>{svc.price_label}</p>}
        </div>
      </section>

      <section style={{ padding: '4rem 0 5rem' }}>
        <div className="container" style={{ maxWidth: '720px' }}>
          {svc.description && <p style={{ fontSize: '1.125rem', color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: '2.5rem' }}>{svc.description}</p>}
          <a href={`https://wa.me/${phone}?text=${waMsg}`} target="_blank" rel="noreferrer" className="btn-primary" style={{ fontSize: '1rem' }}>
            Solicitar Orçamento pelo WhatsApp
          </a>
        </div>
      </section>
    </>
  )
}
