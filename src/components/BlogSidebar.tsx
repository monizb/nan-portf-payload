'use client'

import { useEffect, useState } from 'react'

interface Heading {
  id: string
  text: string
  level: number
}

interface BlogSidebarProps {
  hiddenHeadings?: string[]
}

export default function BlogSidebar({ hiddenHeadings = [] }: BlogSidebarProps) {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    // Extract headings from the blog content
    const contentEl = document.querySelector('.blog-content')
    if (!contentEl) return

    const headingEls = contentEl.querySelectorAll('h2, h3')
    const extracted: Heading[] = []

    headingEls.forEach((el) => {
      const text = el.textContent || ''
      // Skip if heading is in hidden list
      if (hiddenHeadings.some((h) => text.includes(h))) return

      // Generate or use existing id
      if (!el.id) {
        el.id = text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      }

      extracted.push({
        id: el.id,
        text,
        level: el.tagName === 'H2' ? 2 : 3,
      })
    })

    setHeadings(extracted)

    // Only observe headings that are visible in the sidebar
    const visibleIds = new Set(extracted.map((h) => h.id))

    // Intersection observer for active heading
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && visibleIds.has(entry.target.id)) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-100px 0px -60% 0px', threshold: 0 }
    )

    headingEls.forEach((el) => {
      if (visibleIds.has(el.id)) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [hiddenHeadings])

  if (headings.length === 0) return null

  return (
    <nav className="space-y-1">
      {headings.map((heading) => (
        <a
          key={heading.id}
          href={`#${heading.id}`}
          className={`sidebar-link block text-[13px] leading-relaxed py-1 border-l-2 transition-colors ${
            heading.level === 3 ? 'pl-6' : 'pl-4'
          } ${
            activeId === heading.id
              ? 'active font-medium'
              : 'border-l-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          {heading.text}
        </a>
      ))}
    </nav>
  )
}
