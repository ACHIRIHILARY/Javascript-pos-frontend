import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { endShift, getShiftReport, type EndShiftPayload, type ShiftReportFilters } from './api'

export function useShiftReport(filters: ShiftReportFilters = {}) {
  return useQuery({
    queryKey: ['shifts', 'report', filters.from ?? '', filters.to ?? ''],
    queryFn: () => getShiftReport(filters),
  })
}

export function useEndShift() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: EndShiftPayload) => endShift(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['shifts', 'report'] })
    },
  })
}
