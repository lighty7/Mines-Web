import { create } from 'zustand'
import { CoinSide, FlipRecord } from '../types/coinflip'
import { CoinFlipEngine } from '../engine/coinflipEngine'
import { coinFlipApi } from '../api/coinflip.api'
import { useAuthStore } from './authStore'
import { getErrorMessage } from '../api/client'

interface CoinFlipState {
  bet: number
  roundId: string | null
  status: 'IDLE' | 'ACTIVE' | 'WON' | 'LOST'
  streak: number
  multiplier: number
  potentialPayout: number
  isFlipping: boolean
  lastOutcome: CoinSide | null
  lastGuess: CoinSide | null
  flips: FlipRecord[]
  errorMessage: string | null

  setBet: (bet: number) => void
  clearError: () => void
  startGame: () => Promise<boolean>
  flip: (guess: CoinSide) => Promise<{ won: boolean; outcome: CoinSide } | null>
  cashout: () => Promise<number | null>
  reset: () => void
}

export const useCoinFlipStore = create<CoinFlipState>((set, get) => ({
  bet: 10,
  roundId: null,
  status: 'IDLE',
  streak: 0,
  multiplier: 1.0,
  potentialPayout: 10,
  isFlipping: false,
  lastOutcome: null,
  lastGuess: null,
  flips: [],
  errorMessage: null,

  setBet: (bet: number) => {
    if (get().status === 'ACTIVE' || get().isFlipping) return
    const maxBalance = useAuthStore.getState().user.balance
    const safeBet = Math.min(Math.max(1, Math.floor(bet * 100) / 100), maxBalance)
    set({ bet: safeBet, potentialPayout: safeBet })
  },

  clearError: () => set({ errorMessage: null }),

  reset: () =>
    set({
      roundId: null,
      status: 'IDLE',
      streak: 0,
      multiplier: 1.0,
      potentialPayout: get().bet,
      isFlipping: false,
      flips: [],
      errorMessage: null,
    }),

  startGame: async () => {
    const { bet, status, isFlipping } = get()
    if (status === 'ACTIVE' || isFlipping) return false

    const auth = useAuthStore.getState()
    if (auth.user.balance < bet) {
      set({ errorMessage: 'Insufficient balance to place bet' })
      return false
    }

    set({ isFlipping: false, errorMessage: null, flips: [], streak: 0, multiplier: 1.0 })

    // Authenticated Mode
    if (!auth.user.isGuest) {
      try {
        const res = await coinFlipApi.startRound(bet)
        auth.updateBalance(res.balance)
        set({
          roundId: res.roundId,
          status: 'ACTIVE',
          potentialPayout: bet,
          multiplier: 1.0,
          streak: 0,
        })
        return true
      } catch (err) {
        set({ errorMessage: getErrorMessage(err) })
        return false
      }
    }

    // Guest Mode
    auth.updateBalance(auth.user.balance - bet)
    set({
      roundId: 'guest-coin-' + Date.now(),
      status: 'ACTIVE',
      potentialPayout: bet,
      multiplier: 1.0,
      streak: 0,
    })
    return true
  },

  flip: async (guess: CoinSide) => {
    const { roundId, status, isFlipping, streak, bet, flips } = get()
    if (status !== 'ACTIVE' || isFlipping || !roundId) return null

    set({ isFlipping: true, lastGuess: guess, errorMessage: null })
    const auth = useAuthStore.getState()

    // Authenticated Mode
    if (!auth.user.isGuest) {
      try {
        const res = await coinFlipApi.flip(roundId, guess)
        auth.updateBalance(res.balance)

        const updatedFlips = [
          ...flips,
          {
            guess,
            outcome: res.outcome,
            won: res.won,
            streak: res.streak,
            multiplier: res.multiplier,
          },
        ]

        set({
          isFlipping: false,
          lastOutcome: res.outcome,
          streak: res.streak,
          multiplier: res.multiplier,
          potentialPayout: res.potentialPayout,
          status: res.status,
          flips: updatedFlips,
        })

        return { won: res.won, outcome: res.outcome }
      } catch (err) {
        set({ isFlipping: false, errorMessage: getErrorMessage(err) })
        return null
      }
    }

    // Guest Mode
    const outcome = CoinFlipEngine.simulateFlip()
    const won = guess === outcome

    if (won) {
      const nextStreak = streak + 1
      const nextMult = CoinFlipEngine.getStreakMultiplier(nextStreak)
      const nextPayout = CoinFlipEngine.getStreakPayout(bet, nextStreak)

      const updatedFlips = [
        ...flips,
        { guess, outcome, won: true, streak: nextStreak, multiplier: nextMult },
      ]

      set({
        isFlipping: false,
        lastOutcome: outcome,
        streak: nextStreak,
        multiplier: nextMult,
        potentialPayout: nextPayout,
        status: 'ACTIVE',
        flips: updatedFlips,
      })
      return { won: true, outcome }
    } else {
      const updatedFlips = [
        ...flips,
        { guess, outcome, won: false, streak: 0, multiplier: 0 },
      ]

      set({
        isFlipping: false,
        lastOutcome: outcome,
        streak: 0,
        multiplier: 0,
        potentialPayout: 0,
        status: 'LOST',
        flips: updatedFlips,
      })
      return { won: false, outcome }
    }
  },

  cashout: async () => {
    const { roundId, status, isFlipping, streak, potentialPayout } = get()
    if (status !== 'ACTIVE' || isFlipping || !roundId || streak === 0) return null

    const auth = useAuthStore.getState()

    // Authenticated Mode
    if (!auth.user.isGuest) {
      try {
        const res = await coinFlipApi.cashout(roundId)
        auth.updateBalance(res.balance)
        set({
          status: 'WON',
          roundId: null,
        })
        return res.payout
      } catch (err) {
        set({ errorMessage: getErrorMessage(err) })
        return null
      }
    }

    // Guest Mode
    auth.updateBalance(auth.user.balance + potentialPayout)
    set({
      status: 'WON',
      roundId: null,
    })
    return potentialPayout
  },
}))
