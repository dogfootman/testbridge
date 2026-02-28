// @TASK P3-R5.1 - Applications Resource API
// @SPEC docs/planning/02-trd.md#Applications-API

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/applications
 * Submit application to test an app
 */
export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const testerId = parseInt(session.user.id)
    const body = await request.json()
    const { appId, deviceInfo, message } = body

    // Validation
    if (!appId) {
      return NextResponse.json({ error: 'appId is required' }, { status: 400 })
    }

    if (typeof appId !== 'number') {
      return NextResponse.json({ error: 'appId must be a number' }, { status: 400 })
    }

    if (deviceInfo && typeof deviceInfo !== 'string') {
      return NextResponse.json({ error: 'deviceInfo must be a string' }, { status: 400 })
    }

    if (deviceInfo && deviceInfo.length > 100) {
      return NextResponse.json({ error: 'deviceInfo must not exceed 100 characters' }, { status: 400 })
    }

    if (message && typeof message !== 'string') {
      return NextResponse.json({ error: 'message must be a string' }, { status: 400 })
    }

    if (message && message.length > 200) {
      return NextResponse.json({ error: 'message must not exceed 200 characters' }, { status: 400 })
    }

    // Check if app exists
    const app = await prisma.app.findUnique({
      where: { id: appId },
      include: {
        applications: {
          where: { testerId },
        },
      },
    })

    if (!app) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 })
    }

    // Check if app is recruiting
    if (app.status !== 'RECRUITING') {
      return NextResponse.json(
        { error: 'App is not currently recruiting testers' },
        { status: 400 }
      )
    }

    // Check if user already applied
    if (app.applications.length > 0) {
      return NextResponse.json(
        { error: 'You have already applied to this app' },
        { status: 409 }
      )
    }

    // Count approved applications
    const approvedCount = await prisma.application.count({
      where: {
        appId,
        status: 'APPROVED',
      },
    })

    // Determine application status
    const isApproved = approvedCount < app.targetTesters
    const applicationStatus = isApproved ? 'APPROVED' : 'WAITLISTED'
    const approvedAt = isApproved ? new Date() : null

    // Create application
    const application = await prisma.application.create({
      data: {
        appId,
        testerId,
        deviceInfo,
        message,
        status: applicationStatus,
        approvedAt,
      },
    })

    return NextResponse.json(application, { status: 201 })
  } catch (error) {
    console.error('POST /api/applications error:', error)
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/applications
 * Get applications for current user (can be filtered by appId)
 */
export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const testerId = parseInt(session.user.id)
    const { searchParams } = new URL(request.url)
    const appIdParam = searchParams.get('appId')

    // Build where clause
    const where: { testerId: number; appId?: number } = { testerId }
    if (appIdParam) {
      where.appId = parseInt(appIdParam)
    }

    // Fetch applications
    const applications = await prisma.application.findMany({
      where,
      include: {
        app: {
          select: {
            id: true,
            appName: true,
            packageName: true,
            categoryId: true,
            description: true,
            status: true,
          },
        },
      },
      orderBy: {
        appliedAt: 'desc',
      },
    })

    return NextResponse.json(applications, { status: 200 })
  } catch (error) {
    console.error('GET /api/applications error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}
