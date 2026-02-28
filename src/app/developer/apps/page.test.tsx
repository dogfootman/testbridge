// @TASK P3-S8 - Developer Apps List
// @SPEC specs/screens/developer-apps.yaml
// @TEST src/app/developer/apps/page.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import DeveloperAppsPage from './page'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

// Mock getSession
jest.mock('@/lib/auth', () => ({
  getSession: jest.fn(() => Promise.resolve({
    user: { id: '1', email: 'dev@test.com', role: 'DEVELOPER' }
  })),
}))

// Mock fetch
global.fetch = jest.fn()

const mockApps = [
  {
    id: 1,
    appName: 'Test App 1',
    iconUrl: 'https://example.com/icon1.png',
    status: 'RECRUITING',
    testStartDate: '2024-01-01T00:00:00Z',
    testEndDate: null,
    targetTesters: 20,
    createdAt: '2023-12-01T00:00:00Z',
    developerId: 1,
  },
  {
    id: 2,
    appName: 'Test App 2',
    iconUrl: 'https://example.com/icon2.png',
    status: 'IN_TESTING',
    testStartDate: '2024-01-15T00:00:00Z',
    testEndDate: '2024-02-15T00:00:00Z',
    targetTesters: 30,
    createdAt: '2024-01-01T00:00:00Z',
    developerId: 1,
  },
  {
    id: 3,
    appName: 'Test App 3',
    iconUrl: 'https://example.com/icon3.png',
    status: 'COMPLETED',
    testStartDate: '2023-10-01T00:00:00Z',
    testEndDate: '2023-11-01T00:00:00Z',
    targetTesters: 15,
    createdAt: '2023-09-01T00:00:00Z',
    developerId: 1,
  },
  {
    id: 4,
    appName: 'Test App 4',
    iconUrl: 'https://example.com/icon4.png',
    status: 'PRODUCTION',
    testStartDate: '2023-08-01T00:00:00Z',
    testEndDate: '2023-09-01T00:00:00Z',
    targetTesters: 25,
    createdAt: '2023-07-01T00:00:00Z',
    developerId: 1,
  },
]

const mockParticipations = {
  '1': { approved: 8, total: 8 },
  '2': { approved: 15, total: 30 },
  '3': { approved: 15, total: 15 },
  '4': { approved: 25, total: 25 },
}

describe('P3-S8: Developer Apps List', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/apps')) {
        // Extract status filter from URL if present
        const urlObj = new URL(url, 'http://localhost')
        const status = urlObj.searchParams.get('status')

        let filteredApps = [...mockApps]
        if (status && status !== 'ALL') {
          filteredApps = mockApps.filter(app => app.status === status)
        }

        return Promise.resolve({
          ok: true,
          json: async () => ({ apps: filteredApps }),
        })
      }
      if (url.includes('/api/participations')) {
        const appId = url.match(/appId=(\d+)/)?.[1]
        if (appId && mockParticipations[appId]) {
          return Promise.resolve({
            ok: true,
            json: async () => mockParticipations[appId],
          })
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ approved: 0, total: 0 }),
        })
      }
      return Promise.reject(new Error('Unknown URL'))
    })
  })

  describe('🔴 RED: Initial Load - 전체 탭', () => {
    it('should render page title "내 앱 목록"', async () => {
      render(<DeveloperAppsPage />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /내 앱 목록/i })).toBeInTheDocument()
      })
    })

    it('should display "전체" tab as active by default', async () => {
      render(<DeveloperAppsPage />)

      await waitFor(() => {
        const allTab = screen.getByRole('button', { name: /전체/i })
        expect(allTab).toHaveAttribute('data-active', 'true')
      })
    })

    it('should display all status tabs (전체, 모집중, 테스트중, 완료, 프로덕션)', async () => {
      render(<DeveloperAppsPage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /전체/i })).toBeInTheDocument()
      })

      expect(screen.getByRole('button', { name: /모집중/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /테스트중/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /완료/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /프로덕션/i })).toBeInTheDocument()
    })

    it('should fetch apps from GET /api/apps on mount', async () => {
      render(<DeveloperAppsPage />)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/apps'),
          expect.any(Object)
        )
      })
    })

    it('should display all apps in list (최신순)', async () => {
      render(<DeveloperAppsPage />)

      await waitFor(() => {
        expect(screen.getByText('Test App 1')).toBeInTheDocument()
      })

      expect(screen.getByText('Test App 2')).toBeInTheDocument()
      expect(screen.getByText('Test App 3')).toBeInTheDocument()
      expect(screen.getByText('Test App 4')).toBeInTheDocument()
    })
  })

  describe('🔴 RED: Status Filter Tabs', () => {
    it('should filter apps by RECRUITING status when "모집중" tab clicked', async () => {
      render(<DeveloperAppsPage />)

      await waitFor(() => {
        expect(screen.getByText('Test App 1')).toBeInTheDocument()
      })

      const recruitingTab = screen.getByRole('button', { name: /모집중/i })
      fireEvent.click(recruitingTab)

      await waitFor(() => {
        expect(recruitingTab).toHaveAttribute('data-active', 'true')
      })

      // Only RECRUITING app should be visible
      expect(screen.getByText('Test App 1')).toBeInTheDocument()
      expect(screen.queryByText('Test App 2')).not.toBeInTheDocument()
      expect(screen.queryByText('Test App 3')).not.toBeInTheDocument()
      expect(screen.queryByText('Test App 4')).not.toBeInTheDocument()
    })

    it('should filter apps by IN_TESTING status when "테스트중" tab clicked', async () => {
      render(<DeveloperAppsPage />)

      await waitFor(() => {
        expect(screen.getByText('Test App 1')).toBeInTheDocument()
      })

      const testingTab = screen.getByRole('button', { name: /테스트중/i })
      fireEvent.click(testingTab)

      await waitFor(() => {
        expect(testingTab).toHaveAttribute('data-active', 'true')
      })

      // Only IN_TESTING app should be visible
      expect(screen.queryByText('Test App 1')).not.toBeInTheDocument()
      expect(screen.getByText('Test App 2')).toBeInTheDocument()
      expect(screen.queryByText('Test App 3')).not.toBeInTheDocument()
      expect(screen.queryByText('Test App 4')).not.toBeInTheDocument()
    })

    it('should filter apps by COMPLETED status when "완료" tab clicked', async () => {
      render(<DeveloperAppsPage />)

      await waitFor(() => {
        expect(screen.getByText('Test App 1')).toBeInTheDocument()
      })

      const completedTab = screen.getByRole('button', { name: /완료/i })
      fireEvent.click(completedTab)

      await waitFor(() => {
        expect(completedTab).toHaveAttribute('data-active', 'true')
      })

      // Only COMPLETED app should be visible
      expect(screen.queryByText('Test App 1')).not.toBeInTheDocument()
      expect(screen.queryByText('Test App 2')).not.toBeInTheDocument()
      expect(screen.getByText('Test App 3')).toBeInTheDocument()
      expect(screen.queryByText('Test App 4')).not.toBeInTheDocument()
    })

    it('should filter apps by PRODUCTION status when "프로덕션" tab clicked', async () => {
      render(<DeveloperAppsPage />)

      await waitFor(() => {
        expect(screen.getByText('Test App 1')).toBeInTheDocument()
      })

      const productionTab = screen.getByRole('button', { name: /프로덕션/i })
      fireEvent.click(productionTab)

      await waitFor(() => {
        expect(productionTab).toHaveAttribute('data-active', 'true')
      })

      // Only PRODUCTION app should be visible
      expect(screen.queryByText('Test App 1')).not.toBeInTheDocument()
      expect(screen.queryByText('Test App 2')).not.toBeInTheDocument()
      expect(screen.queryByText('Test App 3')).not.toBeInTheDocument()
      expect(screen.getByText('Test App 4')).toBeInTheDocument()
    })

    it('should show all apps when "전체" tab clicked after filtering', async () => {
      render(<DeveloperAppsPage />)

      await waitFor(() => {
        expect(screen.getByText('Test App 1')).toBeInTheDocument()
      })

      // Filter to RECRUITING
      const recruitingTab = screen.getByRole('button', { name: /모집중/i })
      fireEvent.click(recruitingTab)

      await waitFor(() => {
        expect(screen.queryByText('Test App 2')).not.toBeInTheDocument()
      })

      // Click "전체"
      const allTab = screen.getByRole('button', { name: /전체/i })
      fireEvent.click(allTab)

      await waitFor(() => {
        expect(screen.getByText('Test App 1')).toBeInTheDocument()
        expect(screen.getByText('Test App 2')).toBeInTheDocument()
        expect(screen.getByText('Test App 3')).toBeInTheDocument()
        expect(screen.getByText('Test App 4')).toBeInTheDocument()
      })
    })
  })

  describe('🔴 RED: Status Badges', () => {
    it('should display "모집 중" badge with blue color for RECRUITING apps', async () => {
      render(<DeveloperAppsPage />)

      await waitFor(() => {
        const badge = screen.getByTestId('status-badge-1')
        expect(badge).toHaveTextContent('모집 중')
        expect(badge).toHaveClass('bg-blue-100')
      })
    })

    it('should display "테스트 중" badge with orange color for IN_TESTING apps', async () => {
      render(<DeveloperAppsPage />)

      await waitFor(() => {
        const badge = screen.getByTestId('status-badge-2')
        expect(badge).toHaveTextContent('테스트 중')
        expect(badge).toHaveClass('bg-orange-100')
      })
    })

    it('should display "완료" badge with green color for COMPLETED apps', async () => {
      render(<DeveloperAppsPage />)

      await waitFor(() => {
        const badge = screen.getByTestId('status-badge-3')
        expect(badge).toHaveTextContent('완료')
        expect(badge).toHaveClass('bg-green-100')
      })
    })

    it('should display "프로덕션" badge with purple color for PRODUCTION apps', async () => {
      render(<DeveloperAppsPage />)

      await waitFor(() => {
        const badge = screen.getByTestId('status-badge-4')
        expect(badge).toHaveTextContent('프로덕션')
        expect(badge).toHaveClass('bg-purple-100')
      })
    })
  })

  describe('🔴 RED: Progress Display (IN_TESTING only)', () => {
    it('should fetch participations for IN_TESTING apps', async () => {
      render(<DeveloperAppsPage />)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/participations'),
          expect.any(Object)
        )
      })
    })

    it('should display progress "15/30 (50%)" for IN_TESTING app', async () => {
      render(<DeveloperAppsPage />)

      await waitFor(() => {
        expect(screen.getByTestId('progress-2')).toHaveTextContent('15/30')
      })
    })

    it('should not display progress for RECRUITING apps', async () => {
      render(<DeveloperAppsPage />)

      await waitFor(() => {
        expect(screen.getByText('Test App 1')).toBeInTheDocument()
      })

      expect(screen.queryByTestId('progress-1')).not.toBeInTheDocument()
    })
  })

  describe('🔴 RED: Search Functionality', () => {
    it('should render search input field', async () => {
      render(<DeveloperAppsPage />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/앱 이름으로 검색/i)).toBeInTheDocument()
      })
    })

    it('should filter apps by search query', async () => {
      render(<DeveloperAppsPage />)

      await waitFor(() => {
        expect(screen.getByText('Test App 1')).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText(/앱 이름으로 검색/i)
      fireEvent.change(searchInput, { target: { value: 'Test App 2' } })

      await waitFor(() => {
        expect(screen.getByText('Test App 2')).toBeInTheDocument()
        expect(screen.queryByText('Test App 1')).not.toBeInTheDocument()
        expect(screen.queryByText('Test App 3')).not.toBeInTheDocument()
      })
    })

    it('should show "검색 결과가 없습니다" when no match found', async () => {
      render(<DeveloperAppsPage />)

      await waitFor(() => {
        expect(screen.getByText('Test App 1')).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText(/앱 이름으로 검색/i)
      fireEvent.change(searchInput, { target: { value: 'Nonexistent App' } })

      await waitFor(() => {
        expect(screen.getByText(/검색 결과가 없습니다/i)).toBeInTheDocument()
      })
    })
  })

  describe('🔴 RED: Empty State', () => {
    it('should display empty state when no apps exist', async () => {
      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/apps')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ apps: [] }),
          })
        }
        return Promise.reject(new Error('Unknown URL'))
      })

      render(<DeveloperAppsPage />)

      await waitFor(() => {
        expect(screen.getByText(/등록된 앱이 없습니다/i)).toBeInTheDocument()
      })

      expect(screen.getByText(/첫 번째 앱을 등록해보세요/i)).toBeInTheDocument()
    })

    it('should highlight "새 앱 등록" button in empty state', async () => {
      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/apps')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ apps: [] }),
          })
        }
        return Promise.reject(new Error('Unknown URL'))
      })

      render(<DeveloperAppsPage />)

      await waitFor(() => {
        const newAppButtons = screen.getAllByRole('button', { name: /새 앱 등록/i })
        expect(newAppButtons.length).toBeGreaterThan(0)
        expect(newAppButtons[0]).toBeInTheDocument()
      })
    })
  })

  describe('🔴 RED: "새 앱 등록" Button', () => {
    it('should display "새 앱 등록" button in top-right', async () => {
      render(<DeveloperAppsPage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /새 앱 등록/i })).toBeInTheDocument()
      })
    })

    it('should navigate to /developer/apps/new when clicked', async () => {
      const mockPush = jest.fn()
      jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({
        push: mockPush,
      })

      render(<DeveloperAppsPage />)

      await waitFor(() => {
        const newAppButton = screen.getByRole('button', { name: /새 앱 등록/i })
        fireEvent.click(newAppButton)
      })

      expect(mockPush).toHaveBeenCalledWith('/developer/apps/new')
    })
  })

  describe('🔴 RED: App Card Click', () => {
    it('should navigate to /developer/apps/:id when app card clicked', async () => {
      const mockPush = jest.fn()
      jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({
        push: mockPush,
      })

      render(<DeveloperAppsPage />)

      await waitFor(() => {
        const appCard = screen.getByTestId('app-card-1')
        fireEvent.click(appCard)
      })

      expect(mockPush).toHaveBeenCalledWith('/developer/apps/1')
    })
  })

  describe('🔴 RED: Loading State', () => {
    it('should display loading skeleton while fetching apps', async () => {
      ;(global.fetch as jest.Mock).mockImplementation(() => {
        return new Promise(() => {}) // Never resolves
      })

      render(<DeveloperAppsPage />)

      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()
    })
  })

  describe('🔴 RED: Error Handling', () => {
    it('should display error message when API fails', async () => {
      ;(global.fetch as jest.Mock).mockImplementation(() => {
        return Promise.resolve({
          ok: false,
          json: async () => ({ error: 'Failed to fetch apps' }),
        })
      })

      render(<DeveloperAppsPage />)

      await waitFor(() => {
        expect(screen.getByText(/앱 목록을 불러오는데 실패했습니다/i)).toBeInTheDocument()
      })
    })
  })
})
