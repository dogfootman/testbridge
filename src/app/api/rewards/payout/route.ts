// @TASK P5-R10.2 - Rewards Payout API
// @SPEC docs/planning/02-trd.md#rewards-API

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// Valid RewardHistoryType values from Prisma schema
const VALID_REWARD_TYPES = ['EARNED', 'WITHDRAWN', 'WITHDRAWAL_REFUND', 'EXCHANGED'] as const

// Types that decrease balance
const DEBIT_TYPES = ['WITHDRAWN', 'EXCHANGED'] as const

/**
 * POST /api/rewards/payout
 * Process a reward payout (add/deduct points from user balance)
 *
 * Request Body: { userId, amount, type, relatedId? }
 * - userId: target user ID
 * - amount: reward amount (positive integer)
 * - type: RewardHistoryType (EARNED, WITHDRAWN, WITHDRAWAL_REFUND, EXCHANGED)
 * - relatedId?: optional app ID for context
 */
export async function POST(request: NextRequest) {
  try {
    // Layer 1: Authentication
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { userId, amount, type, relatedId } = body

    // Layer 1: Input validation - userId
    if (!userId || typeof userId !== 'number') {
      return NextResponse.json(
        { error: 'userId is required and must be a number' },
        { status: 400 }
      )
    }

    // Layer 1: Input validation - amount
    if (amount === undefined || amount === null) {
      return NextResponse.json(
        { error: 'amount is required' },
        { status: 400 }
      )
    }

    if (typeof amount !== 'number' || !Number.isInteger(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'amount must be a positive integer' },
        { status: 400 }
      )
    }

    // Layer 1: Input validation - type
    if (!type) {
      return NextResponse.json(
        { error: 'type is required' },
        { status: 400 }
      )
    }

    if (!VALID_REWARD_TYPES.includes(type as any)) {
      return NextResponse.json(
        { error: `type must be one of: ${VALID_REWARD_TYPES.join(', ')}` },
        { status: 400 }
      )
    }

    // Use transaction for atomic reward payout
    const result = await prisma.$transaction(async (tx) => {
      // Fetch target user
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true, pointBalance: true },
      })

      if (!user) {
        return { error: 'User not found', status: 404 }
      }

      // Layer 2: Business rule - check balance for debit types
      const isDebit = (DEBIT_TYPES as readonly string[]).includes(type)
      if (isDebit && user.pointBalance < amount) {
        return {
          error: 'Insufficient balance for withdrawal',
          status: 400,
        }
      }

      // Calculate new balance
      const newBalance = isDebit
        ? user.pointBalance - amount
        : user.pointBalance + amount

      // Create reward history record
      const rewardHistory = await tx.rewardHistory.create({
        data: {
          userId,
          appId: relatedId || null,
          type,
          amount,
          balance: newBalance,
          description: null,
        },
      })

      // Update user point balance
      await tx.user.update({
        where: { id: userId },
        data: {
          pointBalance: isDebit
            ? { decrement: amount }
            : { increment: amount },
        },
      })

      return { data: rewardHistory, status: 201 }
    })

    // Handle error responses from within transaction
    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      )
    }

    return NextResponse.json(result.data, { status: 201 })
  } catch (error) {
    console.error('POST /api/rewards/payout error:', error)
    return NextResponse.json(
      { error: 'Failed to process reward payout' },
      { status: 500 }
    )
  }
}
