// @TASK P3-S9 - Participations API
// @SPEC specs/screens/tester-participations.yaml

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

/**
 * GET /api/participations
 * Get participations for the authenticated user (filter by appId, status)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(session.user.id)
    const { searchParams } = new URL(request.url)
    const appIdParam = searchParams.get('appId')
    const statusParam = searchParams.get('status')

    const where: { testerId: number; appId?: number; status?: string } = {
      testerId: userId,
    }
    if (appIdParam) {
      where.appId = parseInt(appIdParam)
    }
    if (statusParam) {
      where.status = statusParam
    }

    const participations = await prisma.participation.findMany({
      where,
      include: {
        app: {
          select: {
            id: true,
            appName: true,
            testStartDate: true,
            testEndDate: true,
            rewardAmount: true,
            rewardType: true,
            images: {
              select: {
                url: true,
                type: true,
              },
            },
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
      orderBy: {
        joinedAt: 'desc',
      },
    })

    return NextResponse.json(participations, { status: 200 })
  } catch (error) {
    console.error('GET /api/participations error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch participations' },
      { status: 500 }
    )
  }
}
