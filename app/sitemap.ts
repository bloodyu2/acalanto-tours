import { MetadataRoute } from 'next'

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://acalantotours.com.br'

const boatSlugs = ['ilha-rasa-iv', 'ilha-rasa-v', 'tania', 'soberano']
const serviceSlugs = ['lancha-privativa', 'fotografia', 'passeio-de-jeep', 'transfer']

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/quem-somos`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/servicos`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/galeria`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    ...boatSlugs.map(slug => ({
      url: `${BASE}/escunas/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),
    ...serviceSlugs.map(slug => ({
      url: `${BASE}/servicos/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]
}
