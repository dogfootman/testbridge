// @TASK P5-R10.1 - Rewards Resource API (List)
// @SPEC docs/planning/02-trd.md#rewards-API

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Valid RewardHistoryType values from Prisma schema
const VALID_REWARD_TYPES = ['EARNED', 'WITHDRAWN', 'WITHDRAWAL_REFUND', 'EXCHANGED'] as const

/**
 * GET /api/rewards
 * Get reward histories list with optional filters (userId, type)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userIdParam = searchParams.get('userId')
    const typeParam = searchParams.get('type')

    const where: { userId?: number; type?: string } = {}

    if (userIdParam) {
      where.userId = parseInt(userIdParam)
    }

    if (typeParam && VALID_REWARD_TYPES.includes(typeParam as any)) {
      where.type = typeParam
    }

    const rewardHistories = await prisma.rewardHistory.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            email: true,
          },
        },
        app: {
          select: {
            id: true,
            appName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(rewardHistories, { status: 200 })
  } catch (error) {
    console.error('GET /api/rewards error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reward histories' },
      { status: 500 }
    )
  }
}
