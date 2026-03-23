import Image from 'next/image'
import Link from 'next/link'

interface CaseStudyCardProps {
  title: string
  slug: string
  company: string
  category: string
  excerpt: string
  featuredImage: {
    url: string
    alt: string
    width?: number
    height?: number
  }
}

export default function CaseStudyCard({
  title,
  slug,
  company,
  category,
  excerpt,
  featuredImage,
}: CaseStudyCardProps) {
  return (
    <Link href={`/work/${slug}`} className="group block">
      <div className="rounded-xl overflow-hidden bg-gray-50 aspect-[16/10] relative">
        <Image
          src={featuredImage.url}
          alt={featuredImage.alt}
          fill
          unoptimized={featuredImage.url.endsWith('.svg')}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      <div className="mt-4">
        <p className="text-[16px] font-display font-normal" style={{ color: '#6B6B6B' }}>
          {company} &bull; {category}
        </p>
        <h3 className="text-[28px] font-display font-medium mt-2 leading-snug text-gray-900">
          {title}
        </h3>
        <div
          className="mt-4 inline-flex items-center gap-2 text-[16px] font-medium text-gray-900 rounded-full px-5 py-2.5 group-hover:bg-[#EBEBEB] transition-colors"
          style={{ backgroundColor: '#F5F5F5' }}
        >
          See how I changed that
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </Link>
  )
}
