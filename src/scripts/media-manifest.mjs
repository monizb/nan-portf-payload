// Writes src/lib/staticMedia.json: the list of files in public/media. Media docs whose
// filename is in this list get a /media/<name> URL served straight from Workers static assets.
import fs from 'node:fs'
import path from 'node:path'

const MAX_ASSET_BYTES = 25 * 1024 * 1024
const dir = path.resolve('public/media')
const files = fs
  .readdirSync(dir)
  .filter((f) => !f.startsWith('.') && fs.statSync(path.join(dir, f)).isFile())
  .sort()

const tooBig = files.filter((f) => fs.statSync(path.join(dir, f)).size > MAX_ASSET_BYTES)
if (tooBig.length) {
  console.error(`These files exceed the 25 MiB Workers static-asset limit; compress them first:\n  ${tooBig.join('\n  ')}`)
  process.exit(1)
}

fs.writeFileSync(path.resolve('src/lib/staticMedia.json'), JSON.stringify(files, null, 2) + '\n')
console.log(`staticMedia.json: ${files.length} files`)
