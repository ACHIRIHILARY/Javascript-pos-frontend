import { apiClient } from '../../lib/api/client'
import { endpoints } from '../../lib/api/endpoints'
import type { LoginRequest, LoginResponse } from '../../lib/types/auth'
import type { ApiSuccess } from '../../lib/types/api'

export const authApi = {
  async login(input: LoginRequest) {
    const { data } = await apiClient.post<ApiSuccess<LoginResponse>>(endpoints.auth.login, input)
    return data.data
  },
  async logout() {
    await apiClient.post(endpoints.auth.logout)
  },
}
