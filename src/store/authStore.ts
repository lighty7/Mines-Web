import { create } from 'zustand'
import { UserProfile } from '../types'
import { authApi } from '../api/auth.api'

interface AuthState {
  token: string | null
  user: UserProfile
  isLoading: boolean
  serverOnline: boolean | null
  setAuth: (token: string, user: { id: string; username: string; email: string; address?: string | null; balance: number }) => void
  updateBalance: (balance: number) => void
  updateProfile: (username?: string, address?: string) => void
  logout: () => void
  checkServer: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const DEFAULT_GUEST: UserProfile = {
  username: 'Guest',
  email: '',
  address: '',
  balance: 1000.0,
  isGuest: true,
}

export const useAuthStore = create<AuthState>((set, get) => {
  const cachedToken = localStorage.getItem('mines_token')
  const cachedUserRaw = localStorage.getItem('mines_user')
  let initialUser: UserProfile = DEFAULT_GUEST

  if (cachedToken && cachedUserRaw) {
    try {
      initialUser = JSON.parse(cachedUserRaw)
    } catch (_) {
      initialUser = DEFAULT_GUEST
    }
  }

  return {
    token: cachedToken,
    user: initialUser,
    isLoading: false,
    serverOnline: null,

    setAuth: (token, user) => {
      const profile: UserProfile = {
        id: user.id,
        username: user.username,
        email: user.email,
        address: user.address || '',
        balance: user.balance,
        isGuest: false,
      }
      localStorage.setItem('mines_token', token)
      localStorage.setItem('mines_user', JSON.stringify(profile))
      set({ token, user: profile })
    },

    updateBalance: (balance: number) => {
      set((state) => {
        const updated = { ...state.user, balance }
        if (!state.user.isGuest) {
          localStorage.setItem('mines_user', JSON.stringify(updated))
        }
        return { user: updated }
      })
    },

    updateProfile: (username?: string, address?: string) => {
      set((state) => {
        const updated = {
          ...state.user,
          username: username !== undefined ? username : state.user.username,
          address: address !== undefined ? address : state.user.address,
        }
        if (!state.user.isGuest) {
          localStorage.setItem('mines_user', JSON.stringify(updated))
        }
        return { user: updated }
      })
    },

    logout: () => {
      localStorage.removeItem('mines_token')
      localStorage.removeItem('mines_user')
      set({
        token: null,
        user: DEFAULT_GUEST,
      })
    },

    checkServer: async () => {
      try {
        const res = await authApi.checkHealth()
        set({ serverOnline: res.status === 'ok' })
      } catch (_) {
        set({ serverOnline: false })
      }
    },

    refreshProfile: async () => {
      if (!get().token || get().user.isGuest) return
      try {
        const user = await authApi.getMe()
        get().setAuth(get().token!, user)
      } catch (_) {}
    },
  }
})
