import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'siteTitle',
      type: 'text',
      defaultValue: 'Nanditha C P',
    },
    {
      name: 'heroTitle',
      type: 'text',
      defaultValue: 'The best design I have ever seen was not made by a human',
    },
    {
      name: 'heroSubtitle',
      type: 'text',
      defaultValue: 'Product Designer, Rocketium',
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'workSectionTitle',
      type: 'text',
      defaultValue: 'Designed by a human. Inspired by everything else.',
    },
    {
      name: 'studioSectionTitle',
      type: 'text',
      defaultValue: 'This is what I build when no one tells me what to build',
    },
    {
      name: 'aboutTitle',
      type: 'text',
      defaultValue: 'Designer • Thinker',
    },
    {
      name: 'aboutDescription',
      type: 'textarea',
      defaultValue: 'I design products. I think in systems.\nEverything else you will have to watch.',
    },
    {
      name: 'aboutImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'speakingTitle',
      type: 'text',
      defaultValue: 'Design is too important to keep to myself.',
    },
    {
      name: 'speakingImages',
      type: 'array',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
        },
      ],
    },
    {
      name: 'footerQuote',
      type: 'text',
      defaultValue: 'The best work happens when two people in the room refuse to settle.',
    },
    {
      name: 'email',
      type: 'email',
      defaultValue: 'contact@nandithacp.com',
    },
    {
      name: 'glbModelUrl',
      type: 'text',
      defaultValue: '/Sprint.glb',
      admin: {
        description: 'URL path to the GLB model for scroll animation',
      },
    },
  ],
}
