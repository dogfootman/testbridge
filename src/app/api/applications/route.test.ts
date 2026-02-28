/**
 * @jest-environment node
 */
// @TASK P3-R5.1 - Applications Resource API 테스트
// @SPEC docs/planning/02-trd.md#Applications-API

import { NextRequest } from 'next/server'

// Mock dependencies BEFORE imports
jest.mock('@/lib/auth', () => ({
  getSession: jest.fn(),
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    application: {
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
    app: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}))

import { GET, POST } from './route'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const mockGetSession = getSession as jest.MockedFunction<typeof getSession>
const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('POST /api/applications', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    mockGetSession.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/applications', {
      method: 'POST',
      body: JSON.stringify({ appId: 1, deviceInfo: 'Samsung Galaxy S23' }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return 400 if appId is missing', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    const request = new NextRequest('http://localhost:3000/api/applications', {
      method: 'POST',
      body: JSON.stringify({ deviceInfo: 'Samsung Galaxy S23' }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('appId is required')
  })

  it('should return 400 if appId is not a number', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    const request = new NextRequest('http://localhost:3000/api/applications', {
      method: 'POST',
      body: JSON.stringify({ appId: 'invalid', deviceInfo: 'Samsung Galaxy S23' }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('appId must be a number')
  })

  it('should return 404 if app not found', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })
    mockPrisma.app.findUnique.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/applications', {
      method: 'POST',
      body: JSON.stringify({ appId: 999, deviceInfo: 'Samsung Galaxy S23' }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('App not found')
  })

  it('should return 400 if app is not in RECRUITING status', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })
    mockPrisma.app.findUnique.mockResolvedValue({
      id: 1,
      status: 'COMPLETED',
      targetTesters: 10,
    } as any)

    const request = new NextRequest('http://localhost:3000/api/applications', {
      method: 'POST',
      body: JSON.stringify({ appId: 1, deviceInfo: 'Samsung Galaxy S23' }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('App is not currently recruiting testers')
  })

  it('should return 409 if user already applied', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })
    mockPrisma.app.findUnique.mockResolvedValue({
      id: 1,
      status: 'RECRUITING',
      targetTesters: 10,
      applications: [{ testerId: 2 }],
    } as any)

    const request = new NextRequest('http://localhost:3000/api/applications', {
      method: 'POST',
      body: JSON.stringify({ appId: 1, deviceInfo: 'Samsung Galaxy S23' }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.error).toBe('You have already applied to this app')
  })

  it('should create application with APPROVED status if slots available', async () => {
    const now = new Date()
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })
    mockPrisma.app.findUnique.mockResolvedValue({
      id: 1,
      status: 'RECRUITING',
      targetTesters: 10,
      applications: [],
    } as any)
    mockPrisma.application.count.mockResolvedValue(5)
    mockPrisma.application.create.mockResolvedValue({
      id: 1,
      appId: 1,
      testerId: 2,
      deviceInfo: 'Samsung Galaxy S23',
      message: null,
      status: 'APPROVED',
      appliedAt: now,
      approvedAt: now,
      createdAt: now,
      updatedAt: now,
    } as any)

    const request = new NextRequest('http://localhost:3000/api/applications', {
      method: 'POST',
      body: JSON.stringify({ appId: 1, deviceInfo: 'Samsung Galaxy S23' }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data).toHaveProperty('id', 1)
    expect(data).toHaveProperty('status', 'APPROVED')
    expect(data).toHaveProperty('appId', 1)
    expect(data).toHaveProperty('testerId', 2)
  })

  it('should create application with WAITLISTED status if slots full', async () => {
    const now = new Date()
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })
    mockPrisma.app.findUnique.mockResolvedValue({
      id: 1,
      status: 'RECRUITING',
      targetTesters: 10,
      applications: [],
    } as any)
    mockPrisma.application.count.mockResolvedValue(10)
    mockPrisma.application.create.mockResolvedValue({
      id: 1,
      appId: 1,
      testerId: 2,
      deviceInfo: 'Samsung Galaxy S23',
      message: null,
      status: 'WAITLISTED',
      appliedAt: now,
      approvedAt: null,
      createdAt: now,
      updatedAt: now,
    } as any)

    const request = new NextRequest('http://localhost:3000/api/applications', {
      method: 'POST',
      body: JSON.stringify({ appId: 1, deviceInfo: 'Samsung Galaxy S23' }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data).toHaveProperty('status', 'WAITLISTED')
  })

  it('should include optional message in application', async () => {
    const now = new Date()
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })
    mockPrisma.app.findUnique.mockResolvedValue({
      id: 1,
      status: 'RECRUITING',
      targetTesters: 10,
      applications: [],
    } as any)
    mockPrisma.application.count.mockResolvedValue(5)
    mockPrisma.application.create.mockResolvedValue({
      id: 1,
      appId: 1,
      testerId: 2,
      deviceInfo: 'Samsung Galaxy S23',
      message: 'I am excited to test this app!',
      status: 'APPROVED',
      appliedAt: now,
      approvedAt: now,
      createdAt: now,
      updatedAt: now,
    } as any)

    const request = new NextRequest('http://localhost:3000/api/applications', {
      method: 'POST',
      body: JSON.stringify({
        appId: 1,
        deviceInfo: 'Samsung Galaxy S23',
        message: 'I am excited to test this app!',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data).toHaveProperty('message', 'I am excited to test this app!')
  })
})

describe('GET /api/applications', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    mockGetSession.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/applications')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return all applications for authenticated user', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    const mockApplications = [
      {
        id: 1,
        appId: 1,
        testerId: 2,
        deviceInfo: 'Samsung Galaxy S23',
        message: null,
        status: 'APPROVED',
        appliedAt: new Date(),
        approvedAt: new Date(),
        app: {
          id: 1,
          appName: 'Test App 1',
          packageName: 'com.test.app1',
        },
      },
      {
        id: 2,
        appId: 2,
        testerId: 2,
        deviceInfo: 'iPhone 14 Pro',
        message: null,
        status: 'PENDING',
        appliedAt: new Date(),
        approvedAt: null,
        app: {
          id: 2,
          appName: 'Test App 2',
          packageName: 'com.test.app2',
        },
      },
    ]

    mockPrisma.application.findMany.mockResolvedValue(mockApplications as any)

    const request = new NextRequest('http://localhost:3000/api/applications')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveLength(2)
    expect(data[0]).toHaveProperty('id', 1)
    expect(data[0]).toHaveProperty('status', 'APPROVED')
    expect(data[0].app).toHaveProperty('appName', 'Test App 1')
  })

  it('should filter applications by appId query parameter', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    const mockApplications = [
      {
        id: 1,
        appId: 1,
        testerId: 2,
        deviceInfo: 'Samsung Galaxy S23',
        message: null,
        status: 'APPROVED',
        appliedAt: new Date(),
        approvedAt: new Date(),
        app: {
          id: 1,
          appName: 'Test App 1',
          packageName: 'com.test.app1',
        },
      },
    ]

    mockPrisma.application.findMany.mockResolvedValue(mockApplications as any)

    const request = new NextRequest('http://localhost:3000/api/applications?appId=1')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(mockPrisma.application.findMany).toHaveBeenCalledWith({
      where: {
        testerId: 2,
        appId: 1,
      },
      include: {
        app: {
          select: {
            id: true,
            appName: true,
            packageName: true,
            categoryId: true,
            description: true,
            status: true,
          },
        },
      },
      orderBy: {
        appliedAt: 'desc',
      },
    })
    expect(data).toHaveLength(1)
    expect(data[0].appId).toBe(1)
  })

  it('should return empty array when no applications found', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    mockPrisma.application.findMany.mockResolvedValue([])

    const request = new NextRequest('http://localhost:3000/api/applications')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual([])
  })
})
