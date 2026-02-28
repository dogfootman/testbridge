// @TASK P3-R4 - App validation schemas
// @SPEC Prisma schema apps model

import { z } from 'zod'

// Create app validation schema
export const createAppSchema = z.object({
  appName: z.string().min(1, 'App name is required').max(50, 'App name must be at most 50 characters'),
  packageName: z.string()
    .min(1, 'Package name is required')
    .max(150, 'Package name must be at most 150 characters')
    .regex(
      /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/,
      'Package name must be in valid format (e.g., com.example.app)'
    ),
  categoryId: z.number().int().positive('Category ID must be a positive integer'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description must be at most 500 characters'),
  testType: z.enum(['PAID_REWARD', 'CREDIT_EXCHANGE']),
  targetTesters: z.number().int().min(1, 'Target testers must be at least 1').max(1000, 'Target testers must be at most 1000'),
  testLink: z.string().url('Test link must be a valid URL').max(500, 'Test link must be at most 500 characters'),
  rewardType: z.enum(['BASIC', 'WITH_FEEDBACK', 'ADVANCED']).optional(),
  rewardAmount: z.number().int().positive('Reward amount must be positive').optional(),
  feedbackRequired: z.boolean().optional(),
  testGuide: z.string().optional(),
})

// Update app validation schema
export const updateAppSchema = z.object({
  appName: z.string().min(1).max(50).optional(),
  categoryId: z.number().int().positive().optional(),
  description: z.string().min(10).max(500).optional(),
  testType: z.enum(['PAID_REWARD', 'CREDIT_EXCHANGE']).optional(),
  targetTesters: z.number().int().min(1).max(1000).optional(),
  testLink: z.string().url().max(500).optional(),
  rewardType: z.enum(['BASIC', 'WITH_FEEDBACK', 'ADVANCED']).optional(),
  rewardAmount: z.number().int().positive().optional(),
  feedbackRequired: z.boolean().optional(),
  testGuide: z.string().optional(),
  status: z.enum([
    'PENDING_APPROVAL',
    'RECRUITING',
    'IN_TESTING',
    'COMPLETED',
    'PRODUCTION',
    'REJECTED',
    'CANCELLED',
    'BLOCKED'
  ]).optional(),
})

export type CreateAppInput = z.infer<typeof createAppSchema>
export type UpdateAppInput = z.infer<typeof updateAppSchema>
