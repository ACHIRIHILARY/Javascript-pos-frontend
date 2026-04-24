import type { AxiosError } from 'axios'

export const mapApiError = (error: unknown) => {
  const fallback = 'Something went wrong. Please try again.'
  const axiosError = error as AxiosError<{ error?: { message?: string } }>
  return axiosError.response?.data?.error?.message ?? fallback
}
