import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { sessionStorage } from '../auth/session'
import { tokenStorage } from '../auth/tokenStorage'
import { API_V1_BASE } from '../constants'
import type { ApiSuccess } from '../types/api'
import { endpoints } from './endpoints'

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean }
type RefreshPayload = { token?: string }

const refreshClient = axios.create({ baseURL: API_V1_BASE, timeout: 15000 })
let refreshPromise: Promise<string | null> | null = null

export const apiClient = axios.create({
  baseURL: API_V1_BASE,
  timeout: 15000,
})

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.get()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
async function attemptTokenRefresh() {
  const currentToken = tokenStorage.get()
  if (!currentToken) return null
  const { data } = await refreshClient.post<ApiSuccess<RefreshPayload>>(
    endpoints.auth.refresh,
    undefined,
    {
      headers: {
        Authorization: `Bearer ${currentToken}`,
      },
    },
  )
  const nextToken = data?.data?.token
  if (!nextToken) return null
  tokenStorage.set(nextToken)
  return nextToken
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status
    const original = error.config as RetriableConfig | undefined
    if (status !== 401 || !original || original._retry) return Promise.reject(error)
    if (original.url?.includes(endpoints.auth.refresh)) return Promise.reject(error)
    original._retry = true
    try {
      if (!refreshPromise) {
        refreshPromise = attemptTokenRefresh().finally(() => {
          refreshPromise = null
        })
      }
      const nextToken = await refreshPromise
      if (!nextToken) throw error
      original.headers = original.headers ?? {}
      tokenStorage.set(nextToken)
      original.headers.Authorization = `Bearer ${nextToken}`
      return apiClient(original)
    } catch (refreshError) {
      tokenStorage.clear()
      sessionStorage.clearUser()
      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
      return Promise.reject(refreshError)
    }
  },
)
