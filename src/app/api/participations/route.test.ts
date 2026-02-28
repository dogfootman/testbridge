/**
 * @jest-environment node
 */
// @TASK P3-R6.1 - Participations Resource API Tests (List)
// @SPEC specs/screens/tester-participations.yaml

import { NextRequest } from 'next/server'

// Mock dependencies BEFORE imports
jest.mock('@/lib/auth', () => ({
  getSession: jest.fn(),
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    participation: {
      findMany: jest.fn(),
    },
  },
}))

import { GET } from './route'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const mockGetSession = getSession as jest.MockedFunction<typeof getSession>
const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('GET /api/participations', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    mockGetSession.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/participations')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return participations for authenticated user', async () => {
    const now = new Date()
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    const mockParticipations = [
      {
        id: 1,
        appId: 1,
        testerId: 2,
        applicationId: 1,
        status: 'ACTIVE',
        rewardStatus: 'NONE',
        skipReason: null,
        lastAppRunAt: now,
        joinedAt: now,
        droppedAt: null,
        dropReason: null,
        completedAt: null,
        createdAt: now,
        updatedAt: now,
        app: {
          id: 1,
          appName: 'Test App',
          testStartDate: now,
          testEndDate: new Date(Date.now() + 14 * 86400000),
          rewardAmount: 5000,
          rewardType: 'BASIC',
          images: [{ url: 'https://example.com/icon.png', type: 'ICON' }],
        },
        tester: {
          id: 2,
          nickname: 'tester1',
          email: 'tester@test.com',
          profileImageUrl: null,
        },
        feedback: null,
      },
    ]

    mockPrisma.participation.findMany.mockResolvedValue(mockParticipations as any)

    const request = new NextRequest('http://localhost:3000/api/participations')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveLength(1)
    expect(data[0]).toHaveProperty('id', 1)
    expect(data[0]).toHaveProperty('status', 'ACTIVE')
    expect(data[0].app).toHaveProperty('appName', 'Test App')
  })

  it('should filter participations by appId query parameter', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    mockPrisma.participation.findMany.mockResolvedValue([])

    const request = new NextRequest('http://localhost:3000/api/participations?appId=1')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(mockPrisma.participation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          testerId: 2,
          appId: 1,
        }),
      })
    )
  })

  it('should filter participations by status query parameter', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    mockPrisma.participation.findMany.mockResolvedValue([])

    const request = new NextRequest('http://localhost:3000/api/participations?status=ACTIVE')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(mockPrisma.participation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          testerId: 2,
          status: 'ACTIVE',
        }),
      })
    )
  })

  it('should return empty array when no participations found', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    mockPrisma.participation.findMany.mockResolvedValue([])

    const request = new NextRequest('http://localhost:3000/api/participations')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual([])
  })

  it('should include app, tester, and feedback relations', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    mockPrisma.participation.findMany.mockResolvedValue([])

    const request = new NextRequest('http://localhost:3000/api/participations')
    await GET(request)

    expect(mockPrisma.participation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          app: expect.any(Object),
          tester: expect.any(Object),
          feedback: true,
        }),
      })
    )
  })

  it('should handle server error gracefully', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    mockPrisma.participation.findMany.mockRejectedValue(new Error('DB error'))

    const request = new NextRequest('http://localhost:3000/api/participations')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to fetch participations')
  })
})
