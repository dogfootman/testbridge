// @TASK P5-R9 - Bug Reports Resource API (List + Create)
// @SPEC docs/planning/02-trd.md#bug-reports-API

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

/**
 * GET /api/bug-reports
 * Get bug reports list with optional filters (feedbackId, appId)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const feedbackIdParam = searchParams.get('feedbackId')
    const appIdParam = searchParams.get('appId')

    const where: {
      feedbackId?: number
      feedback?: { appId: number }
    } = {}

    if (feedbackIdParam) {
      where.feedbackId = parseInt(feedbackIdParam)
    }
    if (appIdParam) {
      where.feedback = { appId: parseInt(appIdParam) }
    }

    const bugReports = await prisma.bugReport.findMany({
      where,
      include: {
        feedback: {
          select: {
            id: true,
            appId: true,
            testerId: true,
            tester: {
              select: {
                id: true,
                nickname: true,
                email: true,
                profileImageUrl: true,
              },
            },
          },
        },
        images: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(bugReports, { status: 200 })
  } catch (error) {
    console.error('GET /api/bug-reports error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bug reports' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/bug-reports
 * Create a bug report for an existing feedback.
 *
 * Request Body: { feedbackId, title, description, deviceInfo?, screenshotUrl? }
 */
export async function POST(request: NextRequest) {
  try {
    // Layer 1: Authentication
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(session.user.id)
    const body = await request.json()
    const { feedbackId, title, description, deviceInfo, screenshotUrl } = body

    // Layer 1: Input validation
    if (!feedbackId) {
      return NextResponse.json(
        { error: 'feedbackId is required' },
        { status: 400 }
      )
    }

    if (!title) {
      return NextResponse.json(
        { error: 'title is required' },
        { status: 400 }
      )
    }

    if (typeof title === 'string' && title.length > 100) {
      return NextResponse.json(
        { error: 'title must be 100 characters or less' },
        { status: 400 }
      )
    }

    if (!description) {
      return NextResponse.json(
        { error: 'description is required' },
        { status: 400 }
      )
    }

    // Layer 2: Fetch feedback with existing bug report
    const feedback = await prisma.feedback.findUnique({
      where: { id: feedbackId },
      include: {
        bugReport: true,
      },
    })

    if (!feedback) {
      return NextResponse.json(
        { error: 'Feedback not found' },
        { status: 404 }
      )
    }

    // Layer 2: Authorization - only feedback owner can create bug report
    if (feedback.testerId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Layer 2: Business rule - no duplicate bug report per feedback (1:1)
    if (feedback.bugReport) {
      return NextResponse.json(
        { error: 'Bug report already exists for this feedback' },
        { status: 409 }
      )
    }

    // Create bug report
    const bugReport = await prisma.bugReport.create({
      data: {
        feedbackId,
        title,
        description,
        deviceInfo: deviceInfo || null,
      },
    })

    // If screenshotUrl provided, create a BugReportImage record
    if (screenshotUrl) {
      await prisma.bugReportImage.create({
        data: {
          bugReportId: bugReport.id,
          url: screenshotUrl,
          sortOrder: 0,
        },
      })
    }

    return NextResponse.json(bugReport, { status: 201 })
  } catch (error) {
    console.error('POST /api/bug-reports error:', error)
    return NextResponse.json(
      { error: 'Failed to create bug report' },
      { status: 500 }
    )
  }
}
