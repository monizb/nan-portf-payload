import Link from 'next/link'

interface SectionButtonProps {
  href: string
  label: string
}

export default function SectionButton({ href, label }: SectionButtonProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-[13px] font-medium text-white rounded-full px-5 py-2.5 transition-opacity hover:opacity-90"
      style={{ background: 'var(--color-terracotta)' }}
    >
      {label}
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path
          d="M1 7h12M8 2l5 5-5 5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  )
}
