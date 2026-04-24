import { apiClient } from '../../lib/api/client'
import { endpoints } from '../../lib/api/endpoints'
import type { ApiSuccess } from '../../lib/types/api'
import type { User } from '../../lib/types/domain'

export async function getUsers() {
  const { data } = await apiClient.get<ApiSuccess<User[]>>(endpoints.users)
  return data.data
}
