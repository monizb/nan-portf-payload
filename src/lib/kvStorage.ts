import path from 'path'
import type { Config } from 'payload'
import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage'
import type { Adapter } from '@payloadcms/plugin-cloud-storage/types'
import { sanitizeFilename } from 'payload/shared'

// Media storage backed by Workers KV. Used instead of R2 so the site runs on the
// Workers Free plan without an R2 subscription. KV values are capped at 25 MiB.
export const KV_MAX_FILE_SIZE = 25 * 1024 * 1024

type Metadata = { contentType?: string }

const kvAdapter =
  (kv: CloudflareEnv['MEDIA_KV']): Adapter =>
  ({ prefix = '' }) => ({
    name: 'kv',
    handleUpload: async ({ data, file }) => {
      if (file.buffer.byteLength > KV_MAX_FILE_SIZE) {
        throw new Error(
          `${file.filename} is ${(file.buffer.byteLength / 1024 / 1024).toFixed(1)} MB; the limit is 25 MB. Please compress it and upload again.`,
        )
      }
      await kv.put(path.posix.join(data.prefix || prefix, file.filename), file.buffer, {
        metadata: { contentType: file.mimeType } satisfies Metadata,
      })
    },
    handleDelete: async ({ doc: { prefix: docPrefix = '' }, filename }) => {
      await kv.delete(path.posix.join(docPrefix, filename))
    },
    staticHandler: async (req, { params: { filename } }) => {
      try {
        const key = path.posix.join(prefix, sanitizeFilename(filename))
        const { value, metadata } = await kv.getWithMetadata<Metadata>(key, {
          type: 'stream',
          cacheTtl: 86400,
        })
        if (!value) return new Response(null, { status: 404, statusText: 'Not Found' })

        const headers = new Headers({
          'Content-Type': metadata?.contentType || 'application/octet-stream',
          'Cache-Control': 'public, max-age=31536000, immutable',
        })
        if (metadata?.contentType === 'image/svg+xml') {
          headers.set('Content-Security-Policy', "script-src 'none'")
        }
        return new Response(value, { headers })
      } catch (err) {
        req.payload.logger.error({ err, msg: `KV media read failed: ${filename}` })
        return new Response('Internal Server Error', { status: 500 })
      }
    },
  })

export const kvStorage =
  ({ kv, collections }: { kv: CloudflareEnv['MEDIA_KV']; collections: string[] }) =>
  (incomingConfig: Config): Config => {
    const adapter = kvAdapter(kv)
    const config: Config = {
      ...incomingConfig,
      collections: (incomingConfig.collections || []).map((collection) =>
        collections.includes(collection.slug)
          ? {
              ...collection,
              upload: {
                ...(typeof collection.upload === 'object' ? collection.upload : {}),
                disableLocalStorage: true,
              },
            }
          : collection,
      ),
    }
    return cloudStoragePlugin({
      collections: Object.fromEntries(collections.map((slug) => [slug, { adapter }])),
    })(config)
  }
