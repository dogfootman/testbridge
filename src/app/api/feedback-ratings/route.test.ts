/**
 * @jest-environment node
 */
// @TASK P5-R8 - Feedback Ratings Resource API Tests (Bulk Create + List)
// @SPEC docs/planning/02-trd.md#feedback-ratings-API

import { NextRequest } from 'next/server'

// Mock dependencies BEFORE imports
jest.mock('@/lib/auth', () => ({
  getSession: jest.fn(),
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    feedback: {
      findUnique: jest.fn(),
    },
    feedbackRating: {
      findMany: jest.fn(),
      createMany: jest.fn(),
      deleteMany: jest.fn(),
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
// GET /api/feedback-ratings
// ======================================
describe('GET /api/feedback-ratings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 400 if feedbackId query param is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/feedback-ratings')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('feedbackId')
  })

  it('should return 400 if feedbackId is not a valid number', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/feedback-ratings?feedbackId=abc'
    )
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('feedbackId')
  })

  it('should return ratings list for a valid feedbackId', async () => {
    const mockRatings = [
      { id: 1, feedbackId: 1, itemType: 'UI_UX', score: 4 },
      { id: 2, feedbackId: 1, itemType: 'PERFORMANCE', score: 3 },
      { id: 3, feedbackId: 1, itemType: 'FUNCTIONALITY', score: 5 },
      { id: 4, feedbackId: 1, itemType: 'STABILITY', score: 4 },
    ]

    ;(mockPrisma.feedbackRating.findMany as jest.Mock).mockResolvedValue(
      mockRatings
    )

    const request = new NextRequest(
      'http://localhost:3000/api/feedback-ratings?feedbackId=1'
    )
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.ratings).toHaveLength(4)
    expect(data.ratings[0]).toHaveProperty('itemType', 'UI_UX')
    expect(data.ratings[0]).toHaveProperty('score', 4)
  })

  it('should return average score in the response', async () => {
    const mockRatings = [
      { id: 1, feedbackId: 1, itemType: 'UI_UX', score: 4 },
      { id: 2, feedbackId: 1, itemType: 'PERFORMANCE', score: 3 },
      { id: 3, feedbackId: 1, itemType: 'FUNCTIONALITY', score: 5 },
      { id: 4, feedbackId: 1, itemType: 'STABILITY', score: 4 },
    ]

    ;(mockPrisma.feedbackRating.findMany as jest.Mock).mockResolvedValue(
      mockRatings
    )

    const request = new NextRequest(
      'http://localhost:3000/api/feedback-ratings?feedbackId=1'
    )
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    // Average of 4 + 3 + 5 + 4 = 16 / 4 = 4.0
    expect(data.average).toBe(4.0)
  })

  it('should return empty ratings and 0 average when no ratings exist', async () => {
    ;(mockPrisma.feedbackRating.findMany as jest.Mock).mockResolvedValue([])

    const request = new NextRequest(
      'http://localhost:3000/api/feedback-ratings?feedbackId=1'
    )
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.ratings).toEqual([])
    expect(data.average).toBe(0)
  })

  it('should handle server error gracefully', async () => {
    ;(mockPrisma.feedbackRating.findMany as jest.Mock).mockRejectedValue(
      new Error('DB error')
    )

    const request = new NextRequest(
      'http://localhost:3000/api/feedback-ratings?feedbackId=1'
    )
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to fetch feedback ratings')
  })
})

// ======================================
// POST /api/feedback-ratings
// ======================================
describe('POST /api/feedback-ratings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    mockGetSession.mockResolvedValue(null)

    const request = new NextRequest(
      'http://localhost:3000/api/feedback-ratings',
      {
        method: 'POST',
        body: JSON.stringify({
          feedbackId: 1,
          ratings: [{ ratingType: 'UI_UX', score: 4 }],
        }),
      }
    )
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return 400 if feedbackId is missing', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    const request = new NextRequest(
      'http://localhost:3000/api/feedback-ratings',
      {
        method: 'POST',
        body: JSON.stringify({
          ratings: [{ ratingType: 'UI_UX', score: 4 }],
        }),
      }
    )
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('feedbackId')
  })

  it('should return 400 if ratings array is missing or empty', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    const request = new NextRequest(
      'http://localhost:3000/api/feedback-ratings',
      {
        method: 'POST',
        body: JSON.stringify({
          feedbackId: 1,
          ratings: [],
        }),
      }
    )
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('ratings')
  })

  it('should return 400 if ratings is not an array', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    const request = new NextRequest(
      'http://localhost:3000/api/feedback-ratings',
      {
        method: 'POST',
        body: JSON.stringify({
          feedbackId: 1,
          ratings: 'invalid',
        }),
      }
    )
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('ratings')
  })

  it('should return 400 if ratingType is invalid', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    const request = new NextRequest(
      'http://localhost:3000/api/feedback-ratings',
      {
        method: 'POST',
        body: JSON.stringify({
          feedbackId: 1,
          ratings: [{ ratingType: 'INVALID_TYPE', score: 4 }],
        }),
      }
    )
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('ratingType')
  })

  it('should return 400 if score is out of range (1-5)', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    const request = new NextRequest(
      'http://localhost:3000/api/feedback-ratings',
      {
        method: 'POST',
        body: JSON.stringify({
          feedbackId: 1,
          ratings: [{ ratingType: 'UI_UX', score: 6 }],
        }),
      }
    )
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('score')
  })

  it('should return 400 if score is 0', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    const request = new NextRequest(
      'http://localhost:3000/api/feedback-ratings',
      {
        method: 'POST',
        body: JSON.stringify({
          feedbackId: 1,
          ratings: [{ ratingType: 'UI_UX', score: 0 }],
        }),
      }
    )
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('score')
  })

  it('should return 400 if duplicate ratingTypes are provided', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    const request = new NextRequest(
      'http://localhost:3000/api/feedback-ratings',
      {
        method: 'POST',
        body: JSON.stringify({
          feedbackId: 1,
          ratings: [
            { ratingType: 'UI_UX', score: 4 },
            { ratingType: 'UI_UX', score: 3 },
          ],
        }),
      }
    )
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('duplicate')
  })

  it('should return 404 if feedback not found', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    ;(mockPrisma.$transaction as jest.Mock).mockImplementation(
      async (cb: any) => {
        return cb(mockPrisma)
      }
    )
    ;(mockPrisma.feedback.findUnique as jest.Mock).mockResolvedValue(null)

    const request = new NextRequest(
      'http://localhost:3000/api/feedback-ratings',
      {
        method: 'POST',
        body: JSON.stringify({
          feedbackId: 999,
          ratings: [{ ratingType: 'UI_UX', score: 4 }],
        }),
      }
    )
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Feedback not found')
  })

  it('should return 403 if user is not the feedback owner', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '5', email: 'other@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    ;(mockPrisma.$transaction as jest.Mock).mockImplementation(
      async (cb: any) => {
        return cb(mockPrisma)
      }
    )
    ;(mockPrisma.feedback.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      appId: 1,
      testerId: 2,
      participationId: 1,
      overallRating: 4,
      ratings: [],
    } as any)

    const request = new NextRequest(
      'http://localhost:3000/api/feedback-ratings',
      {
        method: 'POST',
        body: JSON.stringify({
          feedbackId: 1,
          ratings: [{ ratingType: 'UI_UX', score: 4 }],
        }),
      }
    )
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toBe('Forbidden')
  })

  it('should return 409 if ratings already exist for this feedback', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    ;(mockPrisma.$transaction as jest.Mock).mockImplementation(
      async (cb: any) => {
        return cb(mockPrisma)
      }
    )
    ;(mockPrisma.feedback.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      appId: 1,
      testerId: 2,
      participationId: 1,
      overallRating: 4,
      ratings: [
        { id: 1, feedbackId: 1, itemType: 'UI_UX', score: 4 },
      ],
    } as any)

    const request = new NextRequest(
      'http://localhost:3000/api/feedback-ratings',
      {
        method: 'POST',
        body: JSON.stringify({
          feedbackId: 1,
          ratings: [{ ratingType: 'UI_UX', score: 5 }],
        }),
      }
    )
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.error).toContain('already')
  })

  it('should create ratings in bulk successfully', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    const createdRatings = [
      { id: 1, feedbackId: 1, itemType: 'UI_UX', score: 4 },
      { id: 2, feedbackId: 1, itemType: 'PERFORMANCE', score: 3 },
      { id: 3, feedbackId: 1, itemType: 'FUNCTIONALITY', score: 5 },
      { id: 4, feedbackId: 1, itemType: 'STABILITY', score: 4 },
    ]

    ;(mockPrisma.$transaction as jest.Mock).mockImplementation(
      async (cb: any) => {
        return cb(mockPrisma)
      }
    )
    ;(mockPrisma.feedback.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      appId: 1,
      testerId: 2,
      participationId: 1,
      overallRating: 4,
      ratings: [],
    } as any)
    ;(mockPrisma.feedbackRating.createMany as jest.Mock).mockResolvedValue({
      count: 4,
    })
    ;(mockPrisma.feedbackRating.findMany as jest.Mock).mockResolvedValue(
      createdRatings
    )

    const request = new NextRequest(
      'http://localhost:3000/api/feedback-ratings',
      {
        method: 'POST',
        body: JSON.stringify({
          feedbackId: 1,
          ratings: [
            { ratingType: 'UI_UX', score: 4 },
            { ratingType: 'PERFORMANCE', score: 3 },
            { ratingType: 'FUNCTIONALITY', score: 5 },
            { ratingType: 'STABILITY', score: 4 },
          ],
        }),
      }
    )
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.ratings).toHaveLength(4)
    expect(data.average).toBe(4.0)
  })

  it('should create a single rating successfully', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    const createdRatings = [
      { id: 1, feedbackId: 1, itemType: 'UI_UX', score: 5 },
    ]

    ;(mockPrisma.$transaction as jest.Mock).mockImplementation(
      async (cb: any) => {
        return cb(mockPrisma)
      }
    )
    ;(mockPrisma.feedback.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      appId: 1,
      testerId: 2,
      participationId: 1,
      overallRating: 4,
      ratings: [],
    } as any)
    ;(mockPrisma.feedbackRating.createMany as jest.Mock).mockResolvedValue({
      count: 1,
    })
    ;(mockPrisma.feedbackRating.findMany as jest.Mock).mockResolvedValue(
      createdRatings
    )

    const request = new NextRequest(
      'http://localhost:3000/api/feedback-ratings',
      {
        method: 'POST',
        body: JSON.stringify({
          feedbackId: 1,
          ratings: [{ ratingType: 'UI_UX', score: 5 }],
        }),
      }
    )
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.ratings).toHaveLength(1)
    expect(data.ratings[0]).toHaveProperty('itemType', 'UI_UX')
    expect(data.ratings[0]).toHaveProperty('score', 5)
    expect(data.average).toBe(5.0)
  })

  it('should verify createMany is called with correct data mapping', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    ;(mockPrisma.$transaction as jest.Mock).mockImplementation(
      async (cb: any) => {
        return cb(mockPrisma)
      }
    )
    ;(mockPrisma.feedback.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      appId: 1,
      testerId: 2,
      participationId: 1,
      overallRating: 4,
      ratings: [],
    } as any)
    ;(mockPrisma.feedbackRating.createMany as jest.Mock).mockResolvedValue({
      count: 2,
    })
    ;(mockPrisma.feedbackRating.findMany as jest.Mock).mockResolvedValue([
      { id: 1, feedbackId: 1, itemType: 'UI_UX', score: 4 },
      { id: 2, feedbackId: 1, itemType: 'STABILITY', score: 5 },
    ])

    const request = new NextRequest(
      'http://localhost:3000/api/feedback-ratings',
      {
        method: 'POST',
        body: JSON.stringify({
          feedbackId: 1,
          ratings: [
            { ratingType: 'UI_UX', score: 4 },
            { ratingType: 'STABILITY', score: 5 },
          ],
        }),
      }
    )
    await POST(request)

    // Verify createMany was called with properly mapped data
    expect(mockPrisma.feedbackRating.createMany).toHaveBeenCalledWith({
      data: [
        { feedbackId: 1, itemType: 'UI_UX', score: 4 },
        { feedbackId: 1, itemType: 'STABILITY', score: 5 },
      ],
    })
  })

  it('should handle server error gracefully', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    ;(mockPrisma.$transaction as jest.Mock).mockRejectedValue(
      new Error('DB error')
    )

    const request = new NextRequest(
      'http://localhost:3000/api/feedback-ratings',
      {
        method: 'POST',
        body: JSON.stringify({
          feedbackId: 1,
          ratings: [{ ratingType: 'UI_UX', score: 4 }],
        }),
      }
    )
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to create feedback ratings')
  })
})
