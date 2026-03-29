'use client'

import { useEffect, useRef, useState } from 'react'

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
  const pendingIdRef = useRef<string>('')
  const pendingTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    // Extract section headers from blog-section blocks
    const contentEl = document.querySelector('.blog-content')
    if (!contentEl) return

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
      const activationOffset = 160
      let currentId = ''

      for (const el of sectionEls) {
        const rect = el.getBoundingClientRect()
        if (rect.top <= activationOffset) {
          currentId = el.id
        } else {
          break
        }
      }

      if (pendingIdRef.current) {
        const pendingTarget = sectionEls.find((el) => el.id === pendingIdRef.current)
        if (!pendingTarget) {
          pendingIdRef.current = ''
        } else {
          const pendingRect = pendingTarget.getBoundingClientRect()
          if (pendingRect.top <= activationOffset + 4) {
            pendingIdRef.current = ''
          } else {
            currentId = pendingIdRef.current
          }
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

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    updateActiveSection()

    return () => {
      window.cancelAnimationFrame(rafId)
      if (pendingTimeoutRef.current !== null) {
        window.clearTimeout(pendingTimeoutRef.current)
      }
      window.removeEventListener('scroll', onScroll)
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
            const target = document.getElementById(section.id)
            if (!target) return

            if (pendingTimeoutRef.current !== null) {
              window.clearTimeout(pendingTimeoutRef.current)
            }

            pendingIdRef.current = section.id
            setActiveId(section.id)

            const nextScrollTop = target.getBoundingClientRect().top + window.scrollY - 160
            window.scrollTo({ top: nextScrollTop, behavior: 'smooth' })

            pendingTimeoutRef.current = window.setTimeout(() => {
              pendingIdRef.current = ''
            }, 1200)
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
              className="absolute left-[2px] top-1/2 -translate-y-1/2 h-4 w-[2px] rounded-full"
              style={{ background: 'var(--color-terracotta)' }}
            />
          )}
          {toSentenceCase(section.text)}
        </a>
      ))}
    </nav>
  )
}
