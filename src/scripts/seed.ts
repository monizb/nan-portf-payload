import { getPayload } from 'payload'
import config from '../payload.config'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const defaultRichTextContent = {
  root: {
    children: [
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            text: 'This case study content was seeded automatically.',
          },
        ],
      },
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
}

async function seed() {
  const payload = await getPayload({ config })

  console.log('Seeding database...')

  // Create admin user
  try {
    await payload.create({
      collection: 'users',
      data: {
        email: 'admin@nandithacp.com',
        password: 'changeme123',
      },
    })
    console.log('✓ Admin user created')
  } catch {
    console.log('⏭ Admin user already exists')
  }

  // Create case studies (work grid)
  const workStudies = [
    {
      title: 'Rethinking the Agentic AI Experience',
      slug: 'rethinking-agentic-ai-experience',
      company: 'Rocketium',
      category: 'Agentic AI experinece',
      excerpt: 'Designers were spending their days executing decisions they had already made.',
      publishedDate: '2025-09-14T00:00:00.000Z',
      status: 'published' as const,
      section: 'work-grid' as const,
      isFeatured: true,
    },
    {
      title: 'Designing Intelligence into Every Circuit',
      slug: 'designing-intelligence-into-every-circuit',
      company: 'Rocketium',
      category: 'Agentic AI experinece',
      excerpt: 'Designers were spending their days executing decisions they had already made.',
      publishedDate: '2025-08-22T00:00:00.000Z',
      status: 'published' as const,
      section: 'work-grid' as const,
      isFeatured: true,
    },
    {
      title: 'Neural Networks in Product Design',
      slug: 'neural-networks-in-product-design',
      company: 'Rocketium',
      category: 'Agentic AI experinece',
      excerpt: 'Designers were spending their days executing decisions they had already made.',
      publishedDate: '2025-07-15T00:00:00.000Z',
      status: 'published' as const,
      section: 'work-grid' as const,
      isFeatured: false,
    },
    {
      title: 'When Engineering Meets Design Thinking',
      slug: 'when-engineering-meets-design-thinking',
      company: 'Rocketium',
      category: 'Agentic AI experinece',
      excerpt: 'Designers were spending their days executing decisions they had already made.',
      publishedDate: '2025-06-10T00:00:00.000Z',
      status: 'published' as const,
      section: 'work-grid' as const,
      isFeatured: false,
    },
  ]

  const studioStudies = [
    {
      title: 'Particle Flow: A Generative Study',
      slug: 'particle-flow-generative-study',
      company: 'Rocketium',
      category: 'Agentic AI experinece',
      excerpt: 'An exploration of generative particle systems and visual flow.',
      publishedDate: '2025-05-01T00:00:00.000Z',
      status: 'published' as const,
      section: 'studio-grid' as const,
      isFeatured: false,
    },
    {
      title: 'Data Mesh: Interconnected Visualization',
      slug: 'data-mesh-interconnected-visualization',
      company: 'Rocketium',
      category: 'Agentic AI experinece',
      excerpt: 'Visualizing interconnected data systems through design.',
      publishedDate: '2025-04-15T00:00:00.000Z',
      status: 'published' as const,
      section: 'studio-grid' as const,
      isFeatured: false,
    },
    {
      title: 'Abstract Wave Dynamics',
      slug: 'abstract-wave-dynamics',
      company: 'Rocketium',
      category: 'Agentic AI experinece',
      excerpt: 'Exploring fluid dynamics in digital environments.',
      publishedDate: '2025-03-20T00:00:00.000Z',
      status: 'published' as const,
      section: 'studio-grid' as const,
      isFeatured: false,
    },
  ]

  // Blog case study with full content
  const blogStudy = {
    title: 'Learning at the Speed of Work: Microlearning for Designers, PMs, and Marketers',
    slug: 'microlearning-for-designers-pms-marketers',
    company: 'Rocketium',
    category: 'Thought Leadership',
    excerpt: 'Every role in a modern workplace demands continuous learning. Microlearning provides a practical way to stay sharp.',
    publishedDate: '2025-09-14T00:00:00.000Z',
    status: 'published' as const,
    section: 'work-grid' as const,
    isFeatured: true,
    content: {
      root: {
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'Every role in a modern workplace demands continuous learning. New tools, shifting market conditions, and evolving customer expectations mean that staying still is no longer an option. Yet the challenge is the same across roles: limited time and an overwhelming flood of information. Microlearning provides a practical way for professionals such as designers, product managers, and marketers to stay sharp without losing focus on their core work.' }],
          },
          {
            type: 'heading',
            tag: 'h2',
            children: [{ type: 'text', text: 'Why These Roles Need Continuous Learning' }],
          },
          {
            type: 'list',
            listType: 'bullet',
            children: [
              { type: 'listitem', children: [{ type: 'text', text: 'Designers: Trends in user experience, accessibility standards, and design tools change constantly.', format: 0 }] },
              { type: 'listitem', children: [{ type: 'text', text: 'Product Managers: They need to understand new frameworks, market shifts, and customer insights.', format: 0 }] },
              { type: 'listitem', children: [{ type: 'text', text: 'Marketers: Algorithms, platforms, and consumer behavior evolve faster than traditional training can keep up.', format: 0 }] },
            ],
          },
          {
            type: 'heading',
            tag: 'h2',
            children: [{ type: 'text', text: 'How Microlearning Fits the Workflow' }],
          },
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'Traditional training programs often require hours of uninterrupted focus. Microlearning breaks content into focused, bite-sized modules — typically 5 to 15 minutes — that professionals can complete between meetings, during commutes, or in spare moments throughout the day.' }],
          },
          {
            type: 'heading',
            tag: 'h2',
            children: [{ type: 'text', text: 'Benefits for Designers' }],
          },
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'For designers, microlearning enables rapid skill acquisition in emerging areas like AI-assisted design, motion design principles, and advanced prototyping techniques. Short format lessons allow designers to immediately apply what they learn to ongoing projects.' }],
          },
          {
            type: 'heading',
            tag: 'h2',
            children: [{ type: 'text', text: 'Benefits for Product Managers' }],
          },
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'Product managers benefit from focused modules on market analysis, feature prioritization frameworks, and customer research methodologies. The short format respects their heavily scheduled days while ensuring continuous professional development.' }],
          },
          {
            type: 'heading',
            tag: 'h2',
            children: [{ type: 'text', text: 'Benefits for Marketers' }],
          },
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'Marketers can stay current with platform algorithm changes, content strategy evolution, and new analytics tools through brief, targeted learning sessions that fit between campaign cycles.' }],
          },
          {
            type: 'heading',
            tag: 'h2',
            children: [{ type: 'text', text: 'Why Microlearning Works Better Than Long Courses' }],
          },
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'Research shows that shorter learning sessions lead to better retention. The spacing effect — learning in small chunks over time rather than in massive blocks — significantly improves long-term recall and application of knowledge.' }],
          },
          {
            type: 'heading',
            tag: 'h2',
            children: [{ type: 'text', text: 'Courses for These Roles' }],
          },
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'Modern platforms now offer curated learning paths specifically designed for design, product management, and marketing professionals. These paths combine video lessons, interactive exercises, and real-world case studies in digestible formats.' }],
          },
          {
            type: 'heading',
            tag: 'h2',
            children: [{ type: 'text', text: 'Real Life Scenarios' }],
          },
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'Consider a designer who learns a new Figma plugin in a 10-minute tutorial during lunch, then uses it that afternoon to cut their prototyping time in half. Or a product manager who absorbs a new prioritization framework in a short module and applies it in their next sprint planning session. These are the real-world impacts of well-designed microlearning.' }],
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
      },
    },
    hiddenHeadings: [],
  }

  const sampleImageFiles = [
    'work-1.svg',
    'work-2.svg',
    'work-3.svg',
    'work-4.svg',
    'studio-1.svg',
    'studio-2.svg',
    'studio-3.svg',
  ]

  const mediaIDs: Array<number | string> = []

  for (const imageFile of sampleImageFiles) {
    const existingMedia = await payload.find({
      collection: 'media',
      where: { alt: { equals: imageFile } },
      limit: 1,
    })

    if (existingMedia.docs.length > 0) {
      mediaIDs.push(existingMedia.docs[0]!.id)
      continue
    }

    const createdMedia = await payload.create({
      collection: 'media',
      data: { alt: imageFile },
      filePath: path.resolve(dirname, '../../public/samples', imageFile),
    })

    mediaIDs.push(createdMedia.id)
  }

  const allStudies = [...workStudies, ...studioStudies, blogStudy].map((study, index) => ({
    ...study,
    content: 'content' in study ? study.content : defaultRichTextContent,
    featuredImage: mediaIDs[index % mediaIDs.length],
  }))

  for (const study of allStudies) {
    try {
      const existing = await payload.find({
        collection: 'case-studies',
        where: { slug: { equals: study.slug } },
        limit: 1,
      })

      if (existing.docs.length > 0) {
        console.log(`⏭ "${study.title}" already exists`)
        continue
      }

      await payload.create({
        collection: 'case-studies',
        data: study as Parameters<typeof payload.create>[0]['data'],
      })
      console.log(`✓ Created: ${study.title}`)
    } catch (err) {
      console.error(`✗ Failed to create: ${study.title}`, err)
    }
  }

  console.log('\n✅ Seeding complete!')
  console.log('Admin login: admin@nandithacp.com / changeme123')
  console.log('Visit: http://localhost:3000/admin')

  process.exit(0)
}

seed().catch(console.error)
