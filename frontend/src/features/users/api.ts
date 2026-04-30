import { apiClient } from '../../lib/api/client'
import { endpoints } from '../../lib/api/endpoints'
import type { ApiSuccess } from '../../lib/types/api'
import type { Role } from '../../lib/types/auth'
import type { User } from '../../lib/types/domain'
export type CreateUserPayload = {
  name: string
  email: string
  password: string
  role: Role
}

export type UpdateUserPayload = {
  name?: string
  role?: Role
  active?: boolean
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

const toCollection = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value
  const record = toRecord(value)
  const candidates = [record.items, record.users, record.rows, record.data]
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate
  }
  return []
}

const normalizeUser = (value: unknown): User => {
  const item = toRecord(value)
  return {
    id: toString(item.id),
    name: toString(item.name),
    email: toString(item.email),
    role: toString(item.role, 'CASHIER') as Role,
    active: item.active !== false,
  }
}

export async function getUsers() {
  const { data } = await apiClient.get<ApiSuccess<unknown>>(endpoints.users.list)
  return toCollection(data.data).map(normalizeUser)
}

export async function createUser(payload: CreateUserPayload) {
  const { data } = await apiClient.post<ApiSuccess<unknown>>(endpoints.users.list, payload)
  return normalizeUser(data.data)
}

export async function updateUser(id: string, payload: UpdateUserPayload) {
  const { data } = await apiClient.patch<ApiSuccess<unknown>>(endpoints.users.byId(id), payload)
  return normalizeUser(data.data)
}
