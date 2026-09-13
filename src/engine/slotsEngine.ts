import { SlotSymbol, WinningLine, SpinResult } from '../types/slots'

export const SYMBOLS: Record<number, SlotSymbol> = {
  0: { id: 0, name: 'Cherry', char: '🍒', color: 'text-red-400', payouts: { 3: 0.5, 4: 1.5, 5: 5.0 } },
  1: { id: 1, name: 'Lemon', char: '🍋', color: 'text-yellow-300', payouts: { 3: 0.8, 4: 2.0, 5: 8.0 } },
  2: { id: 2, name: 'Grape', char: '🍇', color: 'text-purple-400', payouts: { 3: 1.2, 4: 3.5, 5: 12.0 } },
  3: { id: 3, name: 'Bell', char: '🔔', color: 'text-amber-400', payouts: { 3: 2.0, 4: 6.0, 5: 25.0 } },
  4: { id: 4, name: 'Bar', char: '🍫', color: 'text-emerald-400', payouts: { 3: 4.0, 4: 12.0, 5: 50.0 } },
  5: { id: 5, name: 'Diamond', char: '💎', color: 'text-cyan-400', payouts: { 3: 8.0, 4: 25.0, 5: 100.0 } },
  6: { id: 6, name: 'Seven', char: '7️⃣', color: 'text-rose-500', payouts: { 3: 20.0, 4: 100.0, 5: 500.0 } },
  7: { id: 7, name: 'Wild', char: '⚡', color: 'text-yellow-400', isWild: true, payouts: { 3: 25.0, 4: 150.0, 5: 750.0 } },
  8: { id: 8, name: 'Scatter', char: '⭐', color: 'text-orange-400', isScatter: true, payouts: { 3: 2.0, 4: 10.0, 5: 50.0 } },
}

export const WILD_ID = 7
export const SCATTER_ID = 8

export const PAYLINES: number[][] = [
  [1, 1, 1, 1, 1], // 1. Middle row
  [0, 0, 0, 0, 0], // 2. Top row
  [2, 2, 2, 2, 2], // 3. Bottom row
  [0, 1, 2, 1, 0], // 4. V-shape
  [2, 1, 0, 1, 2], // 5. Inverted V-shape
  [0, 0, 1, 0, 0], // 6. Top dip
  [2, 2, 1, 2, 2], // 7. Bottom rise
  [1, 2, 2, 2, 1], // 8. Shallow valley
  [1, 0, 0, 0, 1], // 9. Shallow peak
  [1, 0, 1, 0, 1], // 10. Zigzag top
  [1, 2, 1, 2, 1], // 11. Zigzag bottom
  [0, 1, 0, 1, 0], // 12. Top/mid wave
  [2, 1, 2, 1, 2], // 13. Bottom/mid wave
  [0, 1, 1, 1, 0], // 14. Top curve
  [2, 1, 1, 1, 2], // 15. Bottom curve
  [0, 2, 0, 2, 0], // 16. Full zigzag
  [2, 0, 2, 0, 2], // 17. Inverted full zigzag
  [0, 0, 2, 0, 0], // 18. High dip
  [2, 2, 0, 2, 2], // 19. Low jump
  [1, 1, 0, 1, 1], // 20. Mid peak
]

// Weighted distribution strip for client simulation
const WEIGHTS: Record<number, number> = {
  0: 28, // Cherry
  1: 24, // Lemon
  2: 20, // Grape
  3: 16, // Bell
  4: 12, // Bar
  5: 8,  // Diamond
  6: 4,  // Seven
  7: 3,  // Wild
  8: 2,  // Scatter
}

function createReelStrip(): number[] {
  const strip: number[] = []
  for (const [idStr, weight] of Object.entries(WEIGHTS)) {
    const id = Number(idStr)
    for (let i = 0; i < weight; i++) {
      strip.push(id)
    }
  }
  return strip
}

export const REEL_STRIP = createReelStrip()

export class SlotsEngine {
  /**
   * Generates a random 5x3 grid for client-side Guest Mode
   */
  static generateRandomGrid(): number[][] {
    const grid: number[][] = []
    const stripLen = REEL_STRIP.length

    for (let reel = 0; reel < 5; reel++) {
      const stopIndex = Math.floor(Math.random() * stripLen)
      const col: number[] = []
      for (let row = 0; row < 3; row++) {
        col.push(REEL_STRIP[(stopIndex + row) % stripLen])
      }
      grid.push(col)
    }
    return grid
  }

  /**
   * Evaluates paylines and scatter count
   */
  static evaluate(grid: number[][], lineCount: number = 20, betPerLine: number = 1): Omit<SpinResult, 'roundId' | 'balance'> {
    const activeLines = PAYLINES.slice(0, Math.min(Math.max(lineCount, 1), 20))
    const winningLines: WinningLine[] = []
    let totalMultiplier = 0

    // Evaluate paylines
    for (let lIdx = 0; lIdx < activeLines.length; lIdx++) {
      const line = activeLines[lIdx]
      const symbolsOnLine: number[] = []
      const positions: Array<{ reel: number; row: number }> = []

      for (let reel = 0; reel < 5; reel++) {
        const row = line[reel]
        symbolsOnLine.push(grid[reel][row])
        positions.push({ reel, row })
      }

      let targetSymbolId: number | null = null
      for (const symId of symbolsOnLine) {
        if (symId !== SCATTER_ID && symId !== WILD_ID) {
          targetSymbolId = symId
          break
        }
      }
      if (targetSymbolId === null) targetSymbolId = WILD_ID

      let matchCount = 0
      for (let reel = 0; reel < 5; reel++) {
        const current = symbolsOnLine[reel]
        if (current === targetSymbolId || current === WILD_ID) {
          matchCount++
        } else {
          break
        }
      }

      if (matchCount >= 3) {
        const sym = SYMBOLS[targetSymbolId]
        const lineMult = (sym?.payouts as Record<number, number>)?.[matchCount] || 0
        if (lineMult > 0) {
          const linePayout = Math.round(lineMult * betPerLine * 100) / 100
          totalMultiplier += lineMult
          winningLines.push({
            lineIndex: lIdx,
            symbolId: targetSymbolId,
            symbolName: sym.name,
            matchCount,
            multiplier: lineMult,
            payout: linePayout,
            positions: positions.slice(0, matchCount),
          })
        }
      }
    }

    // Evaluate scatters
    let scatterCount = 0
    for (let reel = 0; reel < 5; reel++) {
      for (let row = 0; row < 3; row++) {
        if (grid[reel][row] === SCATTER_ID) scatterCount++
      }
    }

    let freeSpinsWon = 0
    let scatterMultiplier = 0
    if (scatterCount >= 5) {
      freeSpinsWon = 25
      scatterMultiplier = 50.0
    } else if (scatterCount === 4) {
      freeSpinsWon = 15
      scatterMultiplier = 10.0
    } else if (scatterCount === 3) {
      freeSpinsWon = 10
      scatterMultiplier = 2.0
    }

    const totalBet = lineCount * betPerLine
    const scatterPayout = Math.round(scatterMultiplier * totalBet * 100) / 100
    const totalPayout = winningLines.reduce((sum, l) => sum + l.payout, 0) + scatterPayout

    return {
      grid,
      winningLines,
      totalMultiplier: Math.round((totalMultiplier + scatterMultiplier) * 100) / 100,
      payout: Math.round(totalPayout * 100) / 100,
      freeSpinsWon,
      scatterCount,
    }
  }
}
