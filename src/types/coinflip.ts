export type CoinSide = 'HEADS' | 'TAILS'

export interface FlipRecord {
  guess: CoinSide
  outcome: CoinSide
  won: boolean
  streak: number
  multiplier: number
}

export interface StartCoinFlipResponse {
  roundId: string
  bet: number
  status: 'ACTIVE'
  balance: number
  serverSeedHash: string
}

export interface FlipResponse {
  won: boolean
  outcome: CoinSide
  streak: number
  multiplier: number
  potentialPayout: number
  status: 'ACTIVE' | 'LOST'
  balance: number
}

export interface CashoutCoinFlipResponse {
  status: 'WON'
  payout: number
  multiplier: number
  streak: number
  balance: number
}
