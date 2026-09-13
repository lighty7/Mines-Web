import React from 'react'
import { motion } from 'framer-motion'
import { SYMBOLS } from '../../engine/slotsEngine'

interface ReelProps {
  reelIndex: number
  symbols: number[] // 3 symbols [top, mid, bottom]
  isSpinning: boolean
  isStopped: boolean
  winningRows: number[] // which rows in this reel are winning
}

const ALL_SYMBOL_CHARS = Object.values(SYMBOLS).map((s) => s.char)
const MOTION_STRIP = [...ALL_SYMBOL_CHARS, ...ALL_SYMBOL_CHARS]

export const Reel: React.FC<ReelProps> = ({
  symbols,
  isSpinning,
  isStopped,
  winningRows,
}) => {
  return (
    <div className="relative flex-1 bg-surface-1/90 border border-border-default/80 rounded-2xl overflow-hidden shadow-inner flex flex-col items-center py-2 h-[340px] sm:h-[390px] justify-around">
      {/* Blurred motion strip during active spin */}
      {isSpinning && !isStopped ? (
        <motion.div
          animate={{ y: [0, -400] }}
          transition={{ repeat: Infinity, duration: 0.18, ease: 'linear' }}
          className="flex flex-col items-center gap-6 opacity-75 blur-[1px]"
        >
          {MOTION_STRIP.map((c, i) => (
            <div key={i} className="text-4xl sm:text-5xl select-none">
              {c}
            </div>
          ))}
        </motion.div>
      ) : (
        // Landed 3 symbols with spring bounce
        <motion.div
          initial={isSpinning ? { y: -20, scale: 0.95 } : false}
          animate={{ y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="w-full h-full flex flex-col justify-around items-center"
        >
          {symbols.map((symId, rowIdx) => {
            const sym = SYMBOLS[symId] || SYMBOLS[0]
            const isWinning = winningRows.includes(rowIdx)

            return (
              <motion.div
                key={rowIdx}
                animate={
                  isWinning
                    ? {
                        scale: [1, 1.12, 1],
                        transition: { repeat: Infinity, duration: 1.2 },
                      }
                    : {}
                }
                className={`relative w-11/12 h-[95px] sm:h-[110px] rounded-xl flex flex-col items-center justify-center transition-all duration-300 ${
                  isWinning
                    ? 'bg-primary/20 border-2 border-primary shadow-[0_0_20px_rgba(24,201,100,0.35)] z-10'
                    : 'bg-surface-2/70 border border-border-default/60'
                }`}
              >
                {/* Symbol Emoji */}
                <span className="text-4xl sm:text-5xl select-none filter drop-shadow-md">
                  {sym.char}
                </span>

                {/* Symbol Name & Tag */}
                <span
                  className={`text-[10px] sm:text-xs font-mono font-bold tracking-wider uppercase mt-1 ${
                    sym.isWild
                      ? 'text-accent-gold font-extrabold'
                      : sym.isScatter
                      ? 'text-game-slots font-extrabold'
                      : sym.color
                  }`}
                >
                  {sym.name}
                </span>

                {/* Special Tag for Wild / Scatter */}
                {sym.isWild && (
                  <span className="absolute top-1.5 right-1.5 text-[9px] px-1.5 py-0.5 bg-accent-gold/20 text-accent-gold border border-accent-gold/40 rounded-full font-mono font-bold leading-none">
                    WILD
                  </span>
                )}
                {sym.isScatter && (
                  <span className="absolute top-1.5 right-1.5 text-[9px] px-1.5 py-0.5 bg-game-slots/20 text-game-slots border border-game-slots/40 rounded-full font-mono font-bold leading-none">
                    FREE
                  </span>
                )}
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}
