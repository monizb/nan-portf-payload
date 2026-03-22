import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  upload: {
    mimeTypes: ['image/*', 'video/*', 'model/gltf-binary', 'application/octet-stream'],
    staticDir: 'public/media',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
}
