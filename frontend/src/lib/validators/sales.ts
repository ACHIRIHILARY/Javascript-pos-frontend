import { z } from 'zod'

export const createSaleSchema = z.object({
  paymentMethod: z.enum(['CASH', 'CARD', 'MOBILE_MONEY']),
  note: z.string().trim().max(250).optional(),
  items: z.array(
    z.object({
      productId: z.string().min(1),
      quantity: z.number().int().positive(),
      unitPrice: z.number().positive(),
    }),
  ).min(1),
})

export type CreateSaleValues = z.infer<typeof createSaleSchema>
