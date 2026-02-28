// @TASK Demo Hub
// All demo pages for Phase 3

'use client'

import Link from 'next/link'

const DEMOS = [
  {
    phase: 'Phase 3',
    demos: [
      {
        id: 'p3-s7-app-register',
        name: 'P3-S7: App Register (앱 등록 4단계)',
        path: '/demo/phase-3/p3-s7-app-register',
        description: '4단계 위저드 폼 (기본정보 → 테스트설정 → 리워드 → 피드백)',
      },
      {
        id: 'p3-s8-apps-list',
        name: 'P3-S8: Developer Apps List (내 앱 목록)',
        path: '/demo/phase-3/p3-s8-apps-list',
        description: '상태 필터, 검색, 진행률 표시, 빈 상태',
      },
    ],
  },
]

export default function DemoHubPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          🎨 TestBridge Demo Hub
        </h1>

        <div className="space-y-8">
          {DEMOS.map((phase) => (
            <div key={phase.phase} className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                {phase.phase}
              </h2>

              <div className="space-y-4">
                {phase.demos.map((demo) => (
                  <Link
                    key={demo.id}
                    href={demo.path}
                    className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <h3 className="text-lg font-semibold text-blue-600 mb-1">
                      {demo.name}
                    </h3>
                    <p className="text-sm text-gray-600">{demo.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> 데모 페이지는 모든 상태 (normal, loading, error)를 시뮬레이션할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  )
}
