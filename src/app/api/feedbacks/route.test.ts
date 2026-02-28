/**
 * @jest-environment node
 */
// @TASK P5-R7.1 - Feedbacks Resource API Tests (List + Create)
// @SPEC docs/planning/02-trd.md#feedbacks-API

import { NextRequest } from 'next/server'

// Mock dependencies BEFORE imports
jest.mock('@/lib/auth', () => ({
  getSession: jest.fn(),
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    feedback: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    participation: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    rewardHistory: {
      create: jest.fn(),
    },
    user: {
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}))

import { GET, POST } from './route'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const mockGetSession = getSession as jest.MockedFunction<typeof getSession>
const mockPrisma = prisma as jest.Mocked<typeof prisma>

// ======================================
// GET /api/feedbacks
// ======================================
describe('GET /api/feedbacks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return feedbacks list without filters', async () => {
    const now = new Date()
    const mockFeedbacks = [
      {
        id: 1,
        appId: 1,
        testerId: 2,
        participationId: 1,
        overallRating: 4,
        comment: 'Great app!',
        createdAt: now,
        updatedAt: now,
        tester: {
          id: 2,
          nickname: 'tester1',
          email: 'tester@test.com',
          profileImageUrl: null,
        },
      },
    ]

    ;(mockPrisma.feedback.findMany as jest.Mock).mockResolvedValue(mockFeedbacks)

    const request = new NextRequest('http://localhost:3000/api/feedbacks')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveLength(1)
    expect(data[0]).toHaveProperty('id', 1)
    expect(data[0]).toHaveProperty('overallRating', 4)
    expect(data[0]).toHaveProperty('comment', 'Great app!')
    expect(data[0].tester).toHaveProperty('nickname', 'tester1')
  })

  it('should filter feedbacks by appId query parameter', async () => {
    ;(mockPrisma.feedback.findMany as jest.Mock).mockResolvedValue([])

    const request = new NextRequest('http://localhost:3000/api/feedbacks?appId=1')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(mockPrisma.feedback.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          appId: 1,
        }),
      })
    )
  })

  it('should filter feedbacks by userId query parameter', async () => {
    ;(mockPrisma.feedback.findMany as jest.Mock).mockResolvedValue([])

    const request = new NextRequest('http://localhost:3000/api/feedbacks?userId=2')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(mockPrisma.feedback.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          testerId: 2,
        }),
      })
    )
  })

  it('should filter feedbacks by both appId and userId', async () => {
    ;(mockPrisma.feedback.findMany as jest.Mock).mockResolvedValue([])

    const request = new NextRequest('http://localhost:3000/api/feedbacks?appId=1&userId=2')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(mockPrisma.feedback.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          appId: 1,
          testerId: 2,
        }),
      })
    )
  })

  it('should return empty array when no feedbacks found', async () => {
    ;(mockPrisma.feedback.findMany as jest.Mock).mockResolvedValue([])

    const request = new NextRequest('http://localhost:3000/api/feedbacks')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual([])
  })

  it('should include tester relation in response', async () => {
    ;(mockPrisma.feedback.findMany as jest.Mock).mockResolvedValue([])

    const request = new NextRequest('http://localhost:3000/api/feedbacks')
    await GET(request)

    expect(mockPrisma.feedback.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          tester: expect.any(Object),
        }),
      })
    )
  })

  it('should order feedbacks by createdAt descending', async () => {
    ;(mockPrisma.feedback.findMany as jest.Mock).mockResolvedValue([])

    const request = new NextRequest('http://localhost:3000/api/feedbacks')
    await GET(request)

    expect(mockPrisma.feedback.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: 'desc' },
      })
    )
  })

  it('should handle server error gracefully', async () => {
    ;(mockPrisma.feedback.findMany as jest.Mock).mockRejectedValue(new Error('DB error'))

    const request = new NextRequest('http://localhost:3000/api/feedbacks')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to fetch feedbacks')
  })
})

// ======================================
// POST /api/feedbacks
// ======================================
describe('POST /api/feedbacks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    mockGetSession.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/feedbacks', {
      method: 'POST',
      body: JSON.stringify({
        participationId: 1,
        overallRating: 4,
        comment: 'Great app!',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return 400 if participationId is missing', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    const request = new NextRequest('http://localhost:3000/api/feedbacks', {
      method: 'POST',
      body: JSON.stringify({
        overallRating: 4,
        comment: 'Great app!',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('participationId')
  })

  it('should return 400 if overallRating is missing', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    const request = new NextRequest('http://localhost:3000/api/feedbacks', {
      method: 'POST',
      body: JSON.stringify({
        participationId: 1,
        comment: 'Great app!',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('overallRating')
  })

  it('should return 400 if overallRating is out of range (1-5)', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    const request = new NextRequest('http://localhost:3000/api/feedbacks', {
      method: 'POST',
      body: JSON.stringify({
        participationId: 1,
        overallRating: 6,
        comment: 'Great app!',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('overallRating')
  })

  it('should return 404 if participation not found', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    ;(mockPrisma.$transaction as jest.Mock).mockImplementation(async (cb: any) => {
      return cb(mockPrisma)
    })
    ;(mockPrisma.participation.findUnique as jest.Mock).mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/feedbacks', {
      method: 'POST',
      body: JSON.stringify({
        participationId: 999,
        overallRating: 4,
        comment: 'Great app!',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Participation not found')
  })

  it('should return 403 if user is not the participation owner', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '5', email: 'other@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    ;(mockPrisma.$transaction as jest.Mock).mockImplementation(async (cb: any) => {
      return cb(mockPrisma)
    })
    ;(mockPrisma.participation.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      appId: 1,
      testerId: 2,
      status: 'COMPLETED',
      rewardStatus: 'NONE',
      feedback: null,
      app: {
        id: 1,
        rewardType: 'BASIC',
        rewardAmount: 5000,
      },
    } as any)

    const request = new NextRequest('http://localhost:3000/api/feedbacks', {
      method: 'POST',
      body: JSON.stringify({
        participationId: 1,
        overallRating: 4,
        comment: 'Great app!',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toBe('Forbidden')
  })

  it('should return 400 if participation is not in COMPLETED status', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    ;(mockPrisma.$transaction as jest.Mock).mockImplementation(async (cb: any) => {
      return cb(mockPrisma)
    })
    ;(mockPrisma.participation.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      appId: 1,
      testerId: 2,
      status: 'ACTIVE',
      rewardStatus: 'NONE',
      feedback: null,
      app: {
        id: 1,
        rewardType: 'BASIC',
        rewardAmount: 5000,
      },
    } as any)

    const request = new NextRequest('http://localhost:3000/api/feedbacks', {
      method: 'POST',
      body: JSON.stringify({
        participationId: 1,
        overallRating: 4,
        comment: 'Great app!',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('COMPLETED')
  })

  it('should return 409 if feedback already exists for this participation', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    ;(mockPrisma.$transaction as jest.Mock).mockImplementation(async (cb: any) => {
      return cb(mockPrisma)
    })
    ;(mockPrisma.participation.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      appId: 1,
      testerId: 2,
      status: 'COMPLETED',
      rewardStatus: 'NONE',
      feedback: { id: 10 },
      app: {
        id: 1,
        rewardType: 'BASIC',
        rewardAmount: 5000,
      },
    } as any)

    const request = new NextRequest('http://localhost:3000/api/feedbacks', {
      method: 'POST',
      body: JSON.stringify({
        participationId: 1,
        overallRating: 4,
        comment: 'Great app!',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.error).toBe('Feedback already submitted for this participation')
  })

  it('should create feedback and trigger reward for PAID_REWARD app', async () => {
    const now = new Date()
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    ;(mockPrisma.$transaction as jest.Mock).mockImplementation(async (cb: any) => {
      return cb(mockPrisma)
    })
    ;(mockPrisma.participation.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      appId: 1,
      testerId: 2,
      status: 'COMPLETED',
      rewardStatus: 'NONE',
      feedback: null,
      app: {
        id: 1,
        testType: 'PAID_REWARD',
        rewardType: 'WITH_FEEDBACK',
        rewardAmount: 5000,
      },
    } as any)
    ;(mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 2,
      pointBalance: 10000,
    } as any)
    ;(mockPrisma.feedback.create as jest.Mock).mockResolvedValue({
      id: 1,
      appId: 1,
      testerId: 2,
      participationId: 1,
      overallRating: 4,
      comment: 'Great app!',
      createdAt: now,
      updatedAt: now,
    } as any)
    ;(mockPrisma.participation.update as jest.Mock).mockResolvedValue({} as any)
    ;(mockPrisma.rewardHistory.create as jest.Mock).mockResolvedValue({} as any)
    ;(mockPrisma.user.update as jest.Mock).mockResolvedValue({} as any)

    const request = new NextRequest('http://localhost:3000/api/feedbacks', {
      method: 'POST',
      body: JSON.stringify({
        participationId: 1,
        overallRating: 4,
        comment: 'Great app!',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data).toHaveProperty('id', 1)
    expect(data).toHaveProperty('overallRating', 4)

    // Verify participation rewardStatus was updated to PAID
    expect(mockPrisma.participation.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1 },
        data: expect.objectContaining({
          rewardStatus: 'PAID',
        }),
      })
    )

    // Verify reward history was created
    expect(mockPrisma.rewardHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 2,
          appId: 1,
          type: 'EARNED',
          amount: 5000,
        }),
      })
    )

    // Verify user pointBalance was updated
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 2 },
        data: expect.objectContaining({
          pointBalance: { increment: 5000 },
        }),
      })
    )
  })

  it('should create feedback without reward for CREDIT_EXCHANGE app', async () => {
    const now = new Date()
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    ;(mockPrisma.$transaction as jest.Mock).mockImplementation(async (cb: any) => {
      return cb(mockPrisma)
    })
    ;(mockPrisma.participation.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      appId: 1,
      testerId: 2,
      status: 'COMPLETED',
      rewardStatus: 'NONE',
      feedback: null,
      app: {
        id: 1,
        testType: 'CREDIT_EXCHANGE',
        rewardType: null,
        rewardAmount: null,
      },
    } as any)
    ;(mockPrisma.feedback.create as jest.Mock).mockResolvedValue({
      id: 1,
      appId: 1,
      testerId: 2,
      participationId: 1,
      overallRating: 3,
      comment: 'Good app',
      createdAt: now,
      updatedAt: now,
    } as any)
    ;(mockPrisma.participation.update as jest.Mock).mockResolvedValue({} as any)

    const request = new NextRequest('http://localhost:3000/api/feedbacks', {
      method: 'POST',
      body: JSON.stringify({
        participationId: 1,
        overallRating: 3,
        comment: 'Good app',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data).toHaveProperty('id', 1)

    // Verify participation was updated but no reward
    expect(mockPrisma.participation.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1 },
        data: expect.objectContaining({
          rewardStatus: 'SKIPPED',
        }),
      })
    )

    // No reward history should be created
    expect(mockPrisma.rewardHistory.create).not.toHaveBeenCalled()
  })

  it('should allow feedback without comment (comment is optional)', async () => {
    const now = new Date()
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    ;(mockPrisma.$transaction as jest.Mock).mockImplementation(async (cb: any) => {
      return cb(mockPrisma)
    })
    ;(mockPrisma.participation.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      appId: 1,
      testerId: 2,
      status: 'COMPLETED',
      rewardStatus: 'NONE',
      feedback: null,
      app: {
        id: 1,
        testType: 'CREDIT_EXCHANGE',
        rewardType: null,
        rewardAmount: null,
      },
    } as any)
    ;(mockPrisma.feedback.create as jest.Mock).mockResolvedValue({
      id: 1,
      appId: 1,
      testerId: 2,
      participationId: 1,
      overallRating: 5,
      comment: null,
      createdAt: now,
      updatedAt: now,
    } as any)
    ;(mockPrisma.participation.update as jest.Mock).mockResolvedValue({} as any)

    const request = new NextRequest('http://localhost:3000/api/feedbacks', {
      method: 'POST',
      body: JSON.stringify({
        participationId: 1,
        overallRating: 5,
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data).toHaveProperty('overallRating', 5)
  })

  it('should handle server error gracefully', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    ;(mockPrisma.$transaction as jest.Mock).mockRejectedValue(new Error('DB error'))

    const request = new NextRequest('http://localhost:3000/api/feedbacks', {
      method: 'POST',
      body: JSON.stringify({
        participationId: 1,
        overallRating: 4,
        comment: 'Great app!',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to create feedback')
  })
})
