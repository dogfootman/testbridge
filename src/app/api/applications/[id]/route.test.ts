// @TASK P3-R5.2 - Application Approval/Rejection API 테스트
// @SPEC docs/planning/02-trd.md#Applications-Status-Update

import { NextRequest } from 'next/server'

// Mock dependencies BEFORE imports
jest.mock('@/lib/auth', () => ({
  getSession: jest.fn(),
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    application: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
    },
    app: {
      findUnique: jest.fn(),
    },
  },
}))

import { PATCH } from './route'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const mockGetSession = getSession as jest.MockedFunction<typeof getSession>
const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('PATCH /api/applications/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    mockGetSession.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/applications/1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'APPROVED' }),
    })
    const response = await PATCH(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return 400 if status is missing', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'dev@test.com', role: 'DEVELOPER' },
      expires: '2024-12-31',
    })

    const request = new NextRequest('http://localhost:3000/api/applications/1', {
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
      user: { id: '1', email: 'dev@test.com', role: 'DEVELOPER' },
      expires: '2024-12-31',
    })

    const request = new NextRequest('http://localhost:3000/api/applications/1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'INVALID_STATUS' }),
    })
    const response = await PATCH(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('status must be either APPROVED or REJECTED')
  })

  it('should return 404 if application not found', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'dev@test.com', role: 'DEVELOPER' },
      expires: '2024-12-31',
    })
    mockPrisma.application.findUnique.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/applications/999', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'APPROVED' }),
    })
    const response = await PATCH(request, { params: { id: '999' } })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Application not found')
  })

  it('should return 403 if user is not the app developer', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'other@test.com', role: 'DEVELOPER' },
      expires: '2024-12-31',
    })
    mockPrisma.application.findUnique.mockResolvedValue({
      id: 1,
      appId: 1,
      testerId: 3,
      status: 'PENDING',
      app: {
        developerId: 1,
      },
    } as any)

    const request = new NextRequest('http://localhost:3000/api/applications/1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'APPROVED' }),
    })
    const response = await PATCH(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toBe('Forbidden')
  })

  it('should return 400 if application is not in PENDING or WAITLISTED status', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'dev@test.com', role: 'DEVELOPER' },
      expires: '2024-12-31',
    })
    mockPrisma.application.findUnique.mockResolvedValue({
      id: 1,
      appId: 1,
      testerId: 3,
      status: 'APPROVED',
      app: {
        developerId: 1,
      },
    } as any)

    const request = new NextRequest('http://localhost:3000/api/applications/1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'REJECTED' }),
    })
    const response = await PATCH(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Application is not in PENDING or WAITLISTED status')
  })

  it('should approve application successfully', async () => {
    const now = new Date()
    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'dev@test.com', role: 'DEVELOPER' },
      expires: '2024-12-31',
    })
    mockPrisma.application.findUnique.mockResolvedValue({
      id: 1,
      appId: 1,
      testerId: 3,
      status: 'PENDING',
      app: {
        developerId: 1,
      },
    } as any)
    mockPrisma.application.update.mockResolvedValue({
      id: 1,
      appId: 1,
      testerId: 3,
      deviceInfo: 'Samsung Galaxy S23',
      message: null,
      status: 'APPROVED',
      appliedAt: now,
      approvedAt: now,
      createdAt: now,
      updatedAt: now,
    } as any)

    const request = new NextRequest('http://localhost:3000/api/applications/1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'APPROVED' }),
    })
    const response = await PATCH(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('status', 'APPROVED')
    expect(data).toHaveProperty('approvedAt')
    expect(mockPrisma.application.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        status: 'APPROVED',
        approvedAt: expect.any(Date),
      },
    })
  })

  it('should reject application successfully', async () => {
    const now = new Date()
    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'dev@test.com', role: 'DEVELOPER' },
      expires: '2024-12-31',
    })
    mockPrisma.application.findUnique.mockResolvedValue({
      id: 1,
      appId: 1,
      testerId: 3,
      status: 'PENDING',
      app: {
        developerId: 1,
      },
    } as any)
    mockPrisma.application.update.mockResolvedValue({
      id: 1,
      appId: 1,
      testerId: 3,
      deviceInfo: 'Samsung Galaxy S23',
      message: null,
      status: 'REJECTED',
      appliedAt: now,
      approvedAt: null,
      createdAt: now,
      updatedAt: now,
    } as any)

    const request = new NextRequest('http://localhost:3000/api/applications/1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'REJECTED' }),
    })
    const response = await PATCH(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('status', 'REJECTED')
    expect(mockPrisma.application.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        status: 'REJECTED',
        approvedAt: null,
      },
    })
  })

  it('should auto-approve first waitlisted application when approved count reaches targetTesters', async () => {
    const now = new Date()
    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'dev@test.com', role: 'DEVELOPER' },
      expires: '2024-12-31',
    })

    // First call: get application being rejected
    mockPrisma.application.findUnique.mockResolvedValueOnce({
      id: 1,
      appId: 1,
      testerId: 3,
      status: 'APPROVED',
      app: {
        id: 1,
        developerId: 1,
        targetTesters: 10,
      },
    } as any)

    // After rejection, find first waitlisted
    mockPrisma.application.findFirst.mockResolvedValue({
      id: 5,
      appId: 1,
      testerId: 10,
      status: 'WAITLISTED',
    } as any)

    mockPrisma.application.update
      .mockResolvedValueOnce({
        id: 1,
        appId: 1,
        testerId: 3,
        status: 'REJECTED',
        appliedAt: now,
        approvedAt: null,
        createdAt: now,
        updatedAt: now,
      } as any)
      .mockResolvedValueOnce({
        id: 5,
        appId: 1,
        testerId: 10,
        status: 'APPROVED',
        appliedAt: now,
        approvedAt: now,
        createdAt: now,
        updatedAt: now,
      } as any)

    const request = new NextRequest('http://localhost:3000/api/applications/1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'REJECTED' }),
    })
    const response = await PATCH(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('status', 'REJECTED')

    // Verify waitlisted application was auto-approved
    expect(mockPrisma.application.findFirst).toHaveBeenCalledWith({
      where: {
        appId: 1,
        status: 'WAITLISTED',
      },
      orderBy: {
        appliedAt: 'asc',
      },
    })
    expect(mockPrisma.application.update).toHaveBeenCalledTimes(2)
  })
})
