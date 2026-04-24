import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { sessionStorage } from '../auth/session'
import { tokenStorage } from '../auth/tokenStorage'
import { API_V1_BASE } from '../constants'
import { endpoints } from './endpoints'

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean }

const refreshClient = axios.create({ baseURL: API_V1_BASE, timeout: 15000 })

export const apiClient = axios.create({
  baseURL: API_V1_BASE,
  timeout: 15000,
})

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.get()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status
    const original = error.config as RetriableConfig | undefined
    if (status !== 401 || !original || original._retry) return Promise.reject(error)
    original._retry = true
    try {
      const { data } = await refreshClient.post(endpoints.auth.refresh)
      const nextToken = data?.data?.token as string | undefined
      if (!nextToken) throw error
      tokenStorage.set(nextToken)
      original.headers.Authorization = `Bearer ${nextToken}`
      return apiClient(original)
    } catch (refreshError) {
      tokenStorage.clear()
      sessionStorage.clearUser()
      window.location.assign('/login')
      return Promise.reject(refreshError)
    }
  },
)
