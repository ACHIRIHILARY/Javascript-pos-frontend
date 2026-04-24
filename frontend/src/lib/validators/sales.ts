import { z } from 'zod'

export const createSaleSchema = z.object({
  paymentMethod: z.enum(['CASH', 'CARD', 'MOBILE_MONEY']),
  items: z.array(
    z.object({
      productId: z.string().min(1),
      quantity: z.number().int().positive(),
    }),
  ),
})
