import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createUser, getUsers, type CreateUserPayload, updateUser, type UpdateUserPayload } from './api'

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    enabled: true,
  })
}

export function useUsersQuery(enabled = true) {
  return useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    enabled,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => createUser(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) => updateUser(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
