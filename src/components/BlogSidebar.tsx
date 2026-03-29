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
    const scrollContainer = document.querySelector('.blog-scroll-container') as HTMLElement | null
    if (!contentEl || !scrollContainer) return

    const sectionEls = Array.from(contentEl.querySelectorAll<HTMLElement>('.blog-section'))
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

    const updateActiveSection = () => {
      const activationOffset = 24
      const containerTop = scrollContainer.getBoundingClientRect().top
      let currentId = ''

      for (const el of sectionEls) {
        const rect = el.getBoundingClientRect()
        if (rect.top - containerTop <= activationOffset) {
          currentId = el.id
        } else {
          break
        }
      }

      setActiveId((prev) => (prev === currentId ? prev : currentId))
    }

    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      window.requestAnimationFrame(() => {
        updateActiveSection()
        ticking = false
      })
    }

    scrollContainer.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    updateActiveSection()

    return () => {
      window.cancelAnimationFrame(rafId)
      scrollContainer.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  if (sections.length === 0) return null

  return (
    <nav className="space-y-0.5">
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          onClick={(event) => {
            event.preventDefault()
            const scrollContainer = document.querySelector('.blog-scroll-container') as HTMLElement | null
            const target = document.getElementById(section.id)
            if (!target || !scrollContainer) return

            const containerRect = scrollContainer.getBoundingClientRect()
            const targetRect = target.getBoundingClientRect()
            const nextScrollTop = scrollContainer.scrollTop + (targetRect.top - containerRect.top) - 24

            scrollContainer.scrollTo({ top: nextScrollTop, behavior: 'smooth' })
            setActiveId(section.id)
          }}
          className={`sidebar-link relative block text-[16px] leading-[1.35] py-0.5 transition-colors pl-2.5 ${
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
