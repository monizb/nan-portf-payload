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
      label: 'Speaking Section Media',
      type: 'group',
      fields: [
        {
          name: 'leftSlimImage',
          label: 'Left Slim Image',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Narrow portrait image shown on the left side of the Speaking section.',
          },
        },
        {
          name: 'rightFeatureImage',
          label: 'Right Feature Image',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Main wide image shown on the right side with caption overlay.',
          },
        },
        {
          name: 'rightCaption',
          label: 'Right Image Caption',
          type: 'textarea',
          defaultValue: '80% of what you build will never be used.\nWhy engineers need to understand design.',
          admin: {
            description: 'Caption text shown over the right image.',
          },
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
