export type RouletteColor = 'RED' | 'BLACK' | 'GREEN'

export type RouletteBetType =
  | 'STRAIGHT'
  | 'SPLIT'
  | 'STREET'
  | 'CORNER'
  | 'SIX_LINE'
  | 'COLUMN'
  | 'DOZEN'
  | 'RED'
  | 'BLACK'
  | 'EVEN'
  | 'ODD'
  | 'LOW'
  | 'HIGH'

export interface PlacedBet {
  type: RouletteBetType
  numbers: number[]
  amount: number
}

export interface EvaluatedBet extends PlacedBet {
  won: boolean
  payout: number
  multiplier: number
}

export interface SpinRouletteResponse {
  roundId: string
  winningNumber: number
  color: RouletteColor
  totalBet: number
  payout: number
  multiplier: number
  evaluatedBets: EvaluatedBet[]
  balance: number
  serverSeedHash: string
}
