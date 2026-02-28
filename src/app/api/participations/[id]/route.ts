// @TASK P3-R6.2 - Participations Detail & Status Update API
// @SPEC specs/screens/tester-participations.yaml

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/participations/[id]
 * Get participation detail with progress info
 * Access: participation owner (tester) or app developer
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
    const participationId = parseInt(params.id)
    if (isNaN(participationId)) {
      return NextResponse.json(
        { error: 'Invalid participation ID' },
        { status: 400 }
      )
    }

    const userId = parseInt(session.user.id)

    // Fetch participation with relations
    const participation = await prisma.participation.findUnique({
      where: { id: participationId },
      include: {
        app: {
          select: {
            id: true,
            appName: true,
            developerId: true,
            testStartDate: true,
            testEndDate: true,
            rewardAmount: true,
            rewardType: true,
            feedbackRequired: true,
            images: true,
          },
        },
        tester: {
          select: {
            id: true,
            nickname: true,
            email: true,
            profileImageUrl: true,
          },
        },
        feedback: true,
      },
    })

    if (!participation) {
      return NextResponse.json(
        { error: 'Participation not found' },
        { status: 404 }
      )
    }

    // Layer 2: Authorization - only participant or app developer
    if (
      participation.testerId !== userId &&
      participation.app.developerId !== userId
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Calculate progress
    const now = new Date()
    const startDate = new Date(participation.app.testStartDate)
    const endDate = new Date(participation.app.testEndDate)
    const totalDays = Math.round(
      (endDate.getTime() - startDate.getTime()) / 86400000
    )
    const daysPassed = Math.max(
      0,
      Math.round((now.getTime() - startDate.getTime()) / 86400000)
    )
    const percentage = totalDays > 0
      ? Math.min(100, Math.round((daysPassed / totalDays) * 100))
      : 0

    const response = {
      ...participation,
      progress: {
        daysPassed,
        totalDays,
        percentage,
      },
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('GET /api/participations/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch participation' },
      { status: 500 }
    )
  }
}

const VALID_PATCH_STATUSES = ['COMPLETED', 'DROPPED'] as const

/**
 * PATCH /api/participations/[id]
 * Update participation status (ACTIVE -> COMPLETED or DROPPED)
 * Access: participation owner (tester) or app developer
 */
export async function PATCH(
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
    const participationId = parseInt(params.id)
    if (isNaN(participationId)) {
      return NextResponse.json(
        { error: 'Invalid participation ID' },
        { status: 400 }
      )
    }

    const userId = parseInt(session.user.id)
    const body = await request.json()
    const { status, dropReason } = body

    if (!status) {
      return NextResponse.json(
        { error: 'status is required' },
        { status: 400 }
      )
    }

    if (!VALID_PATCH_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: 'status must be one of: COMPLETED, DROPPED' },
        { status: 400 }
      )
    }

    // Validate dropReason length before transaction
    if (dropReason && dropReason.length > 100) {
      return NextResponse.json(
        { error: 'dropReason must not exceed 100 characters' },
        { status: 400 }
      )
    }

    // Use transaction for atomic status update
    const result = await prisma.$transaction(async (tx) => {
      // Find participation within transaction
      const participation = await tx.participation.findUnique({
        where: { id: participationId },
        include: {
          app: {
            select: {
              id: true,
              developerId: true,
              targetTesters: true,
            },
          },
        },
      })

      if (!participation) {
        return { error: 'Participation not found', status: 404 }
      }

      // Layer 2: Authorization
      if (
        participation.testerId !== userId &&
        participation.app.developerId !== userId
      ) {
        return { error: 'Forbidden', status: 403 }
      }

      // Layer 2: Business rule - only ACTIVE participations can be updated
      if (participation.status !== 'ACTIVE') {
        return { error: 'Participation is not in ACTIVE status', status: 400 }
      }

      // Build update data based on target status
      const now = new Date()
      const updateData: any = { status }

      if (status === 'COMPLETED') {
        updateData.completedAt = now
      } else if (status === 'DROPPED') {
        updateData.droppedAt = now
        if (dropReason) {
          updateData.dropReason = dropReason
        }
      }

      const updated = await tx.participation.update({
        where: { id: participationId },
        data: updateData,
      })

      // If completing, check if all participants are done -> update app status
      if (status === 'COMPLETED') {
        const totalParticipants = await tx.participation.count({
          where: { appId: participation.appId },
        })
        const completedParticipants = await tx.participation.count({
          where: { appId: participation.appId, status: 'COMPLETED' },
        })

        if (completedParticipants >= totalParticipants && totalParticipants > 0) {
          await tx.app.update({
            where: { id: participation.appId },
            data: { status: 'COMPLETED' },
          })
        }
      }

      return { data: updated, status: 200 }
    })

    // Handle error responses from within transaction
    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      )
    }

    return NextResponse.json(result.data, { status: 200 })
  } catch (error) {
    console.error('PATCH /api/participations/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to update participation' },
      { status: 500 }
    )
  }
}
