'use client'

import { useEffect, useState } from 'react'

interface SectionEntry {
  id: string
  text: string
}

export default function BlogSidebar() {
  const [sections, setSections] = useState<SectionEntry[]>([])
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    // Extract section headers from blog-section blocks
    const contentEl = document.querySelector('.blog-content')
    if (!contentEl) return

    const sectionEls = contentEl.querySelectorAll('.blog-section')
    const extracted: SectionEntry[] = []

    sectionEls.forEach((el) => {
      const tagEl = el.querySelector('.blog-section-tag')
      const text = tagEl?.textContent || ''
      if (!text) return

      const id = el.id || text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      if (!el.id) {
        el.id = id
      }

      extracted.push({ id, text })
    })

    setSections(extracted)

    const visibleIds = new Set(extracted.map((s) => s.id))

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

    sectionEls.forEach((el) => {
      if (visibleIds.has(el.id)) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  if (sections.length === 0) return null

  return (
    <nav className="space-y-1">
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className={`sidebar-link block text-[13px] leading-relaxed py-1 border-l-2 transition-colors pl-4 ${
            activeId === section.id
              ? 'active font-medium'
              : 'border-l-transparent text-gray-500 hover:text-gray-700'
          }`}
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {section.text}
        </a>
      ))}
    </nav>
  )
}
