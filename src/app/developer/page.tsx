// @TASK P3-S6 - Developer Dashboard
// @SPEC specs/screens/developer-dashboard.yaml

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AppTestCard } from '@/components/dashboard/AppTestCard'
import { FeedbackCard } from '@/components/dashboard/FeedbackCard'
import { SubscriptionCard } from '@/components/dashboard/SubscriptionCard'
import { CreditsCard } from '@/components/dashboard/CreditsCard'

interface App {
  id: number
  appName: string
  iconUrl: string
  status: 'RECRUITING' | 'IN_TESTING'
  targetTesters: number
  testStartDate: string
  testEndDate: string
  developerId: string
}

interface Participation {
  appId: number
  status: 'ACTIVE' | 'DROPPED'
}

interface Feedback {
  id: number
  appId: number
  tester: {
    name: string
    avatar: string
  }
  overallRating: number
  comment: string
  createdAt: string
}

interface Subscription {
  userId: string
  planType: string
  remainingApps: number
}

interface DeveloperProfile {
  userId: string
  credits: number
}

interface DashboardData {
  apps: App[]
  participations: Record<number, Participation[]>
  feedbacks: Feedback[]
  subscription: Subscription | null
  profile: DeveloperProfile | null
}

export default function DeveloperDashboard() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch apps
      const appsRes = await fetch('/api/apps', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!appsRes.ok) throw new Error('Failed to fetch apps')
      const { apps } = await appsRes.json()

      // Fetch participations for each app
      const participations: Record<number, Participation[]> = {}
      for (const app of apps) {
        const partRes = await fetch(`/api/participations?appId=${app.id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
        if (partRes.ok) {
          const { participations: parts } = await partRes.json()
          participations[app.id] = parts
        }
      }

      // Fetch feedbacks
      const feedbacksRes = await fetch('/api/feedbacks?limit=5', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
      const { feedbacks } = feedbacksRes.ok
        ? await feedbacksRes.json()
        : { feedbacks: [] }

      // Fetch subscription
      const subRes = await fetch('/api/subscription-plans', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
      const subscription = subRes.ok ? await subRes.json() : null

      // Fetch developer profile
      const profileRes = await fetch('/api/developer-profiles', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
      const profile = profileRes.ok ? await profileRes.json() : null

      setData({
        apps,
        participations,
        feedbacks,
        subscription,
        profile,
      })
    } catch (err) {
      setError('데이터를 불러오는 중 오류가 발생했습니다')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const calculateDDay = (endDate: string): string => {
    const today = new Date('2026-02-28') // Using fixed date for testing
    const end = new Date(endDate)
    const diffTime = end.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return `D-${diffDays}`
  }

  const getActiveParticipants = (appId: number): number => {
    if (!data?.participations[appId]) return 0
    return data.participations[appId].filter((p) => p.status === 'ACTIVE').length
  }

  const getProgressPercentage = (appId: number, targetTesters: number): number => {
    const active = getActiveParticipants(appId)
    return Math.round((active / targetTesters) * 100)
  }

  const formatRelativeTime = (dateStr: string): string => {
    const date = new Date(dateStr)
    const now = new Date('2026-02-28T12:00:00Z')
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return '오늘'
    if (diffDays === 1) return '1일 전'
    return `${diffDays}일 전`
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary p-8">
        <p className="text-white">로딩 중...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-primary p-8">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="bg-accent-neon text-black px-6 py-2 rounded-lg font-semibold"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  const hasActiveTests = data && data.apps.length > 0

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">개발자 대시보드</h1>
          <Link href="/developer/apps/new">
            <button className="bg-accent-neon text-black px-6 py-3 rounded-full font-semibold hover:bg-accent-neon/90 transition-all">
              새 앱 등록
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Active Tests Summary */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">
                진행 중인 테스트 ({data?.apps.length || 0})
              </h2>

              {!hasActiveTests ? (
                <div className="bg-bg-secondary border border-white/10 rounded-2xl p-12 text-center">
                  <p className="text-white/60 mb-2">진행 중인 테스트가 없습니다</p>
                  <p className="text-white/40 text-sm mb-6">새 앱을 등록해보세요</p>
                  <Link href="/developer/apps/new">
                    <button className="bg-accent-neon text-black px-6 py-3 rounded-full font-semibold">
                      새 앱 등록
                    </button>
                  </Link>
                </div>
              ) : (
                <div
                  data-testid="active-tests-grid"
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {data?.apps.map((app) => (
                    <AppTestCard
                      key={app.id}
                      app={app}
                      activeParticipants={getActiveParticipants(app.id)}
                      onCalculateDDay={calculateDDay}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Recent Feedbacks */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">최근 피드백</h2>

              {!data?.feedbacks || data.feedbacks.length === 0 ? (
                <div className="bg-bg-secondary border border-white/10 rounded-2xl p-8 text-center">
                  <p className="text-white/60">아직 피드백이 없습니다</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.feedbacks.slice(0, 5).map((feedback) => (
                    <FeedbackCard
                      key={feedback.id}
                      feedback={feedback}
                      onFormatRelativeTime={formatRelativeTime}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div data-testid="dashboard-sidebar" className="space-y-6">
            {/* Subscription Card */}
            {data?.subscription && (
              <SubscriptionCard subscription={data.subscription} />
            )}

            {/* Credits Card */}
            {data?.profile && (
              <CreditsCard
                credits={data.profile.credits}
                onClick={() => {
                  // Navigate to credit recharge page
                  console.log('Navigate to credit recharge')
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
