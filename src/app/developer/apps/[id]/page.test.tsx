// @TASK P3-S9 - App Detail (앱 상세/테스트 관리)
// @SPEC specs/screens/app-detail.yaml
// @TEST TDD RED/GREEN Phase

import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import AppDetailPage from './page'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useParams: () => ({ id: '1' }),
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn((key) => (key === 'tab' ? 'overview' : null)),
  }),
}))

// Mock fetch globally
global.fetch = jest.fn()

describe('AppDetailPage', () => {
  const mockApp = {
    id: 1,
    appName: 'Test App',
    packageName: 'com.test.app',
    description: 'Test description',
    status: 'IN_TESTING',
    testType: 'PAID_REWARD',
    targetTesters: 20,
    testStartDate: '2024-01-01T00:00:00.000Z',
    testEndDate: '2024-01-14T00:00:00.000Z',
    testLink: 'https://play.google.com/test',
    rewardType: 'BASIC',
    rewardAmount: 5000,
    feedbackRequired: true,
    testGuide: 'Test guide content',
    category: {
      id: 1,
      name: 'Game',
      slug: 'game',
    },
    developer: {
      id: 1,
      nickname: 'Dev User',
      profileImageUrl: null,
    },
  }

  const mockApplications = [
    {
      id: 1,
      appId: 1,
      testerId: 101,
      status: 'PENDING',
      deviceInfo: 'Samsung Galaxy S21',
      message: 'I want to test this app',
      appliedAt: '2024-01-01T10:00:00.000Z',
      tester: {
        id: 101,
        nickname: 'Tester 1',
        email: 'tester1@example.com',
      },
    },
    {
      id: 2,
      appId: 1,
      testerId: 102,
      status: 'APPROVED',
      deviceInfo: 'iPhone 14 Pro',
      message: 'Looking forward to testing',
      appliedAt: '2024-01-01T11:00:00.000Z',
      approvedAt: '2024-01-01T12:00:00.000Z',
      tester: {
        id: 102,
        nickname: 'Tester 2',
        email: 'tester2@example.com',
      },
    },
  ]

  const mockParticipations = [
    {
      id: 1,
      appId: 1,
      testerId: 102,
      status: 'ACTIVE',
      joinedAt: '2024-01-01T12:00:00.000Z',
      lastAppRunAt: '2024-01-03T10:00:00.000Z',
      tester: {
        id: 102,
        nickname: 'Tester 2',
      },
    },
  ]

  const mockFeedbacks = [
    {
      id: 1,
      appId: 1,
      testerId: 102,
      overallRating: 4.5,
      comment: 'Great app!',
      createdAt: '2024-01-05T10:00:00.000Z',
      ratings: {
        usability: 5,
        performance: 4,
        design: 4,
      },
      bugReport: null,
      tester: {
        id: 102,
        nickname: 'Tester 2',
      },
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    // Setup default fetch mock
    ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/apps/1')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockApp,
        })
      }
      if (url.includes('/api/applications')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockApplications,
        })
      }
      if (url.includes('/api/participations')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockParticipations,
        })
      }
      if (url.includes('/api/feedbacks')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockFeedbacks,
        })
      }
      return Promise.resolve({
        ok: true,
        json: async () => [],
      })
    })
  })

  describe('App Information Display', () => {
    it('renders app basic information', async () => {
      render(<AppDetailPage />)

      await waitFor(() => {
        expect(screen.getByText('Test App')).toBeInTheDocument()
      })

      expect(screen.getByText('Test description')).toBeInTheDocument()
      expect(screen.getByText('com.test.app')).toBeInTheDocument()
    })

    it('displays app status badge', async () => {
      render(<AppDetailPage />)

      await waitFor(() => {
        expect(screen.getByText('IN_TESTING')).toBeInTheDocument()
      })
    })

    it('shows D-Day countdown', async () => {
      render(<AppDetailPage />)

      await waitFor(() => {
        expect(screen.getByText(/D-/)).toBeInTheDocument()
      })
    })
  })

  describe('Tabs Navigation', () => {
    it('renders all 5 tabs', async () => {
      render(<AppDetailPage />)

      await waitFor(() => {
        expect(screen.getByText('Test App')).toBeInTheDocument()
      })

      expect(screen.getByRole('tab', { name: /현황/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /지원자/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /참여자/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /피드백/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /가이드/i })).toBeInTheDocument()
    })

    it('switches tabs when clicked', async () => {
      render(<AppDetailPage />)

      await waitFor(() => {
        expect(screen.getByText('Test App')).toBeInTheDocument()
      })

      const applicantsTab = screen.getByRole('tab', { name: /지원자/i })
      fireEvent.click(applicantsTab)

      expect(applicantsTab).toHaveAttribute('aria-selected', 'true')
    })
  })

  describe('Applicants Tab', () => {
    it('displays applicants list', async () => {
      render(<AppDetailPage />)

      await waitFor(() => {
        expect(screen.getByText('Test App')).toBeInTheDocument()
      })

      const applicantsTab = screen.getByRole('tab', { name: /지원자/i })
      fireEvent.click(applicantsTab)

      await waitFor(() => {
        expect(screen.getByText('Tester 1')).toBeInTheDocument()
      })

      expect(screen.getByText('Tester 2')).toBeInTheDocument()
      expect(screen.getByText('Samsung Galaxy S21')).toBeInTheDocument()
      expect(screen.getByText('iPhone 14 Pro')).toBeInTheDocument()
    })

    it('shows approve button for pending applications', async () => {
      render(<AppDetailPage />)

      await waitFor(() => {
        expect(screen.getByText('Test App')).toBeInTheDocument()
      })

      const applicantsTab = screen.getByRole('tab', { name: /지원자/i })
      fireEvent.click(applicantsTab)

      await waitFor(() => {
        expect(screen.getByText('Tester 1')).toBeInTheDocument()
      })

      const approveButtons = screen.getAllByRole('button', { name: /승인/i })
      expect(approveButtons.length).toBeGreaterThan(0)
    })

    it('shows reject button for pending applications', async () => {
      render(<AppDetailPage />)

      await waitFor(() => {
        expect(screen.getByText('Test App')).toBeInTheDocument()
      })

      const applicantsTab = screen.getByRole('tab', { name: /지원자/i })
      fireEvent.click(applicantsTab)

      await waitFor(() => {
        expect(screen.getByText('Tester 1')).toBeInTheDocument()
      })

      const rejectButtons = screen.getAllByRole('button', { name: /거절/i })
      expect(rejectButtons.length).toBeGreaterThan(0)
    })

    it('calls approve API when approve button clicked', async () => {
      render(<AppDetailPage />)

      await waitFor(() => {
        expect(screen.getByText('Test App')).toBeInTheDocument()
      })

      const applicantsTab = screen.getByRole('tab', { name: /지원자/i })
      fireEvent.click(applicantsTab)

      await waitFor(() => {
        expect(screen.getByText('Tester 1')).toBeInTheDocument()
      })

      const approveButton = screen.getAllByRole('button', { name: /승인/i })[0]
      fireEvent.click(approveButton)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/applications/1',
          expect.objectContaining({
            method: 'PATCH',
          })
        )
      })
    })
  })

  describe('Participants Tab', () => {
    it('displays participants list', async () => {
      render(<AppDetailPage />)

      await waitFor(() => {
        expect(screen.getByText('Test App')).toBeInTheDocument()
      })

      const participantsTab = screen.getByRole('tab', { name: /참여자/i })
      fireEvent.click(participantsTab)

      await waitFor(() => {
        expect(screen.getByText('Tester 2')).toBeInTheDocument()
      })

      expect(screen.getByText('ACTIVE')).toBeInTheDocument()
    })

    it('shows last app run time', async () => {
      render(<AppDetailPage />)

      await waitFor(() => {
        expect(screen.getByText('Test App')).toBeInTheDocument()
      })

      const participantsTab = screen.getByRole('tab', { name: /참여자/i })
      fireEvent.click(participantsTab)

      await waitFor(() => {
        expect(screen.getByText(/최근 실행/i)).toBeInTheDocument()
      })
    })
  })

  describe('Feedback Tab', () => {
    it('displays feedback list', async () => {
      render(<AppDetailPage />)

      await waitFor(() => {
        expect(screen.getByText('Test App')).toBeInTheDocument()
      })

      const feedbackTab = screen.getByRole('tab', { name: /피드백/i })
      fireEvent.click(feedbackTab)

      await waitFor(() => {
        expect(screen.getByText('Great app!')).toBeInTheDocument()
      })

      expect(screen.getByText('4.5')).toBeInTheDocument()
    })
  })

  describe('Production Guide Tab', () => {
    it('displays production guide content', async () => {
      render(<AppDetailPage />)

      await waitFor(() => {
        expect(screen.getByText('Test App')).toBeInTheDocument()
      })

      const guideTab = screen.getByRole('tab', { name: /가이드/i })
      fireEvent.click(guideTab)

      await waitFor(() => {
        expect(screen.getByText(/체크리스트/i)).toBeInTheDocument()
      })
    })

    it('shows production confirmation button', async () => {
      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/apps/1')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ ...mockApp, status: 'COMPLETED' }),
          })
        }
        if (url.includes('/api/participations')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockParticipations,
          })
        }
        return Promise.resolve({
          ok: true,
          json: async () => [],
        })
      })

      render(<AppDetailPage />)

      await waitFor(() => {
        expect(screen.getByText('Test App')).toBeInTheDocument()
      })

      const guideTab = screen.getByRole('tab', { name: /가이드/i })
      fireEvent.click(guideTab)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /프로덕션 확인/i })).toBeInTheDocument()
      })
    })

    it('validates targetTesters before production confirmation', async () => {
      // Create participations with only 10 members (< 14 required)
      const insufficientParticipations = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        appId: 1,
        testerId: 100 + i,
        status: 'ACTIVE',
        joinedAt: '2024-01-01T12:00:00.000Z',
        lastAppRunAt: '2024-01-03T10:00:00.000Z',
        tester: {
          id: 100 + i,
          nickname: `Tester ${i + 1}`,
        },
      }))

      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/apps/1')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ ...mockApp, status: 'COMPLETED' }),
          })
        }
        if (url.includes('/api/participations')) {
          return Promise.resolve({
            ok: true,
            json: async () => insufficientParticipations,
          })
        }
        return Promise.resolve({
          ok: true,
          json: async () => [],
        })
      })

      render(<AppDetailPage />)

      await waitFor(() => {
        expect(screen.getByText('Test App')).toBeInTheDocument()
      })

      const guideTab = screen.getByRole('tab', { name: /가이드/i })
      fireEvent.click(guideTab)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /프로덕션 확인/i })).toBeInTheDocument()
      })

      const confirmButton = screen.getByRole('button', { name: /프로덕션 확인/i })
      fireEvent.click(confirmButton)

      await waitFor(() => {
        expect(screen.getByText(/최소 14명 필요/i)).toBeInTheDocument()
      })
    })
  })

  describe('Loading States', () => {
    it('shows loading state while fetching app data', () => {
      ;(global.fetch as jest.Mock).mockImplementation(
        () =>
          new Promise(() => {
            // Never resolves
          })
      )

      render(<AppDetailPage />)

      expect(screen.getByText(/로딩/i)).toBeInTheDocument()
    })
  })

  describe('Error States', () => {
    it('shows error message when app fetch fails', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'))

      render(<AppDetailPage />)

      await waitFor(() => {
        expect(screen.getByText(/오류/i)).toBeInTheDocument()
      })
    })

    it('shows 404 when app not found', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'App not found' }),
      })

      render(<AppDetailPage />)

      await waitFor(() => {
        expect(screen.getByText(/찾을 수 없습니다/i)).toBeInTheDocument()
      })
    })
  })
})
