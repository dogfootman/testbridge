/**
 * @jest-environment @edge-runtime/jest-environment
 */

import { NextRequest } from 'next/server'
import { GET, resetCategoryCache } from './route'
import { prisma } from '@/lib/prisma'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    category: {
      findMany: jest.fn(),
    },
  },
}))

const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('GET /api/categories', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    resetCategoryCache()
  })

  it('should return all active categories sorted by sortOrder', async () => {
    const mockCategories = [
      {
        id: 1,
        name: 'Games',
        icon: '🎮',
        sortOrder: 1,
      },
      {
        id: 2,
        name: 'Productivity',
        icon: '📝',
        sortOrder: 2,
      },
      {
        id: 3,
        name: 'Social',
        icon: '💬',
        sortOrder: 3,
      },
    ]

    mockPrisma.category.findMany.mockResolvedValue(mockCategories as any)

    const request = new NextRequest('http://localhost:3000/api/categories')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        icon: true,
        sortOrder: true,
      },
    })
    expect(data).toHaveLength(3)
    expect(data[0]).toEqual({
      id: 1,
      name: 'Games',
      icon: '🎮',
      sortOrder: 1,
    })
  })

  it('should return proper response format with id, name, icon, sortOrder', async () => {
    const mockCategories = [
      {
        id: 1,
        name: 'Games',
        icon: '🎮',
        sortOrder: 1,
      },
    ]

    mockPrisma.category.findMany.mockResolvedValue(mockCategories as any)

    const request = new NextRequest('http://localhost:3000/api/categories')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data[0]).toHaveProperty('id')
    expect(data[0]).toHaveProperty('name')
    expect(data[0]).toHaveProperty('icon')
    expect(data[0]).toHaveProperty('sortOrder')
    expect(data[0]).not.toHaveProperty('isActive')
    expect(data[0]).not.toHaveProperty('createdAt')
    expect(data[0]).not.toHaveProperty('updatedAt')
  })

  it('should return empty array when no active categories exist', async () => {
    mockPrisma.category.findMany.mockResolvedValue([])

    const request = new NextRequest('http://localhost:3000/api/categories')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual([])
  })

  it('should handle database errors gracefully', async () => {
    mockPrisma.category.findMany.mockRejectedValue(new Error('Database connection failed'))

    const request = new NextRequest('http://localhost:3000/api/categories')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toHaveProperty('error')
    expect(data.error).toBe('Failed to fetch categories')
  })

  it('should return cached data on subsequent requests', async () => {
    const mockCategories = [
      {
        id: 1,
        name: 'Games',
        icon: '🎮',
        sortOrder: 1,
      },
    ]

    mockPrisma.category.findMany.mockResolvedValue(mockCategories as any)

    // First request - should hit database
    const request1 = new NextRequest('http://localhost:3000/api/categories')
    const response1 = await GET(request1)
    const data1 = await response1.json()

    expect(mockPrisma.category.findMany).toHaveBeenCalledTimes(1)
    expect(response1.headers.get('X-Cache')).toBe('MISS')
    expect(data1).toEqual(mockCategories)

    // Second request - should use cache
    const request2 = new NextRequest('http://localhost:3000/api/categories')
    const response2 = await GET(request2)
    const data2 = await response2.json()

    // Database should still only be called once
    expect(mockPrisma.category.findMany).toHaveBeenCalledTimes(1)
    expect(response2.headers.get('X-Cache')).toBe('HIT')
    expect(data2).toEqual(mockCategories)
  })

  it('should include Cache-Control header', async () => {
    const mockCategories = [
      {
        id: 1,
        name: 'Games',
        icon: '🎮',
        sortOrder: 1,
      },
    ]

    mockPrisma.category.findMany.mockResolvedValue(mockCategories as any)

    const request = new NextRequest('http://localhost:3000/api/categories')
    const response = await GET(request)

    expect(response.headers.get('Cache-Control')).toBe('public, max-age=300')
  })
})
