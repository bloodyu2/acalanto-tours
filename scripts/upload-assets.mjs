/**
 * One-time asset upload script for Acalanto Tours.
 *
 * Usage:
 *   1. Set SUPABASE_SERVICE_ROLE_KEY in .env.local (replace the PLACEHOLDER value)
 *   2. node scripts/upload-assets.mjs
 *
 * What it does:
 *   - Uploads boat photos → Supabase Storage, updates boats.cover_image, inserts gallery rows
 *   - Uploads Cleber's launch photos (skips HEIC) → gallery rows for Lancha Privativa service
 *   - Creates photographer partner + package records, uploads their portfolio photos
 *   - Uploads hero/landscape photos → gallery rows with is_hero=true
 *   - Uploads feedback screenshots → storage only (for manual testimonial seeding)
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, extname, basename } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

// ── resolve project root ──────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// ── load .env.local ───────────────────────────────────────────────────────────
const env = {}
try {
  const raw = readFileSync(join(ROOT, '.env.local'), 'utf8')
  for (const line of raw.split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/)
    if (m) env[m[1].trim()] = m[2].trim()
  }
} catch {
  console.error('Could not read .env.local')
  process.exit(1)
}

const SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL']
const SERVICE_KEY  = env['SUPABASE_SERVICE_ROLE_KEY']

if (!SUPABASE_URL || !SERVICE_KEY || SERVICE_KEY === 'PLACEHOLDER_SERVICE_ROLE_KEY') {
  console.error('❌  Set SUPABASE_SERVICE_ROLE_KEY in .env.local before running this script.')
  process.exit(1)
}

const sb = createClient(SUPABASE_URL, SERVICE_KEY)
const BUCKET = 'images'

// ── known IDs ─────────────────────────────────────────────────────────────────
const BOATS = {
  'Ilha Rasa IV': '6b162cbf-f868-4418-bb47-81e559e8c427',
  'Ilha Rasa V':  '2738e575-45f0-43d8-bcac-acd04e87f1f3',
  'Tania':        '2dd93694-434b-47ca-b79d-f2c03bde85ba',
  'Soberano':     'f9b92267-fdc7-4014-b76e-c94d8710d28c',
}

const SVC_LANCHA     = '97ad9495-1ba2-423a-b2b2-9b46c19f3795'
const SVC_FOTOGRAFIA = '342da636-5db2-4f28-937d-6e60c217a3bc'

// ── helpers ───────────────────────────────────────────────────────────────────
const SKIP_EXT = new Set(['.heic', '.HEIC'])

function listImages(dir) {
  try {
    return readdirSync(dir)
      .filter(f => {
        const ext = extname(f)
        if (SKIP_EXT.has(ext)) { console.log(`  ⏭  skipping HEIC: ${f}`); return false }
        return /\.(jpe?g|png|webp|gif)/i.test(ext)
      })
      .sort()
  } catch {
    console.warn(`  ⚠  folder not found: ${dir}`)
    return []
  }
}

function mimeType(filename) {
  const ext = extname(filename).toLowerCase()
  if (ext === '.png') return 'image/png'
  if (ext === '.webp') return 'image/webp'
  if (ext === '.gif') return 'image/gif'
  return 'image/jpeg'
}

async function upload(localPath, storagePath) {
  const data = readFileSync(localPath)
  const { error } = await sb.storage.from(BUCKET).upload(storagePath, data, {
    contentType: mimeType(localPath),
    upsert: true,
  })
  if (error) {
    console.error(`  ✗ upload failed: ${storagePath} — ${error.message}`)
    return null
  }
  const { data: { publicUrl } } = sb.storage.from(BUCKET).getPublicUrl(storagePath)
  return publicUrl
}

async function insertGallery(row) {
  const { error } = await sb.from('gallery').insert(row)
  if (error) console.error(`  ✗ gallery insert: ${error.message}`)
}

// ── 1. Boat photos ────────────────────────────────────────────────────────────
async function uploadBoat(folderName, boatId, storageSlug) {
  console.log(`\n🚢  ${folderName}`)
  const dir = join(ROOT, 'Parceiros', 'Clientes - Parceiros', 'Escunas', folderName)
  const files = listImages(dir).slice(0, 10)
  if (!files.length) { console.log('  no images found'); return }

  let coverSet = false
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const storagePath = `boats/${storageSlug}/${file}`
    console.log(`  ↑ ${file}`)
    const url = await upload(join(dir, file), storagePath)
    if (!url) continue

    // first image → cover_image on boat
    if (!coverSet) {
      await sb.from('boats').update({ cover_image: url }).eq('id', boatId)
      coverSet = true
      console.log(`  ✓ cover_image set`)
    }

    await insertGallery({
      boat_id: boatId,
      url,
      alt_text: `${folderName} — foto ${i + 1}`,
      display_order: i + 1,
    })
  }
  console.log(`  ✓ ${files.length} photos done`)
}

// ── 2. Cleber launch (skip HEIC) ──────────────────────────────────────────────
async function uploadLancha() {
  console.log('\n🛥️  Cleber — Lancha Privativa')
  const dir = join(ROOT, 'Parceiros', 'Clientes - Parceiros', 'Barcos Privados', 'Cleber - Lancha')
  const files = listImages(dir)
  if (!files.length) { console.log('  no compatible images'); return }

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const storagePath = `services/lancha-privativa/${file}`
    console.log(`  ↑ ${file}`)
    const url = await upload(join(dir, file), storagePath)
    if (!url) continue

    await insertGallery({
      service_id: SVC_LANCHA,
      url,
      alt_text: `Lancha privativa Cleber — foto ${i + 1}`,
      display_order: i + 1,
    })
  }
  console.log(`  ✓ ${files.length} photos done`)
}

// ── 3. Photographer packages ──────────────────────────────────────────────────
const PHOTOGRAPHERS = [
  {
    folderName: 'Arthur',
    portfolioSubdir: 'Própria',
    profileFile: 'perfil arthur.jpg',
    partnerName: 'Arthur Fotografia',
    slug: 'arthur',
    tagline: 'Fotografia de paisagens e natureza em Paraty',
    description: 'Arthur é fotógrafo especializado em paisagens, natureza e experiências de viagem em Paraty e região.',
  },
  {
    folderName: 'Juliane Liberato',
    portfolioSubdir: 'Seleção Viator',
    profileFile: null,
    partnerName: 'Juliane Liberato Fotografia',
    slug: 'juliane-liberato',
    tagline: 'Retratos e momentos de viagem em Paraty',
    description: 'Juliane Liberato captura retratos autênticos e momentos inesquecíveis durante passeios e experiências em Paraty.',
  },
  {
    folderName: 'Kai',
    portfolioSubdir: 'Própria',
    profileFile: 'kai .jpeg',
    partnerName: 'Kai Fotografia',
    slug: 'kai',
    tagline: 'Fotografia de aventura e mar em Paraty',
    description: 'Kai é fotógrafo de aventura especializado em experiências náuticas e trilhas na região de Paraty.',
  },
  {
    folderName: 'Magno',
    portfolioSubdir: 'Própria',
    profileFile: null,
    partnerName: 'Magno Fotografia',
    slug: 'magno',
    tagline: 'Ensaios e paisagens na natureza de Paraty',
    description: 'Magno fotografa ensaios, paisagens e experiências ao ar livre em Paraty e Costa Verde.',
  },
]

async function uploadPhotographer(cfg) {
  console.log(`\n📷  ${cfg.folderName}`)
  const baseDir = join(ROOT, 'Parceiros', 'Clientes - Parceiros', 'Fotografos', cfg.folderName)
  const portfolioDir = join(baseDir, cfg.portfolioSubdir)

  // create partner record (no unique constraint on name — insert or fetch existing)
  let partnerId
  const { data: existing } = await sb.from('partners').select('id').eq('name', cfg.partnerName).maybeSingle()
  if (existing) {
    partnerId = existing.id
    console.log(`  ✓ partner exists: ${partnerId}`)
  } else {
    const { data: partner, error: partnerErr } = await sb
      .from('partners')
      .insert({ name: cfg.partnerName, type: 'photo', active: true })
      .select('id')
      .single()
    if (partnerErr) { console.error(`  ✗ partner insert: ${partnerErr.message}`); return }
    partnerId = partner.id
    console.log(`  ✓ partner id: ${partnerId}`)
  }

  // upload profile photo → cover_image
  let coverUrl = null
  if (cfg.profileFile) {
    const profilePath = join(baseDir, cfg.portfolioSubdir, cfg.profileFile)
    try {
      statSync(profilePath)
      const storagePath = `fotografos/${cfg.slug}/perfil${extname(cfg.profileFile)}`
      console.log(`  ↑ profile: ${cfg.profileFile}`)
      coverUrl = await upload(profilePath, storagePath)
    } catch {
      // profile file might be in base dir
      try {
        const alt = join(baseDir, cfg.profileFile)
        statSync(alt)
        const storagePath = `fotografos/${cfg.slug}/perfil${extname(cfg.profileFile)}`
        console.log(`  ↑ profile (base): ${cfg.profileFile}`)
        coverUrl = await upload(alt, storagePath)
      } catch { console.warn(`  ⚠  profile not found: ${cfg.profileFile}`) }
    }
  }

  // create photographer_package record
  const { data: pkg, error: pkgErr } = await sb
    .from('photographer_packages')
    .upsert({
      slug: cfg.slug,
      name: cfg.partnerName,
      tagline: cfg.tagline,
      description: cfg.description,
      partner_id: partnerId,
      active: true,
      cover_image: coverUrl,
      price_label: 'Consulte valores',
      price_cents: 0,
      duration_label: '1–3 horas',
      photos_count: 30,
      features: ['Fotos editadas em alta resolução', 'Entrega digital', 'Locação em Paraty'],
    }, { onConflict: 'slug' })
    .select('id')
    .single()
  if (pkgErr) { console.error(`  ✗ package upsert: ${pkgErr.message}`); return }
  const pkgId = pkg.id
  console.log(`  ✓ package id: ${pkgId}`)

  // upload portfolio photos — max 10 per photographer
  const files = listImages(portfolioDir).filter(f => f !== cfg.profileFile).slice(0, 10)
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const storagePath = `fotografos/${cfg.slug}/${file}`
    console.log(`  ↑ ${file}`)
    const url = await upload(join(portfolioDir, file), storagePath)
    if (!url) continue

    // set cover_image from first portfolio photo if no profile
    if (!coverUrl && i === 0) {
      coverUrl = url
      await sb.from('photographer_packages').update({ cover_image: url }).eq('id', pkgId)
    }

    await insertGallery({
      photographer_package_id: pkgId,
      url,
      alt_text: `${cfg.partnerName} — foto ${i + 1}`,
      display_order: i + 1,
    })
  }
  console.log(`  ✓ ${files.length} portfolio photos done`)
}

// ── 4. Hero / landscape images ────────────────────────────────────────────────
async function uploadHeroImages() {
  console.log('\n🏖️  Hero images — Praias e Roteiros')
  const dir = join(ROOT, 'Imagens', 'Imagens', 'Praias e Roteiros')
  const files = listImages(dir)

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const storagePath = `hero/${file}`
    console.log(`  ↑ ${file}`)
    const url = await upload(join(dir, file), storagePath)
    if (!url) continue

    await insertGallery({
      url,
      alt_text: `Paraty — ${basename(file, extname(file))}`,
      display_order: i + 1,
      is_hero: true,
      hero_order: i + 1,
    })
  }
  console.log(`  ✓ ${files.length} hero images done`)
}

// ── 4b. Mark first 3 Tânia photos as hero too ────────────────────────────────
async function markBoatPhotosAsHero(boatId, boatName, startOrder) {
  const { data, error } = await sb
    .from('gallery')
    .select('id, hero_order')
    .eq('boat_id', boatId)
    .order('display_order', { ascending: true })
    .limit(3)
  if (error) { console.error(`  ✗ fetch gallery: ${error.message}`); return }

  const baseOrder = startOrder
  for (let i = 0; i < data.length; i++) {
    await sb.from('gallery').update({ is_hero: true, hero_order: baseOrder + i }).eq('id', data[i].id)
  }
  console.log(`  ✓ marked ${data.length} ${boatName} photos as hero (order ${baseOrder}+)`)
}

// ── 5. Feedback screenshots ───────────────────────────────────────────────────
async function uploadFeedbacks() {
  console.log('\n💬  Feedback screenshots')
  const dir = join(ROOT, 'Imagens', 'Imagens', 'Feedbacks')
  const files = listImages(dir)

  for (const file of files) {
    const storagePath = `testimonials/${file}`
    console.log(`  ↑ ${file}`)
    await upload(join(dir, file), storagePath)
  }
  console.log(`  ✓ ${files.length} feedback screenshots uploaded`)
}

// ── main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀  Acalanto Tours — asset upload\n')

  // boats
  await uploadBoat('Ilha Rasa IV', BOATS['Ilha Rasa IV'], 'ilha-rasa-iv')
  await uploadBoat('Ilha Rasa V',  BOATS['Ilha Rasa V'],  'ilha-rasa-v')
  await uploadBoat('Tania',        BOATS['Tania'],         'tania')
  await uploadBoat('Soberano',     BOATS['Soberano'],      'soberano')

  // private launch
  await uploadLancha()

  // photographers
  for (const cfg of PHOTOGRAPHERS) {
    await uploadPhotographer(cfg)
  }

  // hero images from landscapes folder
  await uploadHeroImages()

  // mark first 3 Tânia + first 3 Ilha Rasa IV photos as hero
  const { data: heroRows } = await sb.from('gallery').select('hero_order').eq('is_hero', true).order('hero_order', { ascending: false }).limit(1)
  const nextHeroOrder = (heroRows?.[0]?.hero_order ?? 0) + 1
  await markBoatPhotosAsHero(BOATS['Tania'], 'Tânia', nextHeroOrder)
  await markBoatPhotosAsHero(BOATS['Ilha Rasa IV'], 'Ilha Rasa IV', nextHeroOrder + 3)

  // feedback screenshots
  await uploadFeedbacks()

  console.log('\n✅  Done! All assets uploaded.')
  console.log('\nNext: run the dev server and check the hero carousel at http://localhost:3000')
}

main().catch(err => { console.error(err); process.exit(1) })
