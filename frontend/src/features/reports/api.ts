import { apiClient } from '../../lib/api/client'
import { endpoints } from '../../lib/api/endpoints'
import type { ApiSuccess } from '../../lib/types/api'
import type { ReportSummary, TopProduct } from '../../lib/types/domain'

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

const normalizeSummary = (value: unknown): ReportSummary => {
  const item = toRecord(value)
  return {
    totalRevenue: toNumber(item.totalRevenue),
    totalSales: toNumber(item.totalSales),
    lowStockCount: toNumber(item.lowStockCount),
    averageSaleValue: item.averageSaleValue == null ? undefined : toNumber(item.averageSaleValue),
    period: toString(item.period, 'day') as ReportSummary['period'],
  }
}

const normalizeTopProduct = (value: unknown): TopProduct => {
  const item = toRecord(value)
  return {
    productId: typeof item.productId === 'string' ? item.productId : undefined,
    name: toString(item.name),
    quantitySold: toNumber(item.quantitySold ?? item.quantity ?? item.count),
    revenue: toNumber(item.revenue),
  }
}

export async function getSummary(period: 'day' | 'week' | 'month' = 'day') {
  const { data } = await apiClient.get<ApiSuccess<unknown>>(endpoints.reports.summary, {
    params: { period },
  })
  return normalizeSummary(data.data)
}

export async function getTopProducts() {
  const { data } = await apiClient.get<ApiSuccess<unknown>>(endpoints.reports.topProducts)
  return toCollection(data.data).map(normalizeTopProduct)
}

export async function exportSummaryCsv(period: 'day' | 'week' | 'month') {
  const { data } = await apiClient.get<Blob>(endpoints.reports.summaryExportCsv, {
    params: { period },
    responseType: 'blob',
  })
  return data
}
