// @TASK P3-R5.2 - Application Approval/Rejection API
// @SPEC docs/planning/02-trd.md#Applications-Status-Update

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * PATCH /api/applications/[id]
 * Approve or reject application (developer only)
 *
 * Valid transitions:
 * - PENDING -> APPROVED | REJECTED
 * - WAITLISTED -> APPROVED | REJECTED
 * - APPROVED -> REJECTED (un-approve, triggers auto-approve of waitlisted)
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

    // Find application with app details
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        app: true,
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
    // APPROVED applications can be rejected if the app has targetTesters
    // (triggers auto-approve of first waitlisted application)
    const isApprovedRejection =
      application.status === 'APPROVED' &&
      status === 'REJECTED' &&
      application.app.targetTesters

    // Only PENDING or WAITLISTED applications can be modified normally
    if (
      application.status !== 'PENDING' &&
      application.status !== 'WAITLISTED' &&
      !isApprovedRejection
    ) {
      return NextResponse.json(
        { error: 'Application is not in PENDING or WAITLISTED status' },
        { status: 400 }
      )
    }

    // Update application status
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status,
        approvedAt: status === 'APPROVED' ? new Date() : null,
      },
    })

    // If rejecting an approved application, auto-approve first waitlisted
    if (isApprovedRejection) {
      const waitlistedApplication = await prisma.application.findFirst({
        where: {
          appId: application.appId,
          status: 'WAITLISTED',
        },
        orderBy: {
          appliedAt: 'asc',
        },
      })

      if (waitlistedApplication) {
        await prisma.application.update({
          where: { id: waitlistedApplication.id },
          data: {
            status: 'APPROVED',
            approvedAt: new Date(),
          },
        })
      }
    }

    return NextResponse.json(updatedApplication, { status: 200 })
  } catch (error) {
    console.error('PATCH /api/applications/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    )
  }
}
