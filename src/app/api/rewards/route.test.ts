/**
 * @jest-environment node
 */
// @TASK P5-R10 - Rewards Resource API Tests (List + Payout)
// @SPEC docs/planning/02-trd.md#rewards-API

import { NextRequest } from 'next/server'

// Mock dependencies BEFORE imports
jest.mock('@/lib/auth', () => ({
  getSession: jest.fn(),
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    rewardHistory: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    participation: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}))

import { GET } from './route'
import { POST } from './payout/route'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const mockGetSession = getSession as jest.MockedFunction<typeof getSession>
const mockPrisma = prisma as jest.Mocked<typeof prisma>

// ======================================
// GET /api/rewards
// ======================================
describe('GET /api/rewards', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return reward histories list without filters', async () => {
    const now = new Date()
    const mockRewards = [
      {
        id: 1,
        userId: 2,
        appId: 1,
        type: 'EARNED',
        amount: 5000,
        balance: 15000,
        description: 'Feedback reward for app #1',
        createdAt: now,
        user: {
          id: 2,
          nickname: 'tester1',
          email: 'tester@test.com',
        },
        app: {
          id: 1,
          appName: 'TestApp',
        },
      },
    ]

    ;(mockPrisma.rewardHistory.findMany as jest.Mock).mockResolvedValue(mockRewards)

    const request = new NextRequest('http://localhost:3000/api/rewards')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveLength(1)
    expect(data[0]).toHaveProperty('id', 1)
    expect(data[0]).toHaveProperty('type', 'EARNED')
    expect(data[0]).toHaveProperty('amount', 5000)
    expect(data[0]).toHaveProperty('balance', 15000)
  })

  it('should filter reward histories by userId query parameter', async () => {
    ;(mockPrisma.rewardHistory.findMany as jest.Mock).mockResolvedValue([])

    const request = new NextRequest('http://localhost:3000/api/rewards?userId=2')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(mockPrisma.rewardHistory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: 2,
        }),
      })
    )
  })

  it('should filter reward histories by type query parameter', async () => {
    ;(mockPrisma.rewardHistory.findMany as jest.Mock).mockResolvedValue([])

    const request = new NextRequest('http://localhost:3000/api/rewards?type=EARNED')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(mockPrisma.rewardHistory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          type: 'EARNED',
        }),
      })
    )
  })

  it('should filter by both userId and type', async () => {
    ;(mockPrisma.rewardHistory.findMany as jest.Mock).mockResolvedValue([])

    const request = new NextRequest('http://localhost:3000/api/rewards?userId=2&type=EARNED')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(mockPrisma.rewardHistory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: 2,
          type: 'EARNED',
        }),
      })
    )
  })

  it('should return empty array when no reward histories found', async () => {
    ;(mockPrisma.rewardHistory.findMany as jest.Mock).mockResolvedValue([])

    const request = new NextRequest('http://localhost:3000/api/rewards')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual([])
  })

  it('should include user and app relations in response', async () => {
    ;(mockPrisma.rewardHistory.findMany as jest.Mock).mockResolvedValue([])

    const request = new NextRequest('http://localhost:3000/api/rewards')
    await GET(request)

    expect(mockPrisma.rewardHistory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          user: expect.any(Object),
          app: expect.any(Object),
        }),
      })
    )
  })

  it('should order reward histories by createdAt descending', async () => {
    ;(mockPrisma.rewardHistory.findMany as jest.Mock).mockResolvedValue([])

    const request = new NextRequest('http://localhost:3000/api/rewards')
    await GET(request)

    expect(mockPrisma.rewardHistory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: 'desc' },
      })
    )
  })

  it('should handle server error gracefully', async () => {
    ;(mockPrisma.rewardHistory.findMany as jest.Mock).mockRejectedValue(new Error('DB error'))

    const request = new NextRequest('http://localhost:3000/api/rewards')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to fetch reward histories')
  })
})

// ======================================
// POST /api/rewards/payout
// ======================================
describe('POST /api/rewards/payout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    mockGetSession.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/rewards/payout', {
      method: 'POST',
      body: JSON.stringify({
        userId: 2,
        amount: 5000,
        type: 'EARNED',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return 400 if userId is missing', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
      expires: '2024-12-31',
    })

    const request = new NextRequest('http://localhost:3000/api/rewards/payout', {
      method: 'POST',
      body: JSON.stringify({
        amount: 5000,
        type: 'EARNED',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('userId')
  })

  it('should return 400 if amount is missing', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
      expires: '2024-12-31',
    })

    const request = new NextRequest('http://localhost:3000/api/rewards/payout', {
      method: 'POST',
      body: JSON.stringify({
        userId: 2,
        type: 'EARNED',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('amount')
  })

  it('should return 400 if type is missing', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
      expires: '2024-12-31',
    })

    const request = new NextRequest('http://localhost:3000/api/rewards/payout', {
      method: 'POST',
      body: JSON.stringify({
        userId: 2,
        amount: 5000,
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('type')
  })

  it('should return 400 if amount is not a positive integer', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
      expires: '2024-12-31',
    })

    const request = new NextRequest('http://localhost:3000/api/rewards/payout', {
      method: 'POST',
      body: JSON.stringify({
        userId: 2,
        amount: -100,
        type: 'EARNED',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('amount')
  })

  it('should return 400 if type is not a valid RewardHistoryType', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
      expires: '2024-12-31',
    })

    const request = new NextRequest('http://localhost:3000/api/rewards/payout', {
      method: 'POST',
      body: JSON.stringify({
        userId: 2,
        amount: 5000,
        type: 'INVALID_TYPE',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('type')
  })

  it('should return 404 if target user not found', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
      expires: '2024-12-31',
    })

    ;(mockPrisma.$transaction as jest.Mock).mockImplementation(async (cb: any) => {
      return cb(mockPrisma)
    })
    ;(mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/rewards/payout', {
      method: 'POST',
      body: JSON.stringify({
        userId: 999,
        amount: 5000,
        type: 'EARNED',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('User not found')
  })

  it('should create reward payout and update user balance for EARNED type', async () => {
    const now = new Date()
    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
      expires: '2024-12-31',
    })

    ;(mockPrisma.$transaction as jest.Mock).mockImplementation(async (cb: any) => {
      return cb(mockPrisma)
    })
    ;(mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 2,
      pointBalance: 10000,
    } as any)
    ;(mockPrisma.rewardHistory.create as jest.Mock).mockResolvedValue({
      id: 1,
      userId: 2,
      appId: null,
      type: 'EARNED',
      amount: 5000,
      balance: 15000,
      description: null,
      createdAt: now,
    } as any)
    ;(mockPrisma.user.update as jest.Mock).mockResolvedValue({} as any)

    const request = new NextRequest('http://localhost:3000/api/rewards/payout', {
      method: 'POST',
      body: JSON.stringify({
        userId: 2,
        amount: 5000,
        type: 'EARNED',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data).toHaveProperty('id', 1)
    expect(data).toHaveProperty('type', 'EARNED')
    expect(data).toHaveProperty('amount', 5000)
    expect(data).toHaveProperty('balance', 15000)

    // Verify user balance was incremented
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 2 },
        data: expect.objectContaining({
          pointBalance: { increment: 5000 },
        }),
      })
    )
  })

  it('should create reward payout with relatedId (appId) if provided', async () => {
    const now = new Date()
    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
      expires: '2024-12-31',
    })

    ;(mockPrisma.$transaction as jest.Mock).mockImplementation(async (cb: any) => {
      return cb(mockPrisma)
    })
    ;(mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 2,
      pointBalance: 10000,
    } as any)
    ;(mockPrisma.rewardHistory.create as jest.Mock).mockResolvedValue({
      id: 1,
      userId: 2,
      appId: 5,
      type: 'EARNED',
      amount: 3000,
      balance: 13000,
      description: null,
      createdAt: now,
    } as any)
    ;(mockPrisma.user.update as jest.Mock).mockResolvedValue({} as any)

    const request = new NextRequest('http://localhost:3000/api/rewards/payout', {
      method: 'POST',
      body: JSON.stringify({
        userId: 2,
        amount: 3000,
        type: 'EARNED',
        relatedId: 5,
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data).toHaveProperty('appId', 5)

    // Verify reward history was created with appId
    expect(mockPrisma.rewardHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 2,
          appId: 5,
          type: 'EARNED',
          amount: 3000,
        }),
      })
    )
  })

  it('should decrement balance for WITHDRAWN type', async () => {
    const now = new Date()
    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
      expires: '2024-12-31',
    })

    ;(mockPrisma.$transaction as jest.Mock).mockImplementation(async (cb: any) => {
      return cb(mockPrisma)
    })
    ;(mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 2,
      pointBalance: 10000,
    } as any)
    ;(mockPrisma.rewardHistory.create as jest.Mock).mockResolvedValue({
      id: 2,
      userId: 2,
      appId: null,
      type: 'WITHDRAWN',
      amount: 5000,
      balance: 5000,
      description: null,
      createdAt: now,
    } as any)
    ;(mockPrisma.user.update as jest.Mock).mockResolvedValue({} as any)

    const request = new NextRequest('http://localhost:3000/api/rewards/payout', {
      method: 'POST',
      body: JSON.stringify({
        userId: 2,
        amount: 5000,
        type: 'WITHDRAWN',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data).toHaveProperty('type', 'WITHDRAWN')

    // Verify user balance was decremented
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 2 },
        data: expect.objectContaining({
          pointBalance: { decrement: 5000 },
        }),
      })
    )
  })

  it('should return 400 if insufficient balance for WITHDRAWN type', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
      expires: '2024-12-31',
    })

    ;(mockPrisma.$transaction as jest.Mock).mockImplementation(async (cb: any) => {
      return cb(mockPrisma)
    })
    ;(mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 2,
      pointBalance: 3000,
    } as any)

    const request = new NextRequest('http://localhost:3000/api/rewards/payout', {
      method: 'POST',
      body: JSON.stringify({
        userId: 2,
        amount: 5000,
        type: 'WITHDRAWN',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Insufficient balance')
  })

  it('should handle server error gracefully', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
      expires: '2024-12-31',
    })

    ;(mockPrisma.$transaction as jest.Mock).mockRejectedValue(new Error('DB error'))

    const request = new NextRequest('http://localhost:3000/api/rewards/payout', {
      method: 'POST',
      body: JSON.stringify({
        userId: 2,
        amount: 5000,
        type: 'EARNED',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to process reward payout')
  })
})
