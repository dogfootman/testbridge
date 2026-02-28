// @TASK P2-S3 - S-03 Login 데모 페이지
// @SPEC specs/screens/login.yaml
// @DEMO 모든 상태 시각화

'use client'

import { useState } from 'react'
import { SessionProvider } from 'next-auth/react'

// Mock 컴포넌트 (실제 로그인 페이지와 동일한 UI)
function LoginDemo({ demoState }: { demoState: DemoState }) {
  const handleGoogleLogin = () => {
    alert('데모 모드: Google 로그인 버튼 클릭됨')
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">로그인</h1>
          <p className="mt-2 text-sm text-gray-600">
            로그인 후 계속하려면 인증해주세요
          </p>
          {demoState.callbackUrl && (
            <p className="mt-1 text-xs text-blue-600">
              리다이렉트: {demoState.callbackUrl}
            </p>
          )}
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

// 데모 상태 타입
type DemoState = {
  name: string
  description: string
  callbackUrl?: string
}

const DEMO_STATES: Record<string, DemoState> = {
  normal: {
    name: '기본 상태',
    description: '미로그인 사용자의 로그인 화면',
  },
  withCallback: {
    name: 'callbackUrl 포함',
    description: '특정 페이지 접근 후 로그인 (리다이렉트 URL 포함)',
    callbackUrl: '/tester/apps/123',
  },
  fromDeveloper: {
    name: 'Developer 페이지에서 접근',
    description: 'Developer 대시보드 접근 시도',
    callbackUrl: '/developer',
  },
  fromTester: {
    name: 'Tester 페이지에서 접근',
    description: 'Tester 대시보드 접근 시도',
    callbackUrl: '/tester',
  },
}

export default function LoginDemoPage() {
  const [currentState, setCurrentState] = useState<string>('normal')
  const demoState = DEMO_STATES[currentState]

  return (
    <SessionProvider>
      <div className="min-h-screen bg-gray-100">
        {/* 데모 컨트롤 패널 */}
        <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">
              P2-S3: Login 데모
            </h2>

            {/* 상태 선택 버튼 */}
            <div className="flex flex-wrap gap-2 mb-3">
              {Object.entries(DEMO_STATES).map(([key, state]) => (
                <button
                  key={key}
                  onClick={() => setCurrentState(key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentState === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {state.name}
                </button>
              ))}
            </div>

            {/* 현재 상태 정보 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm font-medium text-blue-900">
                {demoState.name}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                {demoState.description}
              </p>
              {demoState.callbackUrl && (
                <p className="text-xs text-blue-600 mt-1 font-mono">
                  callbackUrl: {demoState.callbackUrl}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 로그인 페이지 렌더링 */}
        <LoginDemo demoState={demoState} />

        {/* 상태 정보 (JSON) */}
        <div className="max-w-7xl mx-auto p-4">
          <details className="bg-white rounded-lg shadow-sm border border-gray-200">
            <summary className="px-4 py-3 cursor-pointer font-medium text-gray-700 hover:bg-gray-50">
              상태 정보 (JSON)
            </summary>
            <pre className="p-4 bg-gray-50 text-xs font-mono overflow-auto">
              {JSON.stringify(demoState, null, 2)}
            </pre>
          </details>
        </div>

        {/* 테스트 시나리오 */}
        <div className="max-w-7xl mx-auto p-4 pb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-800 mb-3">
              테스트 시나리오
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>
                  Google 로그인 버튼 클릭 시 OAuth 인증 플로우 시작
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>
                  DEVELOPER 역할 → /developer 리다이렉트 (테스트에서 검증)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>
                  TESTER 역할 → /tester 리다이렉트 (테스트에서 검증)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>
                  NONE 역할 → /auth/signup 리다이렉트 (신규 사용자)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>
                  callbackUrl 파라미터 존재 시 해당 URL로 리다이렉트 우선
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </SessionProvider>
  )
}
