// @TASK P3-S7 - App Register (앱 등록 4단계 위저드)
// @SPEC specs/screens/app-register.yaml

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { AppFormData, AppFormErrors, Category, TestType, RewardType } from '@/types/app'

export default function AppRegisterPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [categories, setCategories] = useState<Category[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const [formData, setFormData] = useState<AppFormData>({
    appName: '',
    packageName: '',
    categoryId: null,
    description: '',
    testType: null,
    targetTesters: 14,
    testLink: '',
    rewardType: null,
    rewardAmount: 5000,
    feedbackRequired: false,
    testGuide: '',
  })

  const [errors, setErrors] = useState<AppFormErrors>({})

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data.categories || [])
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    }
    fetchCategories()
  }, [])

  // Validate Step 1
  const validateStep1 = (): boolean => {
    const newErrors: AppFormErrors = {}

    if (!formData.appName.trim()) {
      newErrors.appName = '앱 이름을 입력해주세요'
    }

    if (!formData.packageName.trim()) {
      newErrors.packageName = '패키지명을 입력해주세요'
    } else if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(formData.packageName)) {
      newErrors.packageName = '올바른 패키지명 형식이 아닙니다'
    }

    if (!formData.categoryId) {
      newErrors.categoryId = '카테고리를 선택해주세요'
    }

    if (!formData.description.trim()) {
      newErrors.description = '설명을 입력해주세요'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Validate Step 2
  const validateStep2 = (): boolean => {
    const newErrors: AppFormErrors = {}

    if (!formData.testType) {
      newErrors.testType = '테스트 유형을 선택해주세요'
    }

    if (!formData.targetTesters || formData.targetTesters < 1) {
      newErrors.targetTesters = '최소 1명 이상 필요합니다'
    } else if (formData.targetTesters > 100) {
      newErrors.targetTesters = '최대 100명까지 가능합니다'
    }

    if (!formData.testLink.trim()) {
      newErrors.testLink = 'Google Play 테스트 링크를 입력해주세요'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Validate Step 3 (PAID_REWARD only)
  const validateStep3 = (): boolean => {
    if (formData.testType !== 'PAID_REWARD') {
      return true // Skip validation for CREDIT_EXCHANGE
    }

    const newErrors: AppFormErrors = {}

    if (!formData.rewardType) {
      newErrors.rewardType = '리워드 유형을 선택해주세요'
    }

    if (!formData.rewardAmount || formData.rewardAmount < 1000) {
      newErrors.rewardAmount = '최소 1,000원 이상 필요합니다'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle Next
  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) {
      return
    }

    if (currentStep === 2 && !validateStep2()) {
      return
    }

    if (currentStep === 3 && !validateStep3()) {
      return
    }

    // Skip step 3 for CREDIT_EXCHANGE
    if (currentStep === 2 && formData.testType === 'CREDIT_EXCHANGE') {
      setCurrentStep(4)
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  // Handle Back
  const handleBack = () => {
    // Skip step 3 when going back from step 4 with CREDIT_EXCHANGE
    if (currentStep === 4 && formData.testType === 'CREDIT_EXCHANGE') {
      setCurrentStep(2)
    } else {
      setCurrentStep(currentStep - 1)
    }
  }

  // Handle Submit
  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch('/api/apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appName: formData.appName,
          packageName: formData.packageName,
          categoryId: formData.categoryId,
          description: formData.description,
          testType: formData.testType,
          targetTesters: formData.targetTesters,
          testLink: formData.testLink,
          rewardType: formData.rewardType,
          rewardAmount: formData.rewardAmount,
          feedbackRequired: formData.feedbackRequired,
          testGuide: formData.testGuide,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create app')
      }

      setSubmitSuccess(true)
      // Redirect after short delay
      setTimeout(() => {
        router.push('/developer/apps')
      }, 1500)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle input change
  const handleChange = (field: keyof AppFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error for this field
    setErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[field as keyof AppFormErrors]
      return newErrors
    })
  }

  // Calculate total payment
  const totalPayment = formData.rewardAmount * formData.targetTesters

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">앱 등록</h1>

        {/* Stepper */}
        <div className="mb-8 flex items-center justify-between">
          {['기본정보', '테스트설정', '리워드설정', '피드백설정'].map((label, index) => {
            const stepNumber = index + 1
            const isActive = currentStep === stepNumber
            const isCompleted = currentStep > stepNumber

            return (
              <div
                key={label}
                data-step={stepNumber}
                data-testid={`step-${stepNumber}`}
                data-active={isActive}
                className="flex-1 text-center"
              >
                <div
                  className={`inline-block w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : isCompleted
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {stepNumber}
                </div>
                <div className={`text-sm ${isActive ? 'font-semibold text-blue-600' : 'text-gray-600'}`}>
                  {label}
                </div>
              </div>
            )
          })}
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {/* Step 1: 기본정보 */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">기본정보</h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="appName" className="block text-sm font-medium text-gray-700 mb-1">
                    앱 이름 *
                  </label>
                  <input
                    type="text"
                    id="appName"
                    value={formData.appName}
                    onChange={(e) => handleChange('appName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  {errors.appName && (
                    <p className="text-red-600 text-sm mt-1">{errors.appName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="packageName" className="block text-sm font-medium text-gray-700 mb-1">
                    패키지명 *
                  </label>
                  <input
                    type="text"
                    id="packageName"
                    value={formData.packageName}
                    onChange={(e) => handleChange('packageName', e.target.value)}
                    onBlur={validateStep1}
                    placeholder="com.example.app"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  {errors.packageName && (
                    <p className="text-red-600 text-sm mt-1">{errors.packageName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
                    카테고리 *
                  </label>
                  <select
                    id="categoryId"
                    value={formData.categoryId || ''}
                    onChange={(e) => handleChange('categoryId', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">선택하세요</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="text-red-600 text-sm mt-1">{errors.categoryId}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    설명 *
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  {errors.description && (
                    <p className="text-red-600 text-sm mt-1">{errors.description}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: 테스트설정 */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">테스트설정</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    테스트 유형 *
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="testType"
                        value="PAID_REWARD"
                        checked={formData.testType === 'PAID_REWARD'}
                        onChange={(e) => handleChange('testType', e.target.value as TestType)}
                        className="mr-2"
                      />
                      <span>유료 리워드</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="testType"
                        value="CREDIT_EXCHANGE"
                        checked={formData.testType === 'CREDIT_EXCHANGE'}
                        onChange={(e) => handleChange('testType', e.target.value as TestType)}
                        className="mr-2"
                      />
                      <span>크레딧 교환</span>
                    </label>
                  </div>
                  {errors.testType && (
                    <p className="text-red-600 text-sm mt-1">{errors.testType}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="targetTesters" className="block text-sm font-medium text-gray-700 mb-1">
                    목표 테스터 수 *
                  </label>
                  <input
                    type="number"
                    id="targetTesters"
                    value={formData.targetTesters}
                    onChange={(e) => handleChange('targetTesters', parseInt(e.target.value) || 0)}
                    onBlur={validateStep2}
                    min="1"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  {errors.targetTesters && (
                    <p className="text-red-600 text-sm mt-1">{errors.targetTesters}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="testLink" className="block text-sm font-medium text-gray-700 mb-1">
                    Google Play 테스트 링크 *
                  </label>
                  <input
                    type="url"
                    id="testLink"
                    value={formData.testLink}
                    onChange={(e) => handleChange('testLink', e.target.value)}
                    placeholder="https://play.google.com/apps/test"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  {errors.testLink && (
                    <p className="text-red-600 text-sm mt-1">{errors.testLink}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: 리워드설정 (PAID_REWARD only) */}
          {currentStep === 3 && formData.testType === 'PAID_REWARD' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">리워드설정</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    리워드 유형 *
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="rewardType"
                        value="BASIC"
                        checked={formData.rewardType === 'BASIC'}
                        onChange={(e) => handleChange('rewardType', e.target.value as RewardType)}
                        className="mr-2"
                      />
                      <span>기본</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="rewardType"
                        value="WITH_FEEDBACK"
                        checked={formData.rewardType === 'WITH_FEEDBACK'}
                        onChange={(e) => handleChange('rewardType', e.target.value as RewardType)}
                        className="mr-2"
                      />
                      <span>피드백 포함</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="rewardType"
                        value="ADVANCED"
                        checked={formData.rewardType === 'ADVANCED'}
                        onChange={(e) => handleChange('rewardType', e.target.value as RewardType)}
                        className="mr-2"
                      />
                      <span>심화</span>
                    </label>
                  </div>
                  {errors.rewardType && (
                    <p className="text-red-600 text-sm mt-1">{errors.rewardType}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="rewardAmount" className="block text-sm font-medium text-gray-700 mb-1">
                    리워드 금액 *
                  </label>
                  <input
                    type="number"
                    id="rewardAmount"
                    value={formData.rewardAmount}
                    onChange={(e) => handleChange('rewardAmount', parseInt(e.target.value) || 0)}
                    min="1000"
                    step="1000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  {errors.rewardAmount && (
                    <p className="text-red-600 text-sm mt-1">{errors.rewardAmount}</p>
                  )}
                </div>

                <div className="bg-blue-50 p-4 rounded-md">
                  <p className="text-sm text-gray-700">
                    총 결제 금액: <span className="font-semibold">{totalPayment.toLocaleString()}원</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.rewardAmount.toLocaleString()}원 × {formData.targetTesters}명
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: 피드백설정 */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">피드백설정</h2>

              <div className="space-y-4">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      id="feedbackRequired"
                      checked={formData.feedbackRequired}
                      onChange={(e) => handleChange('feedbackRequired', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">피드백 필수 여부</span>
                  </label>
                </div>

                <div>
                  <label htmlFor="testGuide" className="block text-sm font-medium text-gray-700 mb-1">
                    테스트 가이드
                  </label>
                  <textarea
                    id="testGuide"
                    value={formData.testGuide}
                    onChange={(e) => handleChange('testGuide', e.target.value)}
                    rows={6}
                    placeholder="테스터에게 전달할 테스트 가이드를 작성해주세요."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              {submitSuccess && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-green-800">앱이 성공적으로 등록되었습니다</p>
                </div>
              )}

              {submitError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-800">{submitError}</p>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-6 flex justify-between">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isSubmitting}
              >
                이전
              </button>
            )}

            {currentStep < 4 && (
              <button
                onClick={handleNext}
                className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                다음
              </button>
            )}

            {currentStep === 4 && (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="ml-auto px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
              >
                {isSubmitting ? '등록 중...' : '앱 등록'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
