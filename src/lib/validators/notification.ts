import { z } from 'zod'

// Query parameters for GET /api/notifications
export const getNotificationsQuerySchema = z.object({
  page: z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .optional()
    .default(1)
    .transform((val) => (val ? parseInt(String(val), 10) : 1))
    .pipe(z.number().int().min(1)),
  limit: z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .optional()
    .default(20)
    .transform((val) => (val ? parseInt(String(val), 10) : 20))
    .pipe(z.number().int().min(1).max(100)),
  isRead: z
    .union([z.literal('true'), z.literal('false'), z.null(), z.undefined()])
    .optional()
    .transform((val) =>
      val === 'true' ? true : val === 'false' ? false : undefined
    ),
})

export type GetNotificationsQuery = z.infer<typeof getNotificationsQuerySchema>

// Update notification schema
export const markAsReadSchema = z.object({
  isRead: z.boolean().optional().default(true),
})

export type MarkAsReadInput = z.infer<typeof markAsReadSchema>
