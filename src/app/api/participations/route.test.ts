/**
 * @jest-environment node
 */

/**
 * @jest-environment node
 */
// @TASK P3-R6 - Participations Resource API Tests
// @SPEC TDD RED Phase: GET /api/participations

import { NextRequest } from 'next/server'
import { GET } from './route'
import { MockNextRequest } from '@/tests/utils/mockRequest'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Mock dependencies
jest.mock('@/lib/auth')
jest.mock('@/lib/prisma', () => ({
  prisma: {
    participation: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}))

const mockGetSession = getSession as jest.MockedFunction<typeof getSession>
const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('GET /api/participations', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    mockGetSession.mockResolvedValue(null)

    const request = new MockNextRequest('http://localhost:3000/api/participations')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return participations list with pagination', async () => {
    const mockParticipations = [
      {
        id: 1,
        appId: 1,
        testerId: 1,
        applicationId: 1,
        status: 'ACTIVE',
        rewardStatus: 'NONE',
        skipReason: null,
        lastAppRunAt: null,
        joinedAt: new Date('2024-01-01'),
        droppedAt: null,
        dropReason: null,
        completedAt: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        app: {
          id: 1,
          appName: 'Test App 1',
          packageName: 'com.test.app1',
          status: 'IN_TESTING',
        },
        tester: {
          id: 1,
          nickname: 'tester1',
          profileImageUrl: null,
        },
        application: {
          id: 1,
          status: 'APPROVED',
          appliedAt: new Date('2024-01-01'),
        },
      },
      {
        id: 2,
        appId: 2,
        testerId: 1,
        applicationId: 2,
        status: 'COMPLETED',
        rewardStatus: 'PAID',
        skipReason: null,
        lastAppRunAt: new Date('2024-01-05'),
        joinedAt: new Date('2024-01-02'),
        droppedAt: null,
        dropReason: null,
        completedAt: new Date('2024-01-10'),
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-10'),
        app: {
          id: 2,
          appName: 'Test App 2',
          packageName: 'com.test.app2',
          status: 'COMPLETED',
        },
        tester: {
          id: 1,
          nickname: 'tester1',
          profileImageUrl: null,
        },
        application: {
          id: 2,
          status: 'APPROVED',
          appliedAt: new Date('2024-01-02'),
        },
      },
    ]

    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })
    mockPrisma.participation.findMany.mockResolvedValue(mockParticipations)
    mockPrisma.participation.count.mockResolvedValue(2)

    const request = new MockNextRequest('http://localhost:3000/api/participations?page=1&limit=10')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('participations')
    expect(data).toHaveProperty('total', 2)
    expect(data).toHaveProperty('page', 1)
    expect(data).toHaveProperty('limit', 10)
    expect(data.participations).toHaveLength(2)
  })

  it('should filter participations by userId', async () => {
    const mockParticipations = [
      {
        id: 1,
        appId: 1,
        testerId: 1,
        applicationId: 1,
        status: 'ACTIVE',
        rewardStatus: 'NONE',
        skipReason: null,
        lastAppRunAt: null,
        joinedAt: new Date('2024-01-01'),
        droppedAt: null,
        dropReason: null,
        completedAt: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        app: {
          id: 1,
          appName: 'Test App 1',
          packageName: 'com.test.app1',
          status: 'IN_TESTING',
        },
        tester: {
          id: 1,
          nickname: 'tester1',
          profileImageUrl: null,
        },
        application: {
          id: 1,
          status: 'APPROVED',
          appliedAt: new Date('2024-01-01'),
        },
      },
    ]

    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })
    mockPrisma.participation.findMany.mockResolvedValue(mockParticipations)
    mockPrisma.participation.count.mockResolvedValue(1)

    const request = new MockNextRequest('http://localhost:3000/api/participations?userId=1')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.participations).toHaveLength(1)
    expect(data.participations[0].testerId).toBe(1)
  })

  it('should filter participations by appId', async () => {
    const mockParticipations = [
      {
        id: 1,
        appId: 1,
        testerId: 1,
        applicationId: 1,
        status: 'ACTIVE',
        rewardStatus: 'NONE',
        skipReason: null,
        lastAppRunAt: null,
        joinedAt: new Date('2024-01-01'),
        droppedAt: null,
        dropReason: null,
        completedAt: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        app: {
          id: 1,
          appName: 'Test App 1',
          packageName: 'com.test.app1',
          status: 'IN_TESTING',
        },
        tester: {
          id: 1,
          nickname: 'tester1',
          profileImageUrl: null,
        },
        application: {
          id: 1,
          status: 'APPROVED',
          appliedAt: new Date('2024-01-01'),
        },
      },
    ]

    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com', role: 'DEVELOPER' },
      expires: '2024-12-31',
    })
    mockPrisma.participation.findMany.mockResolvedValue(mockParticipations)
    mockPrisma.participation.count.mockResolvedValue(1)

    const request = new MockNextRequest('http://localhost:3000/api/participations?appId=1')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.participations).toHaveLength(1)
    expect(data.participations[0].appId).toBe(1)
  })

  it('should filter participations by status', async () => {
    const mockParticipations = [
      {
        id: 1,
        appId: 1,
        testerId: 1,
        applicationId: 1,
        status: 'ACTIVE',
        rewardStatus: 'NONE',
        skipReason: null,
        lastAppRunAt: null,
        joinedAt: new Date('2024-01-01'),
        droppedAt: null,
        dropReason: null,
        completedAt: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        app: {
          id: 1,
          appName: 'Test App 1',
          packageName: 'com.test.app1',
          status: 'IN_TESTING',
        },
        tester: {
          id: 1,
          nickname: 'tester1',
          profileImageUrl: null,
        },
        application: {
          id: 1,
          status: 'APPROVED',
          appliedAt: new Date('2024-01-01'),
        },
      },
    ]

    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })
    mockPrisma.participation.findMany.mockResolvedValue(mockParticipations)
    mockPrisma.participation.count.mockResolvedValue(1)

    const request = new MockNextRequest('http://localhost:3000/api/participations?status=ACTIVE')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.participations).toHaveLength(1)
    expect(data.participations[0].status).toBe('ACTIVE')
  })

  it('should return empty array if no participations found', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })
    mockPrisma.participation.findMany.mockResolvedValue([])
    mockPrisma.participation.count.mockResolvedValue(0)

    const request = new MockNextRequest('http://localhost:3000/api/participations')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.participations).toEqual([])
    expect(data.total).toBe(0)
  })

  it('should handle pagination correctly', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })
    mockPrisma.participation.findMany.mockResolvedValue([])
    mockPrisma.participation.count.mockResolvedValue(25)

    const request = new MockNextRequest('http://localhost:3000/api/participations?page=2&limit=10')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.page).toBe(2)
    expect(data.limit).toBe(10)
    expect(data.total).toBe(25)
    expect(mockPrisma.participation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
      })
    )
  })

  it('should limit maximum items per page to 100', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })
    mockPrisma.participation.findMany.mockResolvedValue([])
    mockPrisma.participation.count.mockResolvedValue(0)

    const request = new MockNextRequest('http://localhost:3000/api/participations?limit=200')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.limit).toBe(100)
  })
})
