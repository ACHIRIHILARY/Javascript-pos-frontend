import { apiClient } from '../../lib/api/client'
import { endpoints } from '../../lib/api/endpoints'
import type { ApiSuccess } from '../../lib/types/api'
import type { ShiftEndResult, ShiftSummary } from '../../lib/types/domain'

export type ShiftReportFilters = {
  from?: string
  to?: string
}

export type EndShiftPayload = {
  cashierId?: string
  from?: string
  to?: string
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
  const candidates = [record.items, record.rows, record.shifts, record.data]
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate
  }
  return []
}

const normalizeShiftSummary = (value: unknown): ShiftSummary => {
  const item = toRecord(value)
  return {
    cashierId: toString(item.cashierId),
    cashierName: toString(item.cashierName),
    totalSales: toNumber(item.totalSales),
    totalRevenue: toNumber(item.totalRevenue),
    transactionCount: toNumber(item.transactionCount),
  }
}

const normalizeShiftEndResult = (value: unknown): ShiftEndResult => {
  const item = toRecord(value)
  return {
    cashierId: toString(item.cashierId),
    cashierName: toString(item.cashierName),
    totalSales: toNumber(item.totalSales),
    totalRevenue: toNumber(item.totalRevenue),
    transactionCount: toNumber(item.transactionCount),
    periodStart: typeof item.periodStart === 'string' ? item.periodStart : undefined,
    periodEnd: typeof item.periodEnd === 'string' ? item.periodEnd : undefined,
  }
}

export async function getShiftReport(filters: ShiftReportFilters = {}) {
  const { data } = await apiClient.get<ApiSuccess<unknown>>(endpoints.shifts.report, {
    params: {
      from: filters.from || undefined,
      to: filters.to || undefined,
    },
  })
  return toCollection(data.data).map(normalizeShiftSummary)
}

export async function endShift(payload: EndShiftPayload) {
  const { data } = await apiClient.post<ApiSuccess<unknown>>(endpoints.shifts.end, payload)
  return normalizeShiftEndResult(data.data)
}
