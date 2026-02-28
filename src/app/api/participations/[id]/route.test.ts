/**
 * @jest-environment node
 */
// @TASK P3-R6.2 - Participations Detail & Status Update API Tests
// @SPEC specs/screens/tester-participations.yaml

import { NextRequest } from 'next/server'

// Mock dependencies BEFORE imports
jest.mock('@/lib/auth', () => ({
  getSession: jest.fn(),
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    participation: {
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    app: {
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}))

import { GET, PATCH } from './route'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const mockGetSession = getSession as jest.MockedFunction<typeof getSession>
const mockPrisma = prisma as jest.Mocked<typeof prisma>

// ======================================
// GET /api/participations/[id]
// ======================================
describe('GET /api/participations/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    mockGetSession.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/participations/1')
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

    const request = new NextRequest('http://localhost:3000/api/participations/abc')
    const response = await GET(request, { params: { id: 'abc' } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid participation ID')
  })

  it('should return 404 if participation not found', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })
    mockPrisma.participation.findUnique.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/participations/999')
    const response = await GET(request, { params: { id: '999' } })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Participation not found')
  })

  it('should return 403 if user is not the participant or app developer', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '5', email: 'other@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })
    mockPrisma.participation.findUnique.mockResolvedValue({
      id: 1,
      appId: 1,
      testerId: 2,
      applicationId: 1,
      status: 'ACTIVE',
      rewardStatus: 'NONE',
      skipReason: null,
      lastAppRunAt: null,
      joinedAt: new Date(),
      droppedAt: null,
      dropReason: null,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      app: {
        id: 1,
        appName: 'Test App',
        developerId: 3,
        testStartDate: new Date(),
        testEndDate: new Date(),
        rewardAmount: 5000,
        rewardType: 'BASIC',
        feedbackRequired: true,
        images: [],
      },
      tester: {
        id: 2,
        nickname: 'tester1',
        email: 'tester@test.com',
        profileImageUrl: null,
      },
      feedback: null,
    } as any)

    const request = new NextRequest('http://localhost:3000/api/participations/1')
    const response = await GET(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toBe('Forbidden')
  })

  it('should return participation detail with progress for participant', async () => {
    const joinedAt = new Date(Date.now() - 7 * 86400000) // 7 days ago
    const testEndDate = new Date(Date.now() + 7 * 86400000) // 7 days from now

    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })
    mockPrisma.participation.findUnique.mockResolvedValue({
      id: 1,
      appId: 1,
      testerId: 2,
      applicationId: 1,
      status: 'ACTIVE',
      rewardStatus: 'NONE',
      skipReason: null,
      lastAppRunAt: new Date(),
      joinedAt,
      droppedAt: null,
      dropReason: null,
      completedAt: null,
      createdAt: joinedAt,
      updatedAt: new Date(),
      app: {
        id: 1,
        appName: 'Test App',
        developerId: 3,
        testStartDate: joinedAt,
        testEndDate,
        rewardAmount: 5000,
        rewardType: 'BASIC',
        feedbackRequired: true,
        images: [{ url: 'https://example.com/icon.png', type: 'ICON' }],
      },
      tester: {
        id: 2,
        nickname: 'tester1',
        email: 'tester@test.com',
        profileImageUrl: null,
      },
      feedback: null,
    } as any)

    const request = new NextRequest('http://localhost:3000/api/participations/1')
    const response = await GET(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('id', 1)
    expect(data).toHaveProperty('status', 'ACTIVE')
    expect(data).toHaveProperty('progress')
    expect(data.progress).toHaveProperty('daysPassed')
    expect(data.progress).toHaveProperty('totalDays', 14)
    expect(data.progress).toHaveProperty('percentage')
    expect(data.progress.daysPassed).toBeGreaterThanOrEqual(7)
    expect(data.progress.percentage).toBeGreaterThanOrEqual(50)
  })

  it('should return participation detail for app developer', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '3', email: 'dev@test.com', role: 'DEVELOPER' },
      expires: '2024-12-31',
    })
    mockPrisma.participation.findUnique.mockResolvedValue({
      id: 1,
      appId: 1,
      testerId: 2,
      applicationId: 1,
      status: 'ACTIVE',
      rewardStatus: 'NONE',
      skipReason: null,
      lastAppRunAt: null,
      joinedAt: new Date(),
      droppedAt: null,
      dropReason: null,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      app: {
        id: 1,
        appName: 'Test App',
        developerId: 3,
        testStartDate: new Date(),
        testEndDate: new Date(Date.now() + 14 * 86400000),
        rewardAmount: 5000,
        rewardType: 'BASIC',
        feedbackRequired: true,
        images: [],
      },
      tester: {
        id: 2,
        nickname: 'tester1',
        email: 'tester@test.com',
        profileImageUrl: null,
      },
      feedback: null,
    } as any)

    const request = new NextRequest('http://localhost:3000/api/participations/1')
    const response = await GET(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('id', 1)
  })

  it('should handle server error gracefully', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })
    mockPrisma.participation.findUnique.mockRejectedValue(new Error('DB error'))

    const request = new NextRequest('http://localhost:3000/api/participations/1')
    const response = await GET(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to fetch participation')
  })
})

// ======================================
// PATCH /api/participations/[id]
// ======================================
describe('PATCH /api/participations/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    mockGetSession.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/participations/1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'COMPLETED' }),
    })
    const response = await PATCH(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return 400 if id is not a valid number', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    const request = new NextRequest('http://localhost:3000/api/participations/abc', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'COMPLETED' }),
    })
    const response = await PATCH(request, { params: { id: 'abc' } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid participation ID')
  })

  it('should return 400 if status is missing', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    const request = new NextRequest('http://localhost:3000/api/participations/1', {
      method: 'PATCH',
      body: JSON.stringify({}),
    })
    const response = await PATCH(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('status is required')
  })

  it('should return 400 if status is invalid', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    const request = new NextRequest('http://localhost:3000/api/participations/1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'INVALID_STATUS' }),
    })
    const response = await PATCH(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('status must be one of: COMPLETED, DROPPED')
  })

  it('should return 404 if participation not found', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    // $transaction mock - execute the callback
    mockPrisma.$transaction.mockImplementation(async (cb: any) => {
      return cb(mockPrisma)
    })
    mockPrisma.participation.findUnique.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/participations/999', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'COMPLETED' }),
    })
    const response = await PATCH(request, { params: { id: '999' } })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Participation not found')
  })

  it('should return 403 if user is not the participant or app developer', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '5', email: 'other@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    mockPrisma.$transaction.mockImplementation(async (cb: any) => {
      return cb(mockPrisma)
    })
    mockPrisma.participation.findUnique.mockResolvedValue({
      id: 1,
      appId: 1,
      testerId: 2,
      status: 'ACTIVE',
      app: {
        id: 1,
        developerId: 3,
        targetTesters: 10,
      },
    } as any)

    const request = new NextRequest('http://localhost:3000/api/participations/1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'COMPLETED' }),
    })
    const response = await PATCH(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toBe('Forbidden')
  })

  it('should return 400 if participation is not ACTIVE', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    mockPrisma.$transaction.mockImplementation(async (cb: any) => {
      return cb(mockPrisma)
    })
    mockPrisma.participation.findUnique.mockResolvedValue({
      id: 1,
      appId: 1,
      testerId: 2,
      status: 'COMPLETED',
      app: {
        id: 1,
        developerId: 3,
        targetTesters: 10,
      },
    } as any)

    const request = new NextRequest('http://localhost:3000/api/participations/1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'DROPPED' }),
    })
    const response = await PATCH(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Participation is not in ACTIVE status')
  })

  // Status transition: ACTIVE -> COMPLETED
  it('should complete participation successfully', async () => {
    const now = new Date()
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    mockPrisma.$transaction.mockImplementation(async (cb: any) => {
      return cb(mockPrisma)
    })
    mockPrisma.participation.findUnique.mockResolvedValue({
      id: 1,
      appId: 1,
      testerId: 2,
      status: 'ACTIVE',
      app: {
        id: 1,
        developerId: 3,
        targetTesters: 10,
      },
    } as any)
    mockPrisma.participation.update.mockResolvedValue({
      id: 1,
      appId: 1,
      testerId: 2,
      applicationId: 1,
      status: 'COMPLETED',
      rewardStatus: 'NONE',
      completedAt: now,
      joinedAt: now,
      createdAt: now,
      updatedAt: now,
    } as any)
    // Check if all participants completed - not all done yet
    mockPrisma.participation.count
      .mockResolvedValueOnce(10) // total
      .mockResolvedValueOnce(5) // completed (not all)

    const request = new NextRequest('http://localhost:3000/api/participations/1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'COMPLETED' }),
    })
    const response = await PATCH(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('status', 'COMPLETED')
    expect(data).toHaveProperty('completedAt')
    expect(mockPrisma.participation.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        status: 'COMPLETED',
        completedAt: expect.any(Date),
      },
    })
  })

  // Status transition: ACTIVE -> DROPPED
  it('should drop participation with reason', async () => {
    const now = new Date()
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    mockPrisma.$transaction.mockImplementation(async (cb: any) => {
      return cb(mockPrisma)
    })
    mockPrisma.participation.findUnique.mockResolvedValue({
      id: 1,
      appId: 1,
      testerId: 2,
      status: 'ACTIVE',
      app: {
        id: 1,
        developerId: 3,
        targetTesters: 10,
      },
    } as any)
    mockPrisma.participation.update.mockResolvedValue({
      id: 1,
      appId: 1,
      testerId: 2,
      applicationId: 1,
      status: 'DROPPED',
      rewardStatus: 'NONE',
      droppedAt: now,
      dropReason: 'Personal reasons',
      joinedAt: now,
      createdAt: now,
      updatedAt: now,
    } as any)

    const request = new NextRequest('http://localhost:3000/api/participations/1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'DROPPED', dropReason: 'Personal reasons' }),
    })
    const response = await PATCH(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('status', 'DROPPED')
    expect(data).toHaveProperty('droppedAt')
    expect(data).toHaveProperty('dropReason', 'Personal reasons')
    expect(mockPrisma.participation.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        status: 'DROPPED',
        droppedAt: expect.any(Date),
        dropReason: 'Personal reasons',
      },
    })
  })

  // Dropout detection: 7 days without feedback
  it('should auto-drop participation as DROPPED for inactivity (dropout detection)', async () => {
    const sevenDaysAgo = new Date(Date.now() - 8 * 86400000) // 8 days ago, no feedback
    const now = new Date()

    mockGetSession.mockResolvedValue({
      user: { id: '3', email: 'dev@test.com', role: 'DEVELOPER' },
      expires: '2024-12-31',
    })

    mockPrisma.$transaction.mockImplementation(async (cb: any) => {
      return cb(mockPrisma)
    })
    mockPrisma.participation.findUnique.mockResolvedValue({
      id: 1,
      appId: 1,
      testerId: 2,
      status: 'ACTIVE',
      lastAppRunAt: sevenDaysAgo,
      joinedAt: new Date(Date.now() - 14 * 86400000),
      app: {
        id: 1,
        developerId: 3,
        targetTesters: 10,
      },
    } as any)
    mockPrisma.participation.update.mockResolvedValue({
      id: 1,
      appId: 1,
      testerId: 2,
      applicationId: 1,
      status: 'DROPPED',
      rewardStatus: 'NONE',
      droppedAt: now,
      dropReason: 'Inactivity: no app run for 7+ days',
      joinedAt: new Date(Date.now() - 14 * 86400000),
      createdAt: now,
      updatedAt: now,
    } as any)

    const request = new NextRequest('http://localhost:3000/api/participations/1', {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'DROPPED',
        dropReason: 'Inactivity: no app run for 7+ days',
      }),
    })
    const response = await PATCH(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('status', 'DROPPED')
    expect(data).toHaveProperty('dropReason', 'Inactivity: no app run for 7+ days')
  })

  // App status update when all participants complete
  it('should update app status to COMPLETED when all participants complete', async () => {
    const now = new Date()
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    mockPrisma.$transaction.mockImplementation(async (cb: any) => {
      return cb(mockPrisma)
    })
    mockPrisma.participation.findUnique.mockResolvedValue({
      id: 1,
      appId: 1,
      testerId: 2,
      status: 'ACTIVE',
      app: {
        id: 1,
        developerId: 3,
        targetTesters: 10,
        status: 'IN_TESTING',
      },
    } as any)
    mockPrisma.participation.update.mockResolvedValue({
      id: 1,
      appId: 1,
      testerId: 2,
      applicationId: 1,
      status: 'COMPLETED',
      rewardStatus: 'NONE',
      completedAt: now,
      joinedAt: now,
      createdAt: now,
      updatedAt: now,
    } as any)
    // All participants completed: total=10, completed=10 (including this one)
    mockPrisma.participation.count
      .mockResolvedValueOnce(10) // total participants
      .mockResolvedValueOnce(10) // completed participants (all done)
    mockPrisma.app.update.mockResolvedValue({} as any)

    const request = new NextRequest('http://localhost:3000/api/participations/1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'COMPLETED' }),
    })
    const response = await PATCH(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('status', 'COMPLETED')
    // Verify app status was updated
    expect(mockPrisma.app.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { status: 'COMPLETED' },
    })
  })

  it('should NOT update app status when not all participants complete', async () => {
    const now = new Date()
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    mockPrisma.$transaction.mockImplementation(async (cb: any) => {
      return cb(mockPrisma)
    })
    mockPrisma.participation.findUnique.mockResolvedValue({
      id: 1,
      appId: 1,
      testerId: 2,
      status: 'ACTIVE',
      app: {
        id: 1,
        developerId: 3,
        targetTesters: 10,
        status: 'IN_TESTING',
      },
    } as any)
    mockPrisma.participation.update.mockResolvedValue({
      id: 1,
      appId: 1,
      testerId: 2,
      applicationId: 1,
      status: 'COMPLETED',
      rewardStatus: 'NONE',
      completedAt: now,
      joinedAt: now,
      createdAt: now,
      updatedAt: now,
    } as any)
    // Not all completed: total=10, completed=5
    mockPrisma.participation.count
      .mockResolvedValueOnce(10) // total
      .mockResolvedValueOnce(5) // completed (not all)

    const request = new NextRequest('http://localhost:3000/api/participations/1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'COMPLETED' }),
    })
    const response = await PATCH(request, { params: { id: '1' } })

    expect(response.status).toBe(200)
    expect(mockPrisma.app.update).not.toHaveBeenCalled()
  })

  it('should handle dropReason validation (max 100 chars)', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    const longReason = 'A'.repeat(101)
    const request = new NextRequest('http://localhost:3000/api/participations/1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'DROPPED', dropReason: longReason }),
    })
    const response = await PATCH(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('dropReason must not exceed 100 characters')
  })

  it('should handle server error gracefully', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    mockPrisma.$transaction.mockRejectedValue(new Error('DB error'))

    const request = new NextRequest('http://localhost:3000/api/participations/1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'COMPLETED' }),
    })
    const response = await PATCH(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to update participation')
  })
})
