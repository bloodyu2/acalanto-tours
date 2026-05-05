'use client'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props { id: string; approved: boolean }

export default function TestimonialsActions({ id, approved }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const toggle = async () => {
    await supabase.from('testimonials').update({ approved: !approved }).eq('id', id)
    router.refresh()
  }

  return (
    <button onClick={toggle} className={approved ? 'btn-outline' : 'btn-primary'} style={{ fontSize: '0.8rem', padding: '0.4rem 0.875rem' }}>
      {approved ? 'Remover aprovação' : 'Aprovar depoimento'}
    </button>
  )
}
