import type { CollectionConfig } from 'payload'
import {
  lexicalEditor,
  BlocksFeature,
  FixedToolbarFeature,
  InlineToolbarFeature,
  HorizontalRuleFeature,
  TextStateFeature,
} from '@payloadcms/richtext-lexical'

export const CaseStudies: CollectionConfig = {
  slug: 'case-studies',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'company', 'category', 'publishedDate', 'status'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'company',
      type: 'text',
      required: true,
    },
    {
      name: 'category',
      type: 'text',
      required: true,
      admin: {
        description: 'e.g. "Agentic AI experience"',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Short description shown on cards',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'publishedDate',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          FixedToolbarFeature(),
          InlineToolbarFeature(),
          HorizontalRuleFeature(),
          TextStateFeature({
            state: {
              highlight: {
                highlighted: {
                  label: 'Highlighted Text',
                  css: {
                    color: '#D97757',
                    'font-size': '20px',
                  },
                },
              },
            },
          }),
          BlocksFeature({
            blocks: [
              {
                slug: 'section',
                labels: {
                  singular: 'Section',
                  plural: 'Sections',
                },
                fields: [
                  {
                    name: 'sectionTag',
                    type: 'text',
                    required: true,
                  },
                  {
                    name: 'sectionTitle',
                    type: 'text',
                    required: true,
                  },
                  {
                    name: 'sectionBody',
                    type: 'richText',
                    editor: lexicalEditor(),
                    required: false,
                  },
                ],
              },
              {
                slug: 'highlightedText',
                labels: {
                  singular: 'Highlighted Text',
                  plural: 'Highlighted Text',
                },
                fields: [
                  {
                    name: 'text',
                    type: 'text',
                    required: true,
                  },
                ],
              },
            ],
          }),
        ],
      }),
      required: true,
    },
    {
      name: 'hiddenHeadings',
      type: 'array',
      admin: {
        description: 'Check to show a heading in the sidebar, uncheck to hide it.',
        components: {
          Field: '@/components/HeadingVisibilityField#HeadingVisibilityField',
        },
      },
      fields: [
        {
          name: 'headingText',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Show on homepage featured section',
      },
    },
    {
      name: 'section',
      type: 'select',
      admin: {
        position: 'sidebar',
        description: 'Which homepage section to display this in',
      },
      options: [
        { label: 'Work Grid', value: 'work-grid' },
        { label: 'Studio Grid', value: 'studio-grid' },
      ],
    },
  ],
}
