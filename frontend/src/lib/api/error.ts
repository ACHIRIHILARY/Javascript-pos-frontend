import type { AxiosError } from 'axios'
const fallbackMessage = 'Something went wrong. Please try again.'

const errorByCode: Record<string, string> = {
  INSUFFICIENT_STOCK: 'Insufficient stock to complete this action.',
  INVALID_CREDENTIALS: 'Invalid credentials. Please check your email and password.',
  FORBIDDEN: 'You are not allowed to perform this action.',
  VALIDATION_ERROR: 'Some fields are invalid. Please review your input and try again.',
}

type ApiErrorBody = {
  error?: {
    code?: string
    message?: string
  }
}

export type ParsedApiError = {
  code?: string
  message: string
}

export const parseApiError = (error: unknown): ParsedApiError => {
  const axiosError = error as AxiosError<ApiErrorBody>
  const code = axiosError.response?.data?.error?.code
  const backendMessage = axiosError.response?.data?.error?.message
  const message = backendMessage ?? (code ? errorByCode[code] : undefined) ?? fallbackMessage
  return { code, message }
}

export const mapApiError = (error: unknown) => {
  return parseApiError(error).message
}
