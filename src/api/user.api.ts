import { api } from './client'
import { UserTransaction } from '../types'

export const userApi = {
  getBalance: async () => {
    const res = await api.get<{ balance: number }>('/api/user/balance')
    return res.data.balance
  },

  updateProfile: async (data: { username?: string; address?: string }) => {
    const res = await api.put<{ user: { id: string; username: string; email: string; address?: string | null; balance: number } }>(
      '/api/user/profile',
      data
    )
    return res.data.user
  },

  getTransactions: async (limit: number = 50) => {
    const res = await api.get<{ transactions: UserTransaction[] }>('/api/user/transactions', {
      params: { limit },
    })
    return res.data.transactions
  },
}
