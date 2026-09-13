import { api } from './client'
import { PlacedBet, SpinRouletteResponse } from '../types/roulette'

export const rouletteApi = {
  spin: async (bets: PlacedBet[], clientSeed?: string): Promise<SpinRouletteResponse> => {
    const res = await api.post<SpinRouletteResponse>('/api/roulette/spin', {
      bets,
      clientSeed,
    })
    return res.data
  },

  getHistory: async (limit: number = 20): Promise<{ rounds: any[] }> => {
    const res = await api.get<{ rounds: any[] }>(`/api/roulette/history?limit=${limit}`)
    return res.data
  },
}
