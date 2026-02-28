// @TASK P3-S9 - App Detail (앱 상세/테스트 관리)
// @SPEC specs/screens/app-detail.yaml

'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import type {
  AppDetail,
  ApplicationWithTester,
  ParticipationWithTester,
  FeedbackWithTester,
  TabType,
} from '@/types/app-detail'

export default function AppDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const appId = params.id as string

  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [app, setApp] = useState<AppDetail | null>(null)
  const [applications, setApplications] = useState<ApplicationWithTester[]>([])
  const [participations, setParticipations] = useState<ParticipationWithTester[]>([])
  const [feedbacks, setFeedbacks] = useState<FeedbackWithTester[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [productionError, setProductionError] = useState<string | null>(null)

  // Fetch app data
  useEffect(() => {
    async function fetchApp() {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/apps/${appId}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError('앱을 찾을 수 없습니다')
          } else {
            setError('앱 정보를 불러오는데 실패했습니다')
          }
          return
        }
        const data = await response.json()
        setApp(data)
      } catch (err) {
        setError('오류가 발생했습니다')
      } finally {
        setIsLoading(false)
      }
    }

    fetchApp()
  }, [appId])

  // Fetch applications
  useEffect(() => {
    async function fetchApplications() {
      try {
        const response = await fetch(`/api/applications?appId=${appId}`)
        if (response.ok) {
          const data = await response.json()
          setApplications(data)
        }
      } catch (err) {
        console.error('Failed to fetch applications:', err)
      }
    }

    fetchApplications()
  }, [appId])

  // Fetch participations
  useEffect(() => {
    async function fetchParticipations() {
      try {
        const response = await fetch(`/api/participations?appId=${appId}`)
        if (response.ok) {
          const data = await response.json()
          setParticipations(data)
        }
      } catch (err) {
        console.error('Failed to fetch participations:', err)
      }
    }

    fetchParticipations()
  }, [appId])

  // Fetch feedbacks
  useEffect(() => {
    async function fetchFeedbacks() {
      try {
        const response = await fetch(`/api/feedbacks?appId=${appId}`)
        if (response.ok) {
          const data = await response.json()
          setFeedbacks(data)
        }
      } catch (err) {
        console.error('Failed to fetch feedbacks:', err)
      }
    }

    fetchFeedbacks()
  }, [appId])

  // Handle application approval
  const handleApprove = async (applicationId: number) => {
    try {
      setActionLoading(true)
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' }),
      })

      if (!response.ok) {
        throw new Error('Failed to approve application')
      }

      // Refresh applications
      const appsResponse = await fetch(`/api/applications?appId=${appId}`)
      if (appsResponse.ok) {
        const data = await appsResponse.json()
        setApplications(data)
      }
    } catch (err) {
      console.error('Failed to approve application:', err)
    } finally {
      setActionLoading(false)
    }
  }

  // Handle application rejection
  const handleReject = async (applicationId: number) => {
    try {
      setActionLoading(true)
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED' }),
      })

      if (!response.ok) {
        throw new Error('Failed to reject application')
      }

      // Refresh applications
      const appsResponse = await fetch(`/api/applications?appId=${appId}`)
      if (appsResponse.ok) {
        const data = await appsResponse.json()
        setApplications(data)
      }
    } catch (err) {
      console.error('Failed to reject application:', err)
    } finally {
      setActionLoading(false)
    }
  }

  // Handle production confirmation
  const handleProductionConfirm = async () => {
    try {
      setProductionError(null)
      setActionLoading(true)

      // Check active participants
      const activeParticipants = participations.filter((p) => p.status === 'ACTIVE')
      const minRequired = app ? Math.ceil(app.targetTesters * 0.7) : 14

      if (activeParticipants.length < minRequired) {
        setProductionError(`테스트 요건 미충족 (최소 ${minRequired}명 필요)`)
        return
      }

      const response = await fetch(`/api/apps/${appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PRODUCTION' }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setProductionError(errorData.error || 'Failed to confirm production')
        return
      }

      // Redirect to apps list
      router.push('/developer/apps')
    } catch (err) {
      setProductionError('오류가 발생했습니다')
    } finally {
      setActionLoading(false)
    }
  }

  // Calculate D-Day
  const getDDay = () => {
    if (!app?.testEndDate) return null
    const endDate = new Date(app.testEndDate)
    const today = new Date()
    const diff = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">로딩 중...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (!app) {
    return null
  }

  const dDay = getDDay()

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* App Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{app.appName}</h1>
              <p className="text-gray-600 mb-2">{app.description}</p>
              <p className="text-sm text-gray-500">{app.packageName}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {app.status}
              </span>
              {dDay !== null && (
                <span className="text-lg font-semibold text-gray-900">D-{dDay}</span>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { id: 'overview', label: '현황' },
                { id: 'applicants', label: '지원자' },
                { id: 'participants', label: '참여자' },
                { id: 'feedback', label: '피드백' },
                { id: 'guide', label: '프로덕션가이드' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">현황</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">목표 테스터</p>
                    <p className="text-2xl font-semibold">{app.targetTesters}명</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">승인된 지원자</p>
                    <p className="text-2xl font-semibold">
                      {applications.filter((a) => a.status === 'APPROVED').length}명
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">활성 참여자</p>
                    <p className="text-2xl font-semibold">
                      {participations.filter((p) => p.status === 'ACTIVE').length}명
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Applicants Tab */}
            {activeTab === 'applicants' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">지원자 목록</h2>
                {applications.length === 0 ? (
                  <p className="text-gray-600">아직 지원자가 없습니다</p>
                ) : (
                  <div className="space-y-4">
                    {applications.map((application) => (
                      <div
                        key={application.id}
                        className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-semibold">{application.tester.nickname}</p>
                          <p className="text-sm text-gray-600">{application.tester.email}</p>
                          {application.deviceInfo && (
                            <p className="text-sm text-gray-500 mt-1">{application.deviceInfo}</p>
                          )}
                          {application.message && (
                            <p className="text-sm text-gray-700 mt-2">{application.message}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(application.appliedAt).toLocaleDateString('ko-KR')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {application.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleApprove(application.id)}
                                disabled={actionLoading}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
                              >
                                승인
                              </button>
                              <button
                                onClick={() => handleReject(application.id)}
                                disabled={actionLoading}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400"
                              >
                                거절
                              </button>
                            </>
                          )}
                          {application.status === 'APPROVED' && (
                            <span className="px-4 py-2 bg-green-100 text-green-800 rounded-md">
                              승인됨
                            </span>
                          )}
                          {application.status === 'REJECTED' && (
                            <span className="px-4 py-2 bg-red-100 text-red-800 rounded-md">
                              거절됨
                            </span>
                          )}
                          {application.status === 'WAITLISTED' && (
                            <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-md">
                              대기 중
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Participants Tab */}
            {activeTab === 'participants' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">참여자 목록</h2>
                {participations.length === 0 ? (
                  <p className="text-gray-600">아직 참여자가 없습니다</p>
                ) : (
                  <div className="space-y-4">
                    {participations.map((participation) => (
                      <div
                        key={participation.id}
                        className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-semibold">{participation.tester.nickname}</p>
                          <p className="text-sm text-gray-600">
                            가입일: {new Date(participation.joinedAt).toLocaleDateString('ko-KR')}
                          </p>
                          {participation.lastAppRunAt && (
                            <p className="text-sm text-gray-600">
                              최근 실행: {new Date(participation.lastAppRunAt).toLocaleString('ko-KR')}
                            </p>
                          )}
                        </div>
                        <div>
                          <span
                            className={`px-4 py-2 rounded-md ${
                              participation.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {participation.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Feedback Tab */}
            {activeTab === 'feedback' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">피드백 목록</h2>
                {feedbacks.length === 0 ? (
                  <p className="text-gray-600">아직 피드백이 없습니다</p>
                ) : (
                  <div className="space-y-4">
                    {feedbacks.map((feedback) => (
                      <div key={feedback.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold">{feedback.tester.nickname}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-yellow-500">★</span>
                            <span className="font-semibold">{feedback.overallRating.toFixed(1)}</span>
                          </div>
                        </div>
                        {feedback.comment && <p className="text-gray-700 mb-2">{feedback.comment}</p>}
                        <p className="text-xs text-gray-400">
                          {new Date(feedback.createdAt).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Production Guide Tab */}
            {activeTab === 'guide' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">프로덕션 가이드</h2>
                <div className="prose max-w-none">
                  <h3>프로덕션 등록 체크리스트</h3>
                  <ul>
                    <li>모든 피드백을 검토했는지 확인</li>
                    <li>최소 70% 이상의 테스터가 활성 상태인지 확인</li>
                    <li>주요 버그가 모두 수정되었는지 확인</li>
                  </ul>

                  {app.status === 'COMPLETED' && (
                    <div className="mt-6">
                      {productionError && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-red-800">{productionError}</p>
                        </div>
                      )}
                      <button
                        onClick={handleProductionConfirm}
                        disabled={actionLoading}
                        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                      >
                        {actionLoading ? '처리 중...' : '프로덕션 확인'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
