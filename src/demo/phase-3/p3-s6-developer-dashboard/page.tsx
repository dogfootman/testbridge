// @TASK P3-S6 - Developer Dashboard Demo
// @DEMO 모든 상태 (loading, empty, normal, with-data) 표시

'use client'

import { useState } from 'react'
import { AppCard } from '@/components/developer/AppCard'
import { FeedbackList } from '@/components/developer/FeedbackList'
import { SubscriptionCard, CreditsCard } from '@/components/developer/StatCard'
import { EmptyState } from '@/components/developer/EmptyState'
import Link from 'next/link'

type DemoState = 'loading' | 'empty' | 'normal' | 'with-data'

const DEMO_STATES = {
  loading: {
    apps: [],
    feedbacks: [],
    userData: { currentPlan: 'FREE', remainingApps: 1, creditBalance: 0 },
    isLoading: true,
  },
  empty: {
    apps: [],
    feedbacks: [],
    userData: { currentPlan: 'FREE', remainingApps: 1, creditBalance: 0 },
    isLoading: false,
  },
  normal: {
    apps: [
      {
        id: 1,
        appName: '쇼핑몰 앱 v1.0',
        iconUrl: null,
        status: 'RECRUITING',
        targetTesters: 20,
        testStartDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        testEndDate: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000).toISOString(),
        participations: [
          { id: 1, appId: 1, status: 'ACTIVE' },
          { id: 2, appId: 1, status: 'ACTIVE' },
          { id: 3, appId: 1, status: 'ACTIVE' },
        ],
      },
      {
        id: 2,
        appName: 'SNS 앱 베타',
        iconUrl: null,
        status: 'IN_TESTING',
        targetTesters: 15,
        testStartDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        testEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        participations: [
          { id: 4, appId: 2, status: 'ACTIVE' },
          { id: 5, appId: 2, status: 'ACTIVE' },
          { id: 6, appId: 2, status: 'ACTIVE' },
          { id: 7, appId: 2, status: 'ACTIVE' },
          { id: 8, appId: 2, status: 'ACTIVE' },
        ],
      },
    ],
    feedbacks: [
      {
        id: 1,
        appId: 1,
        tester: { nickname: '테스터김' },
        overallRating: 5,
        comment: '앱이 정말 직관적이고 사용하기 편합니다. 계속 사용하고 싶어요!',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 2,
        appId: 2,
        tester: { nickname: '이테스터' },
        overallRating: 4,
        comment: '전반적으로 좋지만 로딩 속도가 조금 느린 것 같아요.',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    userData: { currentPlan: 'PRO', remainingApps: 5, creditBalance: 10000 },
    isLoading: false,
  },
  'with-data': {
    apps: [
      {
        id: 1,
        appName: '쇼핑몰 앱 v1.0',
        iconUrl: null,
        status: 'RECRUITING',
        targetTesters: 20,
        testStartDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        testEndDate: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000).toISOString(),
        participations: [
          { id: 1, appId: 1, status: 'ACTIVE' },
          { id: 2, appId: 1, status: 'ACTIVE' },
          { id: 3, appId: 1, status: 'ACTIVE' },
          { id: 9, appId: 1, status: 'ACTIVE' },
          { id: 10, appId: 1, status: 'ACTIVE' },
          { id: 11, appId: 1, status: 'ACTIVE' },
          { id: 12, appId: 1, status: 'ACTIVE' },
          { id: 13, appId: 1, status: 'ACTIVE' },
        ],
      },
      {
        id: 2,
        appName: 'SNS 앱 베타',
        iconUrl: null,
        status: 'IN_TESTING',
        targetTesters: 15,
        testStartDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        testEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        participations: [
          { id: 4, appId: 2, status: 'ACTIVE' },
          { id: 5, appId: 2, status: 'ACTIVE' },
          { id: 6, appId: 2, status: 'ACTIVE' },
          { id: 7, appId: 2, status: 'ACTIVE' },
          { id: 8, appId: 2, status: 'ACTIVE' },
          { id: 14, appId: 2, status: 'ACTIVE' },
          { id: 15, appId: 2, status: 'ACTIVE' },
          { id: 16, appId: 2, status: 'ACTIVE' },
          { id: 17, appId: 2, status: 'ACTIVE' },
          { id: 18, appId: 2, status: 'ACTIVE' },
          { id: 19, appId: 2, status: 'ACTIVE' },
          { id: 20, appId: 2, status: 'ACTIVE' },
        ],
      },
      {
        id: 3,
        appName: '운동 트래커',
        iconUrl: null,
        status: 'IN_TESTING',
        targetTesters: 10,
        testStartDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        testEndDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        participations: [
          { id: 21, appId: 3, status: 'ACTIVE' },
          { id: 22, appId: 3, status: 'ACTIVE' },
          { id: 23, appId: 3, status: 'ACTIVE' },
          { id: 24, appId: 3, status: 'ACTIVE' },
          { id: 25, appId: 3, status: 'ACTIVE' },
          { id: 26, appId: 3, status: 'ACTIVE' },
          { id: 27, appId: 3, status: 'ACTIVE' },
        ],
      },
    ],
    feedbacks: [
      {
        id: 1,
        appId: 1,
        tester: { nickname: '테스터김' },
        overallRating: 5,
        comment: '앱이 정말 직관적이고 사용하기 편합니다. 계속 사용하고 싶어요!',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 2,
        appId: 2,
        tester: { nickname: '이테스터' },
        overallRating: 4,
        comment: '전반적으로 좋지만 로딩 속도가 조금 느린 것 같아요.',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 3,
        appId: 3,
        tester: { nickname: '박테스터' },
        overallRating: 5,
        comment: 'UI가 깔끔하고 기능이 잘 동작합니다!',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 4,
        appId: 1,
        tester: { nickname: '최테스터' },
        overallRating: 3,
        comment: '괜찮은데 일부 버그가 있어요.',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 5,
        appId: 2,
        tester: { nickname: '정테스터' },
        overallRating: 4,
        comment: '만족스럽습니다. 계속 개선되면 좋겠어요.',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    userData: { currentPlan: 'PREMIUM', remainingApps: 10, creditBalance: 50000 },
    isLoading: false,
  },
} as const

export default function DeveloperDashboardDemo() {
  const [state, setState] = useState<DemoState>('normal')
  const currentState = DEMO_STATES[state]

  return (
    <div className="min-h-screen bg-bg-primary text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Demo Controls */}
        <div className="mb-8 p-6 bg-yellow-500/10 border-2 border-yellow-500 rounded-xl">
          <h2 className="text-xl font-bold mb-4 text-yellow-400">
            🎨 데모 컨트롤러
          </h2>
          <div className="flex flex-wrap gap-3 mb-4">
            {(Object.keys(DEMO_STATES) as DemoState[]).map((s) => (
              <button
                key={s}
                onClick={() => setState(s)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  state === s
                    ? 'bg-accent-neon text-black'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {s === 'loading' && '⏳ Loading'}
                {s === 'empty' && '📭 Empty'}
                {s === 'normal' && '📊 Normal'}
                {s === 'with-data' && '📈 With Data'}
              </button>
            ))}
          </div>
          <div className="text-sm text-white/60">
            <p>현재 상태: <strong className="text-accent-neon">{state}</strong></p>
            <p>앱 개수: {currentState.apps.length}</p>
            <p>피드백 개수: {currentState.feedbacks.length}</p>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">개발자 대시보드</h1>
          <Link
            href="/developer/apps/new"
            className="bg-accent-neon text-black px-6 py-3 rounded-full font-semibold hover:bg-accent-neon/90 transition-colors"
          >
            새 앱 등록
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Active Tests */}
            <section>
              <h2 className="text-xl font-semibold mb-4">진행 중인 테스트</h2>
              {currentState.apps.length === 0 ? (
                <EmptyState
                  title="진행 중인 테스트가 없습니다"
                  message="새 앱을 등록해보세요"
                  ctaText="새 앱 등록"
                  ctaHref="/developer/apps/new"
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentState.apps.map((app) => (
                    <AppCard key={app.id} {...app} />
                  ))}
                </div>
              )}
            </section>

            {/* Recent Feedbacks */}
            <section>
              <h2 className="text-xl font-semibold mb-4">최근 피드백</h2>
              <FeedbackList feedbacks={currentState.feedbacks} />
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <SubscriptionCard
              currentPlan={currentState.userData.currentPlan}
              remainingApps={currentState.userData.remainingApps}
            />
            <CreditsCard creditBalance={currentState.userData.creditBalance} />
          </div>
        </div>

        {/* State Debug Info */}
        <div className="mt-8 p-4 bg-bg-secondary border border-white/10 rounded-xl">
          <h3 className="font-semibold mb-2">📋 현재 상태 정보</h3>
          <pre className="text-xs text-white/60 overflow-auto">
            {JSON.stringify(currentState, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
