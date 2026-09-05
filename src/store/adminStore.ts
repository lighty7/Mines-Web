import { create } from 'zustand'
import { adminApi, AdminStats, AdminDashboardData, AdminPlayer, AdminUser } from '../api/admin.api'
import { getErrorMessage } from '../api/client'

interface AdminState {
  adminToken: string | null
  adminUser: AdminUser | null
  stats: AdminStats | null
  dashboard: AdminDashboardData | null
  users: AdminPlayer[]
  totalUsers: number
  currentPage: number
  totalPages: number
  searchTerm: string
  statusFilter: 'ALL' | 'ACTIVE' | 'BANNED'
  isLoading: boolean
  errorMessage: string | null

  login: (credentials: { key?: string; email?: string; password?: string }) => Promise<boolean>
  logout: () => void
  fetchStats: () => Promise<void>
  fetchDashboard: () => Promise<void>
  fetchUsers: (page?: number) => Promise<void>
  setSearchTerm: (term: string) => void
  setStatusFilter: (status: 'ALL' | 'ACTIVE' | 'BANNED') => void
  toggleBan: (userId: string, isBanned: boolean, reason?: string) => Promise<boolean>
  adjustBalance: (
    userId: string,
    amount: number,
    operation: 'CREDIT' | 'DEBIT' | 'SET',
    reason?: string
  ) => Promise<boolean>
  deleteUser: (userId: string) => Promise<boolean>
}

const CACHED_TOKEN = sessionStorage.getItem('mines_admin_token')
const CACHED_ADMIN = sessionStorage.getItem('mines_admin_user')

export const useAdminStore = create<AdminState>((set, get) => ({
  adminToken: CACHED_TOKEN,
  adminUser: CACHED_ADMIN ? JSON.parse(CACHED_ADMIN) : null,
  stats: null,
  dashboard: null,
  users: [],
  totalUsers: 0,
  currentPage: 1,
  totalPages: 1,
  searchTerm: '',
  statusFilter: 'ALL',
  isLoading: false,
  errorMessage: null,

  login: async (credentials) => {
    set({ isLoading: true, errorMessage: null })
    try {
      const data = await adminApi.login(credentials)
      sessionStorage.setItem('mines_admin_token', data.token)
      sessionStorage.setItem('mines_admin_user', JSON.stringify(data.admin))
      set({
        adminToken: data.token,
        adminUser: data.admin,
        isLoading: false,
      })
      await Promise.all([get().fetchStats(), get().fetchDashboard(), get().fetchUsers(1)])
      return true
    } catch (err) {
      set({ isLoading: false, errorMessage: getErrorMessage(err) })
      return false
    }
  },

  logout: () => {
    sessionStorage.removeItem('mines_admin_token')
    sessionStorage.removeItem('mines_admin_user')
    set({
      adminToken: null,
      adminUser: null,
      stats: null,
      dashboard: null,
      users: [],
    })
  },

  fetchStats: async () => {
    try {
      const stats = await adminApi.getStats()
      set({ stats })
    } catch (err) {
      set({ errorMessage: getErrorMessage(err) })
    }
  },

  fetchDashboard: async () => {
    try {
      const dashboard = await adminApi.getDashboard()
      set({ dashboard })
    } catch (err) {
      set({ errorMessage: getErrorMessage(err) })
    }
  },

  fetchUsers: async (page = 1) => {
    set({ isLoading: true })
    try {
      const { searchTerm, statusFilter } = get()
      const data = await adminApi.getUsers({
        search: searchTerm,
        status: statusFilter,
        page,
        limit: 15,
      })
      set({
        users: data.users,
        totalUsers: data.total,
        currentPage: data.page,
        totalPages: data.totalPages,
        isLoading: false,
      })
    } catch (err) {
      set({ isLoading: false, errorMessage: getErrorMessage(err) })
    }
  },

  setSearchTerm: (term: string) => {
    set({ searchTerm: term })
    get().fetchUsers(1)
  },

  setStatusFilter: (status) => {
    set({ statusFilter: status })
    get().fetchUsers(1)
  },

  toggleBan: async (userId: string, isBanned: boolean, reason?: string) => {
    try {
      await adminApi.setBanStatus(userId, isBanned, reason)
      // Optimistic update
      set((state) => ({
        users: state.users.map((u) =>
          u.id === userId ? { ...u, isBanned, bannedReason: isBanned ? reason || 'Banned' : null } : u
        ),
      }))
      await get().fetchStats()
      return true
    } catch (err) {
      set({ errorMessage: getErrorMessage(err) })
      return false
    }
  },

  adjustBalance: async (userId, amount, operation, reason) => {
    try {
      const res = await adminApi.adjustBalance(userId, amount, operation, reason)
      set((state) => ({
        users: state.users.map((u) =>
          u.id === userId ? { ...u, balance: res.balance } : u
        ),
      }))
      await get().fetchStats()
      return true
    } catch (err) {
      set({ errorMessage: getErrorMessage(err) })
      return false
    }
  },

  deleteUser: async (userId: string) => {
    try {
      await adminApi.deleteUser(userId)
      set((state) => ({
        users: state.users.filter((u) => u.id !== userId),
        totalUsers: Math.max(0, state.totalUsers - 1),
      }))
      await get().fetchStats()
      return true
    } catch (err) {
      set({ errorMessage: getErrorMessage(err) })
      return false
    }
  },
}))
