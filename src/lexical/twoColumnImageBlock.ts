import type { Block } from 'payload'

export const twoColumnImageBlock: Block = {
  slug: 'twoColumnImage',
  labels: {
    singular: '2 Column Image',
    plural: '2 Column Images',
  },
  fields: [
    {
      name: 'leftImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Left column (half width on desktop). Optional if you only use the right image.',
      },
    },
    {
      name: 'rightImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Right column (half width on desktop). Leave empty for a blank right side.',
      },
    },
  ],
}
