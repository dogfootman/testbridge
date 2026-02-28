/**
 * @jest-environment node
 */
// @TASK P5-R7.2 - Feedbacks Detail API Tests
// @SPEC docs/planning/02-trd.md#feedbacks-API

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
  },
}))

import { GET } from './route'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const mockGetSession = getSession as jest.MockedFunction<typeof getSession>
const mockPrisma = prisma as jest.Mocked<typeof prisma>

// ======================================
// GET /api/feedbacks/[id]
// ======================================
describe('GET /api/feedbacks/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    mockGetSession.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/feedbacks/1')
    const response = await GET(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return 400 if id is not a valid number', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    const request = new NextRequest('http://localhost:3000/api/feedbacks/abc')
    const response = await GET(request, { params: { id: 'abc' } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid feedback ID')
  })

  it('should return 404 if feedback not found', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })
    ;(mockPrisma.feedback.findUnique as jest.Mock).mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/feedbacks/999')
    const response = await GET(request, { params: { id: '999' } })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Feedback not found')
  })

  it('should return feedback detail for the feedback author', async () => {
    const now = new Date()
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    ;(mockPrisma.feedback.findUnique as jest.Mock).mockResolvedValue({
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
      app: {
        id: 1,
        appName: 'Test App',
        developerId: 3,
      },
      ratings: [],
      bugReport: null,
    } as any)

    const request = new NextRequest('http://localhost:3000/api/feedbacks/1')
    const response = await GET(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('id', 1)
    expect(data).toHaveProperty('overallRating', 4)
    expect(data).toHaveProperty('comment', 'Great app!')
    expect(data.tester).toHaveProperty('nickname', 'tester1')
    expect(data.app).toHaveProperty('appName', 'Test App')
  })

  it('should return feedback detail for the app developer', async () => {
    const now = new Date()
    mockGetSession.mockResolvedValue({
      user: { id: '3', email: 'dev@test.com', role: 'DEVELOPER' },
      expires: '2024-12-31',
    })

    ;(mockPrisma.feedback.findUnique as jest.Mock).mockResolvedValue({
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
      app: {
        id: 1,
        appName: 'Test App',
        developerId: 3,
      },
      ratings: [],
      bugReport: null,
    } as any)

    const request = new NextRequest('http://localhost:3000/api/feedbacks/1')
    const response = await GET(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('id', 1)
  })

  it('should return 403 if user is not the author or app developer', async () => {
    const now = new Date()
    mockGetSession.mockResolvedValue({
      user: { id: '99', email: 'stranger@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    ;(mockPrisma.feedback.findUnique as jest.Mock).mockResolvedValue({
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
      app: {
        id: 1,
        appName: 'Test App',
        developerId: 3,
      },
      ratings: [],
      bugReport: null,
    } as any)

    const request = new NextRequest('http://localhost:3000/api/feedbacks/1')
    const response = await GET(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toBe('Forbidden')
  })

  it('should include ratings and bugReport relations', async () => {
    const now = new Date()
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    ;(mockPrisma.feedback.findUnique as jest.Mock).mockResolvedValue({
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
      app: {
        id: 1,
        appName: 'Test App',
        developerId: 2,
      },
      ratings: [
        { id: 1, feedbackId: 1, itemType: 'UI_UX', score: 4 },
        { id: 2, feedbackId: 1, itemType: 'PERFORMANCE', score: 3 },
      ],
      bugReport: {
        id: 1,
        feedbackId: 1,
        title: 'Crash on login',
        description: 'App crashes when clicking login button',
        deviceInfo: 'iPhone 15 Pro',
      },
    } as any)

    const request = new NextRequest('http://localhost:3000/api/feedbacks/1')
    const response = await GET(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.ratings).toHaveLength(2)
    expect(data.bugReport).toHaveProperty('title', 'Crash on login')
  })

  it('should handle server error gracefully', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })
    ;(mockPrisma.feedback.findUnique as jest.Mock).mockRejectedValue(new Error('DB error'))

    const request = new NextRequest('http://localhost:3000/api/feedbacks/1')
    const response = await GET(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to fetch feedback')
  })
})
