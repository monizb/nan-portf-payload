import { getPayloadClient } from '@/lib/payload'
import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BlogSidebar from '@/components/BlogSidebar'
import RichTextRenderer from '@/components/RichTextRenderer'
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
      depth: 2,
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
      <main className="pt-14 pb-16 px-6 lg:pl-[5%] lg:pr-[10%]">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[280px_1fr] lg:gap-[10%]">
          <aside className="hidden lg:block lg:sticky lg:top-14 lg:self-start">
            <BlogSidebar />
          </aside>

          <article className="min-w-0">
            <h1 className="leading-[1.12] tracking-[-0.025em] font-display mb-4" style={{ fontSize: '51px' }}>
              {study.title}
            </h1>

            <p className="mb-10" style={{ color: '#252F3EAB', fontSize: '16px', fontFamily: 'var(--font-body)' }}>{publishedDate}</p>

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

            <RichTextRenderer content={study.content as Parameters<typeof RichTextRenderer>[0]['content']} />
          </article>
        </div>
      </main>
      <Footer />
    </>
  )
}


