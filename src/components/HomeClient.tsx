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
  return (
    <>
      <ScrollAnimation glbUrl={glbUrl} />
      
      {/* Main portfolio content flows naturally after the animation runway */}
      <div className="relative bg-white z-10">
        {children}
      </div>
    </>
  )
}
