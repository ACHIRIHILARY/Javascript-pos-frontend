import { useQuery } from '@tanstack/react-query'
import { getShiftReport } from './api'

export function useShiftReport() {
  return useQuery({
    queryKey: ['shifts', 'report'],
    queryFn: getShiftReport,
  })
}
