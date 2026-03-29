'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navLinks = [
  { href: '/#work', label: 'Work' },
  { href: '/#studio', label: 'Studio' },
  { href: '/#thoughtcloud', label: 'Thoughtcloud' },
  { href: '/#beyond', label: 'Beyond the work' },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md">
      <nav className="flex items-center justify-between px-6 py-5 lg:pl-[5%] lg:pr-[5%]">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span
            className="w-3 h-3 rounded-full"
            style={{ background: 'var(--color-terracotta)' }}
          />
          <span className="text-[16px] font-medium tracking-[-0.01em]">
            Nanditha C P
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-[16px] font-medium transition-colors hover:text-gray-900 ${
                pathname === link.href ? 'text-gray-900' : 'text-gray-500'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/#beyond"
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:border-gray-400 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M1 7C3.5 3.5 7 1 7 7C7 13 10.5 10.5 13 7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden p-2" aria-label="Menu">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 6H17M3 10H17M3 14H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </nav>
    </header>
  )
}
