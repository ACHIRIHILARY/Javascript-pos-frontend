import { useMutation, useQuery } from '@tanstack/react-query'
import { exportSummaryCsv, getSummary, getTopProducts } from './api'

export function useSummary(period: 'day' | 'week' | 'month' = 'day') {
  return useQuery({
    queryKey: ['reports', 'summary', period],
    queryFn: () => getSummary(period),
  })
}

export function useTopProducts() {
  return useQuery({
    queryKey: ['reports', 'top-products'],
    queryFn: getTopProducts,
  })
}

export function useExportSummaryCsv() {
  return useMutation({
    mutationFn: (period: 'day' | 'week' | 'month') => exportSummaryCsv(period),
  })
}
