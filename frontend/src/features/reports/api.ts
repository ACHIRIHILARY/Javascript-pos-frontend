import { apiClient } from '../../lib/api/client'
import { endpoints } from '../../lib/api/endpoints'
import type { ApiSuccess } from '../../lib/types/api'
import type { ReportSummary } from '../../lib/types/domain'

export async function getSummary(period: 'day' | 'week' | 'month' = 'day') {
  const { data } = await apiClient.get<ApiSuccess<ReportSummary>>(endpoints.reportsSummary, {
    params: { period },
  })
  return data.data
}
