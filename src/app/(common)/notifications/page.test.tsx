/**
 * P2-S5: S-05 Notifications (알림 센터)
 * TDD RED Phase - Test First
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import NotificationsPage from './page'

// Mock next-auth
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}))

// Mock fetch
global.fetch = jest.fn()

describe('NotificationsPage - TDD RED Phase', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        notifications: [
          {
            id: 1,
            type: 'APPLICATION_APPROVED',
            title: '테스트 지원 승인',
            message: '앱 테스트 지원이 승인되었습니다.',
            isRead: false,
            createdAt: '2026-02-28T10:00:00Z',
            relatedId: 123,
          },
          {
            id: 2,
            type: 'FEEDBACK_SUBMITTED',
            title: '피드백 제출 완료',
            message: '피드백이 제출되었습니다.',
            isRead: true,
            createdAt: '2026-02-27T15:30:00Z',
            relatedId: 456,
          },
        ],
        total: 2,
      }),
    })
  })

  describe('알림 목록 렌더링 검증', () => {
    it('should render notifications page title', async () => {
      render(await NotificationsPage({ searchParams: {} }))
      expect(screen.getByText(/알림 센터/)).toBeInTheDocument()
    })

    it('should render notification tabs', async () => {
      render(await NotificationsPage({ searchParams: {} }))
      expect(screen.getByText('전체')).toBeInTheDocument()
      expect(screen.getByText('읽지않음')).toBeInTheDocument()
      expect(screen.getByText('읽음')).toBeInTheDocument()
    })

    it('should render notification list', async () => {
      render(await NotificationsPage({ searchParams: {} }))
      await waitFor(() => {
        expect(screen.getByText('테스트 지원 승인')).toBeInTheDocument()
        expect(screen.getByText('앱 테스트 지원이 승인되었습니다.')).toBeInTheDocument()
      })
    })

    it('should render mark all read button', async () => {
      render(await NotificationsPage({ searchParams: {} }))
      expect(screen.getByText(/전체 읽음/)).toBeInTheDocument()
    })

    it('should show empty state when no notifications', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ notifications: [], total: 0 }),
      })

      render(await NotificationsPage({ searchParams: {} }))
      await waitFor(() => {
        expect(screen.getByText(/새로운 알림이 없습니다/)).toBeInTheDocument()
      })
    })
  })

  describe('읽음 처리 기능 검증', () => {
    it('should highlight unread notifications', async () => {
      render(await NotificationsPage({ searchParams: {} }))
      await waitFor(() => {
        const unreadNotif = screen.getByText('테스트 지원 승인').closest('div')
        expect(unreadNotif).toHaveClass('font-bold')
      })
    })

    it('should mark notification as read when clicked', async () => {
      render(await NotificationsPage({ searchParams: {} }))

      await waitFor(() => {
        const notification = screen.getByText('테스트 지원 승인')
        fireEvent.click(notification)
      })

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/notifications/1',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ isRead: true }),
        })
      )
    })

    it('should mark all notifications as read', async () => {
      render(await NotificationsPage({ searchParams: {} }))

      await waitFor(() => {
        const markAllReadBtn = screen.getByText(/전체 읽음/)
        fireEvent.click(markAllReadBtn)
      })

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/notifications/mark-all-read',
        expect.objectContaining({
          method: 'PATCH',
        })
      )
    })
  })

  describe('타입별 라우팅 검증', () => {
    it('should navigate to participation page on APPLICATION_APPROVED click', async () => {
      render(await NotificationsPage({ searchParams: {} }))

      await waitFor(() => {
        const notification = screen.getByText('테스트 지원 승인')
        expect(notification.closest('a')).toHaveAttribute(
          'href',
          '/tester/participations/123'
        )
      })
    })

    it('should navigate to feedback page on FEEDBACK_SUBMITTED click', async () => {
      render(await NotificationsPage({ searchParams: {} }))

      await waitFor(() => {
        const notification = screen.getByText('피드백 제출 완료')
        expect(notification.closest('a')).toHaveAttribute(
          'href',
          '/developer/apps/456/feedbacks'
        )
      })
    })
  })

  describe('필터링 기능 검증', () => {
    it('should filter unread notifications when "읽지않음" tab clicked', async () => {
      render(await NotificationsPage({ searchParams: {} }))

      await waitFor(() => {
        const unreadTab = screen.getByText('읽지않음')
        fireEvent.click(unreadTab)
      })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('isRead=false'),
        expect.any(Object)
      )
    })

    it('should filter read notifications when "읽음" tab clicked', async () => {
      render(await NotificationsPage({ searchParams: {} }))

      await waitFor(() => {
        const readTab = screen.getByText('읽음')
        fireEvent.click(readTab)
      })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('isRead=true'),
        expect.any(Object)
      )
    })

    it('should show all notifications when "전체" tab clicked', async () => {
      render(await NotificationsPage({ searchParams: {} }))

      await waitFor(() => {
        const allTab = screen.getByText('전체')
        fireEvent.click(allTab)
      })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.not.stringContaining('isRead='),
        expect.any(Object)
      )
    })
  })

  describe('접근성 검증', () => {
    it('should have proper ARIA labels', async () => {
      render(await NotificationsPage({ searchParams: {} }))
      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getByRole('tablist')).toBeInTheDocument()
    })

    it('should have semantic HTML structure', async () => {
      render(await NotificationsPage({ searchParams: {} }))
      const main = screen.getByRole('main')
      expect(main).toContainElement(screen.getByText(/알림 센터/))
    })
  })
})
