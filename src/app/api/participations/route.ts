// @TASK P3-R6 - Participations Resource API
// @SPEC TDD GREEN Phase: GET /api/participations

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/participations
 * Get list of participations with filtering and pagination
 * @auth Required
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '10', 10),
      100
    )
    const userId = searchParams.get('userId')
    const appId = searchParams.get('appId')
    const status = searchParams.get('status')

    // Build where clause
    const where: any = {}

    if (userId) {
      where.testerId = parseInt(userId, 10)
    }

    if (appId) {
      where.appId = parseInt(appId, 10)
    }

    if (status) {
      where.status = status
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Fetch participations with relations
    const [participations, total] = await Promise.all([
      prisma.participation.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          app: {
            select: {
              id: true,
              appName: true,
              packageName: true,
              status: true,
            },
          },
          tester: {
            select: {
              id: true,
              nickname: true,
              profileImageUrl: true,
            },
          },
          application: {
            select: {
              id: true,
              status: true,
              appliedAt: true,
            },
          },
        },
      }),
      prisma.participation.count({ where }),
    ])

    return NextResponse.json(
      {
        participations,
        total,
        page,
        limit,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching participations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch participations' },
      { status: 500 }
    )
  }
}
