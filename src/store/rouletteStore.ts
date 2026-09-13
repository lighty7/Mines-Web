import { create } from 'zustand'
import { PlacedBet, RouletteColor, RouletteBetType, SpinRouletteResponse } from '../types/roulette'
import { RouletteEngine } from '../engine/rouletteEngine'
import { rouletteApi } from '../api/roulette.api'
import { useAuthStore } from './authStore'
import { getErrorMessage } from '../api/client'

interface RouletteState {
  selectedChip: number
  placedBets: PlacedBet[]
  isSpinning: boolean
  winningNumber: number | null
  winningColor: RouletteColor | null
  lastPayout: number
  lastMultiplier: number
  history: Array<{ number: number; color: RouletteColor }>
  lastResult: SpinRouletteResponse | null
  errorMessage: string | null

  setSelectedChip: (amount: number) => void
  placeBet: (type: RouletteBetType, numbers: number[]) => void
  clearBets: () => void
  undoBet: () => void
  doubleBets: () => void
  clearError: () => void

  spin: () => Promise<SpinRouletteResponse | null>
}

export const useRouletteStore = create<RouletteState>((set, get) => ({
  selectedChip: 5,
  placedBets: [],
  isSpinning: false,
  winningNumber: null,
  winningColor: null,
  lastPayout: 0,
  lastMultiplier: 0,
  history: [
    { number: 17, color: 'BLACK' },
    { number: 32, color: 'RED' },
    { number: 0, color: 'GREEN' },
    { number: 7, color: 'RED' },
  ],
  lastResult: null,
  errorMessage: null,

  setSelectedChip: (chip: number) => set({ selectedChip: chip }),

  placeBet: (type: RouletteBetType, numbers: number[]) => {
    if (get().isSpinning) return
    const { selectedChip, placedBets } = get()
    const auth = useAuthStore.getState()

    const currentTotal = placedBets.reduce((s, b) => s + b.amount, 0)
    if (currentTotal + selectedChip > auth.user.balance) {
      set({ errorMessage: 'Insufficient balance to add chip' })
      return
    }

    // Merge with existing bet on identical numbers if present
    const existingIdx = placedBets.findIndex(
      (b) => b.type === type && b.numbers.length === numbers.length && b.numbers.every((n, i) => n === numbers[i])
    )

    let updated: PlacedBet[]
    if (existingIdx >= 0) {
      updated = [...placedBets]
      updated[existingIdx] = {
        ...updated[existingIdx],
        amount: updated[existingIdx].amount + selectedChip,
      }
    } else {
      updated = [...placedBets, { type, numbers, amount: selectedChip }]
    }

    set({ placedBets: updated, errorMessage: null })
  },

  clearBets: () => {
    if (get().isSpinning) return
    set({ placedBets: [], errorMessage: null })
  },

  undoBet: () => {
    if (get().isSpinning) return
    const { placedBets } = get()
    if (placedBets.length === 0) return
    set({ placedBets: placedBets.slice(0, -1) })
  },

  doubleBets: () => {
    if (get().isSpinning) return
    const { placedBets } = get()
    const auth = useAuthStore.getState()
    const currentTotal = placedBets.reduce((s, b) => s + b.amount, 0)

    if (currentTotal * 2 > auth.user.balance) {
      set({ errorMessage: 'Insufficient balance to double bets' })
      return
    }

    set({
      placedBets: placedBets.map((b) => ({ ...b, amount: b.amount * 2 })),
      errorMessage: null,
    })
  },

  clearError: () => set({ errorMessage: null }),

  spin: async () => {
    const { placedBets, isSpinning, history } = get()
    if (isSpinning || placedBets.length === 0) return null

    const totalBet = placedBets.reduce((s, b) => s + b.amount, 0)
    const auth = useAuthStore.getState()

    if (auth.user.balance < totalBet) {
      set({ errorMessage: 'Insufficient balance to spin' })
      return null
    }

    set({ isSpinning: true, errorMessage: null })

    // Authenticated Mode
    if (!auth.user.isGuest) {
      try {
        const res = await rouletteApi.spin(placedBets)
        auth.updateBalance(res.balance)

        const newHistory = [{ number: res.winningNumber, color: res.color }, ...history].slice(0, 15)

        set({
          winningNumber: res.winningNumber,
          winningColor: res.color,
          lastPayout: res.payout,
          lastMultiplier: res.multiplier,
          history: newHistory,
          lastResult: res,
        })
        return res
      } catch (err) {
        set({ isSpinning: false, errorMessage: getErrorMessage(err) })
        return null
      }
    }

    // Guest Mode
    auth.updateBalance(auth.user.balance - totalBet)
    const winNum = RouletteEngine.simulateSpin()
    const winColor = RouletteEngine.getNumberColor(winNum)
    const evalRes = RouletteEngine.evaluate(placedBets, winNum)
    const newBal = auth.user.balance + evalRes.totalPayout
    auth.updateBalance(newBal)

    const guestRes: SpinRouletteResponse = {
      roundId: 'guest-roulette-' + Date.now(),
      winningNumber: winNum,
      color: winColor,
      totalBet,
      payout: evalRes.totalPayout,
      multiplier: totalBet > 0 ? Math.round((evalRes.totalPayout / totalBet) * 100) / 100 : 0,
      evaluatedBets: evalRes.evaluatedBets,
      balance: newBal,
      serverSeedHash: '',
    }

    const newHistory = [{ number: winNum, color: winColor }, ...history].slice(0, 15)

    set({
      winningNumber: winNum,
      winningColor: winColor,
      lastPayout: evalRes.totalPayout,
      lastMultiplier: guestRes.multiplier,
      history: newHistory,
      lastResult: guestRes,
    })

    return guestRes
  },
}))
