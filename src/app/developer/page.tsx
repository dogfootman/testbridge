// @TASK P3-S6 - Developer Dashboard
// @SPEC specs/screens/developer-dashboard.yaml
// @TEST src/app/developer/page.test.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AppCard } from '@/components/developer/AppCard'
import { FeedbackList } from '@/components/developer/FeedbackList'
import { SubscriptionCard, CreditsCard } from '@/components/developer/StatCard'
import { EmptyState } from '@/components/developer/EmptyState'

// Types
interface App {
  id: number
  appName: string
  iconUrl?: string | null
  status: string
  targetTesters: number
  testStartDate: string
  testEndDate: string
}

interface Participation {
  id: number
  appId: number
  status: string
}

interface Feedback {
  id: number
  appId: number
  tester: {
    nickname: string
  }
  overallRating: number
  comment: string
  createdAt: string
}

interface UserData {
  currentPlan: string
  remainingApps: number
  creditBalance: number
}

interface AppWithParticipations extends App {
  participations: Participation[]
}

export default function DeveloperDashboard() {
  const router = useRouter()
  const [apps, setApps] = useState<AppWithParticipations[]>([])
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [userData, setUserData] = useState<UserData>({
    currentPlan: 'FREE',
    remainingApps: 1,
    creditBalance: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch apps
        const appsRes = await fetch('/api/apps?status=RECRUITING,IN_TESTING')
        if (!appsRes.ok) throw new Error('Failed to fetch apps')
        const appsData = await appsRes.json()
        const fetchedApps: App[] = appsData.apps || []

        // Fetch participations for each app
        const appsWithParticipations: AppWithParticipations[] = await Promise.all(
          fetchedApps.map(async (app) => {
            try {
              const partRes = await fetch(`/api/participations?appId=${app.id}`)
              const partData = await partRes.json()
              return {
                ...app,
                participations: partData.participations || [],
              }
            } catch {
              return { ...app, participations: [] }
            }
          })
        )

        setApps(appsWithParticipations)

        // Fetch recent feedbacks
        try {
          const feedbacksRes = await fetch('/api/feedbacks?limit=5')
          const feedbacksData = await feedbacksRes.json()
          setFeedbacks(feedbacksData.feedbacks || [])
        } catch {
          setFeedbacks([])
        }

        // Fetch user data
        try {
          const userRes = await fetch('/api/users/1')
          if (userRes.ok) {
            const user = await userRes.json()
            setUserData({
              currentPlan: user.currentPlan || 'FREE',
              remainingApps: user.remainingApps || 1,
              creditBalance: user.creditBalance || 0,
            })
          }
        } catch {
          // Use default values
        }
      } catch (err) {
        console.error('Dashboard error:', err)
        setError('데이터를 불러오는 중 오류가 발생했습니다')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (error) {
    return (
      <div className="min-h-screen bg-bg-primary text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">{error}</p>
          <Link href="/" className="text-accent-neon hover:underline">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">개발자 대시보드</h1>
          <Link
            href="/developer/apps/new"
            className="bg-accent-neon text-black px-6 py-3 rounded-full font-semibold hover:bg-accent-neon/90 transition-colors"
          >
            새 앱 등록
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Active Tests */}
            <section>
              <h2 className="text-xl font-semibold mb-4">진행 중인 테스트</h2>
              {apps.length === 0 ? (
                <EmptyState
                  title="진행 중인 테스트가 없습니다"
                  message="새 앱을 등록해보세요"
                  ctaText="새 앱 등록"
                  ctaHref="/developer/apps/new"
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {apps.map((app) => (
                    <AppCard key={app.id} {...app} />
                  ))}
                </div>
              )}
            </section>

            {/* Recent Feedbacks */}
            <section>
              <h2 className="text-xl font-semibold mb-4">최근 피드백</h2>
              <FeedbackList feedbacks={feedbacks} />
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <SubscriptionCard
              currentPlan={userData.currentPlan}
              remainingApps={userData.remainingApps}
            />
            <CreditsCard creditBalance={userData.creditBalance} />
          </div>
        </div>
      </div>
    </div>
  )
}
