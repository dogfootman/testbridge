// @TASK P3-R6 - Participations Resource API (Detail/Update)
// @SPEC TDD GREEN Phase: GET/PATCH /api/participations/[id]

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updateParticipationSchema, isValidStatusTransition } from '@/lib/validators/participation'
import { z } from 'zod'

/**
 * Helper: Validate and parse participation ID
 */
function validateParticipationId(id: string): { valid: boolean; participationId?: number; error?: NextResponse } {
  const participationId = parseInt(id, 10)
  if (isNaN(participationId)) {
    return {
      valid: false,
      error: NextResponse.json({ error: 'Invalid participation ID' }, { status: 400 }),
    }
  }
  return { valid: true, participationId }
}

/**
 * Helper: Check if participation exists
 */
async function getParticipationOrError(participationId: number) {
  const participation = await prisma.participation.findUnique({
    where: { id: participationId },
  })

  if (!participation) {
    return {
      participation: null,
      error: NextResponse.json({ error: 'Participation not found' }, { status: 404 }),
    }
  }

  return { participation, error: null }
}

/**
 * GET /api/participations/[id]
 * Get participation details
 * @auth Required
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const validation = validateParticipationId(params.id)
    if (!validation.valid) return validation.error!

    const participation = await prisma.participation.findUnique({
      where: { id: validation.participationId },
      include: {
        app: {
          select: {
            id: true,
            appName: true,
            packageName: true,
            status: true,
            testType: true,
            rewardType: true,
            rewardAmount: true,
          },
        },
        tester: {
          select: {
            id: true,
            nickname: true,
            profileImageUrl: true,
            email: true,
          },
        },
        application: {
          select: {
            id: true,
            status: true,
            appliedAt: true,
            approvedAt: true,
          },
        },
        feedback: {
          select: {
            id: true,
            overallRating: true,
            comment: true,
            createdAt: true,
          },
        },
      },
    })

    if (!participation) {
      return NextResponse.json({ error: 'Participation not found' }, { status: 404 })
    }

    return NextResponse.json(participation, { status: 200 })
  } catch (error) {
    console.error('Error fetching participation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/participations/[id]
 * Update participation
 * @auth Required
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const validation = validateParticipationId(params.id)
    if (!validation.valid) return validation.error!

    const { participation, error } = await getParticipationOrError(validation.participationId!)
    if (error) return error

    const body = await request.json()

    // Check for dropReason requirement before validation
    if (body.status === 'DROPPED' && !body.dropReason) {
      return NextResponse.json(
        { error: 'dropReason is required when status is DROPPED' },
        { status: 400 }
      )
    }

    const validationResult = updateParticipationSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Validate status transition if status is being updated
    if (data.status && data.status !== participation.status) {
      if (!isValidStatusTransition(participation.status, data.status)) {
        return NextResponse.json(
          { error: 'Invalid status transition' },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {}

    if (data.status !== undefined) {
      updateData.status = data.status

      // Automatically set timestamps based on status
      if (data.status === 'COMPLETED') {
        updateData.completedAt = new Date()
      } else if (data.status === 'DROPPED') {
        updateData.droppedAt = new Date()
      }
    }

    if (data.rewardStatus !== undefined) {
      updateData.rewardStatus = data.rewardStatus
    }

    if (data.skipReason !== undefined) {
      updateData.skipReason = data.skipReason
    }

    if (data.lastAppRunAt !== undefined) {
      updateData.lastAppRunAt = new Date(data.lastAppRunAt)
    }

    if (data.dropReason !== undefined) {
      updateData.dropReason = data.dropReason
    }

    const updatedParticipation = await prisma.participation.update({
      where: { id: validation.participationId },
      data: updateData,
    })

    return NextResponse.json(updatedParticipation, { status: 200 })
  } catch (error) {
    console.error('Error updating participation:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
