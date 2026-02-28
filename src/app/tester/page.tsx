'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

// @TEST P2-S3-V.4 - 테스터 역할 리다이렉트
// @SPEC specs/screens/tester-home.yaml

export default function TesterHome() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (
      status === 'authenticated' &&
      session?.user?.role !== 'TESTER'
    ) {
      // 테스터가 아닌 경우 적절한 페이지로 리다이렉트
      if (session?.user?.role === 'DEVELOPER') {
        router.push('/developer')
      } else {
        router.push('/')
      }
    }
  }, [status, session, router])

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

  if (status === 'authenticated' && session?.user?.role === 'TESTER') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 to-green-800">
        <nav className="bg-green-900 bg-opacity-50 backdrop-blur-md border-b border-green-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-2xl font-bold text-white">테스터 홈</h1>
              <button
                data-testid="logout-button"
                onClick={() => signOut({ redirect: true, callbackUrl: '/' })}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                로그아웃
              </button>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              환영합니다, {session.user?.name}!
            </h2>
            <p className="text-slate-600 text-lg mb-8">
              테스터 계정으로 로그인되었습니다.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  테스트 찾기
                </h3>
                <p className="text-slate-600">
                  새로운 테스트 기회를 찾습니다.
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  진행 중인 테스트
                </h3>
                <p className="text-slate-600">
                  현재 참여하는 테스트를 확인합니다.
                </p>
              </div>

              <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  리워드
                </h3>
                <p className="text-slate-600">
                  획득한 리워드를 확인합니다.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return null
}
