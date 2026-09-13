import { create } from 'zustand'
import { Card, HandScore } from '../types/blackjack'
import { calculateHandScore, createShoe, playDealerTurn } from '../engine/blackjackEngine'
import { blackjackApi } from '../api/blackjack.api'
import { useAuthStore } from './authStore'
import { getErrorMessage } from '../api/client'

interface BlackjackState {
  bet: number
  roundId: string | null
  status: 'IDLE' | 'ACTIVE' | 'WON' | 'LOST' | 'PUSH'
  playerCards: Card[]
  playerScore: HandScore
  dealerCards: Card[]
  dealerScore: HandScore
  payout: number
  isDealing: boolean
  guestShoe: Card[]
  guestDealerFullCards: Card[]
  serverSeedHash: string | null
  serverSeed: string | null
  errorMessage: string | null

  setBet: (bet: number) => void
  clearError: () => void
  reset: () => void
  deal: () => Promise<boolean>
  hit: () => Promise<boolean>
  stand: () => Promise<boolean>
  double: () => Promise<boolean>
}

const initialScore: HandScore = {
  score: 0,
  isSoft: false,
  isBust: false,
  isBlackjack: false,
}

export const useBlackjackStore = create<BlackjackState>((set, get) => ({
  bet: 10,
  roundId: null,
  status: 'IDLE',
  playerCards: [],
  playerScore: initialScore,
  dealerCards: [],
  dealerScore: initialScore,
  payout: 0,
  isDealing: false,
  guestShoe: [],
  guestDealerFullCards: [],
  serverSeedHash: null,
  serverSeed: null,
  errorMessage: null,

  setBet: (bet: number) => {
    if (get().status === 'ACTIVE' || get().isDealing) return
    const maxBalance = useAuthStore.getState().user.balance
    const safeBet = Math.min(Math.max(1, Math.floor(bet * 100) / 100), maxBalance)
    set({ bet: safeBet })
  },

  clearError: () => set({ errorMessage: null }),

  reset: () =>
    set({
      roundId: null,
      status: 'IDLE',
      playerCards: [],
      playerScore: initialScore,
      dealerCards: [],
      dealerScore: initialScore,
      payout: 0,
      isDealing: false,
      serverSeedHash: null,
      serverSeed: null,
      errorMessage: null,
    }),

  deal: async () => {
    const { bet, status, isDealing } = get()
    if (status === 'ACTIVE' || isDealing) return false

    const auth = useAuthStore.getState()
    if (auth.user.balance < bet) {
      set({ errorMessage: 'Insufficient balance to place bet' })
      return false
    }

    set({ isDealing: true, errorMessage: null, payout: 0 })

    // Authenticated Mode
    if (!auth.user.isGuest) {
      try {
        const res = await blackjackApi.deal(bet)
        auth.updateBalance(res.balance)

        set({
          roundId: res.roundId,
          playerCards: res.playerCards,
          playerScore: res.playerScore,
          dealerCards: res.dealerCards,
          dealerScore: res.dealerScore,
          status: res.status,
          payout: res.payout,
          serverSeedHash: res.serverSeedHash || null,
          serverSeed: res.serverSeed || null,
          isDealing: false,
        })
        return true
      } catch (err) {
        set({ isDealing: false, errorMessage: getErrorMessage(err) })
        return false
      }
    }

    // Guest Mode
    auth.updateBalance(auth.user.balance - bet)

    let shoe = [...get().guestShoe]
    if (shoe.length < 20) {
      shoe = createShoe(6)
    }

    const pCard1 = shoe.shift()!
    const dCard1 = shoe.shift()!
    const pCard2 = shoe.shift()!
    const dCard2 = shoe.shift()!

    const pCards = [pCard1, pCard2]
    const dCardsFull = [dCard1, dCard2]

    const pScore = calculateHandScore(pCards)
    const dScoreFull = calculateHandScore(dCardsFull)

    if (pScore.isBlackjack) {
      let finalStatus: 'WON' | 'PUSH' = 'WON'
      let finalPayout = Math.round(bet * 2.5 * 100) / 100 // 3:2 payout

      if (dScoreFull.isBlackjack) {
        finalStatus = 'PUSH'
        finalPayout = bet
      }

      auth.updateBalance(auth.user.balance + finalPayout)

      set({
        roundId: 'guest-bj-' + Date.now(),
        playerCards: pCards,
        playerScore: pScore,
        dealerCards: dCardsFull,
        dealerScore: dScoreFull,
        status: finalStatus,
        payout: finalPayout,
        guestShoe: shoe,
        guestDealerFullCards: dCardsFull,
        isDealing: false,
      })
      return true
    }

    // Dealer shows first card, second is face down
    const dVisibleCards: Card[] = [dCard1, { rank: '?', suit: 'SPADES' }]
    const dVisibleScore = calculateHandScore([dCard1])

    set({
      roundId: 'guest-bj-' + Date.now(),
      playerCards: pCards,
      playerScore: pScore,
      dealerCards: dVisibleCards,
      dealerScore: dVisibleScore,
      status: 'ACTIVE',
      guestShoe: shoe,
      guestDealerFullCards: dCardsFull,
      isDealing: false,
    })
    return true
  },

  hit: async () => {
    const { roundId, status, isDealing, playerCards, guestShoe, guestDealerFullCards } = get()
    if (status !== 'ACTIVE' || isDealing || !roundId) return false

    const auth = useAuthStore.getState()

    // Authenticated Mode
    if (!auth.user.isGuest) {
      try {
        const res = await blackjackApi.hit(roundId)
        auth.updateBalance(res.balance)

        set({
          playerCards: res.playerCards,
          playerScore: res.playerScore,
          dealerCards: res.dealerCards,
          dealerScore: res.dealerScore,
          status: res.status,
          payout: res.payout,
          serverSeed: res.serverSeed || get().serverSeed,
        })
        return true
      } catch (err) {
        set({ errorMessage: getErrorMessage(err) })
        return false
      }
    }

    // Guest Mode
    const shoe = [...guestShoe]
    const nextCard = shoe.shift()!
    const updatedCards = [...playerCards, nextCard]
    const score = calculateHandScore(updatedCards)

    if (score.isBust) {
      // Bust: Dealer reveals hole card, player loses
      const dFullScore = calculateHandScore(guestDealerFullCards)
      set({
        playerCards: updatedCards,
        playerScore: score,
        dealerCards: guestDealerFullCards,
        dealerScore: dFullScore,
        status: 'LOST',
        payout: 0,
        guestShoe: shoe,
      })
    } else {
      set({
        playerCards: updatedCards,
        playerScore: score,
        guestShoe: shoe,
      })
    }
    return true
  },

  stand: async () => {
    const { roundId, status, isDealing, playerCards, guestShoe, guestDealerFullCards, bet } = get()
    if (status !== 'ACTIVE' || isDealing || !roundId) return false

    const auth = useAuthStore.getState()

    // Authenticated Mode
    if (!auth.user.isGuest) {
      try {
        const res = await blackjackApi.stand(roundId)
        auth.updateBalance(res.balance)

        set({
          playerCards: res.playerCards,
          playerScore: res.playerScore,
          dealerCards: res.dealerCards,
          dealerScore: res.dealerScore,
          status: res.status,
          payout: res.payout,
          serverSeed: res.serverSeed || get().serverSeed,
        })
        return true
      } catch (err) {
        set({ errorMessage: getErrorMessage(err) })
        return false
      }
    }

    // Guest Mode
    const dealerResult = playDealerTurn(guestDealerFullCards, guestShoe)
    const pScore = calculateHandScore(playerCards)
    const dScore = dealerResult.finalScore

    let finalStatus: 'WON' | 'LOST' | 'PUSH' = 'LOST'
    let finalPayout = 0

    if (dScore.isBust) {
      finalStatus = 'WON'
      finalPayout = bet * 2
    } else if (pScore.score > dScore.score) {
      finalStatus = 'WON'
      finalPayout = bet * 2
    } else if (pScore.score === dScore.score) {
      finalStatus = 'PUSH'
      finalPayout = bet
    } else {
      finalStatus = 'LOST'
      finalPayout = 0
    }

    if (finalPayout > 0) {
      auth.updateBalance(auth.user.balance + finalPayout)
    }

    set({
      dealerCards: dealerResult.finalCards,
      dealerScore: dScore,
      status: finalStatus,
      payout: finalPayout,
      guestShoe: dealerResult.remainingShoe,
    })
    return true
  },

  double: async () => {
    const { roundId, status, isDealing, playerCards, guestShoe, guestDealerFullCards, bet } = get()
    if (status !== 'ACTIVE' || isDealing || !roundId || playerCards.length !== 2) return false

    const auth = useAuthStore.getState()
    if (auth.user.balance < bet) {
      set({ errorMessage: 'Insufficient balance to double down' })
      return false
    }

    // Authenticated Mode
    if (!auth.user.isGuest) {
      try {
        const res = await blackjackApi.double(roundId)
        auth.updateBalance(res.balance)

        set({
          bet: bet * 2,
          playerCards: res.playerCards,
          playerScore: res.playerScore,
          dealerCards: res.dealerCards,
          dealerScore: res.dealerScore,
          status: res.status,
          payout: res.payout,
          serverSeed: res.serverSeed || get().serverSeed,
        })
        return true
      } catch (err) {
        set({ errorMessage: getErrorMessage(err) })
        return false
      }
    }

    // Guest Mode
    auth.updateBalance(auth.user.balance - bet)
    const totalBet = bet * 2

    const shoe = [...guestShoe]
    const card = shoe.shift()!
    const updatedPlayerCards = [...playerCards, card]
    const pScore = calculateHandScore(updatedPlayerCards)

    if (pScore.isBust) {
      const dFullScore = calculateHandScore(guestDealerFullCards)
      set({
        bet: totalBet,
        playerCards: updatedPlayerCards,
        playerScore: pScore,
        dealerCards: guestDealerFullCards,
        dealerScore: dFullScore,
        status: 'LOST',
        payout: 0,
        guestShoe: shoe,
      })
      return true
    }

    // Dealer plays out
    const dealerResult = playDealerTurn(guestDealerFullCards, shoe)
    const dScore = dealerResult.finalScore

    let finalStatus: 'WON' | 'LOST' | 'PUSH' = 'LOST'
    let finalPayout = 0

    if (dScore.isBust) {
      finalStatus = 'WON'
      finalPayout = totalBet * 2
    } else if (pScore.score > dScore.score) {
      finalStatus = 'WON'
      finalPayout = totalBet * 2
    } else if (pScore.score === dScore.score) {
      finalStatus = 'PUSH'
      finalPayout = totalBet
    } else {
      finalStatus = 'LOST'
      finalPayout = 0
    }

    if (finalPayout > 0) {
      auth.updateBalance(auth.user.balance + finalPayout)
    }

    set({
      bet: totalBet,
      playerCards: updatedPlayerCards,
      playerScore: pScore,
      dealerCards: dealerResult.finalCards,
      dealerScore: dScore,
      status: finalStatus,
      payout: finalPayout,
      guestShoe: dealerResult.remainingShoe,
    })
    return true
  },
}))
