'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'

const ScrollAnimation = dynamic(() => import('@/components/ScrollAnimation'), {
  ssr: false,
  loading: () => (
    <div
      className="w-full"
      style={{ height: '500vh', background: '#D97757' }}
    >
      <div className="sticky top-0 h-screen flex items-center justify-center">
        <div className="text-white text-sm tracking-widest animate-pulse">LOADING...</div>
      </div>
    </div>
  ),
})

interface HomeClientProps {
  children: React.ReactNode
  glbUrl: string
}

export default function HomeClient({ children, glbUrl }: HomeClientProps) {
  const [isAnimationComplete, setIsAnimationComplete] = useState(false)

  const handleAnimationComplete = useCallback(() => {
    setIsAnimationComplete(true)
  }, [])

  return (
    <>
      <ScrollAnimation glbUrl={glbUrl} onAnimationComplete={handleAnimationComplete} />
      
      {/* Main portfolio content flows naturally after the animation runway */}
      <div
        className={`relative bg-white z-10 transition-opacity duration-700 ${
          isAnimationComplete ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!isAnimationComplete}
      >
        {children}
      </div>
    </>
  )
}
