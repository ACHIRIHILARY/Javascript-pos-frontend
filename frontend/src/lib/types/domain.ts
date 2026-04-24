import type { Role } from './auth'

export type Product = {
  id: string
  name: string
  sellingPrice: number
  stock: number
}

export type Sale = {
  id: string
  total: number
  paymentMethod: 'CASH' | 'CARD' | 'MOBILE_MONEY'
  createdAt: string
}

export type ReportSummary = {
  totalRevenue: number
  totalSales: number
  lowStockCount: number
}

export type User = {
  id: string
  name: string
  email: string
  role: Role
  active: boolean
}
