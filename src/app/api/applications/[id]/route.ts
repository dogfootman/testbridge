// @TASK P3-R5.2 - Application Approval/Rejection API
// @SPEC docs/planning/02-trd.md#Applications-Status-Update

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * PATCH /api/applications/[id]
 * Approve or reject application (developer only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(session.user.id)
    const applicationId = parseInt(params.id)
    const body = await request.json()
    const { status } = body

    // Validation
    if (!status) {
      return NextResponse.json({ error: 'status is required' }, { status: 400 })
    }

    if (status !== 'APPROVED' && status !== 'REJECTED') {
      return NextResponse.json(
        { error: 'status must be either APPROVED or REJECTED' },
        { status: 400 }
      )
    }

    // Find application
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
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

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Check if user is the app developer
    if (application.app.developerId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if application can be updated
    const validStatuses = ['PENDING', 'WAITLISTED', 'APPROVED']
    if (!validStatuses.includes(application.status)) {
      return NextResponse.json(
        { error: 'Application cannot be updated from current status' },
        { status: 400 }
      )
    }

    // If already in target status, return error
    if (application.status === status) {
      return NextResponse.json(
        { error: `Application is already ${status}` },
        { status: 400 }
      )
    }

    // Use transaction for race condition safety
    const result = await prisma.$transaction(async (tx) => {
      // Update application
      const updatedApplication = await tx.application.update({
        where: { id: applicationId },
        data: {
          status,
          approvedAt: status === 'APPROVED' ? new Date() : null,
        },
      })

      // If rejecting an approved application, auto-approve first waitlisted
      if (status === 'REJECTED' && application.status === 'APPROVED') {
        const waitlistedApplication = await tx.application.findFirst({
          where: {
            appId: application.app.id,
            status: 'WAITLISTED',
          },
          orderBy: {
            appliedAt: 'asc',
          },
        })

        if (waitlistedApplication) {
          await tx.application.update({
            where: { id: waitlistedApplication.id },
            data: {
              status: 'APPROVED',
              approvedAt: new Date(),
            },
          })
        }
      }

      return updatedApplication
    })

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('PATCH /api/applications/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    )
  }
}
