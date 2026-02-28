// @TASK P3-S8 - D-03 Developer Apps 데모 페이지
// @SPEC specs/screens/developer-apps.yaml
// @DEMO 상태별 앱 목록 시연

'use client'

import { useState } from 'react'

type DemoState = 'normal' | 'empty' | 'loading' | 'error' | 'recruiting-only' | 'in-testing-only'

const DEMO_APPS = {
  normal: [
    {
      id: 1,
      appName: 'Test Flight Pro',
      packageName: 'com.testbridge.flight',
      status: 'RECRUITING' as const,
      targetTesters: 20,
      testStartDate: '2026-03-01T00:00:00Z',
      testEndDate: '2026-03-31T00:00:00Z',
      createdAt: '2026-02-15T00:00:00Z',
      category: { id: 1, name: 'Productivity', icon: '⚙️' },
      developer: { id: 1, nickname: 'Developer1', profileImageUrl: null },
      images: [{ type: 'ICON', url: '/demo-icon-1.png', sortOrder: 0 }],
    },
    {
      id: 2,
      appName: 'Game Master',
      packageName: 'com.testbridge.game',
      status: 'IN_TESTING' as const,
      targetTesters: 30,
      testStartDate: '2026-02-01T00:00:00Z',
      testEndDate: '2026-03-15T00:00:00Z',
      createdAt: '2026-01-20T00:00:00Z',
      category: { id: 2, name: 'Game', icon: '🎮' },
      developer: { id: 1, nickname: 'Developer1', profileImageUrl: null },
      images: [{ type: 'ICON', url: '/demo-icon-2.png', sortOrder: 0 }],
    },
    {
      id: 3,
      appName: 'Social Connect',
      packageName: 'com.testbridge.social',
      status: 'COMPLETED' as const,
      targetTesters: 10,
      testStartDate: '2026-01-01T00:00:00Z',
      testEndDate: '2026-01-31T00:00:00Z',
      createdAt: '2025-12-15T00:00:00Z',
      category: { id: 3, name: 'Social', icon: '💬' },
      developer: { id: 1, nickname: 'Developer1', profileImageUrl: null },
      images: [{ type: 'ICON', url: '/demo-icon-3.png', sortOrder: 0 }],
    },
    {
      id: 4,
      appName: 'E-Commerce Plus',
      packageName: 'com.testbridge.ecommerce',
      status: 'PRODUCTION' as const,
      targetTesters: 50,
      testStartDate: '2025-11-01T00:00:00Z',
      testEndDate: '2025-12-31T00:00:00Z',
      createdAt: '2025-10-15T00:00:00Z',
      category: { id: 4, name: 'Shopping', icon: '🛒' },
      developer: { id: 1, nickname: 'Developer1', profileImageUrl: null },
      images: [{ type: 'ICON', url: '/demo-icon-4.png', sortOrder: 0 }],
    },
  ],
  empty: [],
  loading: [],
  error: [],
  'recruiting-only': [
    {
      id: 1,
      appName: 'Test Flight Pro',
      packageName: 'com.testbridge.flight',
      status: 'RECRUITING' as const,
      targetTesters: 20,
      testStartDate: '2026-03-01T00:00:00Z',
      testEndDate: '2026-03-31T00:00:00Z',
      createdAt: '2026-02-15T00:00:00Z',
      category: { id: 1, name: 'Productivity', icon: '⚙️' },
      developer: { id: 1, nickname: 'Developer1', profileImageUrl: null },
      images: [{ type: 'ICON', url: '/demo-icon-1.png', sortOrder: 0 }],
    },
  ],
  'in-testing-only': [
    {
      id: 2,
      appName: 'Game Master',
      packageName: 'com.testbridge.game',
      status: 'IN_TESTING' as const,
      targetTesters: 30,
      testStartDate: '2026-02-01T00:00:00Z',
      testEndDate: '2026-03-15T00:00:00Z',
      createdAt: '2026-01-20T00:00:00Z',
      category: { id: 2, name: 'Game', icon: '🎮' },
      developer: { id: 1, nickname: 'Developer1', profileImageUrl: null },
      images: [{ type: 'ICON', url: '/demo-icon-2.png', sortOrder: 0 }],
    },
  ],
}

const PARTICIPATION_COUNTS = {
  1: 0, // RECRUITING - no participations yet
  2: 15, // IN_TESTING - 15/30
  3: 10, // COMPLETED - 10/10 (100%)
  4: 50, // PRODUCTION - 50/50
}

const STATUS_CONFIG = {
  RECRUITING: { label: '모집 중', color: 'bg-blue-100 text-blue-800' },
  IN_TESTING: { label: '테스트 중', color: 'bg-orange-100 text-orange-800' },
  COMPLETED: { label: '완료', color: 'bg-green-100 text-green-800' },
  PRODUCTION: { label: '프로덕션', color: 'bg-purple-100 text-purple-800' },
}

export default function DeveloperAppsDemoPage() {
  const [demoState, setDemoState] = useState<DemoState>('normal')
  const [activeTab, setActiveTab] = useState<string>('ALL')

  const apps = DEMO_APPS[demoState] || DEMO_APPS.normal

  const calculateProgress = (app: any) => {
    const current = PARTICIPATION_COUNTS[app.id as keyof typeof PARTICIPATION_COUNTS] || 0
    const total = app.targetTesters
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0
    return { current, total, percentage }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Controls */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            P3-S8: Developer Apps Demo
          </h1>
          <div className="flex gap-2 flex-wrap">
            {Object.keys(DEMO_APPS).map((state) => (
              <button
                key={state}
                onClick={() => setDemoState(state as DemoState)}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-colors
                  ${
                    demoState === state
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }
                `}
              >
                {state}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">내 앱 목록</h2>
            <button
              onClick={() => alert('새 앱 등록 페이지로 이동')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              새 앱 등록
            </button>
          </div>

          {/* Status Filter Tabs */}
          <div
            role="tablist"
            aria-label="앱 상태 필터"
            className="flex gap-2 mb-6 border-b border-gray-200"
          >
            {['전체', '모집중', '테스트중', '완료', '프로덕션'].map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  px-4 py-2 font-medium transition-colors
                  ${
                    activeTab === tab
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Loading State */}
          {demoState === 'loading' && (
            <div className="text-center py-12">
              <p className="text-gray-600">로딩 중...</p>
            </div>
          )}

          {/* Error State */}
          {demoState === 'error' && (
            <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200">
              <p className="text-red-600">앱 목록을 불러오는데 실패했습니다.</p>
            </div>
          )}

          {/* Empty State */}
          {demoState === 'empty' && (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-600 mb-4">
                등록된 앱이 없습니다. 첫 번째 앱을 등록해보세요!
              </p>
              <button
                onClick={() => alert('새 앱 등록 페이지로 이동')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                새 앱 등록
              </button>
            </div>
          )}

          {/* Apps Grid */}
          {demoState !== 'loading' &&
            demoState !== 'error' &&
            demoState !== 'empty' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {apps.map((app) => {
                  const progress = calculateProgress(app)

                  return (
                    <article
                      key={app.id}
                      onClick={() => alert(`앱 상세 페이지로 이동: ${app.appName}`)}
                      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    >
                      {/* App Icon and Info */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-2xl">{app.category.icon}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                            {app.appName}
                          </h3>
                          <p className="text-sm text-gray-500 truncate">
                            {app.packageName}
                          </p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="mb-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            STATUS_CONFIG[app.status].color
                          }`}
                        >
                          {STATUS_CONFIG[app.status].label}
                        </span>
                      </div>

                      {/* Progress Bar (for IN_TESTING and COMPLETED) */}
                      {(app.status === 'IN_TESTING' || app.status === 'COMPLETED') && (
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">진행률</span>
                            <span className="text-sm font-medium text-gray-900">
                              {progress.current}/{progress.total} ({progress.percentage}%)
                            </span>
                          </div>
                          <div
                            role="progressbar"
                            aria-valuenow={progress.percentage}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            className="w-full bg-gray-200 rounded-full h-2 overflow-hidden"
                          >
                            <div
                              className="bg-blue-600 h-full transition-all duration-300"
                              style={{ width: `${progress.percentage}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Category and Date */}
                      <div className="text-sm text-gray-500">
                        <p className="mb-1">
                          {app.category.icon} {app.category.name}
                        </p>
                        <p>
                          등록일: {new Date(app.createdAt).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
        </div>
      </main>

      {/* State Info */}
      <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg p-4 shadow-lg max-w-md">
        <h4 className="font-semibold text-gray-900 mb-2">현재 상태 정보</h4>
        <pre className="text-xs text-gray-600 overflow-auto">
          {JSON.stringify(
            {
              demoState,
              activeTab,
              appsCount: apps.length,
              participationCounts: PARTICIPATION_COUNTS,
            },
            null,
            2
          )}
        </pre>
      </div>
    </div>
  )
}
