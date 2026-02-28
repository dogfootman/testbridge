'use client'

import { signIn } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

// @TEST P2-S3-V - 로그인 플로우 검증
// @SPEC specs/screens/login.yaml

export default function LoginPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 에러 쿼리 파라미터 처리
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      setError(getErrorMessage(errorParam))
    }
  }, [searchParams])

  const getErrorMessage = (error: string): string => {
    const errorMessages: Record<string, string> = {
      'configuration': '설정 오류가 발생했습니다.',
      'accessdenied': '접근이 거부되었습니다.',
      'callback': '콜백 오류가 발생했습니다.',
      'oauthsignin': 'OAuth 로그인에 실패했습니다.',
      'oauthcallback': 'OAuth 콜백 처리에 실패했습니다.',
      'oauthcreateaccount': 'OAuth 계정 생성에 실패했습니다.',
      'emailcreateaccount': '이메일 계정 생성에 실패했습니다.',
      'callback': '콜백 처리 중 오류가 발생했습니다.',
      'oauthaccountnotlinked': '이 이메일로 다른 로그인 방식이 이미 등록되어 있습니다.',
      'emailsignin': '이메일을 확인할 수 없습니다.',
      'credentialssignin': '로그인 정보가 유효하지 않습니다.',
      'sessioncallback': '세션 콜백 중 오류가 발생했습니다.',
      'jwt': 'JWT 처리 중 오류가 발생했습니다.',
    }
    return errorMessages[error.toLowerCase()] || '로그인 중 오류가 발생했습니다.'
  }

  const handleOAuthSignIn = async (provider: 'google') => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn(provider, { redirect: false })

      if (result?.error) {
        setError(getErrorMessage(result.error))
      } else if (result?.ok) {
        // signIn이 성공하면 자동으로 리다이렉트됨
        // 콜백에서 역할에 따라 처리됨
      }
    } catch (err) {
      setError('로그인 중 예기치 않은 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 카드 */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              TestBridge에 로그인
            </h1>
            <p className="text-slate-600 text-sm">
              로그인 후 계속하려면 인증해주세요
            </p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div
              data-testid="error-message"
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* OAuth 버튼 */}
          <div
            data-testid="oauth-buttons"
            className="space-y-3 mb-6"
          >
            <button
              data-testid="google-signin-button"
              onClick={() => handleOAuthSignIn('google')}
              disabled={isLoading}
              className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <image href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%234285F4' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'/%3E%3Cpath fill='%2334A853' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'/%3E%3Cpath fill='%23FBBC05' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'/%3E%3Cpath fill='%23EA4335' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'/%3E%3C/svg%3E" />
              {isLoading ? '로그인 중...' : 'Google로 계속'}
            </button>

            {/* 카카오 로그인 (미구현) */}
            <button
              disabled={true}
              className="w-full bg-yellow-300 text-slate-900 rounded-lg py-3 px-4 font-medium hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {/* Kakao Icon */}
              <span className="text-lg">😀</span>
              카카오로 계속 (준비 중)
            </button>

            {/* 네이버 로그인 (미구현) */}
            <button
              disabled={true}
              className="w-full bg-green-500 text-white rounded-lg py-3 px-4 font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {/* Naver Icon */}
              <span className="text-lg">N</span>
              네이버로 계속 (준비 중)
            </button>
          </div>

          {/* 회원가입 링크 */}
          <div className="text-center">
            <p className="text-slate-600 text-sm">
              계정이 없으신가요?{' '}
              <Link
                href="/auth/signup"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                회원가입
              </Link>
            </p>
          </div>
        </div>

        {/* 하단 정보 */}
        <div className="text-center mt-8 text-slate-400 text-sm">
          <p>보안한 로그인. 개인정보는 보호됩니다.</p>
        </div>
      </div>
    </div>
  )
}
