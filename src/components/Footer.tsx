import Link from 'next/link'

interface FooterProps {
  quote?: string
  email?: string
}

export default function Footer({ 
  quote = 'The best work happens when two people in the room refuse to settle.',
  email = 'contact@nandithacp.com'
}: FooterProps) {
  return (
    <footer className="relative overflow-hidden">
      {/* Quote section */}
      <div className="max-w-[1200px] mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl md:text-[2.75rem] leading-[1.2] font-display max-w-2xl mx-auto">
          {quote}
        </h2>
        <Link
          href={`mailto:${email}`}
          className="inline-block mt-6 text-[15px] hover:underline"
          style={{ color: 'var(--color-terracotta)' }}
        >
          {email}
        </Link>
      </div>

      {/* Confetti footer decoration */}
      <div className="relative h-48 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, #fff 0%, #f5f5f5 30%, #e8e8e8 100%)',
          }}
        />
        {/* Wavy separator */}
        <svg
          className="absolute top-0 left-0 w-full"
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
          style={{ height: '60px' }}
        >
          <path
            d="M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,0 L0,0 Z"
            fill="white"
          />
        </svg>
        {/* Scattered shapes decoration */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-3 text-gray-300">
            <svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 0v12M0 6h12" stroke="currentColor" strokeWidth="1.5"/></svg>
            <span className="text-sm tracking-[0.2em] font-medium text-gray-400">CONTINUE TO SCROLL</span>
            <svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 0v12M0 6h12" stroke="currentColor" strokeWidth="1.5"/></svg>
          </div>
        </div>
        {/* Colorful shapes */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-8 left-[5%] w-3 h-3 bg-blue-500 rounded-full" />
          <div className="absolute top-16 left-[15%] w-4 h-2 bg-red-400 rounded-sm rotate-45" />
          <div className="absolute top-12 left-[25%] w-2 h-2 bg-green-400 rounded-full" />
          <div className="absolute top-20 left-[35%] w-3 h-3 bg-yellow-400 rotate-12" />
          <div className="absolute top-10 left-[55%] w-2 h-4 bg-purple-400 rounded-sm" />
          <div className="absolute top-24 left-[65%] w-3 h-3 bg-pink-400 rounded-full" />
          <div className="absolute top-14 left-[75%] w-4 h-2 bg-blue-300 rotate-[-20deg]" />
          <div className="absolute top-18 left-[85%] w-2 h-2 bg-orange-400 rounded-full" />
          <div className="absolute top-28 left-[45%] w-3 h-1 bg-gray-500 rotate-90" />
          <div className="absolute top-22 left-[92%] w-2 h-3 bg-teal-400 rounded-sm rotate-12" />
        </div>
      </div>
    </footer>
  )
}
