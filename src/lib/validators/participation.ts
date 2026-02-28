// @TASK P3-R6 - Participation validation schemas
// @SPEC Prisma schema participations model

import { z } from 'zod'

// Update participation validation schema
export const updateParticipationSchema = z
  .object({
    status: z.enum(['ACTIVE', 'DROPPED', 'COMPLETED']).optional(),
    rewardStatus: z.enum(['NONE', 'PAID', 'PENDING_FEEDBACK', 'SKIPPED']).optional(),
    skipReason: z.string().max(100, 'Skip reason must be at most 100 characters').optional(),
    lastAppRunAt: z.string().datetime().optional(),
    dropReason: z.string().max(100, 'Drop reason must be at most 100 characters').optional(),
  })
  .refine(
    (data) => {
      // If status is DROPPED, dropReason is required
      if (data.status === 'DROPPED' && !data.dropReason) {
        return false
      }
      return true
    },
    {
      message: 'dropReason is required when status is DROPPED',
      path: ['dropReason'],
    }
  )

export type UpdateParticipationInput = z.infer<typeof updateParticipationSchema>

// Status transition validation
export function isValidStatusTransition(
  currentStatus: string,
  newStatus: string
): boolean {
  const validTransitions: Record<string, string[]> = {
    ACTIVE: ['DROPPED', 'COMPLETED'],
    DROPPED: [], // Cannot transition from DROPPED
    COMPLETED: [], // Cannot transition from COMPLETED
  }

  return validTransitions[currentStatus]?.includes(newStatus) ?? false
}
