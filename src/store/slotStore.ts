import { create } from 'zustand'
import { WinningLine, SpinResult } from '../types/slots'
import { SlotsEngine } from '../engine/slotsEngine'
import { slotsApi } from '../api/slots.api'
import { useAuthStore } from './authStore'
import { getErrorMessage } from '../api/client'

interface SlotState {
  betPerLine: number
  lines: number
  grid: number[][] // 5 columns x 3 rows
  isSpinning: boolean
  reelStopped: boolean[] // 5 reels
  winningLines: WinningLine[]
  totalPayout: number
  totalMultiplier: number
  freeSpinsRemaining: number
  autoSpin: boolean
  turboMode: boolean
  lastResult: SpinResult | null
  errorMessage: string | null

  setBetPerLine: (bet: number) => void
  setLines: (lines: number) => void
  setIsSpinning: (spinning: boolean) => void
  toggleAutoSpin: () => void
  toggleTurboMode: () => void
  clearError: () => void

  spin: () => Promise<SpinResult | null>
}

const DEFAULT_GRID: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 0],
  [1, 2, 3],
  [4, 5, 6],
]

export const useSlotStore = create<SlotState>((set, get) => ({
  betPerLine: 0.5,
  lines: 20,
  grid: DEFAULT_GRID,
  isSpinning: false,
  reelStopped: [true, true, true, true, true],
  winningLines: [],
  totalPayout: 0,
  totalMultiplier: 0,
  freeSpinsRemaining: 0,
  autoSpin: false,
  turboMode: false,
  lastResult: null,
  errorMessage: null,

  setBetPerLine: (bet: number) => {
    if (get().isSpinning) return
    const safeBet = Math.max(0.05, Math.round(bet * 100) / 100)
    set({ betPerLine: safeBet })
  },

  setLines: (lines: number) => {
    if (get().isSpinning) return
    const safeLines = Math.min(Math.max(1, lines), 20)
    set({ lines: safeLines })
  },

  setIsSpinning: (spinning: boolean) => set({ isSpinning: spinning }),

  toggleAutoSpin: () => set((s) => ({ autoSpin: !s.autoSpin })),
  toggleTurboMode: () => set((s) => ({ turboMode: !s.turboMode })),
  clearError: () => set({ errorMessage: null }),

  spin: async () => {
    const { betPerLine, lines, isSpinning, freeSpinsRemaining } = get()
    if (isSpinning) return null

    const auth = useAuthStore.getState()
    const totalBet = Math.round(betPerLine * lines * 100) / 100
    const isFreeSpin = freeSpinsRemaining > 0

    if (!isFreeSpin && auth.user.balance < totalBet) {
      set({ errorMessage: 'Insufficient balance to spin reels', autoSpin: false })
      return null
    }

    set({
      isSpinning: true,
      reelStopped: [false, false, false, false, false],
      winningLines: [],
      errorMessage: null,
    })

    // Authenticated Mode
    if (!auth.user.isGuest) {
      try {
        const result = await slotsApi.spin(betPerLine, lines)
        auth.updateBalance(result.balance)

        const newFreeSpins = (freeSpinsRemaining > 0 ? freeSpinsRemaining - 1 : 0) + result.freeSpinsWon

        set({
          grid: result.grid,
          winningLines: result.winningLines,
          totalPayout: result.payout,
          totalMultiplier: result.totalMultiplier,
          freeSpinsRemaining: newFreeSpins,
          lastResult: result,
        })
        return result
      } catch (err) {
        set({
          isSpinning: false,
          reelStopped: [true, true, true, true, true],
          autoSpin: false,
          errorMessage: getErrorMessage(err),
        })
        return null
      }
    }

    // Guest Mode (Client Simulation)
    if (!isFreeSpin) {
      auth.updateBalance(auth.user.balance - totalBet)
    }

    const grid = SlotsEngine.generateRandomGrid()
    const evalResult = SlotsEngine.evaluate(grid, lines, betPerLine)
    const newBalance = auth.user.balance + evalResult.payout
    auth.updateBalance(newBalance)

    const newFreeSpins = (freeSpinsRemaining > 0 ? freeSpinsRemaining - 1 : 0) + evalResult.freeSpinsWon

    const guestResult: SpinResult = {
      roundId: 'guest-slot-' + Date.now(),
      grid: evalResult.grid,
      winningLines: evalResult.winningLines,
      totalMultiplier: evalResult.totalMultiplier,
      payout: evalResult.payout,
      freeSpinsWon: evalResult.freeSpinsWon,
      scatterCount: evalResult.scatterCount,
      balance: newBalance,
    }

    set({
      grid: evalResult.grid,
      winningLines: evalResult.winningLines,
      totalPayout: evalResult.payout,
      totalMultiplier: evalResult.totalMultiplier,
      freeSpinsRemaining: newFreeSpins,
      lastResult: guestResult,
    })

    return guestResult
  },
}))
