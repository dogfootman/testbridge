// @TASK P3-S6 - Developer Dashboard
// @SPEC specs/screens/developer-dashboard.yaml
// @TEST src/app/developer/page.test.tsx

import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import DeveloperDashboard from './page'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

// Mock getSession
jest.mock('@/lib/auth', () => ({
  getSession: jest.fn(() => Promise.resolve({
    user: { id: 'dev-1', email: 'dev@test.com', role: 'DEVELOPER' }
  })),
}))

// Mock fetch
global.fetch = jest.fn()

describe('P3-S6: Developer Dashboard (D-01)', () => {
  const mockApps = [
    {
      id: 1,
      appName: 'Test Game',
      iconUrl: '/icons/game.png',
      status: 'IN_TESTING',
      targetTesters: 20,
      testStartDate: '2026-02-25',
      testEndDate: '2026-03-05',
      developerId: 'dev-1',
    },
    {
      id: 2,
      appName: 'Shopping App',
      iconUrl: '/icons/shopping.png',
      status: 'RECRUITING',
      targetTesters: 15,
      testStartDate: '2026-03-01',
      testEndDate: '2026-03-10',
      developerId: 'dev-1',
    },
  ]

  const mockParticipations = {
    1: [
      { appId: 1, status: 'ACTIVE' },
      { appId: 1, status: 'ACTIVE' },
      { appId: 1, status: 'ACTIVE' },
      { appId: 1, status: 'DROPPED' },
    ],
    2: [
      { appId: 2, status: 'ACTIVE' },
      { appId: 2, status: 'ACTIVE' },
    ],
  }

  const mockFeedbacks = [
    {
      id: 1,
      appId: 1,
      tester: { name: '테스터A', avatar: '/avatars/a.png' },
      overallRating: 5,
      comment: '매우 훌륭한 게임입니다!',
      createdAt: '2026-02-28T10:00:00Z',
    },
    {
      id: 2,
      appId: 1,
      tester: { name: '테스터B', avatar: '/avatars/b.png' },
      overallRating: 4,
      comment: 'UI가 직관적이고 좋습니다.',
      createdAt: '2026-02-27T15:30:00Z',
    },
    {
      id: 3,
      appId: 2,
      tester: { name: '테스터C', avatar: '/avatars/c.png' },
      overallRating: 3,
      comment: '로딩이 조금 느립니다.',
      createdAt: '2026-02-26T09:00:00Z',
    },
  ]

  const mockSubscription = {
    userId: 'dev-1',
    planType: 'PRO',
    remainingApps: 5,
  }

  const mockDeveloperProfile = {
    userId: 'dev-1',
    credits: 1200,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/apps')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ apps: mockApps }),
        })
      }
      if (url.includes('/api/participations')) {
        const appId = url.match(/appId=(\d+)/)?.[1]
        if (appId) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ participations: mockParticipations[parseInt(appId)] || [] }),
          })
        }
      }
      if (url.includes('/api/feedbacks')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ feedbacks: mockFeedbacks }),
        })
      }
      if (url.includes('/api/subscription-plans')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockSubscription,
        })
      }
      if (url.includes('/api/developer-profiles')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockDeveloperProfile,
        })
      }
      return Promise.reject(new Error('Unknown URL'))
    })
  })

  describe('🔴 RED: Initial Render & Data Fetching', () => {
    it('should render dashboard title and "새 앱 등록" button', async () => {
      render(<DeveloperDashboard />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /개발자 대시보드/i })).toBeInTheDocument()
      })

      expect(screen.getByRole('button', { name: /새 앱 등록/i })).toBeInTheDocument()
    })

    it('should fetch apps with correct filters (status IN_TESTING or RECRUITING)', async () => {
      render(<DeveloperDashboard />)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/apps'),
          expect.any(Object)
        )
      })

      const fetchCall = (global.fetch as jest.Mock).mock.calls.find(call =>
        call[0].includes('/api/apps')
      )
      expect(fetchCall).toBeDefined()
    })

    it('should display active tests count', async () => {
      render(<DeveloperDashboard />)

      await waitFor(() => {
        expect(screen.getByText(/진행 중인 테스트 \(2\)/i)).toBeInTheDocument()
      })
    })
  })

  describe('🔴 RED: Active Tests Summary Cards', () => {
    it('should display all active test cards with app names', async () => {
      render(<DeveloperDashboard />)

      await waitFor(() => {
        expect(screen.getByText('Test Game')).toBeInTheDocument()
      })

      expect(screen.getByText('Shopping App')).toBeInTheDocument()
    })

    it('should display app icons', async () => {
      render(<DeveloperDashboard />)

      await waitFor(() => {
        const gameIcon = screen.getByAltText(/Test Game/i)
        expect(gameIcon).toBeInTheDocument()
        expect(gameIcon).toHaveAttribute('src', expect.stringContaining('game.png'))
      })
    })

    it('should calculate D-Day correctly for IN_TESTING apps', async () => {
      render(<DeveloperDashboard />)

      await waitFor(() => {
        // Test Game ends on 2026-03-05, today is 2026-02-28
        // D-5 (5 days remaining)
        expect(screen.getByText(/D-5/i)).toBeInTheDocument()
      })
    })

    it('should display "모집중" for RECRUITING apps', async () => {
      render(<DeveloperDashboard />)

      await waitFor(() => {
        expect(screen.getByText(/모집중/i)).toBeInTheDocument()
      })
    })

    it('should display participant count vs target (e.g., "3/20")', async () => {
      render(<DeveloperDashboard />)

      await waitFor(() => {
        // Test Game: 3 active participants / 20 target
        expect(screen.getByText(/3\/20/i)).toBeInTheDocument()
      })

      // Shopping App: 2 active participants / 15 target
      expect(screen.getByText(/2\/15/i)).toBeInTheDocument()
    })

    it('should display progress bar based on participation', async () => {
      render(<DeveloperDashboard />)

      await waitFor(() => {
        const progressBars = screen.getAllByRole('progressbar')
        expect(progressBars.length).toBeGreaterThan(0)
      })

      // Test Game: 3/20 = 15%
      const testGameProgress = screen.getAllByRole('progressbar')[0]
      expect(testGameProgress).toHaveAttribute('aria-valuenow', '15')
    })
  })

  describe('🔴 RED: Recent Feedbacks List', () => {
    it('should display "최근 피드백" section title', async () => {
      render(<DeveloperDashboard />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /최근 피드백/i })).toBeInTheDocument()
      })
    })

    it('should fetch and display 5 most recent feedbacks', async () => {
      render(<DeveloperDashboard />)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/feedbacks'),
          expect.any(Object)
        )
      })

      // All 3 feedbacks should be displayed
      expect(screen.getByText('테스터A')).toBeInTheDocument()
      expect(screen.getByText('테스터B')).toBeInTheDocument()
      expect(screen.getByText('테스터C')).toBeInTheDocument()
    })

    it('should display feedback ratings (stars)', async () => {
      render(<DeveloperDashboard />)

      await waitFor(() => {
        expect(screen.getByText('매우 훌륭한 게임입니다!')).toBeInTheDocument()
      })

      // Check for rating (5 stars, 4 stars, 3 stars)
      const ratings = screen.getAllByText(/★/i)
      expect(ratings.length).toBeGreaterThan(0)
    })

    it('should display feedback comments', async () => {
      render(<DeveloperDashboard />)

      await waitFor(() => {
        expect(screen.getByText('매우 훌륭한 게임입니다!')).toBeInTheDocument()
      })

      expect(screen.getByText('UI가 직관적이고 좋습니다.')).toBeInTheDocument()
      expect(screen.getByText('로딩이 조금 느립니다.')).toBeInTheDocument()
    })

    it('should display relative time for feedbacks', async () => {
      render(<DeveloperDashboard />)

      await waitFor(() => {
        // Should show relative time like "1일 전", "2일 전"
        expect(screen.getByText(/일 전/i)).toBeInTheDocument()
      })
    })
  })

  describe('🔴 RED: Subscription Card (Sidebar)', () => {
    it('should display subscription plan type', async () => {
      render(<DeveloperDashboard />)

      await waitFor(() => {
        expect(screen.getByText(/PRO/i)).toBeInTheDocument()
      })
    })

    it('should display remaining apps count', async () => {
      render(<DeveloperDashboard />)

      await waitFor(() => {
        expect(screen.getByText(/남은 등록 가능 앱/i)).toBeInTheDocument()
      })

      expect(screen.getByText('5')).toBeInTheDocument()
    })
  })

  describe('🔴 RED: Credits Card (Sidebar)', () => {
    it('should display developer credits balance', async () => {
      render(<DeveloperDashboard />)

      await waitFor(() => {
        expect(screen.getByText(/크레딧 잔액/i)).toBeInTheDocument()
      })

      expect(screen.getByText('1,200')).toBeInTheDocument()
    })

    it('should have clickable credit card for recharge', async () => {
      render(<DeveloperDashboard />)

      await waitFor(() => {
        const creditCard = screen.getByText(/크레딧 잔액/i).closest('button')
        expect(creditCard).toBeInTheDocument()
      })
    })
  })

  describe('🔴 RED: Empty State (No Active Tests)', () => {
    beforeEach(() => {
      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/apps')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ apps: [] }),
          })
        }
        if (url.includes('/api/feedbacks')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ feedbacks: [] }),
          })
        }
        if (url.includes('/api/subscription-plans')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockSubscription,
          })
        }
        if (url.includes('/api/developer-profiles')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockDeveloperProfile,
          })
        }
        return Promise.reject(new Error('Unknown URL'))
      })
    })

    it('should display empty state message when no active tests', async () => {
      render(<DeveloperDashboard />)

      await waitFor(() => {
        expect(screen.getByText(/진행 중인 테스트가 없습니다/i)).toBeInTheDocument()
      })

      expect(screen.getByText(/새 앱을 등록해보세요/i)).toBeInTheDocument()
    })

    it('should display "새 앱 등록" button in empty state', async () => {
      render(<DeveloperDashboard />)

      await waitFor(() => {
        const registerButtons = screen.getAllByRole('button', { name: /새 앱 등록/i })
        expect(registerButtons.length).toBeGreaterThan(0)
      })
    })
  })

  describe('🔴 RED: Navigation & Events', () => {
    it('should navigate to app detail when test card clicked', async () => {
      const { container } = render(<DeveloperDashboard />)

      await waitFor(() => {
        expect(screen.getByText('Test Game')).toBeInTheDocument()
      })

      const testCard = screen.getByText('Test Game').closest('a')
      expect(testCard).toHaveAttribute('href', '/developer/apps/1')
    })

    it('should navigate to app register when "새 앱 등록" clicked', async () => {
      render(<DeveloperDashboard />)

      await waitFor(() => {
        const newAppButton = screen.getByRole('button', { name: /새 앱 등록/i })
        expect(newAppButton.closest('a')).toHaveAttribute('href', '/developer/apps/new')
      })
    })
  })

  describe('🔴 RED: Loading State', () => {
    it('should display loading skeleton while fetching data', async () => {
      ;(global.fetch as jest.Mock).mockImplementation(() =>
        new Promise(resolve => setTimeout(resolve, 100))
      )

      render(<DeveloperDashboard />)

      // Should show loading state immediately
      expect(screen.getByText(/로딩 중.../i)).toBeInTheDocument()
    })
  })

  describe('🔴 RED: Error Handling', () => {
    beforeEach(() => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'))
    })

    it('should display error message when API fails', async () => {
      render(<DeveloperDashboard />)

      await waitFor(() => {
        expect(screen.getByText(/데이터를 불러오는 중 오류가 발생했습니다/i)).toBeInTheDocument()
      })
    })

    it('should have retry button on error', async () => {
      render(<DeveloperDashboard />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /다시 시도/i })).toBeInTheDocument()
      })
    })
  })

  describe('🔴 RED: Responsive Design', () => {
    it('should render sidebar on desktop', async () => {
      render(<DeveloperDashboard />)

      await waitFor(() => {
        const sidebar = screen.getByTestId('dashboard-sidebar')
        expect(sidebar).toBeInTheDocument()
      })
    })

    it('should stack cards on mobile', async () => {
      // This would require viewport mocking
      // Placeholder test for responsive layout
      render(<DeveloperDashboard />)

      await waitFor(() => {
        expect(screen.getByTestId('active-tests-grid')).toBeInTheDocument()
      })
    })
  })
})
