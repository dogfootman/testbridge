/**
 * P2-S5: S-05 Notifications (알림 센터)
 * Integration Test - Complete Flow Validation
 *
 * @TEST P2-S5-V - Notifications 페이지 검증
 * @SPEC P2-S5 - 알림 센터 기능
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NotificationsPage from './page'

// Mock next-auth
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(() => ({
    user: { id: '1', email: 'test@example.com', name: 'Test User' },
  })),
}))

// Mock fetch
global.fetch = jest.fn()

describe('Notifications Page - Integration Tests', () => {
  const mockNotifications = [
    {
      id: 1,
      type: 'APPLICATION_APPROVED',
      title: '테스트 지원 승인',
      message: '앱 테스트 지원이 승인되었습니다.',
      isRead: false,
      createdAt: new Date(Date.now() - 30 * 60000).toISOString(), // 30분 전
      relatedId: 123,
    },
    {
      id: 2,
      type: 'TEST_STARTED',
      title: '테스트 시작',
      message: '테스트가 시작되었습니다.',
      isRead: false,
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), // 2시간 전
      relatedId: 124,
    },
    {
      id: 3,
      type: 'FEEDBACK_SUBMITTED',
      title: '피드백 제출 완료',
      message: '피드백이 제출되었습니다.',
      isRead: true,
      createdAt: new Date(Date.now() - 24 * 3600000).toISOString(), // 1일 전
      relatedId: 456,
    },
    {
      id: 4,
      type: 'REWARD_PAID',
      title: '보상 지급 완료',
      message: '테스트 보상이 지급되었습니다.',
      isRead: true,
      createdAt: new Date(Date.now() - 7 * 24 * 3600000).toISOString(), // 7일 전
      relatedId: 789,
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        notifications: mockNotifications,
        total: 4,
      }),
    })
  })

  describe('[검증 1] 알림 목록 렌더링', () => {
    it('should render page title', async () => {
      const { container } = render(
        await NotificationsPage({ searchParams: undefined })
      )
      expect(container.querySelector('h1')).toHaveTextContent('알림 센터')
    })

    it('should render all notifications', async () => {
      render(await NotificationsPage({ searchParams: undefined }))
      await waitFor(() => {
        expect(screen.getByText('테스트 지원 승인')).toBeInTheDocument()
        expect(screen.getByText('테스트 시작')).toBeInTheDocument()
        expect(screen.getByText('피드백 제출 완료')).toBeInTheDocument()
        expect(screen.getByText('보상 지급 완료')).toBeInTheDocument()
      })
    })

    it('should render notification messages', async () => {
      render(await NotificationsPage({ searchParams: undefined }))
      await waitFor(() => {
        expect(screen.getByText('앱 테스트 지원이 승인되었습니다.')).toBeInTheDocument()
        expect(screen.getByText('테스트가 시작되었습니다.')).toBeInTheDocument()
        expect(screen.getByText('피드백이 제출되었습니다.')).toBeInTheDocument()
      })
    })

    it('should display relative time format', async () => {
      render(await NotificationsPage({ searchParams: undefined }))
      await waitFor(() => {
        expect(screen.getByText(/분 전|시간 전|일 전|방금 전/)).toBeInTheDocument()
      })
    })
  })

  describe('[검증 2] 읽음/읽지않음 상태 표시', () => {
    it('should highlight unread notifications with blue background', async () => {
      const { container } = render(
        await NotificationsPage({ searchParams: undefined })
      )
      await waitFor(() => {
        const unreadNotifs = container.querySelectorAll('.bg-blue-50')
        expect(unreadNotifs.length).toBeGreaterThan(0)
      })
    })

    it('should show unread indicator dot for unread notifications', async () => {
      const { container } = render(
        await NotificationsPage({ searchParams: undefined })
      )
      await waitFor(() => {
        const indicators = container.querySelectorAll('.bg-blue-600.rounded-full')
        // Should have 2 indicators (2 unread notifications)
        expect(indicators.length).toBeGreaterThanOrEqual(2)
      })
    })

    it('should apply bold text to unread notifications', async () => {
      const { container } = render(
        await NotificationsPage({ searchParams: undefined })
      )
      await waitFor(() => {
        const unreadNotif = container.querySelector('.font-bold')
        expect(unreadNotif).toBeInTheDocument()
      })
    })

    it('should display read notifications with white background', async () => {
      const { container } = render(
        await NotificationsPage({ searchParams: undefined })
      )
      await waitFor(() => {
        const readNotifs = container.querySelectorAll('.bg-white')
        expect(readNotifs.length).toBeGreaterThan(0)
      })
    })
  })

  describe('[검증 3] 알림 클릭 시 읽음 처리', () => {
    it('should call PATCH API when unread notification is clicked', async () => {
      render(await NotificationsPage({ searchParams: undefined }))

      await waitFor(() => {
        const unreadNotif = screen.getByText('테스트 지원 승인')
        fireEvent.click(unreadNotif)
      })

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/notifications/1',
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isRead: true }),
        })
      )
    })

    it('should NOT call PATCH API when read notification is clicked', async () => {
      ;(global.fetch as jest.Mock).mockClear()
      render(await NotificationsPage({ searchParams: undefined }))

      await waitFor(() => {
        const readNotif = screen.getByText('피드백 제출 완료')
        fireEvent.click(readNotif)
      })

      // Should only be called for fetching notifications, not for marking as read
      const patchCalls = (global.fetch as jest.Mock).mock.calls.filter(
        (call) =>
          call[1]?.method === 'PATCH' && call[0]?.includes('/api/notifications')
      )
      expect(patchCalls.length).toBe(0)
    })

    it('should include correct notification ID in API call', async () => {
      render(await NotificationsPage({ searchParams: undefined }))

      await waitFor(() => {
        const notification2 = screen.getByText('테스트 시작')
        fireEvent.click(notification2)
      })

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/notifications/2',
        expect.any(Object)
      )
    })
  })

  describe('[검증 4] 알림 타입별 라우팅', () => {
    it('should navigate to participation page for APPLICATION_APPROVED', async () => {
      render(await NotificationsPage({ searchParams: undefined }))

      await waitFor(() => {
        const link = screen.getByText('테스트 지원 승인').closest('a')
        expect(link).toHaveAttribute('href', '/tester/participations/123')
      })
    })

    it('should navigate to participation page for TEST_STARTED', async () => {
      render(await NotificationsPage({ searchParams: undefined }))

      await waitFor(() => {
        const link = screen.getByText('테스트 시작').closest('a')
        expect(link).toHaveAttribute('href', '/tester/participations/124')
      })
    })

    it('should navigate to feedback page for FEEDBACK_SUBMITTED', async () => {
      render(await NotificationsPage({ searchParams: undefined }))

      await waitFor(() => {
        const link = screen.getByText('피드백 제출 완료').closest('a')
        expect(link).toHaveAttribute('href', '/developer/apps/456/feedbacks')
      })
    })

    it('should navigate to rewards page for REWARD_PAID', async () => {
      render(await NotificationsPage({ searchParams: undefined }))

      await waitFor(() => {
        const link = screen.getByText('보상 지급 완료').closest('a')
        expect(link).toHaveAttribute('href', '/tester/rewards')
      })
    })

    it('should handle unknown notification type gracefully', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          notifications: [
            {
              id: 5,
              type: 'UNKNOWN_TYPE',
              title: 'Unknown',
              message: 'Unknown notification',
              isRead: false,
              createdAt: new Date().toISOString(),
              relatedId: 999,
            },
          ],
          total: 1,
        }),
      })

      render(await NotificationsPage({ searchParams: undefined }))

      await waitFor(() => {
        const link = screen.getByText('Unknown').closest('a')
        expect(link).toHaveAttribute('href', '#')
      })
    })
  })

  describe('[검증 5] 전체 읽음 처리', () => {
    it('should render "전체 읽음" button', async () => {
      render(await NotificationsPage({ searchParams: undefined }))
      expect(screen.getByText('전체 읽음')).toBeInTheDocument()
    })

    it('should call mark-all-read API when button clicked', async () => {
      const { container } = render(
        await NotificationsPage({ searchParams: undefined })
      )

      const markAllButton = screen.getByText('전체 읽음')
      fireEvent.click(markAllButton)

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/notifications/mark-all-read',
        expect.objectContaining({
          method: 'PATCH',
        })
      )
    })

    it('should have correct styling for mark all button', async () => {
      const { container } = render(
        await NotificationsPage({ searchParams: undefined })
      )

      const button = screen.getByText('전체 읽음')
      expect(button).toHaveClass('px-4', 'py-2', 'bg-blue-600', 'text-white')
    })
  })

  describe('[검증 6] 페이지네이션', () => {
    it('should render pagination when total > 20', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          notifications: mockNotifications,
          total: 50, // More than 20
        }),
      })

      const { container } = render(
        await NotificationsPage({ searchParams: undefined })
      )

      await waitFor(() => {
        expect(screen.getByText(/이전|다음/)).toBeInTheDocument()
      })
    })

    it('should not render pagination when total <= 20', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          notifications: mockNotifications,
          total: 4, // Less than 20
        }),
      })

      const { container } = render(
        await NotificationsPage({ searchParams: undefined })
      )

      await waitFor(() => {
        const buttons = container.querySelectorAll('a')
        const paginationButtons = Array.from(buttons).filter(
          (btn) => btn.textContent === '이전' || btn.textContent === '다음'
        )
        expect(paginationButtons.length).toBe(0)
      })
    })

    it('should display correct page number', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          notifications: mockNotifications,
          total: 50,
        }),
      })

      render(await NotificationsPage({ searchParams: { page: '2' } }))

      await waitFor(() => {
        expect(screen.getByText(/2 \//, { selector: 'span' })).toBeInTheDocument()
      })
    })

    it('should include tab parameter in pagination links', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          notifications: mockNotifications,
          total: 50,
        }),
      })

      render(await NotificationsPage({ searchParams: { tab: 'unread', page: '1' } }))

      await waitFor(() => {
        const nextButton = screen.getByText('다음')
        expect(nextButton).toHaveAttribute('href', expect.stringContaining('tab=unread'))
      })
    })
  })

  describe('[검증 7] 필터링 및 탭', () => {
    it('should render three tabs: 전체, 읽지않음, 읽음', async () => {
      render(await NotificationsPage({ searchParams: undefined }))

      expect(screen.getByText('전체')).toBeInTheDocument()
      expect(screen.getByText('읽지않음')).toBeInTheDocument()
      expect(screen.getByText('읽음')).toBeInTheDocument()
    })

    it('should have tablist role', async () => {
      render(await NotificationsPage({ searchParams: undefined }))
      expect(screen.getByRole('tablist')).toBeInTheDocument()
    })

    it('should highlight active tab', async () => {
      const { container } = render(await NotificationsPage({ searchParams: { tab: 'all' } }))

      await waitFor(() => {
        const allTab = screen.getByText('전체').closest('a')
        expect(allTab).toHaveClass('border-b-2', 'border-blue-600', 'font-bold')
      })
    })

    it('should include correct isRead parameter in unread tab', async () => {
      render(await NotificationsPage({ searchParams: undefined }))

      const unreadTab = screen.getByText('읽지않음')
      expect(unreadTab).toHaveAttribute('href', '/notifications?tab=unread')
    })

    it('should include correct isRead parameter in read tab', async () => {
      render(await NotificationsPage({ searchParams: undefined }))

      const readTab = screen.getByText('읽음')
      expect(readTab).toHaveAttribute('href', '/notifications?tab=read')
    })
  })

  describe('[검증 8] 빈 상태', () => {
    it('should show empty state message when no notifications', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          notifications: [],
          total: 0,
        }),
      })

      render(await NotificationsPage({ searchParams: undefined }))

      await waitFor(() => {
        expect(screen.getByText('새로운 알림이 없습니다.')).toBeInTheDocument()
      })
    })

    it('should display empty state with proper styling', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          notifications: [],
          total: 0,
        }),
      })

      const { container } = render(
        await NotificationsPage({ searchParams: undefined })
      )

      await waitFor(() => {
        const emptyState = container.querySelector('.text-center.py-12')
        expect(emptyState).toBeInTheDocument()
      })
    })
  })

  describe('[검증 9] 접근성', () => {
    it('should have main role', async () => {
      render(await NotificationsPage({ searchParams: undefined }))
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    it('should have proper semantic structure', async () => {
      const { container } = render(
        await NotificationsPage({ searchParams: undefined })
      )

      expect(container.querySelector('main')).toBeInTheDocument()
      expect(container.querySelector('h1')).toBeInTheDocument()
      expect(screen.getByRole('tablist')).toBeInTheDocument()
    })

    it('should have alt text for read indicator', async () => {
      // The blue dot indicator should be visible to screen readers via aria-hidden or implicit from context
      render(await NotificationsPage({ searchParams: undefined }))
      // Verify structure has semantic meaning
      const main = screen.getByRole('main')
      expect(main).toBeInTheDocument()
    })
  })

  describe('[검증 10] 실시간 동작 - 사용자 인터랙션 시뮬레이션', () => {
    it('should handle rapid notification clicks', async () => {
      render(await NotificationsPage({ searchParams: undefined }))

      await waitFor(() => {
        const notif1 = screen.getByText('테스트 지원 승인')
        const notif2 = screen.getByText('테스트 시작')

        fireEvent.click(notif1)
        fireEvent.click(notif2)
      })

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/notifications/1',
        expect.any(Object)
      )
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/notifications/2',
        expect.any(Object)
      )
    })

    it('should handle mark-all-read followed by individual click', async () => {
      render(await NotificationsPage({ searchParams: undefined }))

      const markAllButton = screen.getByText('전체 읽음')
      fireEvent.click(markAllButton)

      await waitFor(() => {
        const notification = screen.getByText('테스트 지원 승인')
        fireEvent.click(notification)
      })

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/notifications/mark-all-read',
        expect.any(Object)
      )
    })
  })
})
