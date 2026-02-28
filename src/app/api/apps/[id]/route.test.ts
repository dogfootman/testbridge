/**
 * @jest-environment @edge-runtime/jest-environment
 */

/**
 * @jest-environment node
 */
// @TASK P3-R4 - Apps Resource API Tests (Detail/Update/Delete)
// @SPEC TDD RED Phase: GET/PATCH/DELETE /api/apps/[id]

import { NextRequest } from 'next/server'
import { GET, PATCH, DELETE } from './route'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Mock dependencies
jest.mock('@/lib/auth')
jest.mock('@/lib/prisma', () => ({
  prisma: {
    app: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    category: {
      findUnique: jest.fn(),
    },
  },
}))

const mockGetSession = getSession as jest.MockedFunction<typeof getSession>
const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('GET /api/apps/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 400 for invalid app ID', async () => {
    const request = new NextRequest('http://localhost:3000/api/apps/invalid')
    const response = await GET(request, { params: { id: 'invalid' } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid app ID')
  })

  it('should return 404 if app not found', async () => {
    mockPrisma.app.findUnique.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/apps/999')
    const response = await GET(request, { params: { id: '999' } })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('App not found')
  })

  it('should return app details successfully', async () => {
    const mockApp = {
      id: 1,
      developerId: 1,
      appName: 'Test App',
      packageName: 'com.test.app',
      categoryId: 1,
      description: 'Test description',
      testType: 'PAID_REWARD',
      targetTesters: 20,
      testLink: 'https://example.com/app',
      rewardType: 'BASIC',
      rewardAmount: 50000,
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
      category: { id: 1, name: 'Productivity', icon: '📝' },
      developer: { id: 1, nickname: 'dev1', profileImageUrl: null },
      images: [
        { id: 1, type: 'ICON', url: 'https://example.com/icon.png' },
      ],
    }

    mockPrisma.app.findUnique.mockResolvedValue(mockApp)

    const request = new NextRequest('http://localhost:3000/api/apps/1')
    const response = await GET(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('id', 1)
    expect(data).toHaveProperty('appName', 'Test App')
    expect(data).toHaveProperty('category')
    expect(data).toHaveProperty('developer')
  })
})

describe('PATCH /api/apps/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    mockGetSession.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/apps/1', {
      method: 'PATCH',
      body: JSON.stringify({ appName: 'Updated App' }),
    })
    const response = await PATCH(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return 400 for invalid app ID', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com', role: 'DEVELOPER' },
      expires: '2024-12-31',
    })

    const request = new NextRequest('http://localhost:3000/api/apps/invalid', {
      method: 'PATCH',
      body: JSON.stringify({ appName: 'Updated App' }),
    })
    const response = await PATCH(request, { params: { id: 'invalid' } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid app ID')
  })

  it('should return 404 if app not found', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com', role: 'DEVELOPER' },
      expires: '2024-12-31',
    })
    mockPrisma.app.findUnique.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/apps/999', {
      method: 'PATCH',
      body: JSON.stringify({ appName: 'Updated App' }),
    })
    const response = await PATCH(request, { params: { id: '999' } })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('App not found')
  })

  it('should return 403 if user is not the app owner', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'other@test.com', role: 'DEVELOPER' },
      expires: '2024-12-31',
    })
    mockPrisma.app.findUnique.mockResolvedValue({
      id: 1,
      developerId: 1,
      appName: 'Test App',
      packageName: 'com.test.app',
      categoryId: 1,
      description: 'Test description',
      testType: 'PAID_REWARD',
      targetTesters: 20,
      testLink: 'https://example.com/app',
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
    })

    const request = new NextRequest('http://localhost:3000/api/apps/1', {
      method: 'PATCH',
      body: JSON.stringify({ appName: 'Updated App' }),
    })
    const response = await PATCH(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toBe('Forbidden')
  })

  it('should return 400 for invalid update data', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com', role: 'DEVELOPER' },
      expires: '2024-12-31',
    })
    mockPrisma.app.findUnique.mockResolvedValue({
      id: 1,
      developerId: 1,
      appName: 'Test App',
      packageName: 'com.test.app',
      categoryId: 1,
      description: 'Test description',
      testType: 'PAID_REWARD',
      targetTesters: 20,
      testLink: 'https://example.com/app',
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
    })

    const request = new NextRequest('http://localhost:3000/api/apps/1', {
      method: 'PATCH',
      body: JSON.stringify({ description: 'short' }), // Too short
    })
    const response = await PATCH(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Validation error')
  })

  it('should update app successfully', async () => {
    const updatedApp = {
      id: 1,
      developerId: 1,
      appName: 'Updated App',
      packageName: 'com.test.app',
      categoryId: 1,
      description: 'Updated description for the app',
      testType: 'PAID_REWARD',
      targetTesters: 30,
      testLink: 'https://example.com/app',
      rewardType: 'BASIC',
      rewardAmount: 60000,
      feedbackRequired: true,
      testGuide: 'Updated guide',
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
    }

    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com', role: 'DEVELOPER' },
      expires: '2024-12-31',
    })
    mockPrisma.app.findUnique.mockResolvedValue({
      id: 1,
      developerId: 1,
      appName: 'Test App',
      packageName: 'com.test.app',
      categoryId: 1,
      description: 'Test description',
      testType: 'PAID_REWARD',
      targetTesters: 20,
      testLink: 'https://example.com/app',
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
    })
    mockPrisma.app.update.mockResolvedValue(updatedApp)

    const request = new NextRequest('http://localhost:3000/api/apps/1', {
      method: 'PATCH',
      body: JSON.stringify({
        appName: 'Updated App',
        description: 'Updated description for the app',
        targetTesters: 30,
      }),
    })
    const response = await PATCH(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('appName', 'Updated App')
    expect(data).toHaveProperty('description', 'Updated description for the app')
  })
})

describe('DELETE /api/apps/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    mockGetSession.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/apps/1', {
      method: 'DELETE',
    })
    const response = await DELETE(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return 400 for invalid app ID', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com', role: 'DEVELOPER' },
      expires: '2024-12-31',
    })

    const request = new NextRequest('http://localhost:3000/api/apps/invalid', {
      method: 'DELETE',
    })
    const response = await DELETE(request, { params: { id: 'invalid' } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid app ID')
  })

  it('should return 404 if app not found', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com', role: 'DEVELOPER' },
      expires: '2024-12-31',
    })
    mockPrisma.app.findUnique.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/apps/999', {
      method: 'DELETE',
    })
    const response = await DELETE(request, { params: { id: '999' } })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('App not found')
  })

  it('should return 403 if user is not the app owner', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'other@test.com', role: 'DEVELOPER' },
      expires: '2024-12-31',
    })
    mockPrisma.app.findUnique.mockResolvedValue({
      id: 1,
      developerId: 1,
      appName: 'Test App',
      packageName: 'com.test.app',
      categoryId: 1,
      description: 'Test description',
      testType: 'PAID_REWARD',
      targetTesters: 20,
      testLink: 'https://example.com/app',
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
    })

    const request = new NextRequest('http://localhost:3000/api/apps/1', {
      method: 'DELETE',
    })
    const response = await DELETE(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toBe('Forbidden')
  })

  it('should soft delete app successfully', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com', role: 'DEVELOPER' },
      expires: '2024-12-31',
    })
    mockPrisma.app.findUnique.mockResolvedValue({
      id: 1,
      developerId: 1,
      appName: 'Test App',
      packageName: 'com.test.app',
      categoryId: 1,
      description: 'Test description',
      testType: 'PAID_REWARD',
      targetTesters: 20,
      testLink: 'https://example.com/app',
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
    })
    mockPrisma.app.update.mockResolvedValue({
      id: 1,
      developerId: 1,
      appName: 'Test App',
      packageName: 'com.test.app',
      categoryId: 1,
      description: 'Test description',
      testType: 'PAID_REWARD',
      targetTesters: 20,
      testLink: 'https://example.com/app',
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
      deletedAt: new Date(),
    })

    const request = new NextRequest('http://localhost:3000/api/apps/1', {
      method: 'DELETE',
    })
    const response = await DELETE(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('App deleted successfully')
  })
})
