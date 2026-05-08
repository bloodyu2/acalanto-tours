import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import GalleryManager from '@/components/admin/GalleryManager'

export const dynamic = 'force-dynamic'

type Pkg = { id: string; name: string; cover_image: string | null; active: boolean; display_order: number }
type GalleryRow = { id: string; url: string; alt_text: string | null; display_order: number; photographer_package_id: string | null }

export default async function ParceiroFotosPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/parceiros/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('partner_id')
    .eq('auth_user_id', session.user.id)
    .single()
  if (!profile?.partner_id) redirect('/parceiros/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: packagesRaw } = await (supabase as any)
    .from('photographer_packages')
    .select('id, name, cover_image, active, display_order')
    .eq('partner_id', profile.partner_id)
    .order('display_order', { ascending: true })

  const packages: Pkg[] = packagesRaw ?? []
  const pkgIds = packages.map(p => p.id)

  const galleryMap: Record<string, { id: string; url: string; alt_text: string | null; display_order: number }[]> = {}

  if (pkgIds.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rowsRaw } = await (supabase as any)
      .from('gallery')
      .select('id, url, alt_text, display_order, photographer_package_id')
      .in('photographer_package_id', pkgIds)
      .order('display_order', { ascending: true })

    for (const row of (rowsRaw ?? []) as GalleryRow[]) {
      if (!row.photographer_package_id) continue
      if (!galleryMap[row.photographer_package_id]) galleryMap[row.photographer_package_id] = []
      galleryMap[row.photographer_package_id].push({
        id: row.id,
        url: row.url,
        alt_text: row.alt_text,
        display_order: row.display_order,
      })
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '900px' }}>
      <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: '#0f172a', marginBottom: '0.25rem' }}>
        Fotos dos Pacotes
      </h1>
      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Gerencie o portfólio de fotos de cada pacote. As imagens aparecem na página pública do pacote.
      </p>

      {packages.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: '#94a3b8' }}>Nenhum pacote cadastrado ainda.</p>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Entre em contato com a Acalanto para cadastrar seus pacotes.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {packages.map(pkg => (
            <div
              key={pkg.id}
              style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}
            >
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {pkg.cover_image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={pkg.cover_image}
                    alt={pkg.name}
                    style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }}
                  />
                )}
                <div>
                  <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{pkg.name}</h2>
                  {!pkg.active && (
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Inativo</span>
                  )}
                </div>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <GalleryManager
                  entityField="photographer_package_id"
                  entityId={pkg.id}
                  initialImages={galleryMap[pkg.id] ?? []}
                  label="Fotos do portfólio"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
