/**
 * @jest-environment @edge-runtime/jest-environment
 */

// @TASK P3-R4 - Apps Resource API Tests
// @SPEC TDD RED Phase: POST /api/apps, GET /api/apps

import { NextRequest } from 'next/server'
import { GET, POST } from './route'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Mock dependencies
jest.mock('@/lib/auth')
jest.mock('@/lib/prisma', () => ({
  prisma: {
    app: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    category: {
      findUnique: jest.fn(),
    },
  },
}))

const mockGetSession = getSession as jest.MockedFunction<typeof getSession>
const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('POST /api/apps', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    mockGetSession.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/apps', {
      method: 'POST',
      body: JSON.stringify({
        appName: 'Test App',
        packageName: 'com.test.app',
        categoryId: 1,
        description: 'Test description for the app',
        testType: 'PAID_REWARD',
        targetTesters: 20,
        testLink: 'https://play.google.com/store/apps/details?id=com.test.app',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return 403 if user is not DEVELOPER or BOTH', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    const request = new NextRequest('http://localhost:3000/api/apps', {
      method: 'POST',
      body: JSON.stringify({
        appName: 'Test App',
        packageName: 'com.test.app',
        categoryId: 1,
        description: 'Test description for the app',
        testType: 'PAID_REWARD',
        targetTesters: 20,
        testLink: 'https://play.google.com/store/apps/details?id=com.test.app',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toBe('Only developers can create apps')
  })

  it('should return 400 for invalid input data', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com', role: 'DEVELOPER' },
      expires: '2024-12-31',
    })

    const request = new NextRequest('http://localhost:3000/api/apps', {
      method: 'POST',
      body: JSON.stringify({
        appName: '', // Empty name
        packageName: 'com.test.app',
        categoryId: 1,
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Validation error')
  })

  it('should return 400 if category does not exist', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com', role: 'DEVELOPER' },
      expires: '2024-12-31',
    })
    mockPrisma.category.findUnique.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/apps', {
      method: 'POST',
      body: JSON.stringify({
        appName: 'Test App',
        packageName: 'com.test.app',
        categoryId: 999,
        description: 'Test description for the app',
        testType: 'PAID_REWARD',
        targetTesters: 20,
        testLink: 'https://play.google.com/store/apps/details?id=com.test.app',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid category')
  })

  it('should return 409 if packageName already exists', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com', role: 'DEVELOPER' },
      expires: '2024-12-31',
    })
    mockPrisma.category.findUnique.mockResolvedValue({
      id: 1,
      name: 'Productivity',
      icon: '📝',
      sortOrder: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    mockPrisma.app.create.mockRejectedValue({
      code: 'P2002', // Prisma unique constraint violation
      meta: { target: ['packageName'] },
    })

    const request = new NextRequest('http://localhost:3000/api/apps', {
      method: 'POST',
      body: JSON.stringify({
        appName: 'Test App',
        packageName: 'com.existing.app',
        categoryId: 1,
        description: 'Test description for the app',
        testType: 'PAID_REWARD',
        targetTesters: 20,
        testLink: 'https://play.google.com/store/apps/details?id=com.test.app',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.error).toBe('Package name already exists')
  })

  it('should create app successfully', async () => {
    const mockApp = {
      id: 1,
      developerId: 1,
      appName: 'Test App',
      packageName: 'com.test.app',
      categoryId: 1,
      description: 'Test description for the app',
      testType: 'PAID_REWARD',
      targetTesters: 20,
      testLink: 'https://play.google.com/store/apps/details?id=com.test.app',
      rewardType: null,
      rewardAmount: null,
      feedbackRequired: false,
      testGuide: null,
      status: 'PENDING_APPROVAL',
      rejectedReason: null,
      blockedReason: null,
      testStartDate: null,
      testEndDate: null,
      approvedAt: null,
      productionConfirmedAt: null,
      boostActiveUntil: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    }

    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com', role: 'DEVELOPER' },
      expires: '2024-12-31',
    })
    mockPrisma.category.findUnique.mockResolvedValue({
      id: 1,
      name: 'Productivity',
      icon: '📝',
      sortOrder: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    mockPrisma.app.create.mockResolvedValue(mockApp)

    const request = new NextRequest('http://localhost:3000/api/apps', {
      method: 'POST',
      body: JSON.stringify({
        appName: 'Test App',
        packageName: 'com.test.app',
        categoryId: 1,
        description: 'Test description for the app',
        testType: 'PAID_REWARD',
        targetTesters: 20,
        testLink: 'https://play.google.com/store/apps/details?id=com.test.app',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data).toHaveProperty('id', 1)
    expect(data).toHaveProperty('appName', 'Test App')
    expect(data).toHaveProperty('packageName', 'com.test.app')
    expect(data).toHaveProperty('status', 'PENDING_APPROVAL')
  })
})

describe('GET /api/apps', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return apps list with pagination', async () => {
    const mockApps = [
      {
        id: 1,
        developerId: 1,
        appName: 'Test App 1',
        packageName: 'com.test.app1',
        categoryId: 1,
        description: 'Test description 1',
        testType: 'PAID_REWARD',
        targetTesters: 20,
        testLink: 'https://example.com/app1',
        rewardType: null,
        rewardAmount: null,
        feedbackRequired: false,
        testGuide: null,
        status: 'RECRUITING',
        rejectedReason: null,
        blockedReason: null,
        testStartDate: null,
        testEndDate: null,
        approvedAt: new Date(),
        productionConfirmedAt: null,
        boostActiveUntil: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
        deletedAt: null,
        category: { id: 1, name: 'Productivity', icon: '📝', sortOrder: 1 },
        developer: { id: 1, nickname: 'dev1', profileImageUrl: null },
      },
      {
        id: 2,
        developerId: 2,
        appName: 'Test App 2',
        packageName: 'com.test.app2',
        categoryId: 2,
        description: 'Test description 2',
        testType: 'CREDIT_EXCHANGE',
        targetTesters: 30,
        testLink: 'https://example.com/app2',
        rewardType: null,
        rewardAmount: null,
        feedbackRequired: true,
        testGuide: 'Test guide',
        status: 'IN_TESTING',
        rejectedReason: null,
        blockedReason: null,
        testStartDate: null,
        testEndDate: null,
        approvedAt: new Date(),
        productionConfirmedAt: null,
        boostActiveUntil: null,
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date(),
        deletedAt: null,
        category: { id: 2, name: 'Games', icon: '🎮', sortOrder: 2 },
        developer: { id: 2, nickname: 'dev2', profileImageUrl: null },
      },
    ]

    mockPrisma.app.findMany.mockResolvedValue(mockApps)
    mockPrisma.app.count.mockResolvedValue(2)

    const request = new NextRequest('http://localhost:3000/api/apps?page=1&limit=10')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('apps')
    expect(data).toHaveProperty('total', 2)
    expect(data).toHaveProperty('page', 1)
    expect(data).toHaveProperty('limit', 10)
    expect(data.apps).toHaveLength(2)
    expect(data.apps[0]).toHaveProperty('appName', 'Test App 1')
  })

  it('should filter apps by status', async () => {
    const mockApps = [
      {
        id: 1,
        developerId: 1,
        appName: 'Test App 1',
        packageName: 'com.test.app1',
        categoryId: 1,
        description: 'Test description 1',
        testType: 'PAID_REWARD',
        targetTesters: 20,
        testLink: 'https://example.com/app1',
        rewardType: null,
        rewardAmount: null,
        feedbackRequired: false,
        testGuide: null,
        status: 'RECRUITING',
        rejectedReason: null,
        blockedReason: null,
        testStartDate: null,
        testEndDate: null,
        approvedAt: new Date(),
        productionConfirmedAt: null,
        boostActiveUntil: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        category: { id: 1, name: 'Productivity', icon: '📝', sortOrder: 1 },
        developer: { id: 1, nickname: 'dev1', profileImageUrl: null },
      },
    ]

    mockPrisma.app.findMany.mockResolvedValue(mockApps)
    mockPrisma.app.count.mockResolvedValue(1)

    const request = new NextRequest('http://localhost:3000/api/apps?status=RECRUITING')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.apps).toHaveLength(1)
    expect(data.apps[0].status).toBe('RECRUITING')
  })

  it('should filter apps by categoryId', async () => {
    const mockApps = [
      {
        id: 1,
        developerId: 1,
        appName: 'Test App 1',
        packageName: 'com.test.app1',
        categoryId: 1,
        description: 'Test description 1',
        testType: 'PAID_REWARD',
        targetTesters: 20,
        testLink: 'https://example.com/app1',
        rewardType: null,
        rewardAmount: null,
        feedbackRequired: false,
        testGuide: null,
        status: 'RECRUITING',
        rejectedReason: null,
        blockedReason: null,
        testStartDate: null,
        testEndDate: null,
        approvedAt: new Date(),
        productionConfirmedAt: null,
        boostActiveUntil: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        category: { id: 1, name: 'Productivity', icon: '📝', sortOrder: 1 },
        developer: { id: 1, nickname: 'dev1', profileImageUrl: null },
      },
    ]

    mockPrisma.app.findMany.mockResolvedValue(mockApps)
    mockPrisma.app.count.mockResolvedValue(1)

    const request = new NextRequest('http://localhost:3000/api/apps?categoryId=1')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.apps).toHaveLength(1)
    expect(data.apps[0].categoryId).toBe(1)
  })

  it('should return empty array if no apps found', async () => {
    mockPrisma.app.findMany.mockResolvedValue([])
    mockPrisma.app.count.mockResolvedValue(0)

    const request = new NextRequest('http://localhost:3000/api/apps')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.apps).toEqual([])
    expect(data.total).toBe(0)
  })
})
