import { getPayloadClient } from '@/lib/payload'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CaseStudyCard from '@/components/CaseStudyCard'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Work',
  description: 'Case studies and design work by Nanditha C P — Product Designer.',
}

const PLACEHOLDER = '/placeholder.svg'

function getImageUrl(img: unknown): { url: string; alt: string; width: number; height: number } {
  if (img && typeof img === 'object' && 'url' in img) {
    const m = img as { url?: string; alt?: string; width?: number; height?: number }
    return { url: m.url || PLACEHOLDER, alt: m.alt || '', width: m.width || 800, height: m.height || 450 }
  }
  return { url: PLACEHOLDER, alt: '', width: 800, height: 450 }
}

export default async function WorkPage() {
  const payload = await getPayloadClient()

  let studies: Array<{
    id: string | number
    title: string
    slug: string
    company: string
    category: string
    excerpt: string
    featuredImage: unknown
  }> = []

  try {
    const result = await payload.find({
      collection: 'case-studies',
      where: { status: { equals: 'published' } },
      limit: 20,
      sort: '-publishedDate',
    })
    studies = result.docs as typeof studies
  } catch {
    // DB not ready
  }

  // Fallback sample data
  if (studies.length === 0) {
    studies = [
      { id: '1', title: 'Agentic AI Design System', slug: 'agentic-ai-design-system', company: 'Rocketium', category: 'Agentic AI experinece', excerpt: 'Designers were spending their days executing decisions they had already made.', featuredImage: { url: '/samples/work-1.svg', alt: 'AI wireframe visualization' } },
      { id: '2', title: 'Circuit Board Intelligence', slug: 'circuit-board-intelligence', company: 'Rocketium', category: 'Agentic AI experinece', excerpt: 'Designers were spending their days executing decisions they had already made.', featuredImage: { url: '/samples/work-2.svg', alt: 'Circuit board design' } },
      { id: '3', title: 'Neural Network Patterns', slug: 'neural-network-patterns', company: 'Rocketium', category: 'Agentic AI experinece', excerpt: 'Designers were spending their days executing decisions they had already made.', featuredImage: { url: '/samples/work-3.svg', alt: 'Neural network visualization' } },
      { id: '4', title: 'Engineering Meets Design', slug: 'engineering-meets-design', company: 'Rocketium', category: 'Agentic AI experinece', excerpt: 'Designers were spending their days executing decisions they had already made.', featuredImage: { url: '/samples/work-4.svg', alt: 'Engineer at workstation' } },
    ]
  }

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-20 px-6">
        <div className="max-w-[1200px] mx-auto">
          <h1 className="text-3xl md:text-[2.75rem] leading-[1.15] font-display mb-4">
            Designed by a human. Inspired by everything else.
          </h1>
          <p className="text-gray-500 text-[15px] mb-14 max-w-xl">
            A collection of case studies, design explorations, and product thinking across teams and industries.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-14">
            {studies.map((study) => (
              <CaseStudyCard
                key={study.id}
                title={study.title}
                slug={study.slug}
                company={study.company}
                category={study.category}
                excerpt={study.excerpt}
                featuredImage={getImageUrl(study.featuredImage)}
              />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
