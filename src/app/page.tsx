'use client'

import { useEffect, useState } from 'react'
import { HeroSection } from '@/components/landing/HeroSection'
import { FlowVisualization } from '@/components/landing/FlowVisualization'
import { FeaturedApps } from '@/components/landing/FeaturedApps'
import { Testimonials } from '@/components/landing/Testimonials'
import { FAQSection } from '@/components/landing/FAQSection'
import { CTAFooter } from '@/components/landing/CTAFooter'

interface App {
  id: number
  appName: string
  categoryId: number
  iconUrl: string
  rewardAmount: number
}

export default function Home() {
  const [apps, setApps] = useState<App[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchApps() {
      try {
        const response = await fetch('/api/apps?status=RECRUITING&limit=6')
        if (response.ok) {
          const data = await response.json()
          setApps(data.apps || [])
        }
      } catch (error) {
        console.error('Failed to fetch apps:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchApps()
  }, [])

  return (
    <main className="min-h-screen">
      <HeroSection />
      <FlowVisualization />
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <FeaturedApps apps={apps} />
      )}
      <Testimonials />
      <FAQSection />
      <CTAFooter />
    </main>
  )
}
