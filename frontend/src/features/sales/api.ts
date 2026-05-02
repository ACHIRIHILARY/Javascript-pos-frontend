import { apiClient } from '../../lib/api/client'
import { endpoints } from '../../lib/api/endpoints'
import type { ApiSuccess } from '../../lib/types/api'
import type { PaginatedSales, PaymentMethod, Sale, SaleItem } from '../../lib/types/domain'

export type SalesFilters = {
  page?: number
  limit?: number
}

export type CreateSalePayload = {
  items: Array<{
    productId: string
    quantity: number
    unitPrice: number
  }>
  paymentMethod: PaymentMethod
  note?: string
}

const toRecord = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object') return {}
  return value as Record<string, unknown>
}

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const toString = (value: unknown, fallback = '') => {
  if (typeof value === 'string') return value
  if (value == null) return fallback
  return String(value)
}

const toCollection = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value
  const record = toRecord(value)
  const candidates = [record.items, record.sales, record.rows, record.data]
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate
  }
  return []
}

const normalizeSaleItem = (value: unknown): SaleItem => {
  const item = toRecord(value)
  return {
    id: typeof item.id === 'string' ? item.id : undefined,
    productId: toString(item.productId ?? item.id),
    productName: typeof item.productName === 'string' ? item.productName : undefined,
    quantity: toNumber(item.quantity),
    unitPrice: toNumber(item.unitPrice),
    subtotal: item.subtotal == null ? undefined : toNumber(item.subtotal),
  }
}

const normalizeSale = (value: unknown): Sale => {
  const item = toRecord(value)
  const cashier = toRecord(item.cashier ?? item.user)
  return {
    id: toString(item.id),
    total: toNumber(item.total),
    paymentMethod: toString(item.paymentMethod, 'CASH') as PaymentMethod,
    createdAt: toString(item.createdAt, new Date().toISOString()),
    cashierId: toString(item.cashierId ?? item.userId ?? cashier.id, ''),
    cashierName: toString(item.cashierName ?? cashier.name, ''),
    note: typeof item.note === 'string' ? item.note : undefined,
    items: toCollection(item.items).map(normalizeSaleItem),
  }
}

const normalizeSalesList = (value: unknown, filters: Required<SalesFilters>): PaginatedSales => {
  const payload = toRecord(value)
  const items = toCollection(value).map(normalizeSale)
  const page = toNumber(payload.page, filters.page)
  const limit = toNumber(payload.limit, filters.limit)
  const total = toNumber(payload.total ?? payload.count, items.length)
  const totalPages = toNumber(
    payload.totalPages,
    Math.max(1, Math.ceil((total || items.length) / (limit || filters.limit || 1))),
  )
  return {
    items,
    page,
    limit,
    total,
    totalPages,
  }
}

export async function getSales(filters: SalesFilters = {}) {
  const resolvedFilters: Required<SalesFilters> = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
  }
  const { data } = await apiClient.get<ApiSuccess<unknown>>(endpoints.sales.list, {
    params: resolvedFilters,
  })
  return normalizeSalesList(data.data, resolvedFilters)
}

export async function getSaleById(id: string) {
  const { data } = await apiClient.get<ApiSuccess<unknown>>(endpoints.sales.byId(id))
  const payload = toRecord(data.data)
  return normalizeSale(payload.sale ?? payload.item ?? payload)
}

export async function createSale(payload: CreateSalePayload) {
  const { data } = await apiClient.post<ApiSuccess<unknown>>(endpoints.sales.list, payload)
  const body = toRecord(data.data)
  return normalizeSale(body.sale ?? body)
}
