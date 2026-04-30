import { z } from 'zod'

export const productSchema = z.object({
  name: z.string().min(2),
  barcode: z.string().trim().optional(),
  categoryId: z.string().min(1),
  sellingPrice: z.coerce.number().positive(),
  stock: z.coerce.number().int().nonnegative(),
  lowStockThreshold: z.coerce.number().int().nonnegative(),
})

export type ProductFormValues = z.infer<typeof productSchema>

export const stockAdjustmentSchema = z.object({
  quantity: z.coerce.number().int().refine((value) => value !== 0, {
    message: 'Quantity cannot be zero',
  }),
  reason: z.string().trim().min(2),
})

export type StockAdjustmentValues = z.infer<typeof stockAdjustmentSchema>
