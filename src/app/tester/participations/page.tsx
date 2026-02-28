'use client'

// @TASK T-03 - 내 테스트 현황
// @SPEC specs/screens/tester-participations.yaml
// @TEST src/app/tester/participations/page.test.tsx

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Participation, Application } from '@/types/participation'

type TabType = 'active' | 'completed' | 'pending'

export default function ParticipationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<TabType>('active')
  const [participations, setParticipations] = useState<Participation[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Authentication handling
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (
      status === 'authenticated' &&
      session?.user?.role !== 'TESTER'
    ) {
      if (session?.user?.role === 'DEVELOPER') {
        router.push('/developer')
      } else {
        router.push('/')
      }
    }
  }, [status, session, router])

  // Fetch data
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'TESTER') {
      fetchData()
    }
  }, [status, session])

  const fetchData = async () => {
    try {
      setIsLoading(true)

      const [participationsRes, applicationsRes] = await Promise.all([
        fetch('/api/participations'),
        fetch('/api/applications'),
      ])

      if (participationsRes.ok) {
        const data = await participationsRes.json()
        setParticipations(data.participations || [])
      }

      if (applicationsRes.ok) {
        const data = await applicationsRes.json()
        setApplications(data.applications || [])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // D-Day 계산
  const calculateDDay = (endDate: string): string => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const end = new Date(endDate)
    end.setHours(0, 0, 0, 0)
    const diffTime = end.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'D-Day'
    if (diffDays > 0) return `D-${diffDays}`
    return `D+${Math.abs(diffDays)}`
  }

  // 프로그레스 계산
  const calculateProgress = (joinedAt: string): { current: number; total: number; percentage: number } => {
    const joined = new Date(joinedAt)
    joined.setHours(0, 0, 0, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const diffTime = today.getTime() - joined.getTime()
    const currentDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const total = 14
    const current = Math.min(currentDays, total)
    const percentage = Math.round((current / total) * 100)

    return { current, total, percentage }
  }

  // 오늘 실행 여부 확인
  const isRunToday = (lastAppRunAt: string | null): boolean => {
    if (!lastAppRunAt) return false

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const lastRun = new Date(lastAppRunAt)
    lastRun.setHours(0, 0, 0, 0)

    return today.getTime() === lastRun.getTime()
  }

  // 필터링된 데이터
  const getFilteredData = () => {
    if (activeTab === 'active') {
      return participations.filter(p => p.status === 'ACTIVE')
    }
    if (activeTab === 'completed') {
      return participations.filter(p => p.status === 'COMPLETED')
    }
    if (activeTab === 'pending') {
      return applications.filter(a => a.status === 'PENDING')
    }
    return []
  }

  const handleCardClick = (id: number) => {
    router.push(`/tester/participations/${id}`)
  }

  const handleOpenPlayStore = (e: React.MouseEvent, testLink: string) => {
    e.stopPropagation()
    window.open(testLink, '_blank')
  }

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>로딩 중...</p>
        </div>
      </div>
    )
  }

  // Render for authenticated TESTER
  if (status === 'authenticated' && session?.user?.role === 'TESTER') {
    const filteredData = getFilteredData()

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-2xl font-bold text-gray-900">내 테스트 현황</h1>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tabs */}
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-6 py-3 rounded-lg font-medium transition ${
                activeTab === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              진행중
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-6 py-3 rounded-lg font-medium transition ${
                activeTab === 'completed'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              완료
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-3 rounded-lg font-medium transition ${
                activeTab === 'pending'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              지원중
            </button>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">데이터를 불러오는 중...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <p className="text-gray-600">
                {activeTab === 'active' && '참여 중인 테스트가 없습니다.'}
                {activeTab === 'completed' && '완료된 테스트가 없습니다.'}
                {activeTab === 'pending' && '지원 중인 앱이 없습니다.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeTab === 'active' &&
                (filteredData as Participation[]).map((participation) => {
                  const dday = calculateDDay(participation.app.testEndDate)
                  const progress = calculateProgress(participation.joinedAt)
                  const runToday = isRunToday(participation.lastAppRunAt)

                  return (
                    <div
                      key={participation.id}
                      className="bg-white rounded-lg shadow-sm hover:shadow-md transition p-6"
                    >
                      <div className="flex items-start gap-4">
                        {/* App Icon */}
                        {participation.app.iconUrl ? (
                          <img
                            src={participation.app.iconUrl}
                            alt={participation.app.appName}
                            className="w-16 h-16 rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400 text-2xl">📱</span>
                          </div>
                        )}

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {participation.app.appName}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                dday.startsWith('D-')
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {dday}
                            </span>
                          </div>

                          {/* Progress */}
                          <div className="mb-3">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-gray-600">
                                {progress.current}/{progress.total}일차
                              </span>
                              <span className="text-sm text-gray-600">{progress.percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full transition-all"
                                style={{ width: `${progress.percentage}%` }}
                              />
                            </div>
                          </div>

                          {/* Run Status */}
                          <div className="flex items-center gap-2 mb-3">
                            {runToday ? (
                              <>
                                <span className="text-green-600">✓</span>
                                <span className="text-sm text-green-600 font-medium">
                                  오늘 실행됨
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="text-orange-600">⚠</span>
                                <span className="text-sm text-orange-600 font-medium">
                                  실행 필요
                                </span>
                              </>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                handleOpenPlayStore(e, participation.app.testLink)
                              }}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
                            >
                              Google Play에서 열기
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                router.push(`/tester/participations/${participation.id}/feedback`)
                              }}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                            >
                              피드백 작성
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}

              {activeTab === 'completed' &&
                (filteredData as Participation[]).map((participation) => (
                  <div
                    key={participation.id}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition p-6"
                  >
                    <div className="flex items-start gap-4">
                      {/* App Icon */}
                      {participation.app.iconUrl ? (
                        <img
                          src={participation.app.iconUrl}
                          alt={participation.app.appName}
                          className="w-16 h-16 rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400 text-2xl">📱</span>
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {participation.app.appName}
                          </h3>
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                            완료
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-3">
                          리워드: {participation.app.rewardAmount?.toLocaleString()}원
                        </p>

                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            // TODO: 피드백 보기 페이지로 이동
                          }}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition"
                        >
                          내가 작성한 피드백 보기
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

              {activeTab === 'pending' &&
                (filteredData as Application[]).map((application) => (
                  <div
                    key={application.id}
                    className="bg-white rounded-lg shadow-sm p-6"
                  >
                    <div className="flex items-start gap-4">
                      {/* App Icon */}
                      {application.app.iconUrl ? (
                        <img
                          src={application.app.iconUrl}
                          alt={application.app.appName}
                          className="w-16 h-16 rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400 text-2xl">📱</span>
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {application.app.appName}
                          </h3>
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700">
                            심사 중
                          </span>
                        </div>

                        <p className="text-sm text-gray-600">
                          리워드: {application.app.rewardAmount?.toLocaleString()}원
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          지원일: {new Date(application.appliedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}
