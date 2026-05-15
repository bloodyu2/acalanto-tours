import { MetadataRoute } from 'next'

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://acalantotours.com.br'

const boatSlugs = ['ilha-rasa-iv', 'ilha-rasa-v', 'tania', 'soberano']
const serviceSlugs = ['lancha-privativa', 'fotografia', 'passeio-de-jeep', 'transfer']

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // ── Home ───────────────────────────────────────────────────────────────
    { url: BASE, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },

    // ── Passeios / Escunas ─────────────────────────────────────────────────
    { url: `${BASE}/passeios`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/escunas`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.85 },
    ...boatSlugs.map(slug => ({
      url: `${BASE}/passeios/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),
    ...boatSlugs.map(slug => ({
      url: `${BASE}/escunas/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),

    // ── Serviços ───────────────────────────────────────────────────────────
    { url: `${BASE}/servicos`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    ...serviceSlugs.map(slug => ({
      url: `${BASE}/servicos/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),

    // ── Hotelaria ──────────────────────────────────────────────────────────
    { url: `${BASE}/hotelaria`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },

    // ── Blog ───────────────────────────────────────────────────────────────
    { url: `${BASE}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },

    // ── Institucional ──────────────────────────────────────────────────────
    { url: `${BASE}/quem-somos`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/galeria`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/contato`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/seja-parceiro`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/pesquisa`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },

    // ── Legais ────────────────────────────────────────────────────────────
    { url: `${BASE}/termos`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/privacidade`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/cancelamento`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]
}
