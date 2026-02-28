// @TASK P3-S8 - Developer Apps List
// @SPEC specs/screens/developer-apps.yaml
// @TEST src/app/developer/apps/page.test.tsx

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AppStatus } from '@/types/app'

interface App {
  id: number
  appName: string
  iconUrl: string
  status: AppStatus
  testStartDate: string | null
  testEndDate: string | null
  targetTesters: number
  createdAt: string
  developerId: number
}

interface ProgressData {
  approved: number
  total: number
}

type TabStatus = 'ALL' | AppStatus

const STATUS_TABS: { label: string; value: TabStatus }[] = [
  { label: '전체', value: 'ALL' },
  { label: '모집중', value: 'RECRUITING' },
  { label: '테스트중', value: 'IN_TESTING' },
  { label: '완료', value: 'COMPLETED' },
  { label: '프로덕션', value: 'PRODUCTION' },
]

const STATUS_BADGE_CONFIG: Record<AppStatus, { label: string; bgColor: string; textColor: string }> = {
  PENDING_APPROVAL: { label: '검토 중', bgColor: 'bg-gray-100', textColor: 'text-gray-700' },
  RECRUITING: { label: '모집 중', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
  IN_TESTING: { label: '테스트 중', bgColor: 'bg-orange-100', textColor: 'text-orange-700' },
  COMPLETED: { label: '완료', bgColor: 'bg-green-100', textColor: 'text-green-700' },
  PRODUCTION: { label: '프로덕션', bgColor: 'bg-purple-100', textColor: 'text-purple-700' },
}

export default function DeveloperAppsPage() {
  const router = useRouter()
  const [apps, setApps] = useState<App[]>([])
  const [filteredApps, setFilteredApps] = useState<App[]>([])
  const [activeTab, setActiveTab] = useState<TabStatus>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [progressData, setProgressData] = useState<Record<number, ProgressData>>({})

  // Fetch apps on mount
  useEffect(() => {
    fetchApps()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fetch participations for IN_TESTING apps
  useEffect(() => {
    const inTestingApps = apps.filter(app => app.status === 'IN_TESTING')
    if (inTestingApps.length > 0) {
      inTestingApps.forEach(app => {
        fetchParticipations(app.id)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apps])

  // Filter apps by tab
  useEffect(() => {
    let filtered = apps

    // Filter by status tab
    if (activeTab !== 'ALL') {
      filtered = filtered.filter(app => app.status === activeTab)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(app =>
        app.appName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredApps(filtered)
  }, [apps, activeTab, searchQuery])

  const fetchApps = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/apps', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch apps')
      }

      const data = await response.json()
      setApps(data.apps || [])
    } catch (err) {
      setError('앱 목록을 불러오는데 실패했습니다.')
      console.error('Error fetching apps:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchParticipations = async (appId: number) => {
    try {
      const response = await fetch(`/api/participations?appId=${appId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.ok) {
        const data = await response.json()
        setProgressData(prev => ({
          ...prev,
          [appId]: { approved: data.approved || 0, total: data.total || 0 },
        }))
      }
    } catch (err) {
      console.error(`Error fetching participations for app ${appId}:`, err)
    }
  }

  const handleTabClick = useCallback((tabValue: TabStatus) => {
    setActiveTab(tabValue)
  }, [])

  const handleAppCardClick = useCallback((appId: number) => {
    router.push(`/developer/apps/${appId}`)
  }, [router])

  const handleNewAppClick = useCallback(() => {
    router.push('/developer/apps/new')
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen p-8">
        <div data-testid="loading-skeleton" className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">내 앱 목록</h1>
        <button
          onClick={handleNewAppClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          aria-label="새 앱 등록"
        >
          새 앱 등록
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => handleTabClick(tab.value)}
            data-active={activeTab === tab.value}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === tab.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            aria-label={tab.label}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="앱 이름으로 검색"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Empty State */}
      {filteredApps.length === 0 && apps.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">등록된 앱이 없습니다.</p>
          <p className="text-gray-400 mb-6">첫 번째 앱을 등록해보세요!</p>
          <button
            onClick={handleNewAppClick}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            aria-label="새 앱 등록"
          >
            새 앱 등록
          </button>
        </div>
      )}

      {/* Search No Results */}
      {filteredApps.length === 0 && apps.length > 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">검색 결과가 없습니다.</p>
        </div>
      )}

      {/* App Cards Grid */}
      {filteredApps.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApps.map(app => (
            <div
              key={app.id}
              data-testid={`app-card-${app.id}`}
              onClick={() => handleAppCardClick(app.id)}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              {/* App Icon & Name */}
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={app.iconUrl}
                  alt={`${app.appName} icon`}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{app.appName}</h3>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mb-3">
                <span
                  data-testid={`status-badge-${app.id}`}
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    STATUS_BADGE_CONFIG[app.status].bgColor
                  } ${STATUS_BADGE_CONFIG[app.status].textColor}`}
                >
                  {STATUS_BADGE_CONFIG[app.status].label}
                </span>
              </div>

              {/* Progress (IN_TESTING only) */}
              {app.status === 'IN_TESTING' && progressData[app.id] && (
                <div data-testid={`progress-${app.id}`} className="mt-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>진행률</span>
                    <span>
                      {progressData[app.id].approved}/{progressData[app.id].total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${
                          progressData[app.id].total > 0
                            ? (progressData[app.id].approved / progressData[app.id].total) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Test Dates */}
              {app.testStartDate && (
                <div className="text-sm text-gray-500 mt-3">
                  <span>테스트 시작: {new Date(app.testStartDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
