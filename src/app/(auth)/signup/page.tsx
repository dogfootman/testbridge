// @TASK P2-S2 - S-02 Signup (회원가입)
// @SPEC specs/screens/signup.yaml

'use client'

import { useEffect, useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

type Role = 'DEVELOPER' | 'TESTER' | 'BOTH'
type Step = 'oauth' | 'role' | 'profile' | 'agreement'

interface FormData {
  role: Role | null
  nickname: string
  profileImageUrl: string
  termsAgreed: boolean
  privacyAgreed: boolean
  marketingAgreed: boolean
}

export default function SignupPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [currentStep, setCurrentStep] = useState<Step>('oauth')
  const [formData, setFormData] = useState<FormData>({
    role: null,
    nickname: '',
    profileImageUrl: '',
    termsAgreed: false,
    privacyAgreed: false,
    marketingAgreed: false,
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isLoading, setIsLoading] = useState(false)

  // 기존 사용자 처리
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role) {
      // 기존 사용자는 대시보드로 리다이렉트
      const role = session.user.role.toLowerCase()
      router.push(`/${role}`)
    } else if (status === 'authenticated' && !session?.user?.role) {
      // 신규 사용자는 역할 선택으로
      setCurrentStep('role')
    }
  }, [status, session, router])

  // URL 파라미터에서 역할 읽기
  useEffect(() => {
    const roleParam = searchParams.get('role')
    if (roleParam) {
      setFormData(prev => ({ ...prev, role: roleParam.toUpperCase() as Role }))
    }
  }, [searchParams])

  const handleOAuthSignIn = (provider: string) => {
    signIn(provider, { callbackUrl: '/auth/signup' })
  }

  const handleRoleSelect = (role: Role) => {
    setFormData(prev => ({ ...prev, role }))
  }

  const handleNextFromRole = () => {
    if (!formData.role) {
      setErrors({ role: '역할을 선택해주세요' })
      return
    }
    setErrors({})
    setCurrentStep('profile')
  }

  const handleNextFromProfile = async () => {
    if (!formData.nickname.trim()) {
      setErrors({ nickname: '닉네임을 입력해주세요' })
      return
    }

    // 닉네임 중복 체크
    setIsLoading(true)
    try {
      const response = await fetch(`/api/users/check-nickname?nickname=${formData.nickname}`)
      const data = await response.json()

      if (!response.ok || !data.available) {
        setErrors({ nickname: '이미 사용 중인 닉네임입니다.' })
        setIsLoading(false)
        return
      }

      setErrors({})
      setCurrentStep('agreement')
    } catch (error) {
      setErrors({ nickname: '닉네임 확인 중 오류가 발생했습니다.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.termsAgreed || !formData.privacyAgreed) {
      setErrors({ agreement: '필수 약관에 동의해주세요' })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: formData.role,
          nickname: formData.nickname,
          profileImageUrl: formData.profileImageUrl,
          termsAgreed: formData.termsAgreed,
          privacyAgreed: formData.privacyAgreed,
          marketingAgreed: formData.marketingAgreed,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrors({ submit: data.error || '가입 중 오류가 발생했습니다.' })
        setIsLoading(false)
        return
      }

      // 가입 성공 - 역할에 따라 리다이렉트
      const redirectPath = data.role === 'DEVELOPER' ? '/developer' : '/tester'
      router.push(redirectPath)
    } catch (error) {
      setErrors({ submit: '가입 중 오류가 발생했습니다.' })
      setIsLoading(false)
    }
  }

  // OAuth 단계
  if (currentStep === 'oauth') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-center mb-8">회원가입</h1>

          <div className="space-y-3">
            <button
              onClick={() => handleOAuthSignIn('google')}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google로 계속하기
            </button>

            <button
              onClick={() => handleOAuthSignIn('kakao')}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-yellow-400 rounded-lg hover:bg-yellow-500 transition-colors"
            >
              <span className="font-semibold">Kakao로 계속하기</span>
            </button>

            <button
              onClick={() => handleOAuthSignIn('naver')}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <span className="font-semibold">Naver로 계속하기</span>
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            이미 계정이 있으신가요?{' '}
            <a href="/auth/login" className="text-blue-600 hover:underline">
              로그인
            </a>
          </p>
        </div>
      </div>
    )
  }

  // 역할 선택 단계
  if (currentStep === 'role') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-center mb-4">역할을 선택해주세요</h2>
          <p className="text-center text-gray-600 mb-8">
            TestBridge에서 어떤 역할로 활동하시겠어요?
          </p>

          <div className="space-y-4 mb-8">
            <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" htmlFor="role-developer">
              <input
                id="role-developer"
                data-testid="role-developer"
                type="radio"
                name="role"
                value="DEVELOPER"
                checked={formData.role === 'DEVELOPER'}
                onChange={(e) => handleRoleSelect(e.target.value as Role)}
                className="w-4 h-4 text-blue-600"
              />
              <div className="ml-3">
                <div className="font-semibold">개발자</div>
                <div className="text-sm text-gray-500">앱 테스트를 요청합니다</div>
              </div>
            </label>

            <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" htmlFor="role-tester">
              <input
                id="role-tester"
                data-testid="role-tester"
                type="radio"
                name="role"
                value="TESTER"
                checked={formData.role === 'TESTER'}
                onChange={(e) => handleRoleSelect(e.target.value as Role)}
                className="w-4 h-4 text-blue-600"
              />
              <div className="ml-3">
                <div className="font-semibold">테스터</div>
                <div className="text-sm text-gray-500">앱을 테스트합니다</div>
              </div>
            </label>

            <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" htmlFor="role-both">
              <input
                id="role-both"
                data-testid="role-both"
                type="radio"
                name="role"
                value="BOTH"
                checked={formData.role === 'BOTH'}
                onChange={(e) => handleRoleSelect(e.target.value as Role)}
                className="w-4 h-4 text-blue-600"
              />
              <div className="ml-3">
                <div className="font-semibold">둘 다</div>
                <div className="text-sm text-gray-500">개발자이면서 테스터로 활동합니다</div>
              </div>
            </label>
          </div>

          {errors.role && (
            <p className="text-red-500 text-sm mb-4">{errors.role}</p>
          )}

          <button
            onClick={handleNextFromRole}
            disabled={!formData.role}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            다음
          </button>
        </div>
      </div>
    )
  }

  // 프로필 입력 단계
  if (currentStep === 'profile') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-center mb-4">프로필 입력</h2>
          <p className="text-center text-gray-600 mb-8">
            다른 사용자에게 보여질 정보입니다
          </p>

          <div className="space-y-6 mb-8">
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">
                닉네임 *
              </label>
              <input
                id="nickname"
                data-testid="nickname-input"
                type="text"
                value={formData.nickname}
                onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="사용할 닉네임을 입력하세요"
              />
              {errors.nickname && (
                <p className="text-red-500 text-sm mt-1" data-testid="nickname-error">{errors.nickname}</p>
              )}
            </div>

            <div>
              <label htmlFor="profileImageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                프로필 이미지 URL
              </label>
              <input
                id="profileImageUrl"
                data-testid="profile-image-input"
                type="url"
                value={formData.profileImageUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, profileImageUrl: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <button
            onClick={handleNextFromProfile}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? '확인 중...' : '다음'}
          </button>
        </div>
      </div>
    )
  }

  // 약관 동의 단계
  if (currentStep === 'agreement') {
    const isSubmitEnabled = formData.termsAgreed && formData.privacyAgreed

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-center mb-4">약관 동의</h2>
          <p className="text-center text-gray-600 mb-8">
            서비스 이용을 위해 약관에 동의해주세요
          </p>

          <div className="space-y-4 mb-8">
            <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" htmlFor="terms-agreement">
              <input
                id="terms-agreement"
                data-testid="terms-checkbox"
                type="checkbox"
                required
                checked={formData.termsAgreed}
                onChange={(e) => setFormData(prev => ({ ...prev, termsAgreed: e.target.checked }))}
                className="w-4 h-4 mt-1 text-blue-600"
              />
              <div className="ml-3">
                <div className="font-medium">이용약관 동의 (필수)</div>
                <a href="/terms" className="text-sm text-blue-600 hover:underline">
                  약관 보기
                </a>
              </div>
            </label>

            <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" htmlFor="privacy-agreement">
              <input
                id="privacy-agreement"
                data-testid="privacy-checkbox"
                type="checkbox"
                required
                checked={formData.privacyAgreed}
                onChange={(e) => setFormData(prev => ({ ...prev, privacyAgreed: e.target.checked }))}
                className="w-4 h-4 mt-1 text-blue-600"
              />
              <div className="ml-3">
                <div className="font-medium">개인정보 처리방침 동의 (필수)</div>
                <a href="/privacy" className="text-sm text-blue-600 hover:underline">
                  약관 보기
                </a>
              </div>
            </label>

            <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" htmlFor="marketing-agreement">
              <input
                id="marketing-agreement"
                data-testid="marketing-checkbox"
                type="checkbox"
                checked={formData.marketingAgreed}
                onChange={(e) => setFormData(prev => ({ ...prev, marketingAgreed: e.target.checked }))}
                className="w-4 h-4 mt-1 text-blue-600"
              />
              <div className="ml-3">
                <div className="font-medium">마케팅 정보 수신 동의 (선택)</div>
                <div className="text-sm text-gray-500">이벤트, 혜택 등의 정보를 받습니다</div>
              </div>
            </label>
          </div>

          {errors.agreement && (
            <p className="text-red-500 text-sm mb-4">{errors.agreement}</p>
          )}

          {errors.submit && (
            <p className="text-red-500 text-sm mb-4">{errors.submit}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={!isSubmitEnabled || isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? '처리 중...' : '가입 완료'}
          </button>
        </div>
      </div>
    )
  }

  return null
}
