// Downloads every Media file into public/media so it ships as a Workers static
// asset (free, unlimited requests) instead of being read from KV/R2 at runtime.
//
//   npm run media:pull                 # try live site, then remote R2, then local R2
//   npm run media:pull -- --force      # re-download files that already exist
//
// For each file it tries, in order:
//   1. the deployed site (/api/media/file/<name>)
//   2. `wrangler r2 object get <bucket>/<name> --remote`  (needs `wrangler login`)
//   3. `wrangler r2 object get <bucket>/<name> --local`   (your `next dev` uploads in .wrangler/state)
//
// Files larger than the 25 MiB static-asset limit are re-encoded with sharp.
// Finally it regenerates src/lib/staticMedia.json.
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const SITE = process.env.SITE_URL || 'https://nanditha-portfolio.monish2-basaniwal.workers.dev'
const BUCKET = process.env.R2_BUCKET || 'nanditha-portfolio-media'
const MAX_ASSET_BYTES = 25 * 1024 * 1024
const TARGET_BYTES = 24 * 1024 * 1024
const OUT_DIR = path.resolve('public/media')
const force = process.argv.includes('--force')

fs.mkdirSync(OUT_DIR, { recursive: true })

const res = await fetch(`${SITE}/api/media?limit=1000&depth=0&pagination=false`)
if (!res.ok) throw new Error(`Could not list media from ${SITE}: ${res.status}`)
const { docs } = await res.json()
const files = docs.map((d) => d.filename).filter(Boolean)
console.log(`${files.length} media documents on ${SITE}`)

const fromSite = async (name, dest) => {
  const r = await fetch(`${SITE}/api/media/file/${encodeURIComponent(name)}`)
  if (!r.ok) return false
  const buf = Buffer.from(await r.arrayBuffer())
  if (!buf.length) return false
  fs.writeFileSync(dest, buf)
  return true
}

const fromR2 = (mode) => (name, dest) => {
  try {
    execFileSync('npx', ['wrangler', 'r2', 'object', 'get', `${BUCKET}/${name}`, `--${mode}`, '--file', dest], {
      stdio: 'pipe',
    })
    return fs.existsSync(dest) && fs.statSync(dest).size > 0
  } catch {
    fs.rmSync(dest, { force: true })
    return false
  }
}

const sources = [
  ['site', fromSite],
  ['r2-remote', fromR2('remote')],
  ['r2-local', fromR2('local')],
]

const shrink = async (file) => {
  const input = fs.readFileSync(file)
  const meta = await sharp(input).metadata()
  let width = meta.width
  let out = input
  while (out.length > TARGET_BYTES && width > 400) {
    const img = sharp(input).resize({ width, withoutEnlargement: true })
    out =
      meta.format === 'png'
        ? await img.png({ compressionLevel: 9, palette: true, quality: 90 }).toBuffer()
        : await img.jpeg({ quality: 85, mozjpeg: true }).toBuffer()
    width = Math.round(width * 0.8)
  }
  fs.writeFileSync(file, out)
  console.log(`  shrunk ${path.basename(file)}: ${(input.length / 1e6).toFixed(1)} MB -> ${(out.length / 1e6).toFixed(1)} MB`)
}

const missing = []
for (const name of files) {
  const dest = path.join(OUT_DIR, name)
  if (!force && fs.existsSync(dest) && fs.statSync(dest).size > 0) continue
  let got = null
  for (const [label, fetcher] of sources) {
    if (await fetcher(name, dest)) {
      got = label
      break
    }
  }
  if (!got) {
    missing.push(name)
    console.log(`  MISSING ${name}`)
    continue
  }
  console.log(`  ${got.padEnd(9)} ${name}`)
  if (fs.statSync(dest).size > MAX_ASSET_BYTES) await shrink(dest)
}

execFileSync('node', ['src/scripts/media-manifest.mjs'], { stdio: 'inherit' })

if (missing.length) {
  console.log(`\n${missing.length} file(s) could not be found anywhere. Re-upload them in the admin, or drop the`)
  console.log(`original files into public/media/ with exactly these names and run \`npm run media:manifest\`:`)
  for (const m of missing) console.log(`  - ${m}`)
  process.exitCode = 1
}
