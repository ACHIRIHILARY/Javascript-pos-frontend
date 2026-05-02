import { apiClient } from '../../lib/api/client'
import { endpoints } from '../../lib/api/endpoints'
import type { ApiSuccess } from '../../lib/types/api'
import type { Category, Product, StockMovement } from '../../lib/types/domain'

export type ProductFilters = {
  search?: string
  categoryId?: string
  lowStock?: boolean
}

export type ProductPayload = {
  name: string
  barcode?: string
  qrCodeValue?: string
  categoryId: string
  sellingPrice: number
  stock: number
  lowStockThreshold: number
}

export type ProductUpdatePayload = Partial<ProductPayload>

export type StockAdjustmentPayload = {
  quantity: number
  reason: string
}

export type ImportProductsResult = {
  importedCount: number
  skippedCount: number
  message?: string
}

const toRecord = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object') return {}
  return value as Record<string, unknown>
}

const toString = (value: unknown, fallback = '') => {
  if (typeof value === 'string') return value
  if (value == null) return fallback
  return String(value)
}

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const toCollection = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value
  const record = toRecord(value)
  const candidates = [record.items, record.products, record.rows, record.data]
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate
  }
  return []
}

const normalizeCategory = (value: unknown): Category => {
  const item = toRecord(value)
  return {
    id: toString(item.id),
    name: toString(item.name),
    createdAt: typeof item.createdAt === 'string' ? item.createdAt : undefined,
    updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : undefined,
  }
}

const normalizeStockMovement = (value: unknown): StockMovement => {
  const item = toRecord(value)
  return {
    id: toString(item.id, crypto.randomUUID()),
    quantity: toNumber(item.quantity),
    reason: typeof item.reason === 'string' ? item.reason : undefined,
    type: typeof item.type === 'string' ? item.type : undefined,
    createdAt: toString(item.createdAt, new Date().toISOString()),
  }
}

const normalizeProduct = (value: unknown): Product => {
  const item = toRecord(value)
  const categoryValue = item.category
  let category: Product['category']
  if (typeof categoryValue === 'string') category = categoryValue
  else if (categoryValue && typeof categoryValue === 'object') category = normalizeCategory(categoryValue)
  else category = null
  return {
    id: toString(item.id),
    name: toString(item.name),
    barcode: typeof item.barcode === 'string' ? item.barcode : null,
    categoryId: typeof item.categoryId === 'string' ? item.categoryId : null,
    category,
    sellingPrice: toNumber(item.sellingPrice),
    stock: toNumber(item.stock),
    lowStockThreshold: toNumber(item.lowStockThreshold),
    updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : undefined,
    stockMovements: toCollection(item.stockMovements).map(normalizeStockMovement),
  }
}

export async function getCategories() {
  const { data } = await apiClient.get<ApiSuccess<unknown>>(endpoints.categories)
  return toCollection(data.data).map(normalizeCategory)
}

export async function createCategory(name: string) {
  const { data } = await apiClient.post<ApiSuccess<unknown>>(endpoints.categories, { name })
  return normalizeCategory(data.data)
}

export async function getProducts(filters: ProductFilters = {}) {
  const { data } = await apiClient.get<ApiSuccess<unknown>>(endpoints.products.list, {
    params: {
      search: filters.search?.trim() || undefined,
      categoryId: filters.categoryId || undefined,
      lowStock: filters.lowStock || undefined,
    },
  })
  return toCollection(data.data).map(normalizeProduct)
}

export async function getProductById(id: string) {
  const { data } = await apiClient.get<ApiSuccess<unknown>>(endpoints.products.byId(id))
  const payload = toRecord(data.data)
  const raw = payload.product ?? payload.item ?? payload
  return normalizeProduct(raw)
}

export async function createProduct(input: ProductPayload) {
  const { data } = await apiClient.post<ApiSuccess<unknown>>(endpoints.products.list, input)
  return normalizeProduct(data.data)
}

export async function updateProduct(id: string, input: ProductUpdatePayload) {
  const { data } = await apiClient.patch<ApiSuccess<unknown>>(endpoints.products.byId(id), input)
  return normalizeProduct(data.data)
}

export async function deleteProduct(id: string) {
  await apiClient.delete(endpoints.products.byId(id))
}

export async function adjustProductStock(id: string, input: StockAdjustmentPayload) {
  const { data } = await apiClient.post<ApiSuccess<unknown>>(endpoints.products.adjust(id), input)
  return normalizeProduct(data.data)
}

export async function importProductsCsv(csvText: string) {
  const { data } = await apiClient.post<ApiSuccess<unknown>>(endpoints.products.importCsv, csvText, {
    headers: {
      'Content-Type': 'text/csv',
    },
  })
  const payload = toRecord(data.data)
  return {
    importedCount: toNumber(payload.importedCount ?? payload.created ?? payload.count),
    skippedCount: toNumber(payload.skippedCount ?? payload.skipped),
    message: typeof payload.message === 'string' ? payload.message : undefined,
  } satisfies ImportProductsResult
}

export async function exportProductsCsv() {
  const { data } = await apiClient.get<Blob>(endpoints.products.exportCsv, {
    responseType: 'blob',
  })
  return data
}
