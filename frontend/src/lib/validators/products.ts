import { z } from 'zod'

export const productSchema = z.object({
  name: z.string().min(2),
  categoryId: z.string().min(1),
  sellingPrice: z.coerce.number().nonnegative(),
  stock: z.coerce.number().int().nonnegative(),
  lowStockThreshold: z.coerce.number().int().nonnegative(),
})
