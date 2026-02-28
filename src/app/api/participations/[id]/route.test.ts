/**
 * @jest-environment node
 */
// @TASK P3-R6 - Participations Resource API Tests (Detail/Update)
// @SPEC TDD RED Phase: GET/PATCH /api/participations/[id]

import { NextRequest } from 'next/server'
import { GET, PATCH } from './route'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Mock dependencies
jest.mock('@/lib/auth')
jest.mock('@/lib/prisma', () => ({
  prisma: {
    participation: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}))

const mockGetSession = getSession as jest.MockedFunction<typeof getSession>
const mockPrisma = prisma as jest.Mocked<typeof prisma>

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

  it('should return 400 for invalid participation ID', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    const request = new NextRequest('http://localhost:3000/api/participations/invalid')
    const response = await GET(request, { params: { id: 'invalid' } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid participation ID')
  })

  it('should return 404 if participation not found', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })
    mockPrisma.participation.findUnique.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/participations/999')
    const response = await GET(request, { params: { id: '999' } })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Participation not found')
  })

  it('should return participation details successfully', async () => {
    const mockParticipation = {
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
        appName: 'Test App',
        packageName: 'com.test.app',
        status: 'IN_TESTING',
        testType: 'PAID_REWARD',
        rewardType: 'BASIC',
        rewardAmount: 50000,
      },
      tester: {
        id: 1,
        nickname: 'tester1',
        profileImageUrl: null,
        email: 'tester@test.com',
      },
      application: {
        id: 1,
        status: 'APPROVED',
        appliedAt: new Date('2024-01-01'),
        approvedAt: new Date('2024-01-01'),
      },
      feedback: null,
    }

    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })
    mockPrisma.participation.findUnique.mockResolvedValue(mockParticipation)

    const request = new NextRequest('http://localhost:3000/api/participations/1')
    const response = await GET(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('id', 1)
    expect(data).toHaveProperty('status', 'ACTIVE')
    expect(data).toHaveProperty('app')
    expect(data).toHaveProperty('tester')
    expect(data).toHaveProperty('application')
  })
})

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

  it('should return 400 for invalid participation ID', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    const request = new NextRequest('http://localhost:3000/api/participations/invalid', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'COMPLETED' }),
    })
    const response = await PATCH(request, { params: { id: 'invalid' } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid participation ID')
  })

  it('should return 404 if participation not found', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com', role: 'TESTER' },
      expires: '2024-12-31',
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

  it('should return 400 for invalid update data', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })
    mockPrisma.participation.findUnique.mockResolvedValue({
      id: 1,
      appId: 1,
      testerId: 1,
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
    })

    const request = new NextRequest('http://localhost:3000/api/participations/1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'INVALID_STATUS' }),
    })
    const response = await PATCH(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Validation error')
  })

  it('should update participation status to COMPLETED successfully', async () => {
    const updatedParticipation = {
      id: 1,
      appId: 1,
      testerId: 1,
      applicationId: 1,
      status: 'COMPLETED',
      rewardStatus: 'PAID',
      skipReason: null,
      lastAppRunAt: new Date('2024-01-05'),
      joinedAt: new Date('2024-01-01'),
      droppedAt: null,
      dropReason: null,
      completedAt: new Date('2024-01-10'),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-10'),
    }

    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })
    mockPrisma.participation.findUnique.mockResolvedValue({
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
    })
    mockPrisma.participation.update.mockResolvedValue(updatedParticipation)

    const request = new NextRequest('http://localhost:3000/api/participations/1', {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'COMPLETED',
        rewardStatus: 'PAID',
      }),
    })
    const response = await PATCH(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('status', 'COMPLETED')
    expect(data).toHaveProperty('rewardStatus', 'PAID')
    expect(data).toHaveProperty('completedAt')
  })

  it('should update participation status to DROPPED with reason', async () => {
    const updatedParticipation = {
      id: 1,
      appId: 1,
      testerId: 1,
      applicationId: 1,
      status: 'DROPPED',
      rewardStatus: 'NONE',
      skipReason: null,
      lastAppRunAt: null,
      joinedAt: new Date('2024-01-01'),
      droppedAt: new Date('2024-01-05'),
      dropReason: 'Not interested anymore',
      completedAt: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-05'),
    }

    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })
    mockPrisma.participation.findUnique.mockResolvedValue({
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
    })
    mockPrisma.participation.update.mockResolvedValue(updatedParticipation)

    const request = new NextRequest('http://localhost:3000/api/participations/1', {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'DROPPED',
        dropReason: 'Not interested anymore',
      }),
    })
    const response = await PATCH(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('status', 'DROPPED')
    expect(data).toHaveProperty('dropReason', 'Not interested anymore')
    expect(data).toHaveProperty('droppedAt')
  })

  it('should return 400 when transitioning from invalid state', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })
    mockPrisma.participation.findUnique.mockResolvedValue({
      id: 1,
      appId: 1,
      testerId: 1,
      applicationId: 1,
      status: 'COMPLETED',
      rewardStatus: 'PAID',
      skipReason: null,
      lastAppRunAt: null,
      joinedAt: new Date('2024-01-01'),
      droppedAt: null,
      dropReason: null,
      completedAt: new Date('2024-01-10'),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-10'),
    })

    const request = new NextRequest('http://localhost:3000/api/participations/1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'ACTIVE' }),
    })
    const response = await PATCH(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid status transition')
  })

  it('should update lastAppRunAt timestamp', async () => {
    const now = new Date()
    const updatedParticipation = {
      id: 1,
      appId: 1,
      testerId: 1,
      applicationId: 1,
      status: 'ACTIVE',
      rewardStatus: 'NONE',
      skipReason: null,
      lastAppRunAt: now,
      joinedAt: new Date('2024-01-01'),
      droppedAt: null,
      dropReason: null,
      completedAt: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: now,
    }

    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })
    mockPrisma.participation.findUnique.mockResolvedValue({
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
    })
    mockPrisma.participation.update.mockResolvedValue(updatedParticipation)

    const request = new NextRequest('http://localhost:3000/api/participations/1', {
      method: 'PATCH',
      body: JSON.stringify({ lastAppRunAt: now.toISOString() }),
    })
    const response = await PATCH(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('lastAppRunAt')
  })

  it('should update rewardStatus independently', async () => {
    const updatedParticipation = {
      id: 1,
      appId: 1,
      testerId: 1,
      applicationId: 1,
      status: 'COMPLETED',
      rewardStatus: 'PAID',
      skipReason: null,
      lastAppRunAt: new Date('2024-01-05'),
      joinedAt: new Date('2024-01-01'),
      droppedAt: null,
      dropReason: null,
      completedAt: new Date('2024-01-10'),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-11'),
    }

    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com', role: 'ADMIN' },
      expires: '2024-12-31',
    })
    mockPrisma.participation.findUnique.mockResolvedValue({
      id: 1,
      appId: 1,
      testerId: 1,
      applicationId: 1,
      status: 'COMPLETED',
      rewardStatus: 'NONE',
      skipReason: null,
      lastAppRunAt: new Date('2024-01-05'),
      joinedAt: new Date('2024-01-01'),
      droppedAt: null,
      dropReason: null,
      completedAt: new Date('2024-01-10'),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-10'),
    })
    mockPrisma.participation.update.mockResolvedValue(updatedParticipation)

    const request = new NextRequest('http://localhost:3000/api/participations/1', {
      method: 'PATCH',
      body: JSON.stringify({ rewardStatus: 'PAID' }),
    })
    const response = await PATCH(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('rewardStatus', 'PAID')
  })

  it('should require dropReason when status is DROPPED', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })
    mockPrisma.participation.findUnique.mockResolvedValue({
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
    })

    const request = new NextRequest('http://localhost:3000/api/participations/1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'DROPPED' }),
    })
    const response = await PATCH(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('dropReason is required when status is DROPPED')
  })
})
