import { api } from './client'
import { BlackjackActionResponse, BlackjackRoundHistory, DealResponse } from '../types/blackjack'

export const blackjackApi = {
  deal: async (bet: number, clientSeed?: string): Promise<DealResponse> => {
    const res = await api.post<DealResponse>('/api/blackjack/deal', {
      bet,
      clientSeed,
    })
    return res.data
  },

  hit: async (roundId: string): Promise<BlackjackActionResponse> => {
    const res = await api.post<BlackjackActionResponse>('/api/blackjack/hit', {
      roundId,
    })
    return res.data
  },

  stand: async (roundId: string): Promise<BlackjackActionResponse> => {
    const res = await api.post<BlackjackActionResponse>('/api/blackjack/stand', {
      roundId,
    })
    return res.data
  },

  double: async (roundId: string): Promise<BlackjackActionResponse> => {
    const res = await api.post<BlackjackActionResponse>('/api/blackjack/double', {
      roundId,
    })
    return res.data
  },

  getHistory: async (limit: number = 20): Promise<{ rounds: BlackjackRoundHistory[] }> => {
    const res = await api.get<{ rounds: BlackjackRoundHistory[] }>(`/api/blackjack/history?limit=${limit}`)
    return res.data
  },
}
