export interface SlotSymbol {
  id: number
  name: string
  char: string
  color: string
  payouts: {
    3: number
    4: number
    5: number
  }
  isWild?: boolean
  isScatter?: boolean
}

export interface WinningLine {
  lineIndex: number
  symbolId: number
  symbolName: string
  matchCount: number
  multiplier: number
  payout: number
  positions: Array<{ reel: number; row: number }>
}

export interface SpinResult {
  roundId: string
  grid: number[][] // 5 reels x 3 rows
  winningLines: WinningLine[]
  totalMultiplier: number
  payout: number
  freeSpinsWon: number
  scatterCount: number
  balance: number
  serverSeedHash?: string
}

export interface PaytableInfo {
  symbols: Record<number, SlotSymbol>
  paylines: number[][]
  totalLines: number
  rtp: number
}
