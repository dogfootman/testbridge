// @TASK P3-S8 - D-03 Developer Apps 페이지
// @SPEC specs/screens/developer-apps.yaml
// @TEST TDD GREEN Phase - 앱 목록, 상태 필터, 진행률 구현

'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

// Types
type AppStatus = 'PENDING_APPROVAL' | 'RECRUITING' | 'IN_TESTING' | 'COMPLETED' | 'PRODUCTION' | 'REJECTED' | 'CANCELLED' | 'BLOCKED'

type StatusFilter = 'ALL' | AppStatus

interface App {
  id: number
  appName: string
  packageName: string
  status: AppStatus
  targetTesters: number
  testStartDate?: string
  testEndDate?: string
  createdAt: string
  category: {
    id: number
    name: string
    icon?: string
  }
  developer: {
    id: number
    nickname?: string
    profileImageUrl?: string
  }
  images?: Array<{
    type: string
    url: string
    sortOrder: number
  }>
}

interface Participation {
  appId: number
  status: string
}

interface AppsResponse {
  apps: App[]
  total: number
  page: number
  limit: number
}

interface ParticipationsResponse {
  participations: Participation[]
  total: number
}

// Status configurations
const STATUS_CONFIG = {
  RECRUITING: { label: '모집 중', color: 'bg-blue-100 text-blue-800' },
  IN_TESTING: { label: '테스트 중', color: 'bg-orange-100 text-orange-800' },
  COMPLETED: { label: '완료', color: 'bg-green-100 text-green-800' },
  PRODUCTION: { label: '프로덕션', color: 'bg-purple-100 text-purple-800' },
  PENDING_APPROVAL: { label: '승인 대기', color: 'bg-gray-100 text-gray-800' },
  REJECTED: { label: '거부됨', color: 'bg-red-100 text-red-800' },
  CANCELLED: { label: '취소됨', color: 'bg-gray-100 text-gray-600' },
  BLOCKED: { label: '차단됨', color: 'bg-red-100 text-red-900' },
}

const FILTER_TABS = [
  { key: 'ALL', label: '전체' },
  { key: 'RECRUITING', label: '모집중' },
  { key: 'IN_TESTING', label: '테스트중' },
  { key: 'COMPLETED', label: '완료' },
  { key: 'PRODUCTION', label: '프로덕션' },
] as const

export default function DeveloperAppsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [apps, setApps] = useState<App[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [participationCounts, setParticipationCounts] = useState<Record<number, number>>({})

  // Auth check
  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/developer/apps')
      return
    }

    if (session?.user?.role !== 'DEVELOPER' && session?.user?.role !== 'BOTH') {
      setError('개발자만 접근할 수 있습니다.')
      setLoading(false)
      return
    }
  }, [session, status, router])

  // Fetch apps
  useEffect(() => {
    if (status !== 'authenticated') return
    if (session?.user?.role !== 'DEVELOPER' && session?.user?.role !== 'BOTH') return

    const fetchApps = async () => {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams({
          page: '1',
          limit: '100',
        })

        if (statusFilter !== 'ALL') {
          params.append('status', statusFilter)
        }

        const response = await fetch(`/api/apps?${params.toString()}`)

        if (!response.ok) {
          throw new Error('Failed to fetch apps')
        }

        const data: AppsResponse = await response.json()

        // Filter by developerId (since API doesn't have this filter yet)
        const myApps = data.apps.filter(
          (app) => app.developer.id.toString() === session.user.id
        )

        setApps(myApps)

        // Fetch participation counts for IN_TESTING and COMPLETED apps
        const appsNeedingCounts = myApps.filter(
          (app) => app.status === 'IN_TESTING' || app.status === 'COMPLETED'
        )

        const counts: Record<number, number> = {}
        await Promise.all(
          appsNeedingCounts.map(async (app) => {
            try {
              const participationsResponse = await fetch(
                `/api/participations?appId=${app.id}&limit=1000`
              )
              if (participationsResponse.ok) {
                const participationsData: ParticipationsResponse =
                  await participationsResponse.json()
                counts[app.id] = participationsData.total
              }
            } catch (err) {
              console.error(`Failed to fetch participations for app ${app.id}:`, err)
            }
          })
        )

        setParticipationCounts(counts)
      } catch (err) {
        console.error('Error fetching apps:', err)
        setError('앱 목록을 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchApps()
  }, [session, status, statusFilter])

  // Calculate progress percentage
  const calculateProgress = (app: App): { current: number; total: number; percentage: number } => {
    const current = participationCounts[app.id] || 0
    const total = app.targetTesters
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0

    return { current, total, percentage }
  }

  // Handle new app navigation
  const handleNewApp = () => {
    router.push('/developer/apps/new')
  }

  // Handle app card click
  const handleAppClick = (appId: number) => {
    router.push(`/developer/apps/${appId}`)
  }

  // Render loading state
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </main>
    )
  }

  // Render error state
  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-red-600">{error}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">내 앱 목록</h1>
          <button
            onClick={handleNewApp}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            aria-label="새 앱 등록하기"
          >
            새 앱 등록
          </button>
        </div>

        {/* Status Filter Tabs */}
        <div
          role="tablist"
          aria-label="앱 상태 필터"
          className="flex gap-2 mb-6 border-b border-gray-200"
        >
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={statusFilter === tab.key}
              onClick={() => setStatusFilter(tab.key as StatusFilter)}
              className={`
                px-4 py-2 font-medium transition-colors
                ${
                  statusFilter === tab.key
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Apps Grid */}
        {apps.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600 mb-4">
              등록된 앱이 없습니다. 첫 번째 앱을 등록해보세요!
            </p>
            <button
              onClick={handleNewApp}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              새 앱 등록
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apps.map((app) => {
              const iconImage = app.images?.find((img) => img.type === 'ICON')
              const progress = calculateProgress(app)

              return (
                <article
                  key={app.id}
                  onClick={() => handleAppClick(app.id)}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                >
                  {/* App Icon and Info */}
                  <div className="flex items-start gap-4 mb-4">
                    {iconImage ? (
                      <img
                        src={iconImage.url}
                        alt="앱 아이콘"
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-2xl">
                          {app.category.icon || '📱'}
                        </span>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                        {app.appName}
                      </h2>
                      <p className="text-sm text-gray-500 truncate">{app.packageName}</p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mb-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        STATUS_CONFIG[app.status].color
                      }`}
                    >
                      {STATUS_CONFIG[app.status].label}
                    </span>
                  </div>

                  {/* Progress Bar (for IN_TESTING and COMPLETED) */}
                  {(app.status === 'IN_TESTING' || app.status === 'COMPLETED') && (
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">진행률</span>
                        <span className="text-sm font-medium text-gray-900">
                          {progress.current}/{progress.total} ({progress.percentage}%)
                        </span>
                      </div>
                      <div
                        role="progressbar"
                        aria-valuenow={progress.percentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`진행률 ${progress.percentage}%`}
                        className="w-full bg-gray-200 rounded-full h-2 overflow-hidden"
                      >
                        <div
                          className="bg-blue-600 h-full transition-all duration-300"
                          style={{ width: `${progress.percentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Category and Date */}
                  <div className="text-sm text-gray-500">
                    <p className="mb-1">
                      {app.category.icon} {app.category.name}
                    </p>
                    <p>등록일: {new Date(app.createdAt).toLocaleDateString('ko-KR')}</p>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
