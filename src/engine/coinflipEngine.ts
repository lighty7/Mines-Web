import { CoinSide } from '../types/coinflip'

export const FLIP_MULTIPLIER_STEP = 1.96

export class CoinFlipEngine {
  static getStreakMultiplier(streak: number): number {
    if (streak <= 0) return 1.0
    const mult = Math.pow(FLIP_MULTIPLIER_STEP, streak)
    return Math.round(mult * 100) / 100
  }

  static getStreakPayout(bet: number, streak: number): number {
    return Math.round(bet * this.getStreakMultiplier(streak) * 100) / 100
  }

  static simulateFlip(): CoinSide {
    return Math.random() < 0.5 ? 'HEADS' : 'TAILS'
  }
}
