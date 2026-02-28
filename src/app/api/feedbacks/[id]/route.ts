// @TASK P5-R7.2 - Feedbacks Detail API
// @SPEC docs/planning/02-trd.md#feedbacks-API

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/feedbacks/[id]
 * Get feedback detail with ratings and bug report
 * Access: feedback author (tester) or app developer
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Layer 1: Authentication
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Layer 1: Input validation
    const feedbackId = parseInt(params.id)
    if (isNaN(feedbackId)) {
      return NextResponse.json(
        { error: 'Invalid feedback ID' },
        { status: 400 }
      )
    }

    const userId = parseInt(session.user.id)

    // Fetch feedback with relations
    const feedback = await prisma.feedback.findUnique({
      where: { id: feedbackId },
      include: {
        tester: {
          select: {
            id: true,
            nickname: true,
            email: true,
            profileImageUrl: true,
          },
        },
        app: {
          select: {
            id: true,
            appName: true,
            developerId: true,
          },
        },
        ratings: true,
        bugReport: true,
      },
    })

    if (!feedback) {
      return NextResponse.json(
        { error: 'Feedback not found' },
        { status: 404 }
      )
    }

    // Layer 2: Authorization - only feedback author or app developer
    if (feedback.testerId !== userId && feedback.app.developerId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(feedback, { status: 200 })
  } catch (error) {
    console.error('GET /api/feedbacks/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    )
  }
}
