export type GameState = 'IDLE' | 'ACTIVE' | 'WON' | 'LOST'

export type TileState = 'HIDDEN' | 'REVEALING' | 'SAFE' | 'MINE'

export interface Tile {
  index: number
  isMine: boolean
  state: TileState
}

export interface UserProfile {
  id?: string
  username: string
  email: string
  address?: string
  balance: number
  isGuest: boolean
}

export interface UserTransaction {
  id: string
  type: 'BET' | 'WIN' | 'DEPOSIT' | 'WITHDRAW' | string
  amount: number
  roundId?: string
  createdAt: string
}

export interface StartRoundResponse {
  roundId: string
  balance: number
  boardSize: number
  mines: number
  bet: number
}

export interface RevealResponse {
  safe: boolean
  tileIndex: number
  multiplier: number
  potentialWin: number
  balance: number
  revealedCount: number
  mineIndices?: number[]
}

export interface CashoutResponse {
  won: boolean
  multiplier: number
  payout: number
  balance: number
}

export interface AuthResponse {
  token: string
  user: {
    id: string
    username: string
    email: string
    address?: string | null
    balance: number
  }
}

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}
