'use client'

import dynamic from 'next/dynamic'

const CrossBalloons = dynamic(() => import('@/components/CrossBalloons'), {
  ssr: false,
  loading: () => (
    <div className="w-full rounded-2xl overflow-hidden bg-gray-900 aspect-[16/9] animate-pulse" />
  ),
})

export default function HeroCrossBalloons() {
  return <CrossBalloons />
}
