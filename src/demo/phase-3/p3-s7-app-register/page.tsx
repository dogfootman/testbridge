// @TASK P3-S7 - Demo Page for App Register
// @SPEC specs/screens/app-register.yaml

'use client'

import { useState } from 'react'
import AppRegisterPage from '@/app/developer/apps/new/page'

const DEMO_STATES = {
  normal: {
    description: '정상 상태: 앱 등록 위저드 전체 플로우',
    mockCategories: [
      { id: 1, name: 'Game', slug: 'game' },
      { id: 2, name: 'Productivity', slug: 'productivity' },
      { id: 3, name: 'Education', slug: 'education' },
    ],
  },
  loading: {
    description: '로딩 상태: 카테고리 로딩 중',
    mockCategories: [],
  },
  error: {
    description: '에러 상태: 패키지명 중복',
    mockCategories: [
      { id: 1, name: 'Game', slug: 'game' },
    ],
    error: 'Package name already exists',
  },
} as const

export default function DemoPage() {
  const [state, setState] = useState<keyof typeof DEMO_STATES>('normal')

  // Mock fetch for demo
  if (typeof window !== 'undefined') {
    const originalFetch = window.fetch
    window.fetch = async (url: string | URL | Request, init?: RequestInit) => {
      const urlStr = url.toString()

      if (urlStr.includes('/api/categories')) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        return {
          ok: true,
          json: async () => ({ categories: DEMO_STATES[state].mockCategories }),
        } as Response
      }

      if (urlStr.includes('/api/apps') && init?.method === 'POST') {
        await new Promise((resolve) => setTimeout(resolve, 1000))

        if (state === 'error') {
          return {
            ok: false,
            json: async () => ({ error: DEMO_STATES[state].error }),
          } as Response
        }

        return {
          ok: true,
          json: async () => ({
            id: 1,
            appName: 'Demo App',
            status: 'PENDING_APPROVAL',
          }),
        } as Response
      }

      return originalFetch(url, init)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* State Selector */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            P3-S7: App Register Demo
          </h1>
          <div className="flex gap-2 mb-4">
            {Object.keys(DEMO_STATES).map((s) => (
              <button
                key={s}
                onClick={() => setState(s as keyof typeof DEMO_STATES)}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  state === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
            <strong>현재 상태:</strong> {DEMO_STATES[state].description}
          </div>
        </div>
      </div>

      {/* Component Render */}
      <div className="py-8">
        <AppRegisterPage />
      </div>

      {/* State Info */}
      <div className="bg-white border-t border-gray-200 p-4 fixed bottom-0 w-full">
        <div className="max-w-7xl mx-auto">
          <details className="cursor-pointer">
            <summary className="font-semibold text-gray-700">
              State Details (Click to expand)
            </summary>
            <pre className="mt-2 p-4 bg-gray-100 text-xs rounded overflow-auto max-h-60">
              {JSON.stringify(DEMO_STATES[state], null, 2)}
            </pre>
          </details>
        </div>
      </div>

      {/* Feature Checklist */}
      <div className="fixed right-4 top-20 bg-white p-4 rounded-lg shadow-lg max-w-sm">
        <h3 className="font-bold text-gray-900 mb-2">✅ Features</h3>
        <ul className="text-sm space-y-1 text-gray-700">
          <li>✓ 4단계 위저드 (기본정보 → 테스트설정 → 리워드 → 피드백)</li>
          <li>✓ 단계별 입력 검증</li>
          <li>✓ PAID_REWARD: Step 3 표시</li>
          <li>✓ CREDIT_EXCHANGE: Step 3 스킵</li>
          <li>✓ 이전/다음 네비게이션</li>
          <li>✓ 총 결제 금액 계산</li>
          <li>✓ API 통합 (POST /api/apps)</li>
          <li>✓ 에러 핸들링</li>
        </ul>
      </div>
    </div>
  )
}
