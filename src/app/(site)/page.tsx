import { getPayloadClient } from '@/lib/payload'
import HomeClient from '@/components/HomeClient'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CaseStudyCard from '@/components/CaseStudyCard'
import SectionButton from '@/components/SectionButton'
import Image from 'next/image'

// Placeholder images (replaced when real uploads exist)
const PLACEHOLDER = '/placeholder.svg'

function getImageUrl(img: unknown): { url: string; alt: string; width: number; height: number } {
  if (img && typeof img === 'object' && 'url' in img) {
    const m = img as { url?: string; alt?: string; width?: number; height?: number }
    return {
      url: m.url || PLACEHOLDER,
      alt: m.alt || '',
      width: m.width || 800,
      height: m.height || 450,
    }
  }
  return { url: PLACEHOLDER, alt: '', width: 800, height: 450 }
}

export default async function Home() {
  const payload = await getPayloadClient()

  // Fetch case studies
  let workStudies: Array<{
    id: string | number
    title: string
    slug: string
    company: string
    category: string
    excerpt: string
    featuredImage: unknown
  }> = []
  let studioStudies: typeof workStudies = []

  try {
    const workResult = await payload.find({
      collection: 'case-studies',
      where: {
        status: { equals: 'published' },
        section: { equals: 'work-grid' },
      },
      limit: 4,
      sort: '-publishedDate',
    })
    workStudies = workResult.docs as typeof workStudies

    const studioResult = await payload.find({
      collection: 'case-studies',
      where: {
        status: { equals: 'published' },
        section: { equals: 'studio-grid' },
      },
      limit: 4,
      sort: '-publishedDate',
    })
    studioStudies = studioResult.docs as typeof studioStudies
  } catch {
    // DB not seeded yet — use sample data
  }

  // Fetch site settings
  let settings: {
    heroTitle?: string
    heroSubtitle?: string
    heroImage?: unknown
    workSectionTitle?: string
    studioSectionTitle?: string
    aboutTitle?: string
    aboutDescription?: string
    aboutImage?: unknown
    speakingTitle?: string
    speakingImages?: Array<{ image: unknown; caption?: string }>
    footerQuote?: string
    email?: string
    glbModelUrl?: string
  } = {}
  try {
    settings = (await payload.findGlobal({ slug: 'site-settings' })) as typeof settings
  } catch {
    // Not configured yet
  }

  const heroTitle = settings.heroTitle || 'The best design I have ever seen was not made by a human'
  const heroSubtitle = settings.heroSubtitle || 'Product Designer, Rocketium'
  const workTitle = settings.workSectionTitle || 'Designed by a human. Inspired by everything else.'
  const studioTitle = settings.studioSectionTitle || 'This is what I build when no one tells me what to build'
  const aboutTitle = settings.aboutTitle || 'Designer • Thinker'
  const aboutDesc = settings.aboutDescription || 'I design products. I think in systems.\nEverything else you will have to watch.'
  const speakingTitle = settings.speakingTitle || 'Design is too important to keep to myself.'
  const footerQuote = settings.footerQuote || 'The best work happens when two people in the room refuse to settle.'
  const email = settings.email || 'contact@nandithacp.com'
  const glbUrl = settings.glbModelUrl || '/Sprint.glb'

  // Sample data when DB is empty
  const sampleWork = [
    { id: '1', title: 'Agentic AI Design System', slug: 'agentic-ai-design-system', company: 'Rocketium', category: 'Agentic AI experinece', excerpt: 'Designers were spending their days executing decisions they had already made.', featuredImage: { url: '/samples/work-1.svg', alt: 'AI wireframe visualization' } },
    { id: '2', title: 'Circuit Board Intelligence', slug: 'circuit-board-intelligence', company: 'Rocketium', category: 'Agentic AI experinece', excerpt: 'Designers were spending their days executing decisions they had already made.', featuredImage: { url: '/samples/work-2.svg', alt: 'Circuit board design' } },
    { id: '3', title: 'Neural Network Patterns', slug: 'neural-network-patterns', company: 'Rocketium', category: 'Agentic AI experinece', excerpt: 'Designers were spending their days executing decisions they had already made.', featuredImage: { url: '/samples/work-3.svg', alt: 'Neural network visualization' } },
    { id: '4', title: 'Engineering Meets Design', slug: 'engineering-meets-design', company: 'Rocketium', category: 'Agentic AI experinece', excerpt: 'Designers were spending their days executing decisions they had already made.', featuredImage: { url: '/samples/work-4.svg', alt: 'Engineer at workstation' } },
  ]

  const sampleStudio = [
    { id: 's1', title: 'Particle Flow Study', slug: 'particle-flow-study', company: 'Rocketium', category: 'Agentic AI experinece', excerpt: 'An exploration of generative particle systems and visual flow.', featuredImage: { url: '/samples/studio-1.svg', alt: 'Particle flow' } },
    { id: 's2', title: 'Data Mesh Visualization', slug: 'data-mesh-visualization', company: 'Rocketium', category: 'Agentic AI experinece', excerpt: 'Visualizing interconnected data systems through design.', featuredImage: { url: '/samples/studio-2.svg', alt: 'Data mesh' } },
    { id: 's3', title: 'Abstract Wave Study', slug: 'abstract-wave-study', company: 'Rocketium', category: 'Agentic AI experinece', excerpt: 'Exploring fluid dynamics in digital environments.', featuredImage: { url: '/samples/studio-3.svg', alt: 'Abstract waves' } },
  ]

  const displayWork = workStudies.length > 0 ? workStudies : sampleWork
  const displayStudio = studioStudies.length > 0 ? studioStudies : sampleStudio

  return (
    <HomeClient glbUrl={glbUrl}>
      <Navbar />

      {/* Hero Section */}
      <section className="pt-28 pb-16 px-6" id="hero">
        <div className="max-w-350 mx-auto">
          <h1 className="text-[40px]! leading-[1.1] tracking-[-0.03em] font-display max-w-2xl">
            {heroTitle}
          </h1>
          <div className="flex items-center justify-between mt-0">
            <p className="text-[20px]" style={{ color: 'var(--color-terracotta)' }}>
              {heroSubtitle}
            </p>
            <SectionButton href="/#beyond" label="Beyond the work" />
          </div>

          {/* Hero Image */}
          <div className="mt-10 rounded-2xl overflow-hidden bg-gray-900 aspect-[16/9] relative">
            {settings.heroImage ? (
              <Image
                src={getImageUrl(settings.heroImage).url}
                alt="Hero"
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black" />
            )}
          </div>
        </div>
      </section>

      {/* Work Section */}
      <section className="py-20 px-6" id="work">
        <div className="max-w-350 mx-auto">
          <div className="flex items-start justify-between mb-12">
            <h2 className="text-[40px] leading-[1.15] font-display">
              {workTitle}
            </h2>
            <SectionButton href="/work" label="All work" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
            {displayWork.map((study) => (
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
      </section>

      {/* Studio Section */}
      <section className="py-20 px-6" id="studio">
        <div className="max-w-350 mx-auto">
          <div className="flex items-start justify-between mb-12">
            <h2 className="text-3xl md:text-[2.5rem] leading-[1.15] font-display max-w-lg">
              {studioTitle}
            </h2>
            <SectionButton href="/work" label="Enter the studio" />
          </div>

          {/* Asymmetric grid matching screenshot */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Large left */}
            {displayStudio[0] && (
              <div className="md:col-span-7">
                <div className="rounded-xl overflow-hidden bg-gray-50 aspect-[4/3] relative">
                  <Image
                    src={getImageUrl(displayStudio[0].featuredImage).url}
                    alt={getImageUrl(displayStudio[0].featuredImage).alt}
                    fill
                    className="object-cover"
                    sizes="60vw"
                  />
                </div>
                <p className="text-[13px] text-gray-400 font-medium mt-4">
                  {displayStudio[0].company} &bull; {displayStudio[0].category}
                </p>
              </div>
            )}
            {/* Right stack */}
            <div className="md:col-span-5 flex flex-col gap-6">
              {displayStudio.slice(1, 3).map((item) => (
                <div key={item.id}>
                  <div className="rounded-xl overflow-hidden bg-gray-50 aspect-[16/10] relative">
                    <Image
                      src={getImageUrl(item.featuredImage).url}
                      alt={getImageUrl(item.featuredImage).alt}
                      fill
                      className="object-cover"
                      sizes="40vw"
                    />
                  </div>
                  <p className="text-[13px] text-gray-400 font-medium mt-3">
                    {item.company} &bull; {item.category}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* About row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 items-center">
            <div className="rounded-xl overflow-hidden bg-gray-50 aspect-[4/3] relative">
              {settings.aboutImage ? (
                <Image
                  src={getImageUrl(settings.aboutImage).url}
                  alt="About"
                  fill
                  className="object-cover"
                  sizes="50vw"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900" />
              )}
            </div>
            <div className="py-8">
              <p className="text-[13px] text-gray-400 font-medium mb-3">{aboutTitle}</p>
              <h3 className="text-2xl md:text-3xl font-display leading-snug whitespace-pre-line">
                {aboutDesc}
              </h3>
            </div>
          </div>

          {/* Full width image */}
          <div className="mt-12 rounded-2xl overflow-hidden bg-gray-900 aspect-[2/1] relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-blue-950" />
          </div>
        </div>
      </section>

      {/* Thoughtcloud / Speaking Section */}
      <section className="py-20 px-6" id="thoughtcloud">
        <div className="max-w-350 mx-auto">
          <h2 className="text-3xl md:text-[2.5rem] leading-[1.15] font-display mb-12">
            {speakingTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(settings.speakingImages && settings.speakingImages.length > 0
              ? settings.speakingImages
              : [
                  { image: null, caption: '80% of what you build will never be used.\nWhy engineers need to understand design.' },
                  { image: null, caption: '' },
                ]
            ).map((item, i) => (
              <div key={i} className="relative rounded-xl overflow-hidden bg-gray-100 aspect-[4/3]">
                {item.image ? (
                  <Image
                    src={getImageUrl(item.image).url}
                    alt={item.caption || 'Speaking event'}
                    fill
                    className="object-cover"
                    sizes="50vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300" />
                )}
                {item.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
                    <p className="text-white text-[15px] font-medium whitespace-pre-line">
                      {item.caption}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Beyond / Footer */}
      <section id="beyond">
        <Footer quote={footerQuote} email={email} />
      </section>
    </HomeClient>
  )
}
