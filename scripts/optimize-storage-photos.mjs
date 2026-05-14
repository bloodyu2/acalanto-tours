// In-place optimization of photos in Supabase storage.
//
// For each file under `images/fotografos/`:
//   1. Download original
//   2. Resize long edge to 2400 px (only downscales; never upscales)
//   3. Re-encode JPEG q=85, strip metadata
//   4. Overwrite the original at the same storage path
//
// Why one universal 2400 px source instead of two (1600 cover + 3000 portfolio):
//   - Next/Image generates srcsets up to 3840w; with a 2400 px source it will
//     simply cap at 2400 for the high-res variant. That's plenty for the
//     lightbox (which uses raw <img> with object-fit: contain).
//   - The grid + card thumbs are 256-1080 px wide -- Next/Image downscales
//     from 2400 -> 1080 cheaply. No quality loss visible.
//   - One source file = simpler to manage, smaller storage, fewer rules.
//
// Run: node --env-file=.env.local scripts/optimize-storage-photos.mjs
//      [--dry-run]   (preview only, don't upload)
//      [--prefix=fotografos/]  (limit scope; default = fotografos/)
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) throw new Error('Missing SUPABASE env')

const args = new Set(process.argv.slice(2))
const dryRun = args.has('--dry-run')
const prefixArg = [...args].find(a => a.startsWith('--prefix='))
const prefix = prefixArg ? prefixArg.split('=')[1] : 'fotografos/'

const BUCKET = 'images'
const LONG_EDGE = 2400
const QUALITY = 85

const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })

async function listAll(prefix) {
  const out = []
  async function walk(dir) {
    const { data, error } = await sb.storage.from(BUCKET).list(dir, { limit: 1000 })
    if (error) throw error
    for (const entry of data ?? []) {
      const fullPath = dir ? `${dir}/${entry.name}` : entry.name
      // Folder rows have null id and metadata; files have an id and metadata.size.
      if (entry.id === null) {
        await walk(fullPath)
      } else {
        out.push({ path: fullPath, size: entry.metadata?.size ?? 0, mimetype: entry.metadata?.mimetype })
      }
    }
  }
  await walk(prefix.replace(/\/$/, ''))
  return out
}

function fmt(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

console.log(`Scanning ${BUCKET}/${prefix}${dryRun ? '  [DRY RUN]' : ''}`)
const files = await listAll(prefix)
const images = files.filter(f => /\.(jpe?g|png|webp)$/i.test(f.path))
console.log(`Found ${images.length} image files (${fmt(images.reduce((s, f) => s + f.size, 0))} total)\n`)

let totalBefore = 0
let totalAfter = 0
let skipped = 0
let failed = 0

for (const f of images) {
  const before = f.size
  totalBefore += before
  try {
    // Download
    const { data: blob, error: dlErr } = await sb.storage.from(BUCKET).download(f.path)
    if (dlErr) throw dlErr
    const buf = Buffer.from(await blob.arrayBuffer())

    // Skip tiny files (already optimized)
    if (buf.length < 100 * 1024) {
      console.log(`  · ${f.path}  ${fmt(buf.length)}  (already small — skip)`)
      skipped++
      totalAfter += buf.length
      continue
    }

    // Resize + re-encode
    const optimized = await sharp(buf)
      .rotate()                              // honour EXIF orientation, then strip
      .resize({ width: LONG_EDGE, height: LONG_EDGE, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: QUALITY, mozjpeg: true, progressive: true })
      .withMetadata({})                      // strip GPS/EXIF; keep ICC if present
      .toBuffer()

    const after = optimized.length
    totalAfter += after
    const pct = Math.round((1 - after / before) * 100)
    const marker = dryRun ? '[dry]' : '✓'
    console.log(`  ${marker} ${f.path}  ${fmt(before)} → ${fmt(after)}  (-${pct}%)`)

    if (!dryRun) {
      const { error: upErr } = await sb.storage.from(BUCKET).update(f.path, optimized, {
        cacheControl: '2678400',
        contentType: 'image/jpeg',
        upsert: true,
      })
      if (upErr) {
        // some endpoints expect upload(); try that
        const { error: upErr2 } = await sb.storage.from(BUCKET).upload(f.path, optimized, {
          cacheControl: '2678400',
          contentType: 'image/jpeg',
          upsert: true,
        })
        if (upErr2) throw upErr2
      }
    }
  } catch (e) {
    failed++
    console.log(`  ! ${f.path}  ERROR: ${e.message ?? e}`)
  }
}

console.log()
console.log(`Done. processed=${images.length - skipped - failed}  skipped=${skipped}  failed=${failed}`)
console.log(`Total: ${fmt(totalBefore)} → ${fmt(totalAfter)}  (saved ${fmt(totalBefore - totalAfter)})`)
if (dryRun) console.log(`\n(dry run — no uploads performed)`)
