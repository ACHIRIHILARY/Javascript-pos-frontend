import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  adjustProductStock,
  createCategory,
  createProduct,
  deleteProduct,
  exportProductsCsv,
  getCategories,
  getProductById,
  getProducts,
  importProductsCsv,
  type ProductFilters,
  type ProductPayload,
  type ProductUpdatePayload,
  type StockAdjustmentPayload,
  updateProduct,
} from './api'

const invalidateProductQueries = async (queryClient: ReturnType<typeof useQueryClient>) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['products'] }),
    queryClient.invalidateQueries({ queryKey: ['reports', 'summary'] }),
  ])
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })
}

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: ['products', filters.search ?? '', filters.categoryId ?? '', Boolean(filters.lowStock)],
    queryFn: () => getProducts(filters),
  })
}

export function useProduct(id?: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductById(id ?? ''),
    enabled: Boolean(id),
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => createCategory(name),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ProductPayload) => createProduct(payload),
    onSuccess: async () => {
      await invalidateProductQueries(queryClient)
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProductUpdatePayload }) => updateProduct(id, payload),
    onSuccess: async (_, variables) => {
      await Promise.all([
        invalidateProductQueries(queryClient),
        queryClient.invalidateQueries({ queryKey: ['product', variables.id] }),
      ])
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: async () => {
      await invalidateProductQueries(queryClient)
    },
  })
}

export function useAdjustProductStock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: StockAdjustmentPayload }) =>
      adjustProductStock(id, payload),
    onSuccess: async (_, variables) => {
      await Promise.all([
        invalidateProductQueries(queryClient),
        queryClient.invalidateQueries({ queryKey: ['product', variables.id] }),
      ])
    },
  })
}

export function useImportProductsCsv() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (csvText: string) => importProductsCsv(csvText),
    onSuccess: async () => {
      await invalidateProductQueries(queryClient)
    },
  })
}

export function useExportProductsCsv() {
  return useMutation({
    mutationFn: exportProductsCsv,
  })
}
