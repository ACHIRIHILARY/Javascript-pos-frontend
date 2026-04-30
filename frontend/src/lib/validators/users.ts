import { z } from 'zod'

export const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['OWNER', 'ADMIN', 'CASHIER']),
})

export type CreateUserValues = z.infer<typeof createUserSchema>

export const updateUserSchema = z.object({
  name: z.string().min(2),
  role: z.enum(['OWNER', 'ADMIN', 'CASHIER']),
  active: z.boolean(),
})

export type UpdateUserValues = z.infer<typeof updateUserSchema>
