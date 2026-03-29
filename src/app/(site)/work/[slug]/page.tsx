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

type CaseStudy = {
  title: string
  company: string
  category: string
  excerpt: string
  publishedDate: string
  content: unknown
  featuredImage: unknown
  hiddenHeadings?: Array<{ headingText: string }>
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

  let study: CaseStudy | null = null

  try {
    const result = await payload.find({
      collection: 'case-studies',
      where: { slug: { equals: slug }, status: { equals: 'published' } },
      limit: 1,
      depth: 1,
    })
    study = (result.docs[0] as unknown as CaseStudy) ?? null
  } catch {
    notFound()
  }

  if (!study) notFound()

  const publishedDate = study.publishedDate
    ? new Date(study.publishedDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'September 14, 2025'

  const featuredImg = study.featuredImage &&
    typeof study.featuredImage === 'object' &&
    'url' in study.featuredImage
      ? (study.featuredImage as { url: string; alt?: string })
      : null

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-20 px-6 lg:pl-[5%] lg:pr-[10%]">
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10 lg:gap-[10%]">
            {/* Sidebar stays fixed during page scroll */}
            <aside className="hidden lg:block sticky top-[71px] self-start h-fit pt-2">
              <BlogSidebar />
            </aside>

            {/* Main content */}
            <article className="min-w-0 self-start">
              {/* Back button stays fixed during page scroll */}
              <div className="sticky top-[71px] z-20 bg-white/95 backdrop-blur-sm py-2">
                <Link
                  href="/work"
                  className="inline-flex items-center gap-1.5 font-medium hover:opacity-70 transition-opacity"
                  style={{ color: '#D97757', fontSize: '16px', fontFamily: 'var(--font-body)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M13 7H1M6 2L1 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Back to work
                </Link>
              </div>

              <div className="pt-6">
                {/* Title */}
                <h1 className="leading-[1.12] tracking-[-0.025em] font-display mb-4" style={{ fontSize: '51px' }}>
                  {study.title}
                </h1>

                {/* Date */}
                <p className="mb-10" style={{ color: '#252F3EAB', fontSize: '16px', fontFamily: 'var(--font-body)' }}>{publishedDate}</p>

                {/* Featured image */}
                {featuredImg && (
                  <div className="rounded-xl overflow-hidden mb-10 relative" style={{ height: '531px' }}>
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
                <RichTextRenderer content={study.content as Parameters<typeof RichTextRenderer>[0]['content']} />
              </div>
            </article>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}


