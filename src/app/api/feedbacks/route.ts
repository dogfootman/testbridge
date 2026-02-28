// @TASK P5-R7.1 - Feedbacks Resource API (List + Create)
// @SPEC docs/planning/02-trd.md#feedbacks-API

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

/**
 * GET /api/feedbacks
 * Get feedbacks list with optional filters (appId, userId)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const appIdParam = searchParams.get('appId')
    const userIdParam = searchParams.get('userId')

    const where: { appId?: number; testerId?: number } = {}
    if (appIdParam) {
      where.appId = parseInt(appIdParam)
    }
    if (userIdParam) {
      where.testerId = parseInt(userIdParam)
    }

    const feedbacks = await prisma.feedback.findMany({
      where,
      include: {
        tester: {
          select: {
            id: true,
            nickname: true,
            email: true,
            profileImageUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(feedbacks, { status: 200 })
  } catch (error) {
    console.error('GET /api/feedbacks error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feedbacks' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/feedbacks
 * Create a feedback for a completed participation.
 * Triggers reward auto-payment for PAID_REWARD apps.
 *
 * Request Body: { participationId, overallRating, comment? }
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
    const { participationId, overallRating, comment } = body

    // Layer 1: Input validation
    if (!participationId) {
      return NextResponse.json(
        { error: 'participationId is required' },
        { status: 400 }
      )
    }

    if (overallRating === undefined || overallRating === null) {
      return NextResponse.json(
        { error: 'overallRating is required' },
        { status: 400 }
      )
    }

    if (
      typeof overallRating !== 'number' ||
      overallRating < 1 ||
      overallRating > 5 ||
      !Number.isInteger(overallRating)
    ) {
      return NextResponse.json(
        { error: 'overallRating must be an integer between 1 and 5' },
        { status: 400 }
      )
    }

    // Use transaction for atomic feedback creation + reward
    const result = await prisma.$transaction(async (tx) => {
      // Fetch participation with app and existing feedback
      const participation = await tx.participation.findUnique({
        where: { id: participationId },
        include: {
          feedback: true,
          app: {
            select: {
              id: true,
              testType: true,
              rewardType: true,
              rewardAmount: true,
            },
          },
        },
      })

      if (!participation) {
        return { error: 'Participation not found', status: 404 }
      }

      // Layer 2: Authorization - only participation owner
      if (participation.testerId !== userId) {
        return { error: 'Forbidden', status: 403 }
      }

      // Layer 2: Business rule - participation must be COMPLETED
      if (participation.status !== 'COMPLETED') {
        return {
          error: 'Participation must be in COMPLETED status to submit feedback',
          status: 400,
        }
      }

      // Layer 2: Business rule - no duplicate feedback
      if (participation.feedback) {
        return {
          error: 'Feedback already submitted for this participation',
          status: 409,
        }
      }

      // Create feedback
      const feedback = await tx.feedback.create({
        data: {
          appId: participation.appId,
          testerId: userId,
          participationId: participation.id,
          overallRating,
          comment: comment || null,
        },
      })

      // Determine reward status based on app testType
      const isPaidReward =
        participation.app.testType === 'PAID_REWARD' &&
        participation.app.rewardAmount &&
        participation.app.rewardAmount > 0

      if (isPaidReward) {
        // Get current user balance for reward history
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { pointBalance: true },
        })

        const rewardAmount = participation.app.rewardAmount!
        const newBalance = (user?.pointBalance || 0) + rewardAmount

        // Create reward history record
        await tx.rewardHistory.create({
          data: {
            userId,
            appId: participation.appId,
            type: 'EARNED',
            amount: rewardAmount,
            balance: newBalance,
            description: `Feedback reward for app #${participation.appId}`,
          },
        })

        // Update user point balance
        await tx.user.update({
          where: { id: userId },
          data: {
            pointBalance: { increment: rewardAmount },
          },
        })

        // Update participation reward status to PAID
        await tx.participation.update({
          where: { id: participation.id },
          data: {
            rewardStatus: 'PAID',
          },
        })
      } else {
        // No reward - mark as SKIPPED
        await tx.participation.update({
          where: { id: participation.id },
          data: {
            rewardStatus: 'SKIPPED',
          },
        })
      }

      return { data: feedback, status: 201 }
    })

    // Handle error responses from within transaction
    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      )
    }

    return NextResponse.json(result.data, { status: 201 })
  } catch (error) {
    console.error('POST /api/feedbacks error:', error)
    return NextResponse.json(
      { error: 'Failed to create feedback' },
      { status: 500 }
    )
  }
}
