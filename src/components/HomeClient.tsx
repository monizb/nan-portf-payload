'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { ComponentType } from 'react'

interface ScrollAnimationProps {
  glbUrl: string
  active: boolean
  onAnimationComplete?: () => void
}

interface HomeClientProps {
  children: React.ReactNode
  glbUrl: string
}

export default function HomeClient({ children, glbUrl }: HomeClientProps) {
  const [animationActive, setAnimationActive] = useState(true)
  const [AnimComponent, setAnimComponent] = useState<ComponentType<ScrollAnimationProps> | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Load ScrollAnimation on client only — avoids next/dynamic Suspense hydration mismatch
  useEffect(() => {
    import('@/components/ScrollAnimation').then((mod) => {
      setAnimComponent(() => mod.default)
    })
  }, [])

  const handleAnimationComplete = useCallback(() => {
    setAnimationActive(false)
  }, [])

  // When user scrolls up at the very top of content → return to animation
  useEffect(() => {
    if (animationActive) return

    const onWheel = (e: WheelEvent) => {
      if (window.scrollY === 0 && e.deltaY < 0) {
        e.preventDefault()
        setAnimationActive(true)
      }
    }

    let touchY = 0
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0].clientY
    }
    const onTouchMove = (e: TouchEvent) => {
      if (window.scrollY === 0 && e.touches[0].clientY > touchY) {
        e.preventDefault()
        setAnimationActive(true)
      }
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
    }
  }, [animationActive])

  return (
    <>
      {/* Animation — loaded client-side only, no Suspense boundary */}
      {AnimComponent ? (
        <AnimComponent
          glbUrl={glbUrl}
          active={animationActive}
          onAnimationComplete={handleAnimationComplete}
        />
      ) : (
        /* Static placeholder — identical on server & client, no hydration mismatch */
        <div className="fixed inset-0" style={{ background: '#D97757', zIndex: 100 }}>
          <div className="flex items-center justify-center h-screen">
            <div className="text-white text-sm tracking-widest animate-pulse">LOADING...</div>
          </div>
        </div>
      )}

      {/* Main portfolio content — always in DOM, hidden during animation */}
      <div
        ref={contentRef}
        className="relative bg-white"
        style={{ display: animationActive ? 'none' : 'block' }}
      >
        {children}
      </div>
    </>
  )
}
