/**
 * @jest-environment @edge-runtime/jest-environment
 */

import { NextRequest } from 'next/server'
import { GET, PATCH } from './route'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Mock dependencies
jest.mock('@/lib/auth')
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}))

const mockGetSession = getSession as jest.MockedFunction<typeof getSession>
const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('GET /api/users/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    mockGetSession.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/users/1')
    const response = await GET(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return 404 if user not found', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })
    mockPrisma.user.findUnique.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/users/999')
    const response = await GET(request, { params: { id: '999' } })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('User not found')
  })

  it('should return user data successfully', async () => {
    const mockUser = {
      id: 1,
      email: 'test@test.com',
      emailHash: 'hash',
      name: 'Test User',
      nickname: 'tester',
      bio: 'Test bio',
      profileImageUrl: 'http://example.com/image.jpg',
      role: 'TESTER',
      status: 'ACTIVE',
      currentPlan: 'FREE',
      pointBalance: 100,
      creditBalance: 50,
      trustScore: 75,
      trustBadge: 'BRONZE',
      remainingApps: 1,
      provider: 'GOOGLE',
      providerId: 'google-123',
      lastLoginAt: new Date(),
      nicknameChangedAt: null,
      suspendedAt: null,
      suspendedReason: null,
      suspendedUntil: null,
      withdrawnAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    }

    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })
    mockPrisma.user.findUnique.mockResolvedValue(mockUser)

    const request = new NextRequest('http://localhost:3000/api/users/1')
    const response = await GET(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('id', 1)
    expect(data).toHaveProperty('email', 'test@test.com')
    expect(data).toHaveProperty('name', 'Test User')
  })

  it('should return 400 for invalid user ID', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    const request = new NextRequest('http://localhost:3000/api/users/invalid')
    const response = await GET(request, { params: { id: 'invalid' } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid user ID')
  })
})

describe('PATCH /api/users/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    mockGetSession.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/users/1', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'Updated Name' }),
    })
    const response = await PATCH(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return 403 if user tries to update another user', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    const request = new NextRequest('http://localhost:3000/api/users/2', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'Updated Name' }),
    })
    const response = await PATCH(request, { params: { id: '2' } })
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toBe('Forbidden')
  })

  it('should return 400 for invalid input data', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    const request = new NextRequest('http://localhost:3000/api/users/1', {
      method: 'PATCH',
      body: JSON.stringify({ nickname: 'a' }), // Too short
    })
    const response = await PATCH(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Validation error')
  })

  it('should update user successfully', async () => {
    const updatedUser = {
      id: 1,
      email: 'test@test.com',
      emailHash: 'hash',
      name: 'Updated Name',
      nickname: 'newtester',
      bio: 'Updated bio',
      profileImageUrl: 'http://example.com/new.jpg',
      role: 'TESTER',
      status: 'ACTIVE',
      currentPlan: 'FREE',
      pointBalance: 100,
      creditBalance: 50,
      trustScore: 75,
      trustBadge: 'BRONZE',
      remainingApps: 1,
      provider: 'GOOGLE',
      providerId: 'google-123',
      lastLoginAt: new Date(),
      nicknameChangedAt: null,
      suspendedAt: null,
      suspendedReason: null,
      suspendedUntil: null,
      withdrawnAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    }

    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })
    mockPrisma.user.update.mockResolvedValue(updatedUser)

    const request = new NextRequest('http://localhost:3000/api/users/1', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'Updated Name', bio: 'Updated bio' }),
    })
    const response = await PATCH(request, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('name', 'Updated Name')
    expect(data).toHaveProperty('bio', 'Updated bio')
  })
})
