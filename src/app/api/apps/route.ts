// @TASK P3-R4 - Apps Resource API
// @SPEC TDD GREEN Phase: POST /api/apps, GET /api/apps

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAppSchema } from '@/lib/validators/app'
import { z } from 'zod'

/**
 * POST /api/apps
 * Create a new app
 * @auth Required (DEVELOPER or BOTH role)
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check role - only developers can create apps
    if (session.user.role !== 'DEVELOPER' && session.user.role !== 'BOTH') {
      return NextResponse.json(
        { error: 'Only developers can create apps' },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = createAppSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: validationResult.error.errors,
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    })

    if (!category) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }

    // Create app
    const app = await prisma.app.create({
      data: {
        developerId: parseInt(session.user.id, 10),
        appName: data.appName,
        packageName: data.packageName,
        categoryId: data.categoryId,
        description: data.description,
        testType: data.testType,
        targetTesters: data.targetTesters,
        testLink: data.testLink,
        rewardType: data.rewardType || null,
        rewardAmount: data.rewardAmount || null,
        feedbackRequired: data.feedbackRequired || false,
        testGuide: data.testGuide || null,
        status: 'PENDING_APPROVAL',
      },
    })

    return NextResponse.json(app, { status: 201 })
  } catch (error) {
    console.error('Error creating app:', error)

    // Handle Prisma unique constraint violation
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    ) {
      return NextResponse.json(
        { error: 'Package name already exists' },
        { status: 409 }
      )
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/apps
 * Get list of apps with filtering and pagination
 * @auth Not required (public endpoint)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '10', 10),
      100
    )
    const status = searchParams.get('status')
    const categoryId = searchParams.get('categoryId')

    // Build where clause
    const where: any = {
      deletedAt: null, // Exclude soft-deleted apps
    }

    if (status) {
      where.status = status
    }

    if (categoryId) {
      where.categoryId = parseInt(categoryId, 10)
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Fetch apps with relations
    const [apps, total] = await Promise.all([
      prisma.app.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              icon: true,
              sortOrder: true,
            },
          },
          developer: {
            select: {
              id: true,
              nickname: true,
              profileImageUrl: true,
            },
          },
        },
      }),
      prisma.app.count({ where }),
    ])

    return NextResponse.json(
      {
        apps,
        total,
        page,
        limit,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching apps:', error)
    return NextResponse.json(
      { error: 'Failed to fetch apps' },
      { status: 500 }
    )
  }
}
