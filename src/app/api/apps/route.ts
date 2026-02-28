// @TASK P3-S7 - Apps API (Create App)
// @SPEC specs/screens/app-register.yaml

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/apps
 * Create a new app registration
 */
export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const developerId = parseInt(session.user.id)
    const body = await request.json()

    const {
      appName,
      packageName,
      categoryId,
      description,
      testType,
      targetTesters,
      testLink,
      rewardType,
      rewardAmount,
      feedbackRequired,
      testGuide,
    } = body

    // Validation
    if (!appName || typeof appName !== 'string' || appName.trim().length === 0) {
      return NextResponse.json({ error: 'appName is required' }, { status: 400 })
    }

    if (!packageName || typeof packageName !== 'string' || packageName.trim().length === 0) {
      return NextResponse.json({ error: 'packageName is required' }, { status: 400 })
    }

    // Package name format validation
    if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(packageName)) {
      return NextResponse.json({ error: 'Invalid package name format' }, { status: 400 })
    }

    if (!categoryId || typeof categoryId !== 'number') {
      return NextResponse.json({ error: 'categoryId is required and must be a number' }, { status: 400 })
    }

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return NextResponse.json({ error: 'description is required' }, { status: 400 })
    }

    if (!testType || !['PAID_REWARD', 'CREDIT_EXCHANGE'].includes(testType)) {
      return NextResponse.json({ error: 'testType must be PAID_REWARD or CREDIT_EXCHANGE' }, { status: 400 })
    }

    if (!targetTesters || typeof targetTesters !== 'number' || targetTesters < 1 || targetTesters > 100) {
      return NextResponse.json({ error: 'targetTesters must be between 1 and 100' }, { status: 400 })
    }

    if (!testLink || typeof testLink !== 'string' || testLink.trim().length === 0) {
      return NextResponse.json({ error: 'testLink is required' }, { status: 400 })
    }

    // Check if package name already exists
    const existingApp = await prisma.app.findUnique({
      where: { packageName },
    })

    if (existingApp) {
      return NextResponse.json({ error: 'Package name already exists' }, { status: 409 })
    }

    // Check category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // For CREDIT_EXCHANGE, check credit balance
    if (testType === 'CREDIT_EXCHANGE') {
      const user = await prisma.user.findUnique({
        where: { id: developerId },
        select: { creditBalance: true },
      })

      if (!user || user.creditBalance < 50) {
        return NextResponse.json(
          { error: `크레딧이 부족합니다. (현재: ${user?.creditBalance || 0}, 필요: 50)` },
          { status: 400 }
        )
      }
    }

    // Create app
    const app = await prisma.app.create({
      data: {
        developerId,
        appName: appName.trim(),
        packageName: packageName.trim(),
        categoryId,
        description: description.trim(),
        testType,
        targetTesters,
        testLink: testLink.trim(),
        rewardType: testType === 'PAID_REWARD' ? rewardType : null,
        rewardAmount: testType === 'PAID_REWARD' ? rewardAmount : null,
        feedbackRequired: feedbackRequired || false,
        testGuide: testGuide?.trim() || null,
        status: 'PENDING_APPROVAL',
      },
    })

    return NextResponse.json(app, { status: 201 })
  } catch (error) {
    console.error('POST /api/apps error:', error)
    return NextResponse.json(
      { error: 'Failed to create app' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/apps
 * Get apps (filter by status, categoryId, search, rewardMin, limit)
 * @TASK T-01 - 테스터 홈 앱 탐색 필터링 지원
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const categoryId = searchParams.get('categoryId')
    const search = searchParams.get('search')
    const rewardMin = searchParams.get('rewardMin')
    const limit = searchParams.get('limit')

    // Build where clause
    const where: {
      status?: string
      categoryId?: number
      appName?: { contains: string; mode: 'insensitive' }
      rewardAmount?: { gte: number }
    } = {}

    if (status) {
      where.status = status
    }

    if (categoryId) {
      where.categoryId = parseInt(categoryId)
    }

    if (search && search.trim().length > 0) {
      where.appName = {
        contains: search.trim(),
        mode: 'insensitive',
      }
    }

    if (rewardMin) {
      where.rewardAmount = {
        gte: parseInt(rewardMin),
      }
    }

    const apps = await prisma.app.findMany({
      where,
      take: limit ? parseInt(limit) : undefined,
      orderBy: {
        createdAt: 'desc',
      },
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
            icon: true,
          },
        },
        _count: {
          select: {
            participations: true,
          },
        },
      },
    })

    return NextResponse.json({ apps }, { status: 200 })
  } catch (error) {
    console.error('GET /api/apps error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch apps' },
      { status: 500 }
    )
  }
}
