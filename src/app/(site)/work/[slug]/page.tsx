import { getPayloadClient } from '@/lib/payload'
import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BlogSidebar from '@/components/BlogSidebar'
import RichTextRenderer from '@/components/RichTextRenderer'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayloadClient()

  try {
    const result = await payload.find({
      collection: 'case-studies',
      where: { slug: { equals: slug }, status: { equals: 'published' } },
      limit: 1,
    })

    const study = result.docs[0]
    if (!study) return { title: 'Not Found' }

    return {
      title: study.title,
      description: study.excerpt,
    }
  } catch {
    return { title: slug }
  }
}

export async function generateStaticParams() {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'case-studies',
      where: { status: { equals: 'published' } },
      limit: 100,
    })
    return result.docs.map((doc) => ({ slug: doc.slug }))
  } catch {
    return []
  }
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params
  const payload = await getPayloadClient()

  let study: {
    title: string
    company: string
    category: string
    excerpt: string
    publishedDate: string
    content: unknown
    featuredImage: unknown
    hiddenHeadings?: Array<{ headingText: string }>
  } | null = null

  try {
    const result = await payload.find({
      collection: 'case-studies',
      where: { slug: { equals: slug }, status: { equals: 'published' } },
      limit: 1,
    })
    study = result.docs[0] as unknown as typeof study
  } catch {
    // Use sample content for development
  }

  // If no study found, show sample content for dev
  if (!study) {
    study = getSampleStudy(slug)
    if (!study) notFound()
  }

  const publishedDate = study.publishedDate
    ? new Date(study.publishedDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'September 14, 2025'

  const hiddenTexts = (study.hiddenHeadings || []).map((h) => h.headingText)

  const featuredImg = study.featuredImage &&
    typeof study.featuredImage === 'object' &&
    'url' in study.featuredImage
      ? (study.featuredImage as { url: string; alt?: string })
      : null

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-20 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-12">
            {/* Sticky sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-28">
                <BlogSidebar hiddenHeadings={hiddenTexts} />
              </div>
            </aside>

            {/* Main content */}
            <article className="max-w-[720px]">
              {/* Back button */}
              <Link
                href="/work"
                className="inline-flex items-center gap-1.5 text-[13px] font-medium mb-8 hover:opacity-70 transition-opacity"
                style={{ color: 'var(--color-terracotta)' }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M13 7H1M6 2L1 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Back to work
              </Link>

              {/* Title */}
              <h1 className="text-3xl md:text-[2.75rem] leading-[1.12] tracking-[-0.025em] font-display mb-4">
                {study.title}
              </h1>

              {/* Date */}
              <p className="text-[14px] text-gray-400 mb-10">{publishedDate}</p>

              {/* Featured image */}
              {featuredImg && (
                <div className="rounded-xl overflow-hidden mb-10 aspect-[16/9] relative">
                  <Image
                    src={featuredImg.url}
                    alt={featuredImg.alt || study.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, 720px"
                  />
                </div>
              )}

              {/* Rich text content */}
              {study.content ? (
                <RichTextRenderer content={study.content as Parameters<typeof RichTextRenderer>[0]['content']} />
              ) : (
                <SampleBlogContent />
              )}
            </article>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

function getSampleStudy(slug: string) {
  const studies: Record<string, {
    title: string
    company: string
    category: string
    excerpt: string
    publishedDate: string
    content: null
    featuredImage: null
    hiddenHeadings: never[]
  }> = {
    'agentic-ai-design-system': {
      title: 'Learning at the Speed of Work: Microlearning for Designers, PMs, and Marketers',
      company: 'Rocketium',
      category: 'Agentic AI',
      excerpt: 'How we rethought the design system for an AI-native future.',
      publishedDate: '2025-09-14',
      content: null,
      featuredImage: null,
      hiddenHeadings: [],
    },
    'circuit-board-intelligence': {
      title: 'Circuit Board Intelligence: Designing for Hardware Meets Software',
      company: 'Rocketium',
      category: 'Product Design',
      excerpt: 'Bridging the gap between physical and digital product design.',
      publishedDate: '2025-08-22',
      content: null,
      featuredImage: null,
      hiddenHeadings: [],
    },
    'neural-network-patterns': {
      title: 'Neural Network Patterns in Product Interfaces',
      company: 'Rocketium',
      category: 'Research',
      excerpt: 'Exploring how neural network architectures influence UI patterns.',
      publishedDate: '2025-07-15',
      content: null,
      featuredImage: null,
      hiddenHeadings: [],
    },
    'engineering-meets-design': {
      title: 'Engineering Meets Design: Cross-functional Collaboration',
      company: 'Rocketium',
      category: 'Process',
      excerpt: 'Building bridges between engineering and design teams.',
      publishedDate: '2025-06-10',
      content: null,
      featuredImage: null,
      hiddenHeadings: [],
    },
  }

  return studies[slug] || null
}

function SampleBlogContent() {
  return (
    <div className="blog-content">
      <p>
        Every role in a modern workplace demands continuous learning. New tools, shifting market
        conditions, and evolving customer expectations mean that staying still is no longer an option.
        Yet the challenge is the same across roles: limited time and an overwhelming flood of
        information. Microlearning provides a practical way for professionals such as designers, product
        managers, and marketers to stay sharp without losing focus on their core work.
      </p>

      <h2 id="why-these-roles-need-continuous-learning">Why These Roles Need Continuous Learning</h2>
      <ul>
        <li><strong>Designers:</strong> Trends in user experience, accessibility standards, and design tools change constantly.</li>
        <li><strong>Product Managers:</strong> They need to understand new frameworks, market shifts, and customer insights.</li>
        <li><strong>Marketers:</strong> Algorithms, platforms, and consumer behavior evolve faster than traditional training can keep up.</li>
      </ul>

      <h2 id="how-microlearning-fits-the-workflow">How Microlearning Fits the Workflow</h2>
      <p>
        Traditional training programs often require hours of uninterrupted focus. Microlearning breaks content
        into focused, bite-sized modules — typically 5 to 15 minutes — that professionals can complete between
        meetings, during commutes, or in spare moments throughout the day.
      </p>

      <h2 id="benefits-for-designers">Benefits for Designers</h2>
      <p>
        For designers, microlearning enables rapid skill acquisition in emerging areas like AI-assisted design,
        motion design principles, and advanced prototyping techniques. Short format lessons allow designers to
        immediately apply what they learn to ongoing projects.
      </p>

      <h2 id="benefits-for-product-managers">Benefits for Product Managers</h2>
      <p>
        Product managers benefit from focused modules on market analysis, feature prioritization frameworks,
        and customer research methodologies. The short format respects their heavily scheduled days while
        ensuring continuous professional development.
      </p>

      <h2 id="benefits-for-marketers">Benefits for Marketers</h2>
      <p>
        Marketers can stay current with platform algorithm changes, content strategy evolution, and new
        analytics tools through brief, targeted learning sessions that fit between campaign cycles.
      </p>

      <h2 id="why-microlearning-works-better-than-long-courses">Why Microlearning Works Better Than Long Courses</h2>
      <p>
        Research shows that shorter learning sessions lead to better retention. The spacing effect — learning
        in small chunks over time rather than in massive blocks — significantly improves long-term recall and
        application of knowledge.
      </p>

      <h2 id="courses-for-these-roles">Courses for These Roles</h2>
      <p>
        Modern platforms now offer curated learning paths specifically designed for design, product management,
        and marketing professionals. These paths combine video lessons, interactive exercises, and real-world
        case studies in digestible formats.
      </p>

      <h2 id="real-life-scenarios">Real Life Scenarios</h2>
      <p>
        Consider a designer who learns a new Figma plugin in a 10-minute tutorial during lunch, then uses it
        that afternoon to cut their prototyping time in half. Or a product manager who absorbs a new
        prioritization framework in a short module and applies it in their next sprint planning session. These
        are the real-world impacts of well-designed microlearning.
      </p>
    </div>
  )
}
