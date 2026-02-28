/**
 * @jest-environment @edge-runtime/jest-environment
 */

/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { PATCH } from './route'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    notification: {
      updateMany: jest.fn(),
    },
  },
}))

jest.mock('@/lib/auth', () => ({
  getSession: jest.fn(),
}))

const mockPrisma = prisma as jest.Mocked<typeof prisma>
const mockGetSession = getSession as jest.MockedFunction<typeof getSession>

describe('PATCH /api/notifications/mark-all-read', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Authentication', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/notifications/mark-all-read', {
        method: 'PATCH',
      })
      const response = await PATCH(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })
  })

  describe('Mark all as read', () => {
    beforeEach(() => {
      mockGetSession.mockResolvedValue({
        user: { id: '1', email: 'test@example.com' },
        expires: new Date().toISOString(),
      } as any)
    })

    it('should mark all user notifications as read', async () => {
      mockPrisma.notification.updateMany.mockResolvedValue({ count: 5 } as any)

      const request = new NextRequest('http://localhost:3000/api/notifications/mark-all-read', {
        method: 'PATCH',
      })
      const response = await PATCH(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith({
        where: {
          userId: 1,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      })
      expect(data.count).toBe(5)
      expect(data.message).toBe('All notifications marked as read')
    })

    it('should return count 0 when user has no unread notifications', async () => {
      mockPrisma.notification.updateMany.mockResolvedValue({ count: 0 } as any)

      const request = new NextRequest('http://localhost:3000/api/notifications/mark-all-read', {
        method: 'PATCH',
      })
      const response = await PATCH(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.count).toBe(0)
      expect(data.message).toBe('All notifications marked as read')
    })

    it('should only update unread notifications for the current user', async () => {
      mockPrisma.notification.updateMany.mockResolvedValue({ count: 3 } as any)

      const request = new NextRequest('http://localhost:3000/api/notifications/mark-all-read', {
        method: 'PATCH',
      })
      await PATCH(request)

      expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith({
        where: {
          userId: 1,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      })
    })
  })

  describe('Error handling', () => {
    beforeEach(() => {
      mockGetSession.mockResolvedValue({
        user: { id: '1', email: 'test@example.com' },
        expires: new Date().toISOString(),
      } as any)
    })

    it('should handle database errors gracefully', async () => {
      mockPrisma.notification.updateMany.mockRejectedValue(new Error('Database connection failed'))

      const request = new NextRequest('http://localhost:3000/api/notifications/mark-all-read', {
        method: 'PATCH',
      })
      const response = await PATCH(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
      expect(data.error).toBe('Failed to mark notifications as read')
    })
  })
})
