import { apiClient } from '../../lib/api/client'
import { endpoints } from '../../lib/api/endpoints'
import type { ApiSuccess } from '../../lib/types/api'
import type { Product } from '../../lib/types/domain'

export async function getProducts() {
  const { data } = await apiClient.get<ApiSuccess<Product[]>>(endpoints.products)
  return data.data
}
