// @TASK P3-S8 - D-03 Developer Apps 페이지 테스트
// @SPEC specs/screens/developer-apps.yaml
// @TEST TDD RED Phase - 앱 목록, 상태 필터, 진행률 검증

import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import DeveloperAppsPage from './page'

// Mocks
const mockPush = jest.fn()
const mockBack = jest.fn()
const mockForward = jest.fn()
const mockRefresh = jest.fn()
const mockReplace = jest.fn()
const mockPrefetch = jest.fn()

jest.mock('next-auth/react')
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
    forward: mockForward,
    refresh: mockRefresh,
    replace: mockReplace,
    prefetch: mockPrefetch,
  }),
}))

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>

// Mock fetch
global.fetch = jest.fn()

const mockDeveloperSession = {
  data: {
    user: {
      id: '1',
      email: 'dev@test.com',
      role: 'DEVELOPER',
      name: 'Developer',
    },
    expires: '2026-12-31',
  },
  status: 'authenticated' as const,
  update: jest.fn(),
}

const mockApps = [
  {
    id: 1,
    appName: 'Test App 1',
    packageName: 'com.test.app1',
    status: 'RECRUITING',
    targetTesters: 20,
    testStartDate: '2026-02-01T00:00:00Z',
    testEndDate: '2026-02-28T00:00:00Z',
    createdAt: '2026-01-15T00:00:00Z',
    category: { id: 1, name: 'Game', icon: '🎮' },
    developer: { id: 1, nickname: 'Developer', profileImageUrl: null },
    images: [{ type: 'ICON', url: '/icon1.png', sortOrder: 0 }],
  },
  {
    id: 2,
    appName: 'Test App 2',
    packageName: 'com.test.app2',
    status: 'IN_TESTING',
    targetTesters: 30,
    testStartDate: '2026-02-01T00:00:00Z',
    testEndDate: '2026-03-01T00:00:00Z',
    createdAt: '2026-01-20T00:00:00Z',
    category: { id: 2, name: 'Productivity', icon: '⚙️' },
    developer: { id: 1, nickname: 'Developer', profileImageUrl: null },
    images: [{ type: 'ICON', url: '/icon2.png', sortOrder: 0 }],
  },
  {
    id: 3,
    appName: 'Test App 3',
    packageName: 'com.test.app3',
    status: 'COMPLETED',
    targetTesters: 10,
    testStartDate: '2026-01-01T00:00:00Z',
    testEndDate: '2026-01-31T00:00:00Z',
    createdAt: '2025-12-15T00:00:00Z',
    category: { id: 3, name: 'Social', icon: '💬' },
    developer: { id: 1, nickname: 'Developer', profileImageUrl: null },
    images: [{ type: 'ICON', url: '/icon3.png', sortOrder: 0 }],
  },
]

const mockParticipations = {
  1: [], // RECRUITING - no participations yet
  2: [
    { appId: 2, status: 'ACTIVE' },
    { appId: 2, status: 'ACTIVE' },
    { appId: 2, status: 'ACTIVE' },
    { appId: 2, status: 'ACTIVE' },
    { appId: 2, status: 'ACTIVE' },
    { appId: 2, status: 'COMPLETED' },
    { appId: 2, status: 'COMPLETED' },
    { appId: 2, status: 'COMPLETED' },
    { appId: 2, status: 'COMPLETED' },
    { appId: 2, status: 'COMPLETED' },
    { appId: 2, status: 'COMPLETED' },
    { appId: 2, status: 'COMPLETED' },
    { appId: 2, status: 'COMPLETED' },
    { appId: 2, status: 'COMPLETED' },
    { appId: 2, status: 'COMPLETED' },
  ], // 15/30 participations
  3: Array(10).fill({ status: 'COMPLETED' }), // 10/10 completed
}

describe('DeveloperAppsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSession.mockReturnValue(mockDeveloperSession)

    // Default fetch responses
    ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/apps?')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            apps: mockApps,
            total: mockApps.length,
            page: 1,
            limit: 10,
          }),
        })
      }
      if (url.includes('/api/participations?appId=')) {
        const appId = parseInt(url.split('appId=')[1])
        return Promise.resolve({
          ok: true,
          json: async () => ({
            participations: mockParticipations[appId] || [],
            total: (mockParticipations[appId] || []).length,
          }),
        })
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      })
    })
  })

  describe('🔴 RED: 렌더링 테스트', () => {
    it('페이지 제목이 렌더링된다', async () => {
      render(<DeveloperAppsPage />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /내 앱 목록/i })).toBeInTheDocument()
      })
    })

    it('상태 필터 탭이 모두 렌더링된다', async () => {
      render(<DeveloperAppsPage />)

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /전체/i })).toBeInTheDocument()
        expect(screen.getByRole('tab', { name: /모집중/i })).toBeInTheDocument()
        expect(screen.getByRole('tab', { name: /테스트중/i })).toBeInTheDocument()
        expect(screen.getByRole('tab', { name: /완료/i })).toBeInTheDocument()
        expect(screen.getByRole('tab', { name: /프로덕션/i })).toBeInTheDocument()
      })
    })

    it('새 앱 등록 버튼이 렌더링된다', async () => {
      render(<DeveloperAppsPage />)

      await waitFor(() => {
        const newAppButton = screen.getByRole('button', { name: /새 앱 등록/i })
        expect(newAppButton).toBeInTheDocument()
      })
    })

    it('로딩 상태가 표시된다', () => {
      ;(global.fetch as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      render(<DeveloperAppsPage />)

      expect(screen.getByText(/로딩/i)).toBeInTheDocument()
    })
  })

  describe('🔴 RED: 앱 목록 렌더링 테스트', () => {
    it('모든 앱이 카드로 렌더링된다', async () => {
      render(<DeveloperAppsPage />)

      await waitFor(() => {
        expect(screen.getByText('Test App 1')).toBeInTheDocument()
        expect(screen.getByText('Test App 2')).toBeInTheDocument()
        expect(screen.getByText('Test App 3')).toBeInTheDocument()
      })
    })

    it('앱 카드에 아이콘이 렌더링된다', async () => {
      render(<DeveloperAppsPage />)

      await waitFor(() => {
        const icons = screen.getAllByRole('img', { name: /앱 아이콘/i })
        expect(icons).toHaveLength(3)
      })
    })

    it('앱 카드에 상태 배지가 렌더링된다', async () => {
      render(<DeveloperAppsPage />)

      await waitFor(() => {
        // Use getAllByText for duplicate text
        expect(screen.getByText(/모집 중/i)).toBeInTheDocument()
        expect(screen.getByText(/테스트 중/i)).toBeInTheDocument()

        // "완료" appears in both tab and badge, so use getAllByText
        const completeElements = screen.getAllByText(/^완료$/)
        expect(completeElements.length).toBeGreaterThanOrEqual(1)
      })
    })

    it('빈 상태가 올바르게 표시된다', async () => {
      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/apps?')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              apps: [],
              total: 0,
              page: 1,
              limit: 10,
            }),
          })
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({}),
        })
      })

      render(<DeveloperAppsPage />)

      await waitFor(() => {
        expect(screen.getByText(/등록된 앱이 없습니다/i)).toBeInTheDocument()
      })
    })
  })

  describe('🔴 RED: 상태 필터링 테스트', () => {
    it('전체 탭 선택 시 모든 앱이 표시된다', async () => {
      render(<DeveloperAppsPage />)

      await waitFor(() => {
        expect(screen.getByText('Test App 1')).toBeInTheDocument()
        expect(screen.getByText('Test App 2')).toBeInTheDocument()
        expect(screen.getByText('Test App 3')).toBeInTheDocument()
      })
    })

    it('모집중 탭 선택 시 RECRUITING 앱만 표시된다', async () => {
      // Use fireEvent instead of userEvent
      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/apps?') && url.includes('status=RECRUITING')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              apps: [mockApps[0]],
              total: 1,
              page: 1,
              limit: 10,
            }),
          })
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({
            apps: mockApps,
            total: mockApps.length,
            page: 1,
            limit: 10,
          }),
        })
      })

      render(<DeveloperAppsPage />)

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /모집중/i })).toBeInTheDocument()
      })

      const recruitingTab = screen.getByRole('tab', { name: /모집중/i })
      fireEvent.click(recruitingTab)

      await waitFor(() => {
        expect(screen.getByText('Test App 1')).toBeInTheDocument()
        expect(screen.queryByText('Test App 2')).not.toBeInTheDocument()
        expect(screen.queryByText('Test App 3')).not.toBeInTheDocument()
      })
    })

    it('테스트중 탭 선택 시 IN_TESTING 앱만 표시된다', async () => {
      // Use fireEvent instead of userEvent
      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/apps?') && url.includes('status=IN_TESTING')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              apps: [mockApps[1]],
              total: 1,
              page: 1,
              limit: 10,
            }),
          })
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({
            apps: mockApps,
            total: mockApps.length,
            page: 1,
            limit: 10,
          }),
        })
      })

      render(<DeveloperAppsPage />)

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /테스트중/i })).toBeInTheDocument()
      })

      const testingTab = screen.getByRole('tab', { name: /테스트중/i })
      fireEvent.click(testingTab)

      await waitFor(() => {
        expect(screen.queryByText('Test App 1')).not.toBeInTheDocument()
        expect(screen.getByText('Test App 2')).toBeInTheDocument()
        expect(screen.queryByText('Test App 3')).not.toBeInTheDocument()
      })
    })
  })

  describe('🔴 RED: 진행률 표시 테스트', () => {
    it('IN_TESTING 상태 앱의 진행률이 올바르게 계산된다', async () => {
      render(<DeveloperAppsPage />)

      await waitFor(() => {
        // 15/30 = 50%
        expect(screen.getByText(/15\/30/i)).toBeInTheDocument()
        expect(screen.getByText(/50%/i)).toBeInTheDocument()
      })
    })

    it('COMPLETED 상태 앱의 진행률이 100%로 표시된다', async () => {
      render(<DeveloperAppsPage />)

      await waitFor(() => {
        // 10/10 = 100%
        expect(screen.getByText(/10\/10/i)).toBeInTheDocument()
        expect(screen.getByText(/100%/i)).toBeInTheDocument()
      })
    })

    it('진행률 바가 시각적으로 렌더링된다', async () => {
      render(<DeveloperAppsPage />)

      await waitFor(() => {
        const progressBars = screen.getAllByRole('progressbar')
        expect(progressBars.length).toBeGreaterThan(0)
      })
    })
  })

  describe('🔴 RED: 인터랙션 테스트', () => {
    it('앱 카드 클릭 시 상세 페이지로 이동한다', async () => {
      // Use fireEvent instead of userEvent

      render(<DeveloperAppsPage />)

      await waitFor(() => {
        expect(screen.getByText('Test App 1')).toBeInTheDocument()
      })

      const appCard = screen.getByText('Test App 1').closest('article')
      expect(appCard).toBeInTheDocument()

      fireEvent.click(appCard!)

      expect(mockPush).toHaveBeenCalledWith('/developer/apps/1')
    })

    it('새 앱 등록 버튼 클릭 시 등록 페이지로 이동한다', async () => {
      // Use fireEvent instead of userEvent

      render(<DeveloperAppsPage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /새 앱 등록/i })).toBeInTheDocument()
      })

      const newAppButton = screen.getByRole('button', { name: /새 앱 등록/i })
      fireEvent.click(newAppButton)

      expect(mockPush).toHaveBeenCalledWith('/developer/apps/new')
    })
  })

  describe('🔴 RED: 접근성 테스트', () => {
    it('메인 컨텐츠가 main 태그로 마크업된다', async () => {
      const { container } = render(<DeveloperAppsPage />)

      await waitFor(() => {
        expect(container.querySelector('main')).toBeInTheDocument()
      })
    })

    it('탭 네비게이션이 적절한 ARIA 속성을 갖는다', async () => {
      render(<DeveloperAppsPage />)

      await waitFor(() => {
        const tablist = screen.getByRole('tablist')
        expect(tablist).toBeInTheDocument()
        expect(tablist).toHaveAttribute('aria-label')
      })
    })

    it('앱 카드가 article 태그로 마크업된다', async () => {
      const { container } = render(<DeveloperAppsPage />)

      await waitFor(() => {
        const articles = container.querySelectorAll('article')
        expect(articles.length).toBeGreaterThan(0)
      })
    })

    it('진행률 바에 적절한 ARIA 속성이 있다', async () => {
      render(<DeveloperAppsPage />)

      await waitFor(() => {
        const progressBars = screen.getAllByRole('progressbar')
        progressBars.forEach((bar) => {
          expect(bar).toHaveAttribute('aria-valuenow')
          expect(bar).toHaveAttribute('aria-valuemin')
          expect(bar).toHaveAttribute('aria-valuemax')
        })
      })
    })
  })

  describe('🔴 RED: 에러 처리 테스트', () => {
    it('API 에러 시 에러 메시지가 표시된다', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'))

      render(<DeveloperAppsPage />)

      await waitFor(() => {
        expect(screen.getByText(/앱 목록을 불러오는데 실패했습니다/i)).toBeInTheDocument()
      })
    })

    it('인증되지 않은 사용자는 로그인 페이지로 리다이렉트된다', async () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      })

      render(<DeveloperAppsPage />)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login?callbackUrl=/developer/apps')
      })
    })

    it('TESTER 역할 사용자는 접근이 거부된다', async () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '2',
            email: 'tester@test.com',
            role: 'TESTER',
            name: 'Tester',
          },
          expires: '2026-12-31',
        },
        status: 'authenticated',
        update: jest.fn(),
      })

      render(<DeveloperAppsPage />)

      await waitFor(() => {
        expect(screen.getByText(/개발자만 접근할 수 있습니다/i)).toBeInTheDocument()
      })
    })
  })
})
