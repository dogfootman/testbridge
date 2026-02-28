import { z } from 'zod'

// Query parameters for GET /api/notifications
export const getNotificationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  isRead: z.enum(['true', 'false']).optional().transform(val => val === 'true' ? true : val === 'false' ? false : undefined),
})

export type GetNotificationsQuery = z.infer<typeof getNotificationsQuerySchema>

// Update notification schema
export const markAsReadSchema = z.object({
  isRead: z.boolean().optional().default(true),
})

export type MarkAsReadInput = z.infer<typeof markAsReadSchema>
