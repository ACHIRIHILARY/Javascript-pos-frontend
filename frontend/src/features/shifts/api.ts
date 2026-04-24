import { apiClient } from '../../lib/api/client'
import { endpoints } from '../../lib/api/endpoints'
import type { ApiSuccess } from '../../lib/types/api'

type ShiftReport = {
  cashierId: string
  totalSales: number
}

export async function getShiftReport() {
  const { data } = await apiClient.get<ApiSuccess<ShiftReport[]>>(endpoints.shiftsReport)
  return data.data
}
