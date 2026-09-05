export class MinesEngine {
  static readonly HOUSE_EDGE = 0.01 // 1% house edge (0.99 RTP)

  /**
   * Calculates nCr (combinations) safely
   */
  static combinations(n: number, r: number): number {
    if (r < 0 || r > n) return 0
    if (r === 0 || r === n) return 1
    const k = Math.min(r, n - r)
    let c = 1
    for (let i = 0; i < k; i++) {
      c = (c * (n - i)) / (i + 1)
    }
    return c
  }

  /**
   * Multiplier = 0.99 * [nCr(N, k) / nCr(N - M, k)]
   */
  static calculateMultiplier(totalTiles: number, minesCount: number, revealedCount: number): number {
    if (revealedCount <= 0) return 1.0
    const safeTiles = totalTiles - minesCount
    if (revealedCount > safeTiles) return 0.0

    const totalCombos = this.combinations(totalTiles, revealedCount)
    const safeCombos = this.combinations(safeTiles, revealedCount)
    if (safeCombos === 0) return 0.0

    const rawMultiplier = (1.0 - this.HOUSE_EDGE) * (totalCombos / safeCombos)
    return Math.max(1.0, Math.floor(rawMultiplier * 100) / 100)
  }

  static mineChancePercentage(totalTiles: number, minesCount: number, revealedCount: number = 0): number {
    const remainingTiles = totalTiles - revealedCount
    if (remainingTiles <= 0) return 100.0
    return Math.min(100.0, Math.max(0.0, (minesCount / remainingTiles) * 100))
  }

  static safeChancePercentage(totalTiles: number, minesCount: number, revealedCount: number = 0): number {
    return Math.max(0.0, 100.0 - this.mineChancePercentage(totalTiles, minesCount, revealedCount))
  }
}
