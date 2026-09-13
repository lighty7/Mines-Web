import { api } from './client'
import { SpinResult, PaytableInfo } from '../types/slots'

export const slotsApi = {
  spin: async (betPerLine: number, lines: number = 20, clientSeed?: string): Promise<SpinResult> => {
    const res = await api.post<SpinResult>('/api/slots/spin', {
      betPerLine,
      lines,
      clientSeed,
    })
    return res.data
  },

  getPaytable: async (): Promise<PaytableInfo> => {
    const res = await api.get<PaytableInfo>('/api/slots/paytable')
    return res.data
  },

  getHistory: async (limit: number = 20): Promise<{ rounds: any[] }> => {
    const res = await api.get<{ rounds: any[] }>(`/api/slots/history?limit=${limit}`)
    return res.data
  },
}
