/**
 * @jest-environment @edge-runtime/jest-environment
 */

import { NextRequest } from 'next/server'
import { GET } from './route'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Mock dependencies
jest.mock('@/lib/auth')
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}))

const mockGetSession = getSession as jest.MockedFunction<typeof getSession>
const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('GET /api/users/me', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    mockGetSession.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/users/me')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return 404 if current user not found in database', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })
    mockPrisma.user.findUnique.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/users/me')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('User not found')
  })

  it('should return current user data successfully', async () => {
    const mockUser = {
      id: 1,
      email: 'test@test.com',
      emailHash: 'hash',
      name: 'Current User',
      nickname: 'currentuser',
      bio: 'My bio',
      profileImageUrl: 'http://example.com/me.jpg',
      role: 'TESTER',
      status: 'ACTIVE',
      currentPlan: 'FREE',
      pointBalance: 200,
      creditBalance: 100,
      trustScore: 80,
      trustBadge: 'SILVER',
      remainingApps: 5,
      provider: 'GOOGLE',
      providerId: 'google-456',
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

    const request = new NextRequest('http://localhost:3000/api/users/me')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('id', 1)
    expect(data).toHaveProperty('email', 'test@test.com')
    expect(data).toHaveProperty('name', 'Current User')
    expect(data).toHaveProperty('nickname', 'currentuser')
  })
})
