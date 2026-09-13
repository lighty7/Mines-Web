import React from 'react'
import { motion } from 'framer-motion'
import { PlacedBet, RouletteBetType } from '../../types/roulette'
import { RED_NUMBERS, BLACK_NUMBERS } from '../../engine/rouletteEngine'

interface BettingTableProps {
  placedBets: PlacedBet[]
  onPlaceBet: (type: RouletteBetType, numbers: number[]) => void
  disabled: boolean
}

export const BettingTable: React.FC<BettingTableProps> = ({
  placedBets,
  onPlaceBet,
  disabled,
}) => {
  // Helper to find placed bet on exact numbers set
  const getBetOnNumbers = (numbers: number[]): number => {
    const bet = placedBets.find(
      (b) =>
        b.numbers.length === numbers.length &&
        b.numbers.every((n, i) => n === numbers[i])
    )
    return bet ? bet.amount : 0
  }

  const renderChipBadge = (amount: number) => {
    if (amount <= 0) return null
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-accent-gold text-black font-mono font-black text-[9px] flex items-center justify-center shadow-lg border border-white z-10 select-none"
      >
        {amount}
      </motion.div>
    )
  }

  // Numbers arranged in 12 columns of 3 rows:
  const row1 = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36]
  const row2 = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35]
  const row3 = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34]

  const renderNumberCell = (num: number) => {
    const isRed = RED_NUMBERS.has(num)
    const amount = getBetOnNumbers([num])

    return (
      <button
        key={num}
        type="button"
        disabled={disabled}
        onClick={() => onPlaceBet('STRAIGHT', [num])}
        className={`relative h-10 sm:h-12 border border-border-default rounded-md font-mono font-black text-xs sm:text-sm flex items-center justify-center transition-all cursor-pointer select-none ${
          isRed
            ? 'bg-rose-600/85 hover:bg-rose-500 text-white'
            : 'bg-surface-3 hover:bg-surface-hover text-white'
        }`}
      >
        <span>{num}</span>
        {renderChipBadge(amount)}
      </button>
    )
  }

  return (
    <div className="w-full bg-surface-2/80 border border-border-default rounded-3xl p-3 sm:p-5 shadow-2xl flex flex-col gap-2 overflow-x-auto select-none backdrop-blur-md">
      {/* Table Grid */}
      <div className="flex min-w-[580px] gap-1.5">
        {/* Zero Column (Left) */}
        <div className="flex flex-col w-12 sm:w-14">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onPlaceBet('STRAIGHT', [0])}
            className="relative flex-1 bg-emerald-600/90 hover:bg-emerald-500 border border-border-default rounded-md flex flex-col items-center justify-center text-white font-mono font-black text-sm sm:text-base transition-all cursor-pointer"
          >
            <span>0</span>
            {renderChipBadge(getBetOnNumbers([0]))}
          </button>
        </div>

        {/* 12 Columns of Numbers (1 to 36) */}
        <div className="flex-1 flex flex-col gap-1">
          {/* Row 1 */}
          <div className="grid grid-cols-12 gap-1">{row1.map(renderNumberCell)}</div>
          {/* Row 2 */}
          <div className="grid grid-cols-12 gap-1">{row2.map(renderNumberCell)}</div>
          {/* Row 3 */}
          <div className="grid grid-cols-12 gap-1">{row3.map(renderNumberCell)}</div>
        </div>

        {/* Column Bets (2 to 1 on the right) */}
        <div className="flex flex-col gap-1 w-12 sm:w-14">
          {[row1, row2, row3].map((r, idx) => {
            const amount = getBetOnNumbers(r)
            return (
              <button
                key={idx}
                type="button"
                disabled={disabled}
                onClick={() => onPlaceBet('COLUMN', r)}
                className="relative h-10 sm:h-12 bg-surface-3 hover:bg-surface-hover border border-border-default rounded-md font-mono font-bold text-[10px] sm:text-xs text-text-secondary hover:text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <span>2:1</span>
                {renderChipBadge(amount)}
              </button>
            )
          })}
        </div>
      </div>

      {/* Dozens Bets (1st 12, 2nd 12, 3rd 12) */}
      <div className="flex min-w-[580px] gap-1.5 pl-14 pr-14">
        {[
          { label: '1st 12', nums: Array.from({ length: 12 }, (_, i) => i + 1) },
          { label: '2nd 12', nums: Array.from({ length: 12 }, (_, i) => i + 13) },
          { label: '3rd 12', nums: Array.from({ length: 12 }, (_, i) => i + 25) },
        ].map((d, i) => {
          const amount = getBetOnNumbers(d.nums)
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => onPlaceBet('DOZEN', d.nums)}
              className="relative flex-1 py-2 bg-surface-3 hover:bg-surface-hover border border-border-default rounded-md text-xs font-bold text-text-secondary hover:text-white uppercase transition-all cursor-pointer"
            >
              <span>{d.label}</span>
              {renderChipBadge(amount)}
            </button>
          )
        })}
      </div>

      {/* Outside Even-Money Bets: 1-18, Even, RED, BLACK, Odd, 19-36 */}
      <div className="flex min-w-[580px] gap-1.5 pl-14 pr-14">
        {[
          { label: '1 - 18', type: 'LOW' as const, nums: Array.from({ length: 18 }, (_, i) => i + 1) },
          { label: 'EVEN', type: 'EVEN' as const, nums: Array.from({ length: 18 }, (_, i) => (i + 1) * 2) },
          { label: 'RED', type: 'RED' as const, nums: Array.from<number>(RED_NUMBERS) },
          { label: 'BLACK', type: 'BLACK' as const, nums: Array.from<number>(BLACK_NUMBERS) },
          { label: 'ODD', type: 'ODD' as const, nums: Array.from({ length: 18 }, (_, i) => i * 2 + 1) },
          { label: '19 - 36', type: 'HIGH' as const, nums: Array.from({ length: 18 }, (_, i) => i + 19) },
        ].map((item, i) => {
          const amount = getBetOnNumbers(item.nums)
          const isRed = item.type === 'RED'
          const isBlack = item.type === 'BLACK'

          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => onPlaceBet(item.type, item.nums)}
              className={`relative flex-1 py-2.5 rounded-md text-xs font-black uppercase transition-all border cursor-pointer ${
                isRed
                  ? 'bg-rose-600/85 hover:bg-rose-500 border-rose-500/60 text-white'
                  : isBlack
                  ? 'bg-zinc-900 hover:bg-zinc-800 border-border-default text-white'
                  : 'bg-surface-3 hover:bg-surface-hover border-border-default text-text-secondary hover:text-white'
              }`}
            >
              <span>{item.label}</span>
              {renderChipBadge(amount)}
            </button>
          )
        })}
      </div>
    </div>
  )
}
