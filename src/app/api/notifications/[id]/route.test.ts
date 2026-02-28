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
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}))

jest.mock('@/lib/auth', () => ({
  getSession: jest.fn(),
}))

const mockPrisma = prisma as jest.Mocked<typeof prisma>
const mockGetSession = getSession as jest.MockedFunction<typeof getSession>

describe('PATCH /api/notifications/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Authentication', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/notifications/1', {
        method: 'PATCH',
      })
      const response = await PATCH(request, { params: { id: '1' } })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })
  })

  describe('Authorization', () => {
    beforeEach(() => {
      mockGetSession.mockResolvedValue({
        user: { id: '1', email: 'test@example.com' },
        expires: new Date().toISOString(),
      } as any)
    })

    it('should return 404 if notification does not exist', async () => {
      mockPrisma.notification.findUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/notifications/999', {
        method: 'PATCH',
      })
      const response = await PATCH(request, { params: { id: '999' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Notification not found')
    })

    it('should return 403 if user tries to update another user\'s notification', async () => {
      mockPrisma.notification.findUnique.mockResolvedValue({
        id: 1,
        userId: 2, // Different user
        type: 'SELECTED',
        title: 'Test',
        message: 'Test',
        linkUrl: null,
        isRead: false,
        relatedAppId: null,
        createdAt: new Date(),
      } as any)

      const request = new NextRequest('http://localhost:3000/api/notifications/1', {
        method: 'PATCH',
      })
      const response = await PATCH(request, { params: { id: '1' } })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Forbidden')
    })
  })

  describe('Mark as read', () => {
    beforeEach(() => {
      mockGetSession.mockResolvedValue({
        user: { id: '1', email: 'test@example.com' },
        expires: new Date().toISOString(),
      } as any)
    })

    it('should mark notification as read', async () => {
      const mockNotification = {
        id: 1,
        userId: 1,
        type: 'SELECTED',
        title: 'Test notification',
        message: 'Test message',
        linkUrl: null,
        isRead: false,
        relatedAppId: null,
        createdAt: new Date(),
      }

      mockPrisma.notification.findUnique.mockResolvedValue(mockNotification as any)
      mockPrisma.notification.update.mockResolvedValue({
        ...mockNotification,
        isRead: true,
      } as any)

      const request = new NextRequest('http://localhost:3000/api/notifications/1', {
        method: 'PATCH',
      })
      const response = await PATCH(request, { params: { id: '1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(mockPrisma.notification.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isRead: true },
      })
      expect(data.isRead).toBe(true)
    })

    it('should handle already read notification', async () => {
      const mockNotification = {
        id: 1,
        userId: 1,
        type: 'SELECTED',
        title: 'Test notification',
        message: 'Test message',
        linkUrl: null,
        isRead: true,
        relatedAppId: null,
        createdAt: new Date(),
      }

      mockPrisma.notification.findUnique.mockResolvedValue(mockNotification as any)
      mockPrisma.notification.update.mockResolvedValue(mockNotification as any)

      const request = new NextRequest('http://localhost:3000/api/notifications/1', {
        method: 'PATCH',
      })
      const response = await PATCH(request, { params: { id: '1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.isRead).toBe(true)
    })
  })

  describe('Validation', () => {
    beforeEach(() => {
      mockGetSession.mockResolvedValue({
        user: { id: '1', email: 'test@example.com' },
        expires: new Date().toISOString(),
      } as any)
    })

    it('should validate notification ID is a number', async () => {
      const request = new NextRequest('http://localhost:3000/api/notifications/invalid', {
        method: 'PATCH',
      })
      const response = await PATCH(request, { params: { id: 'invalid' } })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBeDefined()
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
      mockPrisma.notification.findUnique.mockRejectedValue(new Error('Database connection failed'))

      const request = new NextRequest('http://localhost:3000/api/notifications/1', {
        method: 'PATCH',
      })
      const response = await PATCH(request, { params: { id: '1' } })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
      expect(data.error).toBe('Failed to update notification')
    })
  })
})
