// @TASK T-01 - 테스터 홈 / 앱 탐색
// @SPEC specs/screens/tester-home.yaml
// @TEST TDD Phase: RED - 테스트 먼저 작성

import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useSession } from 'next-auth/react'
import TesterHome from './page'

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signOut: jest.fn(),
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}))

// Mock fetch for API calls
global.fetch = jest.fn()

describe('TesterHome - 앱 탐색', () => {
  const mockSession = {
    user: {
      id: '1',
      email: 'tester@test.com',
      name: '테스터',
      role: 'TESTER',
    },
  }

  const mockCategories = [
    { id: 1, name: '소셜', icon: '👥', sortOrder: 1 },
    { id: 2, name: '유틸리티', icon: '🔧', sortOrder: 2 },
    { id: 3, name: '게임', icon: '🎮', sortOrder: 3 },
  ]

  const mockApps = [
    {
      id: 1,
      appName: '소셜앱1',
      categoryId: 1,
      iconUrl: '/icon1.png',
      description: '소셜 네트워킹 앱',
      rewardAmount: 3000,
      rewardType: 'BASIC',
      targetTesters: 10,
      status: 'RECRUITING',
      category: { id: 1, name: '소셜', icon: '👥' },
      _count: { participations: 8 },
    },
    {
      id: 2,
      appName: '유틸리티앱1',
      categoryId: 2,
      iconUrl: '/icon2.png',
      description: '생산성 도구',
      rewardAmount: 5000,
      rewardType: 'WITH_FEEDBACK',
      targetTesters: 10,
      status: 'RECRUITING',
      category: { id: 2, name: '유틸리티', icon: '🔧' },
      _count: { participations: 3 },
    },
    {
      id: 3,
      appName: '게임앱1',
      categoryId: 3,
      iconUrl: '/icon3.png',
      description: '액션 게임',
      rewardAmount: 2000,
      rewardType: 'BASIC',
      targetTesters: 20,
      status: 'RECRUITING',
      category: { id: 3, name: '게임', icon: '🎮' },
      _count: { participations: 15 },
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useSession as jest.Mock).mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    })

    // Mock API responses
    ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/categories')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockCategories,
        })
      }
      if (url.includes('/api/apps')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ apps: mockApps }),
        })
      }
      return Promise.reject(new Error('Unknown URL'))
    })
  })

  describe('초기 로드', () => {
    test('모집 중인 앱 목록을 표시해야 함', async () => {
      render(<TesterHome />)

      await waitFor(() => {
        expect(screen.getByText('소셜앱1')).toBeInTheDocument()
      })

      expect(screen.getByText('유틸리티앱1')).toBeInTheDocument()
      expect(screen.getByText('게임앱1')).toBeInTheDocument()
    })

    test('카테고리 사이드바를 표시해야 함', async () => {
      render(<TesterHome />)

      await waitFor(() => {
        expect(screen.getByText('소셜')).toBeInTheDocument()
      })

      expect(screen.getByText('유틸리티')).toBeInTheDocument()
      expect(screen.getByText('게임')).toBeInTheDocument()
    })

    test('검색바를 표시해야 함', async () => {
      render(<TesterHome />)

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/앱 이름 또는 키워드 검색/i)
        ).toBeInTheDocument()
      })
    })

    test('앱 카드에 리워드 정보를 표시해야 함', async () => {
      render(<TesterHome />)

      await waitFor(() => {
        expect(screen.getByText(/3,000원/i)).toBeInTheDocument()
      })

      expect(screen.getByText(/5,000원/i)).toBeInTheDocument()
    })

    test('앱 카드에 남은 자리 정보를 표시해야 함', async () => {
      render(<TesterHome />)

      await waitFor(() => {
        // targetTesters - participations = 남은 자리
        expect(screen.getByText(/2명 남음/i)).toBeInTheDocument() // 10-8=2
      })

      expect(screen.getByText(/7명 남음/i)).toBeInTheDocument() // 10-3=7
    })
  })

  describe('카테고리 필터링', () => {
    test('카테고리 선택 시 해당 카테고리 앱만 표시해야 함', async () => {
      const user = userEvent.setup()
      render(<TesterHome />)

      // 초기 로드 대기
      await waitFor(() => {
        expect(screen.getByText('소셜앱1')).toBeInTheDocument()
      })

      // 유틸리티 카테고리 클릭
      const utilityButton = screen.getByRole('button', { name: /유틸리티/i })
      await user.click(utilityButton)

      // API 호출 확인
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('categoryId=2')
        )
      })
    })

    test('전체 카테고리 선택 시 모든 앱을 표시해야 함', async () => {
      const user = userEvent.setup()
      render(<TesterHome />)

      await waitFor(() => {
        expect(screen.getByText('소셜앱1')).toBeInTheDocument()
      })

      // 전체 버튼 클릭
      const allButton = screen.getByRole('button', { name: /전체/i })
      await user.click(allButton)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('status=RECRUITING')
        )
        expect(global.fetch).toHaveBeenCalledWith(
          expect.not.stringContaining('categoryId')
        )
      })
    })
  })

  describe('검색 기능', () => {
    test('검색어 입력 시 앱 이름으로 필터링해야 함', async () => {
      const user = userEvent.setup()
      render(<TesterHome />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/앱 이름 또는 키워드 검색/i)).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText(/앱 이름 또는 키워드 검색/i)
      await user.type(searchInput, '소셜')

      // Debounce 대기
      await waitFor(
        () => {
          expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('search=소셜')
          )
        },
        { timeout: 1000 }
      )
    })
  })

  describe('리워드 금액 필터링', () => {
    test('리워드 금액 범위 선택 시 필터링해야 함', async () => {
      const user = userEvent.setup()
      render(<TesterHome />)

      await waitFor(() => {
        expect(screen.getByText('소셜앱1')).toBeInTheDocument()
      })

      // 리워드 필터 선택 (5,000원 이상)
      const rewardFilter = screen.getByLabelText(/5,000원 이상/i)
      await user.click(rewardFilter)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('rewardMin=5000')
        )
      })
    })
  })

  describe('HOT 태그 표시', () => {
    test('남은 자리가 5명 미만인 경우 HOT 태그를 표시해야 함', async () => {
      const hotApp = {
        ...mockApps[1],
        targetTesters: 10,
        _count: { participations: 8 }, // 남은 자리 2명
      }

      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/categories')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockCategories,
          })
        }
        if (url.includes('/api/apps')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ apps: [hotApp] }),
          })
        }
        return Promise.reject(new Error('Unknown URL'))
      })

      render(<TesterHome />)

      await waitFor(() => {
        expect(screen.getByText('HOT')).toBeInTheDocument()
      })
    })

    test('리워드 금액이 5,000원 이상인 경우 HOT 태그를 표시해야 함', async () => {
      render(<TesterHome />)

      await waitFor(() => {
        expect(screen.getByText('유틸리티앱1')).toBeInTheDocument()
      })

      // 유틸리티앱1 카드 찾기 (리워드 5000원)
      const appCard = screen.getByText('유틸리티앱1').closest('button')
      expect(within(appCard as HTMLElement).getByText('HOT')).toBeInTheDocument()
    })
  })

  describe('앱 카드 클릭', () => {
    test('앱 카드 클릭 시 상세 페이지로 이동해야 함', async () => {
      const user = userEvent.setup()
      const mockPush = jest.fn()

      jest.spyOn(require('next/navigation'), 'useRouter').mockImplementation(() => ({
        push: mockPush,
      }))

      render(<TesterHome />)

      await waitFor(() => {
        expect(screen.getByText('소셜앱1')).toBeInTheDocument()
      })

      const appCard = screen.getByText('소셜앱1').closest('button')
      await user.click(appCard!)

      expect(mockPush).toHaveBeenCalledWith('/tester/apps/1')
    })
  })

  describe('인증 처리', () => {
    test('미인증 사용자는 로그인 페이지로 리다이렉트해야 함', () => {
      const mockPush = jest.fn()

      ;(useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'unauthenticated',
      })

      jest.spyOn(require('next/navigation'), 'useRouter').mockImplementation(() => ({
        push: mockPush,
      }))

      render(<TesterHome />)

      expect(mockPush).toHaveBeenCalledWith('/auth/login')
    })

    test('테스터가 아닌 사용자는 다른 페이지로 리다이렉트해야 함', () => {
      const mockPush = jest.fn()

      ;(useSession as jest.Mock).mockReturnValue({
        data: { ...mockSession, user: { ...mockSession.user, role: 'DEVELOPER' } },
        status: 'authenticated',
      })

      jest.spyOn(require('next/navigation'), 'useRouter').mockImplementation(() => ({
        push: mockPush,
      }))

      render(<TesterHome />)

      expect(mockPush).toHaveBeenCalledWith('/developer')
    })
  })
})
