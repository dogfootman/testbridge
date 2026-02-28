// @TASK P5-R8 - Feedback Ratings Resource API (Bulk Create + List)
// @SPEC docs/planning/02-trd.md#feedback-ratings-API

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// Valid rating types matching FeedbackItemType enum
const VALID_RATING_TYPES = [
  'UI_UX',
  'PERFORMANCE',
  'FUNCTIONALITY',
  'STABILITY',
] as const

type RatingType = (typeof VALID_RATING_TYPES)[number]

/**
 * Calculate the average score from an array of ratings.
 * Returns 0 if the array is empty.
 */
function calculateAverage(
  ratings: Array<{ score: number }>
): number {
  if (ratings.length === 0) return 0
  const sum = ratings.reduce((acc, r) => acc + r.score, 0)
  return Math.round((sum / ratings.length) * 100) / 100
}

/**
 * GET /api/feedback-ratings?feedbackId=:id
 * Get ratings list for a specific feedback with average score.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const feedbackIdParam = searchParams.get('feedbackId')

    // Layer 1: Input validation
    if (!feedbackIdParam) {
      return NextResponse.json(
        { error: 'feedbackId query parameter is required' },
        { status: 400 }
      )
    }

    const feedbackId = parseInt(feedbackIdParam)
    if (isNaN(feedbackId)) {
      return NextResponse.json(
        { error: 'feedbackId must be a valid number' },
        { status: 400 }
      )
    }

    const ratings = await prisma.feedbackRating.findMany({
      where: { feedbackId },
      orderBy: { id: 'asc' },
    })

    const average = calculateAverage(ratings)

    return NextResponse.json({ ratings, average }, { status: 200 })
  } catch (error) {
    console.error('GET /api/feedback-ratings error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feedback ratings' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/feedback-ratings
 * Bulk create ratings for a feedback.
 *
 * Request Body: {
 *   feedbackId: number,
 *   ratings: Array<{ ratingType: FeedbackItemType, score: number (1-5) }>
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Layer 1: Authentication
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(session.user.id)
    const body = await request.json()
    const { feedbackId, ratings } = body

    // Layer 1: Input validation - feedbackId
    if (!feedbackId) {
      return NextResponse.json(
        { error: 'feedbackId is required' },
        { status: 400 }
      )
    }

    // Layer 1: Input validation - ratings array
    if (!Array.isArray(ratings) || ratings.length === 0) {
      return NextResponse.json(
        { error: 'ratings must be a non-empty array' },
        { status: 400 }
      )
    }

    // Layer 1: Validate each rating item
    for (const rating of ratings) {
      if (
        !rating.ratingType ||
        !VALID_RATING_TYPES.includes(rating.ratingType as RatingType)
      ) {
        return NextResponse.json(
          {
            error: `Invalid ratingType: "${rating.ratingType}". Must be one of: ${VALID_RATING_TYPES.join(', ')}`,
          },
          { status: 400 }
        )
      }

      if (
        typeof rating.score !== 'number' ||
        !Number.isInteger(rating.score) ||
        rating.score < 1 ||
        rating.score > 5
      ) {
        return NextResponse.json(
          {
            error:
              'Each score must be an integer between 1 and 5',
          },
          { status: 400 }
        )
      }
    }

    // Layer 1: Check for duplicate ratingTypes in the request
    const ratingTypes = ratings.map(
      (r: { ratingType: string }) => r.ratingType
    )
    const uniqueTypes = new Set(ratingTypes)
    if (uniqueTypes.size !== ratingTypes.length) {
      return NextResponse.json(
        { error: 'Ratings contain duplicate ratingType entries' },
        { status: 400 }
      )
    }

    // Use transaction for atomic bulk insert
    const result = await prisma.$transaction(async (tx) => {
      // Fetch feedback with existing ratings
      const feedback = await tx.feedback.findUnique({
        where: { id: feedbackId },
        include: { ratings: true },
      })

      if (!feedback) {
        return { error: 'Feedback not found', status: 404 }
      }

      // Layer 2: Authorization - only feedback owner
      if (feedback.testerId !== userId) {
        return { error: 'Forbidden', status: 403 }
      }

      // Layer 2: Business rule - no duplicate ratings
      if (feedback.ratings.length > 0) {
        return {
          error: 'Ratings already exist for this feedback',
          status: 409,
        }
      }

      // Bulk insert ratings
      await tx.feedbackRating.createMany({
        data: ratings.map(
          (r: { ratingType: string; score: number }) => ({
            feedbackId,
            itemType: r.ratingType as RatingType,
            score: r.score,
          })
        ),
      })

      // Fetch created ratings for response
      const createdRatings = await tx.feedbackRating.findMany({
        where: { feedbackId },
        orderBy: { id: 'asc' },
      })

      const average = calculateAverage(createdRatings)

      return { data: { ratings: createdRatings, average }, status: 201 }
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
    console.error('POST /api/feedback-ratings error:', error)
    return NextResponse.json(
      { error: 'Failed to create feedback ratings' },
      { status: 500 }
    )
  }
}
