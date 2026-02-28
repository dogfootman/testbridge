// @TASK T-02 - App Detail Tester (앱 상세 테스터뷰)
// @SPEC specs/screens/app-detail-tester.yaml
// @TEST src/app/tester/apps/[id]/page.test.tsx

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import type {
  TesterAppDetail,
  AppImage,
  Participation,
  TesterApplication,
  ApplicationFormData,
  ApplicationFormErrors,
} from '@/types/tester-app-detail'

export default function AppDetailTesterPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const appId = params.id as string

  // State
  const [app, setApp] = useState<TesterAppDetail | null>(null)
  const [appImages, setAppImages] = useState<AppImage[]>([])
  const [participations, setParticipations] = useState<Participation[]>([])
  const [existingApplication, setExistingApplication] = useState<TesterApplication | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState<ApplicationFormData>({
    deviceInfo: '',
    message: '',
  })
  const [formErrors, setFormErrors] = useState<ApplicationFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Screenshot gallery state
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Authentication check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'TESTER') {
      router.push('/')
    }
  }, [status, session, router])

  // ESC key handler for modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        handleCloseModal()
      }
    }

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isModalOpen])

  // Fetch app data
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'TESTER') {
      fetchAppData()
    }
  }, [status, session, appId])

  const fetchAppData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch app details
      const appResponse = await fetch(`/api/apps/${appId}`)
      if (!appResponse.ok) {
        if (appResponse.status === 404) {
          setError('앱을 찾을 수 없습니다')
        } else {
          setError('앱 정보를 불러오는데 실패했습니다')
        }
        return
      }
      const appData = await appResponse.json()
      setApp(appData)

      // Fetch app images (mocked for now, can be extended)
      try {
        const imagesResponse = await fetch(`/api/app-images?appId=${appId}`)
        if (imagesResponse.ok) {
          const imagesData = await imagesResponse.json()
          setAppImages(imagesData)
        }
      } catch (err) {
        console.error('Failed to fetch app images:', err)
      }

      // Fetch participations
      try {
        const participationsResponse = await fetch(`/api/participations?appId=${appId}`)
        if (participationsResponse.ok) {
          const participationsData = await participationsResponse.json()
          setParticipations(participationsData)
        }
      } catch (err) {
        console.error('Failed to fetch participations:', err)
      }

      // Check if user already applied
      try {
        const applicationsResponse = await fetch(`/api/applications?appId=${appId}`)
        if (applicationsResponse.ok) {
          const applicationsData = await applicationsResponse.json()
          if (applicationsData.length > 0) {
            setExistingApplication(applicationsData[0])
          }
        }
      } catch (err) {
        console.error('Failed to fetch applications:', err)
      }
    } catch (err) {
      console.error('Error fetching app data:', err)
      setError('오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplyClick = () => {
    setIsModalOpen(true)
    setFormData({ deviceInfo: '', message: '' })
    setFormErrors({})
    setSubmitError(null)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setFormData({ deviceInfo: '', message: '' })
    setFormErrors({})
    setSubmitError(null)
  }

  const handleInputChange = (field: keyof ApplicationFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const errors: ApplicationFormErrors = {}

    if (!formData.deviceInfo.trim()) {
      errors.deviceInfo = '기기 정보를 입력해주세요.'
    } else if (formData.deviceInfo.length > 100) {
      errors.deviceInfo = '기기 정보는 100자 이내로 입력해주세요.'
    }

    if (formData.message && formData.message.length > 200) {
      errors.message = '자기소개는 200자 이내로 입력해주세요.'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setIsSubmitting(true)
      setSubmitError(null)

      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appId: parseInt(appId),
          deviceInfo: formData.deviceInfo,
          message: formData.message || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setSubmitError(errorData.error || '지원에 실패했습니다')
        return
      }

      const newApplication = await response.json()
      setExistingApplication(newApplication)
      setSubmitSuccess(true)

      // Close modal after success
      setTimeout(() => {
        handleCloseModal()
        setSubmitSuccess(false)
        // Optionally redirect to my applications page
        // router.push('/tester/applications')
      }, 2000)
    } catch (err) {
      console.error('Failed to submit application:', err)
      setSubmitError('오류가 발생했습니다')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRemainingSlots = () => {
    if (!app) return 0
    const activeParticipations = participations.filter((p) => p.status === 'ACTIVE').length
    return app.targetTesters - activeParticipations
  }

  // Loading state
  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error}</p>
        </div>
      </div>
    )
  }

  // Not found
  if (!app) {
    return null
  }

  const remainingSlots = getRemainingSlots()
  const isAlreadyApplied = !!existingApplication

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => router.push('/tester')}
              className="text-gray-600 hover:text-gray-900 mr-4 transition-colors"
              aria-label="테스터 홈으로 돌아가기"
            >
              ← 뒤로가기
            </button>
            <h1 className="text-xl font-semibold text-gray-900">앱 상세</h1>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* App Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{app.appName}</h1>
              <p className="text-gray-600 mb-2">{app.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{app.category.name}</span>
                <span>•</span>
                <span>{app.packageName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Screenshot Gallery */}
        {appImages.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">스크린샷</h2>

            {/* Main Image Display */}
            <div className="relative mb-4">
              <img
                src={appImages[currentImageIndex].url}
                alt={`Screenshot ${appImages[currentImageIndex].sortOrder}`}
                className="w-full h-auto rounded-lg border border-gray-200 max-h-96 object-contain bg-gray-50"
              />

              {/* Navigation Arrows (if more than 1 image) */}
              {appImages.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : appImages.length - 1))
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-md transition"
                    aria-label="이전 스크린샷"
                  >
                    ←
                  </button>
                  <button
                    onClick={() =>
                      setCurrentImageIndex((prev) => (prev < appImages.length - 1 ? prev + 1 : 0))
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-md transition"
                    aria-label="다음 스크린샷"
                  >
                    →
                  </button>
                </>
              )}

              {/* Image Counter */}
              <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {appImages.length}
              </div>
            </div>

            {/* Thumbnail Navigation */}
            <div className="grid grid-cols-5 gap-2">
              {appImages.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`border-2 rounded-lg overflow-hidden transition ${
                    index === currentImageIndex
                      ? 'border-green-600 shadow-md'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                  aria-label={`스크린샷 ${index + 1}으로 이동`}
                >
                  <img
                    src={image.url}
                    alt={`Thumbnail ${image.sortOrder}`}
                    className="w-full h-auto aspect-video object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Test Info Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">테스트 정보</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">리워드</p>
              <p className="text-2xl font-bold text-green-600">
                {app.rewardAmount ? `${app.rewardAmount.toLocaleString()}원` : '크레딧 교환'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">남은 자리</p>
              <p className="text-2xl font-bold text-gray-900">{remainingSlots}명 남음</p>
            </div>
            {app.testStartDate && app.testEndDate && (
              <>
                <div>
                  <p className="text-sm text-gray-600 mb-1">테스트 기간</p>
                  <p className="text-gray-900">
                    {new Date(app.testStartDate).toLocaleDateString('ko-KR')} -{' '}
                    {new Date(app.testEndDate).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Developer Profile */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">개발자 정보</h2>
          <div className="flex items-center gap-4">
            {app.developer.profileImageUrl ? (
              <img
                src={app.developer.profileImageUrl}
                alt={app.developer.nickname}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-xl">👤</span>
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-900">{app.developer.nickname}</p>
              <p className="text-sm text-gray-500">앱 개발자</p>
            </div>
          </div>
        </div>

        {/* Test Guide */}
        {app.testGuide && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">테스터 가이드</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{app.testGuide}</p>
          </div>
        )}

        {/* Apply Button */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <button
            onClick={handleApplyClick}
            disabled={isAlreadyApplied}
            aria-disabled={isAlreadyApplied}
            className={`w-full py-4 rounded-lg font-semibold text-lg transition-all duration-300 ${
              isAlreadyApplied
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-md transform hover:-translate-y-0.5'
            }`}
          >
            {isAlreadyApplied ? '지원 완료 (승인 대기 중)' : '테스트 지원하기'}
          </button>
          {isAlreadyApplied && existingApplication && (
            <p className="mt-3 text-sm text-gray-600 text-center">
              지원일: {new Date(existingApplication.appliedAt).toLocaleDateString('ko-KR')} • 상태:{' '}
              {existingApplication.status === 'PENDING' && '승인 대기'}
              {existingApplication.status === 'APPROVED' && '승인됨'}
              {existingApplication.status === 'REJECTED' && '거절됨'}
            </p>
          )}
        </div>
      </div>

      {/* Application Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleCloseModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="modal-title" className="text-2xl font-bold text-gray-900 mb-4">
              테스트 지원하기
            </h2>

            {submitSuccess && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-800">지원이 완료되었습니다. 승인을 기다려주세요.</p>
              </div>
            )}

            {submitError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800">{submitError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Device Info */}
              <div className="mb-4">
                <label htmlFor="deviceInfo" className="block text-sm font-medium text-gray-700 mb-2">
                  기기 정보 <span className="text-red-600">*</span>
                </label>
                <input
                  id="deviceInfo"
                  type="text"
                  value={formData.deviceInfo}
                  onChange={(e) => handleInputChange('deviceInfo', e.target.value)}
                  placeholder="예: iPhone 15 Pro, Galaxy S24"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 ${
                    formErrors.deviceInfo ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.deviceInfo && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.deviceInfo}</p>
                )}
              </div>

              {/* Message */}
              <div className="mb-6">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  자기소개
                </label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder="테스트에 지원하는 이유를 간단히 작성해주세요."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition"
                >
                  {isSubmitting ? '제출 중...' : '지원하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
