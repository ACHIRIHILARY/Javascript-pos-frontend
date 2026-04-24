import { useQuery } from '@tanstack/react-query'
import { getSummary } from './api'

export function useSummary(period: 'day' | 'week' | 'month' = 'day') {
  return useQuery({
    queryKey: ['reports', 'summary', period],
    queryFn: () => getSummary(period),
  })
}
