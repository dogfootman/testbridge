// @TASK P2-S4 - 알림 설정 API
// @SPEC specs/screens/profile.yaml#notification_settings

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const notificationSettingsSchema = z.object({
  pushEnabled: z.boolean().optional(),
  emailEnabled: z.boolean().optional(),
  smsEnabled: z.boolean().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(session.user.id, 10)

    const settings = await prisma.notificationSetting.findUnique({
      where: { userId },
    })

    if (!settings) {
      // Create default settings
      const newSettings = await prisma.notificationSetting.create({
        data: {
          userId,
          pushEnabled: true,
          emailEnabled: true,
          smsEnabled: false,
        },
      })
      return NextResponse.json(newSettings, { status: 200 })
    }

    return NextResponse.json(settings, { status: 200 })
  } catch (error) {
    console.error('Error fetching notification settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(session.user.id, 10)
    const body = await request.json()
    const validationResult = notificationSettingsSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const updatedSettings = await prisma.notificationSetting.upsert({
      where: { userId },
      update: validationResult.data,
      create: {
        userId,
        ...validationResult.data,
      },
    })

    return NextResponse.json(updatedSettings, { status: 200 })
  } catch (error) {
    console.error('Error updating notification settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
