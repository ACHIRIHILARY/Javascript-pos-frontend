import type { Role } from './auth'
export type Category = {
  id: string
  name: string
  createdAt?: string
  updatedAt?: string
}

export type StockMovement = {
  id: string
  quantity: number
  reason?: string
  type?: string
  createdAt: string
}

export type Product = {
  id: string
  name: string
  barcode?: string | null
  categoryId?: string | null
  category?: Category | string | null
  sellingPrice: number
  stock: number
  lowStockThreshold: number
  updatedAt?: string
  stockMovements?: StockMovement[]
}
export type PaymentMethod = 'CASH' | 'CARD' | 'MOBILE_MONEY'

export type SaleItem = {
  id?: string
  productId: string
  productName?: string
  quantity: number
  unitPrice: number
  subtotal?: number
}

export type Sale = {
  id: string
  total: number
  paymentMethod: PaymentMethod
  createdAt: string
  cashierId?: string
  cashierName?: string
  note?: string
  items?: SaleItem[]
}

export type PaginatedSales = {
  items: Sale[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export type ReportSummary = {
  totalRevenue: number
  totalSales: number
  lowStockCount: number
  averageSaleValue?: number
  period?: 'day' | 'week' | 'month'
}

export type TopProduct = {
  productId?: string
  name: string
  quantitySold: number
  revenue: number
}

export type User = {
  id: string
  name: string
  email: string
  role: Role
  active: boolean
}

export type ShiftSummary = {
  cashierId: string
  cashierName?: string
  totalSales: number
  totalRevenue: number
  transactionCount: number
}

export type ShiftEndResult = {
  cashierId?: string
  cashierName?: string
  totalSales: number
  totalRevenue: number
  transactionCount: number
  periodStart?: string
  periodEnd?: string
}
