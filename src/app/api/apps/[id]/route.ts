// @TASK P3-R4 - Apps Resource API (Detail/Update/Delete)
// @SPEC TDD REFACTOR Phase: GET/PATCH/DELETE /api/apps/[id]

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updateAppSchema } from '@/lib/validators/app'
import { z } from 'zod'

/**
 * Helper: Validate and parse app ID
 */
function validateAppId(id: string): { valid: boolean; appId?: number; error?: NextResponse } {
  const appId = parseInt(id, 10)
  if (isNaN(appId)) {
    return {
      valid: false,
      error: NextResponse.json({ error: 'Invalid app ID' }, { status: 400 }),
    }
  }
  return { valid: true, appId }
}

/**
 * Helper: Check if app exists and not deleted
 */
async function getAppOrError(appId: number) {
  const app = await prisma.app.findUnique({ where: { id: appId } })

  if (!app || app.deletedAt) {
    return {
      app: null,
      error: NextResponse.json({ error: 'App not found' }, { status: 404 }),
    }
  }

  return { app, error: null }
}

/**
 * Helper: Check if user owns the app
 */
function checkAppOwnership(app: any, userId: string): NextResponse | null {
  if (app.developerId !== parseInt(userId, 10)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return null
}

/**
 * GET /api/apps/[id]
 * Get app details
 * @auth Not required (public endpoint)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const validation = validateAppId(params.id)
    if (!validation.valid) return validation.error!

    const app = await prisma.app.findUnique({
      where: { id: validation.appId },
      include: {
        category: {
          select: { id: true, name: true, icon: true },
        },
        developer: {
          select: { id: true, nickname: true, profileImageUrl: true },
        },
        images: {
          select: { id: true, type: true, url: true },
        },
      },
    })

    if (!app || app.deletedAt) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 })
    }

    return NextResponse.json(app, { status: 200 })
  } catch (error) {
    console.error('Error fetching app:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/apps/[id]
 * Update app
 * @auth Required (must be app owner)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const validation = validateAppId(params.id)
    if (!validation.valid) return validation.error!

    const { app, error } = await getAppOrError(validation.appId!)
    if (error) return error

    const ownershipError = checkAppOwnership(app, session.user.id)
    if (ownershipError) return ownershipError

    const body = await request.json()
    const validationResult = updateAppSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const updatedApp = await prisma.app.update({
      where: { id: validation.appId },
      data: validationResult.data,
    })

    return NextResponse.json(updatedApp, { status: 200 })
  } catch (error) {
    console.error('Error updating app:', error)

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
 * DELETE /api/apps/[id]
 * Soft delete app
 * @auth Required (must be app owner)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const validation = validateAppId(params.id)
    if (!validation.valid) return validation.error!

    const { app, error } = await getAppOrError(validation.appId!)
    if (error) return error

    const ownershipError = checkAppOwnership(app, session.user.id)
    if (ownershipError) return ownershipError

    await prisma.app.update({
      where: { id: validation.appId },
      data: { deletedAt: new Date() },
    })

    return NextResponse.json(
      { message: 'App deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting app:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
