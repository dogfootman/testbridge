// @TASK P3-S9 - Apps API (Get Single App)
// @SPEC specs/screens/app-detail.yaml

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/apps/[id]
 * Get single app by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appId = parseInt(params.id)

    if (isNaN(appId)) {
      return NextResponse.json({ error: 'Invalid app ID' }, { status: 400 })
    }

    const app = await prisma.app.findUnique({
      where: { id: appId },
      include: {
        developer: {
          select: {
            id: true,
            nickname: true,
            profileImageUrl: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    })

    if (!app) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 })
    }

    return NextResponse.json(app, { status: 200 })
  } catch (error) {
    console.error('GET /api/apps/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch app' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/apps/[id]
 * Update app status (e.g., to PRODUCTION)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appId = parseInt(params.id)
    const body = await request.json()
    const { status } = body

    if (isNaN(appId)) {
      return NextResponse.json({ error: 'Invalid app ID' }, { status: 400 })
    }

    if (!status) {
      return NextResponse.json({ error: 'status is required' }, { status: 400 })
    }

    // Validate status
    const validStatuses = ['PENDING_APPROVAL', 'RECRUITING', 'IN_TESTING', 'COMPLETED', 'PRODUCTION']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // If changing to PRODUCTION, validate requirements
    if (status === 'PRODUCTION') {
      const app = await prisma.app.findUnique({
        where: { id: appId },
        include: {
          participations: {
            where: {
              status: 'ACTIVE',
            },
          },
        },
      })

      if (!app) {
        return NextResponse.json({ error: 'App not found' }, { status: 404 })
      }

      // Check if at least 14 active participants (70% of 20)
      const minRequiredParticipants = Math.ceil(app.targetTesters * 0.7)
      if (app.participations.length < minRequiredParticipants) {
        return NextResponse.json(
          {
            error: `테스트 요건 미충족 (최소 ${minRequiredParticipants}명 필요, 현재 ${app.participations.length}명)`,
          },
          { status: 400 }
        )
      }
    }

    const updatedApp = await prisma.app.update({
      where: { id: appId },
      data: { status },
    })

    return NextResponse.json(updatedApp, { status: 200 })
  } catch (error) {
    console.error('PATCH /api/apps/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to update app' },
      { status: 500 }
    )
  }
}
