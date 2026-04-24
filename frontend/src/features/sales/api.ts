import { apiClient } from '../../lib/api/client'
import { endpoints } from '../../lib/api/endpoints'
import type { ApiSuccess } from '../../lib/types/api'
import type { Sale } from '../../lib/types/domain'

export async function getSales() {
  const { data } = await apiClient.get<ApiSuccess<Sale[]>>(endpoints.sales)
  return data.data
}
