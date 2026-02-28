'use client'

// @TASK T-04 - 피드백 작성
// @SPEC specs/screens/feedback-form.yaml
// @TEST src/app/tester/participations/[id]/feedback/page.test.tsx

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { RatingItemType, FeedbackRating } from '@/types/participation'

interface Participation {
  id: number
  app: {
    id: number
    appName: string
    iconUrl: string | null
  }
}

export default function FeedbackPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const participationId = params?.id as string

  const [participation, setParticipation] = useState<Participation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [overallRating, setOverallRating] = useState<number>(0)
  const [itemRatings, setItemRatings] = useState<FeedbackRating[]>([
    { itemType: 'UI_UX', score: 0 },
    { itemType: 'PERFORMANCE', score: 0 },
    { itemType: 'FUNCTIONALITY', score: 0 },
    { itemType: 'STABILITY', score: 0 },
  ])
  const [comment, setComment] = useState('')
  const [bugTitle, setBugTitle] = useState('')
  const [bugDescription, setBugDescription] = useState('')
  const [submitError, setSubmitError] = useState<string | null>(null)

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

  // Fetch participation data
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'TESTER' && participationId) {
      fetchParticipation()
    }
  }, [status, session, participationId])

  const fetchParticipation = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/participations/${participationId}`)

      if (!response.ok) {
        if (response.status === 404) {
          setError('참여 정보를 찾을 수 없습니다.')
        } else {
          setError('참여 정보를 불러오는 데 실패했습니다.')
        }
        return
      }

      const data = await response.json()
      setParticipation(data)
    } catch (err) {
      setError('참여 정보를 불러오는 데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleItemRatingChange = (itemType: RatingItemType, score: number) => {
    setItemRatings((prev) =>
      prev.map((item) =>
        item.itemType === itemType ? { ...item, score } : item
      )
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    // Validation
    if (overallRating === 0) {
      setSubmitError('전체 만족도를 선택해주세요.')
      return
    }

    if (!comment.trim()) {
      setSubmitError('피드백 내용을 입력해주세요.')
      return
    }

    if (comment.trim().length < 10) {
      setSubmitError('피드백 내용을 최소 10자 이상 입력해주세요.')
      return
    }

    // 버그 리포트 유효성 검증 (제목만 입력하고 설명 누락 or 반대)
    const hasBugTitle = bugTitle.trim().length > 0
    const hasBugDescription = bugDescription.trim().length > 0
    if (hasBugTitle && !hasBugDescription) {
      setSubmitError('버그 설명을 입력해주세요.')
      return
    }
    if (!hasBugTitle && hasBugDescription) {
      setSubmitError('버그 제목을 입력해주세요.')
      return
    }

    try {
      setIsSubmitting(true)

      // 1. Create feedback
      const feedbackResponse = await fetch('/api/feedbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participationId: Number(participationId),
          overallRating,
          comment,
        }),
      })

      if (!feedbackResponse.ok) {
        throw new Error('피드백 제출에 실패했습니다.')
      }

      const feedbackData = await feedbackResponse.json()

      // 2. Create feedback ratings
      const ratingsResponse = await fetch('/api/feedback-ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedbackId: feedbackData.id,
          ratings: itemRatings,
        }),
      })

      if (!ratingsResponse.ok) {
        throw new Error('항목별 별점 제출에 실패했습니다.')
      }

      // 3. Create bug report if provided
      if (bugTitle.trim() && bugDescription.trim()) {
        const bugReportResponse = await fetch('/api/bug-reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            participationId: Number(participationId),
            title: bugTitle,
            description: bugDescription,
          }),
        })

        if (!bugReportResponse.ok) {
          console.warn('버그 리포트 제출에 실패했습니다.')
        }
      }

      // Success - redirect to participations page
      router.push('/tester/participations')
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : '제출에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading state
  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>로딩 중...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/tester/participations')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            참여 현황으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  // Render for authenticated TESTER
  if (status === 'authenticated' && session?.user?.role === 'TESTER' && participation) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-2xl font-bold text-gray-900">피드백 작성</h1>
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* App Info */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center gap-4">
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
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {participation.app.appName}
                </h2>
                <p className="text-sm text-gray-600">테스트 피드백을 작성해주세요</p>
              </div>
            </div>
          </div>

          {/* Feedback Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Overall Rating */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                전체 만족도 <span className="text-red-500">*</span>
              </h3>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setOverallRating(star)}
                    data-testid={`overall-star-${star}`}
                    aria-pressed={overallRating >= star}
                    className={`w-12 h-12 text-2xl transition ${
                      overallRating >= star
                        ? 'text-yellow-400'
                        : 'text-gray-300 hover:text-yellow-200'
                    }`}
                  >
                    {overallRating >= star ? '★' : '☆'}
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {overallRating > 0 && `${overallRating}점 선택됨`}
              </p>
            </div>

            {/* Item Ratings */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                항목별 평가
              </h3>
              <div className="space-y-6">
                {itemRatings.map((item) => {
                  const labels: Record<RatingItemType, string> = {
                    UI_UX: 'UI/UX',
                    PERFORMANCE: '성능',
                    FUNCTIONALITY: '기능',
                    STABILITY: '안정성',
                  }

                  const testIdMap: Record<RatingItemType, string> = {
                    UI_UX: 'ui-ux',
                    PERFORMANCE: 'performance',
                    FUNCTIONALITY: 'functionality',
                    STABILITY: 'stability',
                  }

                  return (
                    <div key={item.itemType}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {labels[item.itemType]}
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleItemRatingChange(item.itemType, star)}
                            data-testid={`${testIdMap[item.itemType]}-star-${star}`}
                            aria-pressed={item.score >= star}
                            className={`w-10 h-10 text-xl transition ${
                              item.score >= star
                                ? 'text-yellow-400'
                                : 'text-gray-300 hover:text-yellow-200'
                            }`}
                          >
                            {item.score >= star ? '★' : '☆'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Comment */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                상세 의견 <span className="text-red-500">*</span>
              </h3>
              <p className="text-sm text-gray-600 mb-2">최소 10자 이상 작성해주세요</p>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="앱 사용 소감을 자유롭게 작성해주세요..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                rows={6}
              />
            </div>

            {/* Bug Report (Optional) */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                버그 리포트 (선택)
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                발견한 버그가 있다면 자세히 알려주세요
              </p>
              <div className="space-y-4">
                <input
                  type="text"
                  value={bugTitle}
                  onChange={(e) => setBugTitle(e.target.value)}
                  placeholder="버그 제목 (예: 로그인 버튼이 작동하지 않음)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <textarea
                  value={bugDescription}
                  onChange={(e) => setBugDescription(e.target.value)}
                  placeholder="버그 설명 및 재현 방법을 자세히 작성해주세요..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  rows={4}
                />
              </div>
            </div>

            {/* Submit Error */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{submitError}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => router.push('/tester/participations')}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '제출 중...' : '제출'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return null
}
