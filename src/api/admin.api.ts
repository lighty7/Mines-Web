import { api } from './client'

export interface AdminUser {
  id: string
  username: string
  email: string
  role: string
}

export interface AdminStats {
  activePlayersCount: number
  totalUsersCount: number
  bannedUsersCount: number
  mainPot: number
  totalWagered: number
  totalPayout: number
  houseProfit: number
  totalRounds: number
  wonRounds: number
  lostRounds: number
  activeRounds: Array<{
    id: string
    userId: string
    username: string
    bet: number
    mines: number
    boardSize: number
    revealedCount: number
    multiplier: number
    potentialWin: number
    createdAt: string
  }>
}

export interface AdminPlayer {
  id: string
  username: string
  email: string
  balance: number
  role: string
  isBanned: boolean
  bannedReason: string | null
  gamesCount: number
  createdAt: string
}

export interface AdminUsersResponse {
  total: number
  page: number
  limit: number
  totalPages: number
  users: AdminPlayer[]
}

function getAdminHeaders() {
  const token = sessionStorage.getItem('mines_admin_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const adminApi = {
  login: async (credentials: { key?: string; email?: string; password?: string }) => {
    const res = await api.post<{ token: string; admin: AdminUser }>('/api/admin/login', credentials)
    if (res.data.token) {
      sessionStorage.setItem('mines_admin_token', res.data.token)
    }
    return res.data
  },

  getStats: async (): Promise<AdminStats> => {
    const res = await api.get<AdminStats>('/api/admin/stats', {
      headers: getAdminHeaders(),
    })
    return res.data
  },

  getUsers: async (params: {
    search?: string
    status?: 'ALL' | 'ACTIVE' | 'BANNED'
    page?: number
    limit?: number
  }): Promise<AdminUsersResponse> => {
    const res = await api.get<AdminUsersResponse>('/api/admin/users', {
      params,
      headers: getAdminHeaders(),
    })
    return res.data
  },

  setBanStatus: async (userId: string, isBanned: boolean, bannedReason?: string) => {
    const res = await api.patch(
      `/api/admin/users/${userId}/ban`,
      { isBanned, bannedReason },
      { headers: getAdminHeaders() }
    )
    return res.data
  },

  adjustBalance: async (
    userId: string,
    amount: number,
    operation: 'CREDIT' | 'DEBIT' | 'SET',
    reason?: string
  ) => {
    const res = await api.patch(
      `/api/admin/users/${userId}/balance`,
      { amount, operation, reason },
      { headers: getAdminHeaders() }
    )
    return res.data
  },

  deleteUser: async (userId: string) => {
    const res = await api.delete(`/api/admin/users/${userId}`, {
      headers: getAdminHeaders(),
    })
    return res.data
  },
}
