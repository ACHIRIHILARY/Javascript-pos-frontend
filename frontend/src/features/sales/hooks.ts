import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createSale, getSaleById, getSales, type CreateSalePayload } from './api'

export function useSales(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['sales', page, limit],
    queryFn: () => getSales({ page, limit }),
  })
}

export function useSale(id?: string) {
  return useQuery({
    queryKey: ['sale', id],
    queryFn: () => getSaleById(id ?? ''),
    enabled: Boolean(id),
  })
}

export function useCreateSale() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateSalePayload) => createSale(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['sales'] }),
        queryClient.invalidateQueries({ queryKey: ['products'] }),
        queryClient.invalidateQueries({ queryKey: ['reports', 'summary'] }),
        queryClient.invalidateQueries({ queryKey: ['reports', 'top-products'] }),
      ])
    },
  })
}
