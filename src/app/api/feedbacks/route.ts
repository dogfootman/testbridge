// @TASK P3-S9 - Feedbacks API
// @SPEC specs/screens/app-detail.yaml

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/feedbacks
 * Get feedbacks (filter by appId)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const appIdParam = searchParams.get('appId')

    const where: { appId?: number } = {}
    if (appIdParam) {
      where.appId = parseInt(appIdParam)
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
