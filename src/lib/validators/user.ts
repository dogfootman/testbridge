import { z } from 'zod'

// User update validation schema
export const updateUserSchema = z.object({
  name: z.string().max(100).optional(),
  nickname: z.string().min(2).max(20).optional(),
  bio: z.string().max(200).optional(),
  profileImageUrl: z.string().url().max(500).optional(),
})

export type UpdateUserInput = z.infer<typeof updateUserSchema>
