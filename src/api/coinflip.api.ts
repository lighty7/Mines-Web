import { api } from './client'
import {
  CoinSide,
  StartCoinFlipResponse,
  FlipResponse,
  CashoutCoinFlipResponse,
} from '../types/coinflip'

export const coinFlipApi = {
  startRound: async (bet: number, clientSeed?: string): Promise<StartCoinFlipResponse> => {
    const res = await api.post<StartCoinFlipResponse>('/api/coinflip/start', {
      bet,
      clientSeed,
    })
    return res.data
  },

  flip: async (roundId: string, guess: CoinSide): Promise<FlipResponse> => {
    const res = await api.post<FlipResponse>('/api/coinflip/flip', {
      roundId,
      guess,
    })
    return res.data
  },

  cashout: async (roundId: string): Promise<CashoutCoinFlipResponse> => {
    const res = await api.post<CashoutCoinFlipResponse>('/api/coinflip/cashout', {
      roundId,
    })
    return res.data
  },

  getHistory: async (limit: number = 20): Promise<{ rounds: any[] }> => {
    const res = await api.get<{ rounds: any[] }>(`/api/coinflip/history?limit=${limit}`)
    return res.data
  },
}
