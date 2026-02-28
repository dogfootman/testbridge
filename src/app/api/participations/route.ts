// @TASK P3-S9 - Participations API
// @SPEC specs/screens/app-detail.yaml

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/participations
 * Get participations (filter by appId)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const appIdParam = searchParams.get('appId')

    const where: any = {}
    if (appIdParam) {
      where.appId = parseInt(appIdParam)
    }

    const participations = await prisma.participation.findMany({
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
