import axios, { AxiosError } from 'axios'

function normalizeBaseUrl(raw?: string): string {
  let url = (raw || 'https://mines-backend-mex2.onrender.com').trim()
  url = url.replace(/\/+$/, '')
  if (url.endsWith('/api')) {
    url = url.slice(0, -4)
  }
  return url.replace(/\/+$/, '')
}

const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_URL)

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Request Interceptor: Attach JWT Token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mines_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Helper to extract clean error message from backend responses
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ error?: string; message?: string }>
    if (axiosError.response?.data) {
      return (
        axiosError.response.data.message ||
        axiosError.response.data.error ||
        axiosError.message
      )
    }
    if (axiosError.code === 'ERR_NETWORK') {
      return 'Cannot connect to server. Please check your internet connection.'
    }
    return axiosError.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred'
}
