import { create } from 'zustand'
import { GameState, Tile } from '../types'
import { MinesEngine } from '../engine/minesEngine'
import { gameApi } from '../api/game.api'
import { useAuthStore } from './authStore'
import { getErrorMessage } from '../api/client'

interface GameStoreState {
  boardSize: number // 9, 25, 36, 64
  gridDimension: number // 3, 5, 6, 8
  mines: number
  bet: number
  gameState: GameState
  activeRoundId: string | null
  tiles: Tile[]
  revealedCount: number
  multiplier: number
  potentialWin: number
  lastResult: { won: boolean; payout: number; multiplier: number } | null
  isLoading: boolean
  errorMessage: string | null

  // Local Guest Engine Mine Locations (only used when playing as guest)
  guestMineIndices: Set<number>

  setBet: (bet: number) => void
  setMines: (mines: number) => void
  setGridDimension: (dim: number) => void
  clearError: () => void

  startGame: () => Promise<boolean>
  revealTile: (index: number) => Promise<{ safe: boolean; gameOver: boolean; payout?: number; multiplier?: number } | null>
  cashout: () => Promise<{ payout: number; multiplier: number } | null>
}

const DEFAULT_GRID_DIMENSION = 5
const DEFAULT_BOARD_SIZE = DEFAULT_GRID_DIMENSION * DEFAULT_GRID_DIMENSION

function createInitialTiles(size: number): Tile[] {
  return Array.from({ length: size }, (_, i) => ({
    index: i,
    isMine: false,
    state: 'HIDDEN',
  }))
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  boardSize: DEFAULT_BOARD_SIZE,
  gridDimension: DEFAULT_GRID_DIMENSION,
  mines: 5,
  bet: 10,
  gameState: 'IDLE',
  activeRoundId: null,
  tiles: createInitialTiles(DEFAULT_BOARD_SIZE),
  revealedCount: 0,
  multiplier: 1.0,
  potentialWin: 10.0,
  lastResult: null,
  isLoading: false,
  errorMessage: null,
  guestMineIndices: new Set(),

  setBet: (bet: number) => {
    if (get().gameState === 'ACTIVE' || get().isLoading) return
    const maxBalance = useAuthStore.getState().user.balance
    const safeBet = Math.min(Math.max(1, Math.floor(bet * 100) / 100), maxBalance)
    set({ bet: safeBet })
  },

  setMines: (mines: number) => {
    if (get().gameState === 'ACTIVE' || get().isLoading) return
    const maxMines = get().boardSize - 1
    const safeMines = Math.min(Math.max(1, mines), maxMines)
    set({ mines: safeMines })
  },

  setGridDimension: (dim: number) => {
    if (get().gameState === 'ACTIVE' || get().isLoading) return
    const validDims = [4, 5, 6]
    if (!validDims.includes(dim)) return
    const boardSize = dim * dim
    const maxMines = boardSize - 1
    set({
      gridDimension: dim,
      boardSize,
      mines: Math.min(get().mines, maxMines),
      tiles: createInitialTiles(boardSize),
    })
  },

  clearError: () => set({ errorMessage: null }),

  startGame: async () => {
    const { bet, mines, boardSize, gridDimension, gameState, isLoading } = get()
    if (gameState === 'ACTIVE' || isLoading) return false

    const auth = useAuthStore.getState()
    if (auth.user.balance < bet) {
      set({ errorMessage: 'Insufficient balance to place bet' })
      return false
    }

    set({ isLoading: true, errorMessage: null, lastResult: null })

    // If Authenticated: Call live server API with dimension (4, 5, or 6)
    if (!auth.user.isGuest) {
      try {
        const response = await gameApi.startGame(bet, mines, gridDimension)
        auth.updateBalance(response.balance)
        set({
          activeRoundId: response.roundId,
          gameState: 'ACTIVE',
          tiles: createInitialTiles(boardSize),
          revealedCount: 0,
          multiplier: 1.0,
          potentialWin: bet,
          isLoading: false,
        })
        return true
      } catch (err) {
        set({ isLoading: false, errorMessage: getErrorMessage(err) })
        return false
      }
    }

    // Guest Mode: Local Engine Simulation
    auth.updateBalance(auth.user.balance - bet)
    const mineIndices = new Set<number>()
    while (mineIndices.size < mines) {
      mineIndices.add(Math.floor(Math.random() * boardSize))
    }

    set({
      activeRoundId: 'guest-' + Date.now(),
      gameState: 'ACTIVE',
      tiles: createInitialTiles(boardSize),
      revealedCount: 0,
      multiplier: 1.0,
      potentialWin: bet,
      guestMineIndices: mineIndices,
      isLoading: false,
    })
    return true
  },

  revealTile: async (index: number) => {
    const { gameState, tiles, activeRoundId, isLoading, boardSize, mines, bet, revealedCount } = get()
    if (gameState !== 'ACTIVE' || isLoading || !activeRoundId) return null
    const currentTile = tiles[index]
    if (!currentTile || currentTile.state !== 'HIDDEN') return null

    // Mark as revealing
    const updatedTiles = [...tiles]
    updatedTiles[index] = { ...currentTile, state: 'REVEALING' }
    set({ tiles: updatedTiles, isLoading: true, errorMessage: null })

    const auth = useAuthStore.getState()

    // Authenticated Mode: Remote Backend Call
    if (!auth.user.isGuest) {
      try {
        const res = await gameApi.revealTile(activeRoundId, index)
        auth.updateBalance(res.balance)

        if (res.safe) {
          updatedTiles[index] = { index, isMine: false, state: 'SAFE' }
          set({
            tiles: updatedTiles,
            revealedCount: res.revealedCount,
            multiplier: res.multiplier,
            potentialWin: res.potentialWin,
            isLoading: false,
          })
          return { safe: true, gameOver: false, payout: res.potentialWin, multiplier: res.multiplier }
        } else {
          // Mine hit! Reveal all mines
          for (let i = 0; i < updatedTiles.length; i++) {
            if (res.mineIndices?.includes(i) || i === index) {
              updatedTiles[i] = { index: i, isMine: true, state: 'MINE' }
            }
          }
          set({
            tiles: updatedTiles,
            gameState: 'LOST',
            activeRoundId: null,
            multiplier: 0,
            potentialWin: 0,
            lastResult: { won: false, payout: 0, multiplier: 0 },
            isLoading: false,
          })
          return { safe: false, gameOver: true }
        }
      } catch (err) {
        updatedTiles[index] = { ...currentTile, state: 'HIDDEN' }
        set({ tiles: updatedTiles, isLoading: false, errorMessage: getErrorMessage(err) })
        return null
      }
    }

    // Guest Mode: Local Logic
    const isMine = get().guestMineIndices.has(index)
    if (isMine) {
      for (let i = 0; i < updatedTiles.length; i++) {
        if (get().guestMineIndices.has(i)) {
          updatedTiles[i] = { index: i, isMine: true, state: 'MINE' }
        }
      }
      set({
        tiles: updatedTiles,
        gameState: 'LOST',
        activeRoundId: null,
        multiplier: 0,
        potentialWin: 0,
        lastResult: { won: false, payout: 0, multiplier: 0 },
        isLoading: false,
      })
      return { safe: false, gameOver: true }
    } else {
      const nextRevealed = revealedCount + 1
      const nextMultiplier = MinesEngine.calculateMultiplier(boardSize, mines, nextRevealed)
      const nextPayout = Math.floor(bet * nextMultiplier * 100) / 100
      updatedTiles[index] = { index, isMine: false, state: 'SAFE' }

      // Check if all safe tiles are cleared
      const totalSafeTiles = boardSize - mines
      const isCompleteWin = nextRevealed === totalSafeTiles

      if (isCompleteWin) {
        auth.updateBalance(auth.user.balance + nextPayout)
        set({
          tiles: updatedTiles,
          gameState: 'WON',
          activeRoundId: null,
          revealedCount: nextRevealed,
          multiplier: nextMultiplier,
          potentialWin: nextPayout,
          lastResult: { won: true, payout: nextPayout, multiplier: nextMultiplier },
          isLoading: false,
        })
        return { safe: true, gameOver: true, payout: nextPayout, multiplier: nextMultiplier }
      }

      set({
        tiles: updatedTiles,
        revealedCount: nextRevealed,
        multiplier: nextMultiplier,
        potentialWin: nextPayout,
        isLoading: false,
      })
      return { safe: true, gameOver: false, payout: nextPayout, multiplier: nextMultiplier }
    }
  },

  cashout: async () => {
    const { gameState, activeRoundId, isLoading, multiplier, potentialWin } = get()
    if (gameState !== 'ACTIVE' || isLoading || !activeRoundId) return null

    set({ isLoading: true, errorMessage: null })
    const auth = useAuthStore.getState()

    // Authenticated Mode
    if (!auth.user.isGuest) {
      try {
        const res = await gameApi.cashout(activeRoundId)
        auth.updateBalance(res.balance)
        set({
          gameState: 'WON',
          activeRoundId: null,
          lastResult: { won: true, payout: res.payout, multiplier: res.multiplier },
          isLoading: false,
        })
        return { payout: res.payout, multiplier: res.multiplier }
      } catch (err) {
        set({ isLoading: false, errorMessage: getErrorMessage(err) })
        return null
      }
    }

    // Guest Mode
    auth.updateBalance(auth.user.balance + potentialWin)
    set({
      gameState: 'WON',
      activeRoundId: null,
      lastResult: { won: true, payout: potentialWin, multiplier },
      isLoading: false,
    })
    return { payout: potentialWin, multiplier }
  },
}))
