'use client'

import { useEffect, useState } from 'react'

interface SectionEntry {
  id: string
  text: string
}

function toSentenceCase(text: string): string {
  const normalized = text.trim().toLowerCase()
  if (!normalized) return normalized
  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
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

    const rafId = window.requestAnimationFrame(() => {
      setSections(extracted)
    })

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
    return () => {
      window.cancelAnimationFrame(rafId)
      observer.disconnect()
    }
  }, [])

  if (sections.length === 0) return null

  return (
    <nav className="space-y-0.5">
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className={`sidebar-link relative block text-[13px] leading-[1.35] py-0.5 transition-colors pl-3.5 ${
            activeId === section.id
              ? 'active font-medium'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {activeId === section.id && (
            <span
              aria-hidden="true"
              className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[2px] rounded-full"
              style={{ background: 'var(--color-terracotta)' }}
            />
          )}
          {toSentenceCase(section.text)}
        </a>
      ))}
    </nav>
  )
}
