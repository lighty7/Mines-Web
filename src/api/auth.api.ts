import { api } from './client'
import { AuthResponse } from '../types'

export const authApi = {
  checkHealth: async () => {
    try {
      const res = await api.get<{ status: string }>('/health')
      return res.data
    } catch {
      const res = await api.get<{ status: string }>('/api/health')
      return res.data
    }
  },

  login: async (email: string, password: string) => {
    const res = await api.post<AuthResponse>('/api/auth/login', { email, password })
    return res.data
  },

  register: async (username: string, email: string, password: string, address?: string) => {
    const res = await api.post<AuthResponse>('/api/auth/register', {
      username,
      email,
      password,
      address: address?.trim() ? address.trim() : undefined,
    })
    return res.data
  },

  getMe: async () => {
    const res = await api.get<{ user: AuthResponse['user'] }>('/api/auth/me')
    return res.data.user
  },

  sendOtp: async (email: string, reason: string = 'verification') => {
    const res = await api.post<{ message: string }>('/api/auth/send-otp', { email, reason })
    return res.data
  },

  verifyOtp: async (email: string, code: string) => {
    const res = await api.post<{ message: string }>('/api/auth/verify-otp', { email, code })
    return res.data
  },

  resetPassword: async (email: string, code: string, newPassword: string) => {
    const res = await api.post<{ message: string }>('/api/auth/reset-password', {
      email,
      code,
      newPassword,
    })
    return res.data
  },
}
