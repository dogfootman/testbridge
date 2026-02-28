/**
 * @jest-environment @edge-runtime/jest-environment
 */

/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { GET } from './route'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    notification: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}))

jest.mock('@/lib/auth', () => ({
  getSession: jest.fn(),
}))

const mockPrisma = prisma as jest.Mocked<typeof prisma>
const mockGetSession = getSession as jest.MockedFunction<typeof getSession>

describe('GET /api/notifications', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Authentication', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/notifications')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })
  })

  describe('Pagination', () => {
    beforeEach(() => {
      mockGetSession.mockResolvedValue({
        user: { id: '1', email: 'test@example.com' },
        expires: new Date().toISOString(),
      } as any)
    })

    it('should return notifications with default pagination (page=1, limit=20)', async () => {
      const mockNotifications = [
        {
          id: 1,
          userId: 1,
          type: 'SELECTED',
          title: 'Test notification',
          message: 'Test message',
          linkUrl: null,
          isRead: false,
          relatedAppId: null,
          createdAt: new Date('2024-01-01'),
        },
      ]

      mockPrisma.notification.findMany.mockResolvedValue(mockNotifications as any)
      mockPrisma.notification.count.mockResolvedValue(1)

      const request = new NextRequest('http://localhost:3000/api/notifications')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 20,
      })
      expect(data.data).toHaveLength(1)
      expect(data.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      })
    })

    it('should support custom pagination parameters', async () => {
      mockPrisma.notification.findMany.mockResolvedValue([])
      mockPrisma.notification.count.mockResolvedValue(50)

      const request = new NextRequest('http://localhost:3000/api/notifications?page=2&limit=10')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        orderBy: { createdAt: 'desc' },
        skip: 10,
        take: 10,
      })
      expect(data.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 50,
        totalPages: 5,
      })
    })

    it('should validate page parameter is positive integer', async () => {
      const request = new NextRequest('http://localhost:3000/api/notifications?page=0')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBeDefined()
    })

    it('should validate limit parameter is within bounds', async () => {
      const request = new NextRequest('http://localhost:3000/api/notifications?limit=101')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBeDefined()
    })
  })

  describe('Filtering', () => {
    beforeEach(() => {
      mockGetSession.mockResolvedValue({
        user: { id: '1', email: 'test@example.com' },
        expires: new Date().toISOString(),
      } as any)
    })

    it('should filter unread notifications when isRead=false', async () => {
      mockPrisma.notification.findMany.mockResolvedValue([])
      mockPrisma.notification.count.mockResolvedValue(0)

      const request = new NextRequest('http://localhost:3000/api/notifications?isRead=false')
      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId: 1, isRead: false },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 20,
      })
    })

    it('should filter read notifications when isRead=true', async () => {
      mockPrisma.notification.findMany.mockResolvedValue([])
      mockPrisma.notification.count.mockResolvedValue(0)

      const request = new NextRequest('http://localhost:3000/api/notifications?isRead=true')
      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId: 1, isRead: true },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 20,
      })
    })

    it('should return all notifications when isRead is not specified', async () => {
      mockPrisma.notification.findMany.mockResolvedValue([])
      mockPrisma.notification.count.mockResolvedValue(0)

      const request = new NextRequest('http://localhost:3000/api/notifications')
      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 20,
      })
    })
  })

  describe('Sorting', () => {
    beforeEach(() => {
      mockGetSession.mockResolvedValue({
        user: { id: '1', email: 'test@example.com' },
        expires: new Date().toISOString(),
      } as any)
    })

    it('should order notifications by createdAt DESC', async () => {
      const mockNotifications = [
        {
          id: 2,
          userId: 1,
          type: 'SELECTED',
          title: 'Newer notification',
          message: 'Test message',
          linkUrl: null,
          isRead: false,
          relatedAppId: null,
          createdAt: new Date('2024-01-02'),
        },
        {
          id: 1,
          userId: 1,
          type: 'SELECTED',
          title: 'Older notification',
          message: 'Test message',
          linkUrl: null,
          isRead: false,
          relatedAppId: null,
          createdAt: new Date('2024-01-01'),
        },
      ]

      mockPrisma.notification.findMany.mockResolvedValue(mockNotifications as any)
      mockPrisma.notification.count.mockResolvedValue(2)

      const request = new NextRequest('http://localhost:3000/api/notifications')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data[0].id).toBe(2)
      expect(data.data[1].id).toBe(1)
      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 20,
      })
    })
  })

  describe('Response format', () => {
    beforeEach(() => {
      mockGetSession.mockResolvedValue({
        user: { id: '1', email: 'test@example.com' },
        expires: new Date().toISOString(),
      } as any)
    })

    it('should return proper response structure with data and pagination', async () => {
      const mockNotifications = [
        {
          id: 1,
          userId: 1,
          type: 'SELECTED',
          title: 'Test notification',
          message: 'Test message',
          linkUrl: 'https://example.com',
          isRead: false,
          relatedAppId: 5,
          createdAt: new Date('2024-01-01'),
        },
      ]

      mockPrisma.notification.findMany.mockResolvedValue(mockNotifications as any)
      mockPrisma.notification.count.mockResolvedValue(1)

      const request = new NextRequest('http://localhost:3000/api/notifications')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('data')
      expect(data).toHaveProperty('pagination')
      expect(data.data[0]).toHaveProperty('id')
      expect(data.data[0]).toHaveProperty('type')
      expect(data.data[0]).toHaveProperty('title')
      expect(data.data[0]).toHaveProperty('message')
      expect(data.data[0]).toHaveProperty('linkUrl')
      expect(data.data[0]).toHaveProperty('isRead')
      expect(data.data[0]).toHaveProperty('relatedAppId')
      expect(data.data[0]).toHaveProperty('createdAt')
      expect(data.data[0]).not.toHaveProperty('userId')
    })

    it('should return empty array when user has no notifications', async () => {
      mockPrisma.notification.findMany.mockResolvedValue([])
      mockPrisma.notification.count.mockResolvedValue(0)

      const request = new NextRequest('http://localhost:3000/api/notifications')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data).toEqual([])
      expect(data.pagination.total).toBe(0)
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
      mockPrisma.notification.findMany.mockRejectedValue(new Error('Database connection failed'))

      const request = new NextRequest('http://localhost:3000/api/notifications')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
      expect(data.error).toBe('Failed to fetch notifications')
    })
  })
})
