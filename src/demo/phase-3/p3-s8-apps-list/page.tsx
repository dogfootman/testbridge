// @TASK P3-S8 - Developer Apps List Demo
// @SPEC specs/screens/developer-apps.yaml

'use client'

import { useState } from 'react'

type DemoState = 'all-apps' | 'recruiting-only' | 'testing-only' | 'empty' | 'loading' | 'error'

const DEMO_STATES: Record<DemoState, any> = {
  'all-apps': {
    apps: [
      {
        id: 1,
        appName: '슈퍼 게임 앱',
        iconUrl: 'https://via.placeholder.com/48/3B82F6/FFFFFF?text=SG',
        status: 'RECRUITING',
        testStartDate: '2024-01-01T00:00:00Z',
        testEndDate: null,
        targetTesters: 20,
        createdAt: '2023-12-01T00:00:00Z',
        developerId: 1,
      },
      {
        id: 2,
        appName: '생산성 도구',
        iconUrl: 'https://via.placeholder.com/48/10B981/FFFFFF?text=PT',
        status: 'IN_TESTING',
        testStartDate: '2024-01-15T00:00:00Z',
        testEndDate: '2024-02-15T00:00:00Z',
        targetTesters: 30,
        createdAt: '2024-01-01T00:00:00Z',
        developerId: 1,
      },
      {
        id: 3,
        appName: '소셜 네트워크',
        iconUrl: 'https://via.placeholder.com/48/F59E0B/FFFFFF?text=SN',
        status: 'COMPLETED',
        testStartDate: '2023-10-01T00:00:00Z',
        testEndDate: '2023-11-01T00:00:00Z',
        targetTesters: 15,
        createdAt: '2023-09-01T00:00:00Z',
        developerId: 1,
      },
      {
        id: 4,
        appName: '쇼핑 플랫폼',
        iconUrl: 'https://via.placeholder.com/48/8B5CF6/FFFFFF?text=SP',
        status: 'PRODUCTION',
        testStartDate: '2023-08-01T00:00:00Z',
        testEndDate: '2023-09-01T00:00:00Z',
        targetTesters: 25,
        createdAt: '2023-07-01T00:00:00Z',
        developerId: 1,
      },
    ],
    participations: {
      2: { approved: 15, total: 30 },
    },
  },
  'recruiting-only': {
    apps: [
      {
        id: 1,
        appName: '슈퍼 게임 앱',
        iconUrl: 'https://via.placeholder.com/48/3B82F6/FFFFFF?text=SG',
        status: 'RECRUITING',
        testStartDate: '2024-01-01T00:00:00Z',
        testEndDate: null,
        targetTesters: 20,
        createdAt: '2023-12-01T00:00:00Z',
        developerId: 1,
      },
    ],
    participations: {},
  },
  'testing-only': {
    apps: [
      {
        id: 2,
        appName: '생산성 도구',
        iconUrl: 'https://via.placeholder.com/48/10B981/FFFFFF?text=PT',
        status: 'IN_TESTING',
        testStartDate: '2024-01-15T00:00:00Z',
        testEndDate: '2024-02-15T00:00:00Z',
        targetTesters: 30,
        createdAt: '2024-01-01T00:00:00Z',
        developerId: 1,
      },
    ],
    participations: {
      2: { approved: 15, total: 30 },
    },
  },
  'empty': {
    apps: [],
    participations: {},
  },
  'loading': null,
  'error': { error: '앱 목록을 불러오는데 실패했습니다.' },
}

export default function DemoPage() {
  const [state, setState] = useState<DemoState>('all-apps')

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Demo Controls */}
        <div className="bg-white border-2 border-blue-500 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-blue-600">🎬 P3-S8 Demo: Developer Apps List</h2>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              <strong>상태 선택:</strong> 다양한 앱 목록 상태를 시뮬레이션합니다.
            </p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(DEMO_STATES) as DemoState[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setState(s)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    state === s
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {s === 'all-apps' && '📋 전체 앱 (4개)'}
                  {s === 'recruiting-only' && '📢 모집중만'}
                  {s === 'testing-only' && '🧪 테스트중만'}
                  {s === 'empty' && '📭 빈 상태'}
                  {s === 'loading' && '⏳ 로딩'}
                  {s === 'error' && '❌ 에러'}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <strong>현재 상태:</strong> {state}
          </div>
        </div>

        {/* Simulated Component */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {state === 'loading' && (
            <div data-testid="loading-skeleton" className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          )}

          {state === 'error' && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {DEMO_STATES[state].error}
            </div>
          )}

          {state !== 'loading' && state !== 'error' && (
            <>
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">내 앱 목록</h1>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => alert('Navigate to /developer/apps/new')}
                >
                  새 앱 등록
                </button>
              </div>

              {/* Status Tabs */}
              <div className="flex gap-2 mb-6 overflow-x-auto">
                {['전체', '모집중', '테스트중', '완료', '프로덕션'].map(tab => (
                  <button
                    key={tab}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                      tab === '전체'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Search Input */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="앱 이름으로 검색"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Empty State */}
              {DEMO_STATES[state].apps.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg mb-4">등록된 앱이 없습니다.</p>
                  <p className="text-gray-400 mb-6">첫 번째 앱을 등록해보세요!</p>
                  <button
                    onClick={() => alert('Navigate to /developer/apps/new')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    새 앱 등록
                  </button>
                </div>
              )}

              {/* App Cards */}
              {DEMO_STATES[state].apps.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {DEMO_STATES[state].apps.map((app: any) => {
                    const statusConfig = {
                      RECRUITING: { label: '모집 중', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
                      IN_TESTING: { label: '테스트 중', bgColor: 'bg-orange-100', textColor: 'text-orange-700' },
                      COMPLETED: { label: '완료', bgColor: 'bg-green-100', textColor: 'text-green-700' },
                      PRODUCTION: { label: '프로덕션', bgColor: 'bg-purple-100', textColor: 'text-purple-700' },
                    }[app.status] || { label: '상태 없음', bgColor: 'bg-gray-100', textColor: 'text-gray-700' }

                    const progress = DEMO_STATES[state].participations[app.id]

                    return (
                      <div
                        key={app.id}
                        onClick={() => alert(`Navigate to /developer/apps/${app.id}`)}
                        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                      >
                        {/* App Icon & Name */}
                        <div className="flex items-center gap-4 mb-4">
                          <img
                            src={app.iconUrl}
                            alt={`${app.appName} icon`}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{app.appName}</h3>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="mb-3">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}
                          >
                            {statusConfig.label}
                          </span>
                        </div>

                        {/* Progress (IN_TESTING only) */}
                        {app.status === 'IN_TESTING' && progress && (
                          <div className="mt-3">
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>진행률</span>
                              <span>
                                {progress.approved}/{progress.total}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{
                                  width: `${(progress.approved / progress.total) * 100}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {/* Test Dates */}
                        {app.testStartDate && (
                          <div className="text-sm text-gray-500 mt-3">
                            <span>테스트 시작: {new Date(app.testStartDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* State Info */}
        <div className="mt-8 bg-gray-100 rounded-lg p-4">
          <h3 className="font-semibold mb-2">📊 현재 데모 데이터</h3>
          <pre className="text-xs overflow-auto bg-white p-3 rounded">
            {JSON.stringify(DEMO_STATES[state], null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
