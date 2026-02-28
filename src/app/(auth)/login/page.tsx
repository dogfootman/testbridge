// @TASK P2-S3 - S-03 Login 페이지
// @SPEC specs/screens/login.yaml
// @TEST src/app/(auth)/login/page.test.tsx

'use client'

import { useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl')

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // 1. callbackUrl 우선 리다이렉트
      if (callbackUrl) {
        router.push(callbackUrl)
        return
      }

      // 2. 역할 없으면 회원가입으로
      if (session.user.role === 'NONE' || !session.user.role) {
        router.push('/auth/signup')
        return
      }

      // 3. 역할별 대시보드
      if (session.user.role === 'DEVELOPER') {
        router.push('/developer')
      } else if (session.user.role === 'TESTER') {
        router.push('/tester')
      }
    }
  }, [status, session, router, callbackUrl])

  const handleGoogleLogin = async () => {
    await signIn('google', {
      callbackUrl: callbackUrl || '/',
    })
  }

  // 로딩 중
  if (status === 'loading') {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </main>
    )
  }

  // 이미 로그인됨 (리다이렉트 처리 중)
  if (status === 'authenticated') {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">리다이렉트 중...</p>
        </div>
      </main>
    )
  }

  // 미로그인 상태 - 로그인 UI
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">로그인</h1>
          <p className="mt-2 text-sm text-gray-600">
            로그인 후 계속하려면 인증해주세요
          </p>
        </div>

        {/* OAuth 버튼 */}
        <div className="space-y-3">
          <button
            onClick={handleGoogleLogin}
            aria-label="Google로 로그인"
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-colors"
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
            <span className="text-sm font-medium text-gray-700">
              Google로 계속하기
            </span>
          </button>

          {/* 카카오, 네이버 버튼 (향후 구현) */}
          <button
            disabled
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-lg shadow-sm bg-gray-100 cursor-not-allowed opacity-50"
          >
            <span className="text-sm font-medium text-gray-500">
              카카오 로그인 (준비 중)
            </span>
          </button>

          <button
            disabled
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-lg shadow-sm bg-gray-100 cursor-not-allowed opacity-50"
          >
            <span className="text-sm font-medium text-gray-500">
              네이버 로그인 (준비 중)
            </span>
          </button>
        </div>

        {/* 안내 문구 */}
        <p className="text-xs text-center text-gray-500">
          로그인하면{' '}
          <a href="/terms" className="underline hover:text-gray-700">
            서비스 이용약관
          </a>{' '}
          및{' '}
          <a href="/privacy" className="underline hover:text-gray-700">
            개인정보 처리방침
          </a>
          에 동의하는 것으로 간주됩니다.
        </p>
      </div>
    </main>
  )
}
