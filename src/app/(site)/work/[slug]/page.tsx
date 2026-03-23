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
        <div className="max-w-350 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-12">
            {/* Sticky sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-28">
                <BlogSidebar hiddenHeadings={hiddenTexts} />
              </div>
            </aside>

            {/* Main content */}
            <article className="min-w-0">
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
              <RichTextRenderer content={study.content as Parameters<typeof RichTextRenderer>[0]['content']} />
            </article>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}


