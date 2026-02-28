/**
 * @jest-environment node
 */
// @TASK P5-R9 - Bug Reports Resource API Tests
// @SPEC docs/planning/02-trd.md#bug-reports-API

import { NextRequest } from 'next/server'

// Mock dependencies BEFORE imports
jest.mock('@/lib/auth', () => ({
  getSession: jest.fn(),
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    bugReport: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    feedback: {
      findUnique: jest.fn(),
    },
    bugReportImage: {
      create: jest.fn(),
    },
  },
}))

import { POST, GET } from './route'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const mockGetSession = getSession as jest.MockedFunction<typeof getSession>
const mockPrisma = prisma as jest.Mocked<typeof prisma>

// ======================================
// POST /api/bug-reports
// ======================================
describe('POST /api/bug-reports', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    mockGetSession.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/bug-reports', {
      method: 'POST',
      body: JSON.stringify({
        feedbackId: 1,
        title: 'App crashes on login',
        description: 'The app crashes when I try to login with Google',
      }),
    })
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

    const request = new NextRequest('http://localhost:3000/api/bug-reports', {
      method: 'POST',
      body: JSON.stringify({
        title: 'App crashes on login',
        description: 'The app crashes when I try to login with Google',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('feedbackId')
  })

  it('should return 400 if title is missing', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    const request = new NextRequest('http://localhost:3000/api/bug-reports', {
      method: 'POST',
      body: JSON.stringify({
        feedbackId: 1,
        description: 'The app crashes when I try to login with Google',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('title')
  })

  it('should return 400 if description is missing', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    const request = new NextRequest('http://localhost:3000/api/bug-reports', {
      method: 'POST',
      body: JSON.stringify({
        feedbackId: 1,
        title: 'App crashes on login',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('description')
  })

  it('should return 400 if title exceeds 100 characters', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    const request = new NextRequest('http://localhost:3000/api/bug-reports', {
      method: 'POST',
      body: JSON.stringify({
        feedbackId: 1,
        title: 'a'.repeat(101),
        description: 'Some description',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('title')
  })

  it('should return 404 if feedback not found', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    ;(mockPrisma.feedback.findUnique as jest.Mock).mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/bug-reports', {
      method: 'POST',
      body: JSON.stringify({
        feedbackId: 999,
        title: 'App crashes on login',
        description: 'The app crashes when I try to login with Google',
      }),
    })
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

    ;(mockPrisma.feedback.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      appId: 1,
      testerId: 2,
      participationId: 1,
      overallRating: 4,
      comment: 'Great app!',
      bugReport: null,
    })

    const request = new NextRequest('http://localhost:3000/api/bug-reports', {
      method: 'POST',
      body: JSON.stringify({
        feedbackId: 1,
        title: 'App crashes on login',
        description: 'The app crashes when I try to login with Google',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toBe('Forbidden')
  })

  it('should return 409 if bug report already exists for this feedback', async () => {
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
      bugReport: { id: 10 },
    })

    const request = new NextRequest('http://localhost:3000/api/bug-reports', {
      method: 'POST',
      body: JSON.stringify({
        feedbackId: 1,
        title: 'App crashes on login',
        description: 'The app crashes when I try to login with Google',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.error).toBe('Bug report already exists for this feedback')
  })

  it('should create a bug report successfully', async () => {
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
      bugReport: null,
    })

    ;(mockPrisma.bugReport.create as jest.Mock).mockResolvedValue({
      id: 1,
      feedbackId: 1,
      title: 'App crashes on login',
      description: 'The app crashes when I try to login with Google',
      deviceInfo: null,
      createdAt: now,
    })

    const request = new NextRequest('http://localhost:3000/api/bug-reports', {
      method: 'POST',
      body: JSON.stringify({
        feedbackId: 1,
        title: 'App crashes on login',
        description: 'The app crashes when I try to login with Google',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data).toHaveProperty('id', 1)
    expect(data).toHaveProperty('feedbackId', 1)
    expect(data).toHaveProperty('title', 'App crashes on login')
    expect(data).toHaveProperty('description', 'The app crashes when I try to login with Google')
  })

  it('should create a bug report with optional deviceInfo', async () => {
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
      bugReport: null,
    })

    ;(mockPrisma.bugReport.create as jest.Mock).mockResolvedValue({
      id: 1,
      feedbackId: 1,
      title: 'App crashes on login',
      description: 'The app crashes when I try to login with Google',
      deviceInfo: 'Galaxy S24 Ultra / Android 15',
      createdAt: now,
    })

    const request = new NextRequest('http://localhost:3000/api/bug-reports', {
      method: 'POST',
      body: JSON.stringify({
        feedbackId: 1,
        title: 'App crashes on login',
        description: 'The app crashes when I try to login with Google',
        deviceInfo: 'Galaxy S24 Ultra / Android 15',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data).toHaveProperty('deviceInfo', 'Galaxy S24 Ultra / Android 15')
  })

  it('should create a bug report with screenshotUrl saved as BugReportImage', async () => {
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
      bugReport: null,
    })

    ;(mockPrisma.bugReport.create as jest.Mock).mockResolvedValue({
      id: 1,
      feedbackId: 1,
      title: 'App crashes on login',
      description: 'The app crashes when I try to login with Google',
      deviceInfo: null,
      createdAt: now,
      images: [],
    })

    ;(mockPrisma.bugReportImage.create as jest.Mock).mockResolvedValue({
      id: 1,
      bugReportId: 1,
      url: 'https://storage.example.com/screenshots/bug1.png',
      sortOrder: 0,
      createdAt: now,
    })

    const request = new NextRequest('http://localhost:3000/api/bug-reports', {
      method: 'POST',
      body: JSON.stringify({
        feedbackId: 1,
        title: 'App crashes on login',
        description: 'The app crashes when I try to login with Google',
        screenshotUrl: 'https://storage.example.com/screenshots/bug1.png',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(mockPrisma.bugReportImage.create).toHaveBeenCalledWith({
      data: {
        bugReportId: 1,
        url: 'https://storage.example.com/screenshots/bug1.png',
        sortOrder: 0,
      },
    })
  })

  it('should handle server error gracefully', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'tester@test.com', role: 'TESTER' },
      expires: '2024-12-31',
    })

    ;(mockPrisma.feedback.findUnique as jest.Mock).mockRejectedValue(new Error('DB error'))

    const request = new NextRequest('http://localhost:3000/api/bug-reports', {
      method: 'POST',
      body: JSON.stringify({
        feedbackId: 1,
        title: 'App crashes on login',
        description: 'The app crashes when I try to login with Google',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to create bug report')
  })
})

// ======================================
// GET /api/bug-reports
// ======================================
describe('GET /api/bug-reports', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return bug reports list without filters', async () => {
    const now = new Date()
    const mockBugReports = [
      {
        id: 1,
        feedbackId: 1,
        title: 'App crashes on login',
        description: 'The app crashes when I try to login with Google',
        deviceInfo: 'Galaxy S24 Ultra / Android 15',
        createdAt: now,
        feedback: {
          id: 1,
          appId: 1,
          testerId: 2,
          tester: {
            id: 2,
            nickname: 'tester1',
            email: 'tester@test.com',
            profileImageUrl: null,
          },
        },
        images: [],
      },
    ]

    ;(mockPrisma.bugReport.findMany as jest.Mock).mockResolvedValue(mockBugReports)

    const request = new NextRequest('http://localhost:3000/api/bug-reports')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveLength(1)
    expect(data[0]).toHaveProperty('id', 1)
    expect(data[0]).toHaveProperty('title', 'App crashes on login')
    expect(data[0]).toHaveProperty('feedback')
    expect(data[0].feedback.tester).toHaveProperty('nickname', 'tester1')
  })

  it('should filter bug reports by feedbackId query parameter', async () => {
    ;(mockPrisma.bugReport.findMany as jest.Mock).mockResolvedValue([])

    const request = new NextRequest('http://localhost:3000/api/bug-reports?feedbackId=1')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(mockPrisma.bugReport.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          feedbackId: 1,
        }),
      })
    )
  })

  it('should filter bug reports by appId query parameter', async () => {
    ;(mockPrisma.bugReport.findMany as jest.Mock).mockResolvedValue([])

    const request = new NextRequest('http://localhost:3000/api/bug-reports?appId=1')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(mockPrisma.bugReport.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          feedback: expect.objectContaining({
            appId: 1,
          }),
        }),
      })
    )
  })

  it('should return empty array when no bug reports found', async () => {
    ;(mockPrisma.bugReport.findMany as jest.Mock).mockResolvedValue([])

    const request = new NextRequest('http://localhost:3000/api/bug-reports')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual([])
  })

  it('should handle server error gracefully', async () => {
    ;(mockPrisma.bugReport.findMany as jest.Mock).mockRejectedValue(new Error('DB error'))

    const request = new NextRequest('http://localhost:3000/api/bug-reports')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to fetch bug reports')
  })
})
