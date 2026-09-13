export type Suit = 'SPADES' | 'HEARTS' | 'DIAMONDS' | 'CLUBS'
export type Rank =
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | 'J'
  | 'Q'
  | 'K'
  | 'A'
  | '?'

export interface Card {
  rank: Rank
  suit: Suit
}

export interface HandScore {
  score: number
  isSoft: boolean
  isBust: boolean
  isBlackjack: boolean
}

export interface DealResponse {
  roundId: string
  bet: number
  playerCards: Card[]
  playerScore: HandScore
  dealerCards: Card[]
  dealerScore: HandScore
  status: 'ACTIVE' | 'WON' | 'LOST' | 'PUSH'
  payout: number
  balance: number
  serverSeedHash?: string
  serverSeed?: string
}

export interface BlackjackActionResponse {
  roundId: string
  playerCards: Card[]
  playerScore: HandScore
  dealerCards: Card[]
  dealerScore: HandScore
  status: 'ACTIVE' | 'WON' | 'LOST' | 'PUSH'
  payout: number
  balance: number
  serverSeed?: string
}

export interface BlackjackRoundHistory {
  id: string
  bet: number
  payout: number
  status: 'ACTIVE' | 'WON' | 'LOST' | 'PUSH'
  playerHands: any
  dealerHand: any
  createdAt: string
}
