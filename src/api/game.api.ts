import { api } from './client'
import { StartRoundResponse, RevealResponse, CashoutResponse } from '../types'

export const gameApi = {
  startGame: async (bet: number, mines: number, boardSize: number = 25) => {
    const res = await api.post<StartRoundResponse>('/api/game/start', {
      bet,
      mines,
      boardSize,
    })
    return res.data
  },

  revealTile: async (roundId: string, tileIndex: number) => {
    const res = await api.post<RevealResponse>('/api/game/reveal', {
      roundId,
      tileIndex,
    })
    return res.data
  },

  cashout: async (roundId: string) => {
    const res = await api.post<CashoutResponse>('/api/game/cashout', {
      roundId,
    })
    return res.data
  },
}
