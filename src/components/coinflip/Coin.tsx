import React from 'react'
import { motion } from 'framer-motion'
import { CoinSide } from '../../types/coinflip'

interface CoinProps {
  isFlipping: boolean
  outcome: CoinSide | null
}

export const Coin: React.FC<CoinProps> = ({ isFlipping, outcome }) => {
  return (
    <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center perspective-1000">
      <motion.div
        animate={
          isFlipping
            ? {
                rotateY: [0, 720, 1440, 1800],
                y: [0, -60, -20, 0],
                scale: [1, 1.15, 1.05, 1],
              }
            : outcome === 'TAILS'
            ? { rotateY: 180, y: 0, scale: 1 }
            : { rotateY: 0, y: 0, scale: 1 }
        }
        transition={
          isFlipping
            ? { duration: 1.1, ease: [0.25, 0.1, 0.25, 1] }
            : { type: 'spring', stiffness: 300, damping: 25 }
        }
        style={{ transformStyle: 'preserve-3d' }}
        className="relative w-full h-full rounded-full shadow-[0_15px_35px_rgba(0,0,0,0.7)] cursor-pointer"
      >
        {/* FRONT: HEADS (👑) */}
        <div
          style={{ backfaceVisibility: 'hidden' }}
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-yellow-200 border-4 border-yellow-300 flex flex-col items-center justify-center p-4 shadow-inner text-black select-none"
        >
          <div className="w-5/6 h-5/6 rounded-full border-2 border-dashed border-amber-800/40 flex flex-col items-center justify-center gap-1 bg-gradient-to-br from-yellow-300/40 to-amber-500/40 shadow-inner">
            <span className="text-5xl sm:text-6xl drop-shadow-md">👑</span>
            <span className="font-black text-sm sm:text-base tracking-widest uppercase text-amber-950">
              HEADS
            </span>
          </div>
        </div>

        {/* BACK: TAILS (🪙) */}
        <div
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-700 via-amber-500 to-yellow-300 border-4 border-yellow-300 flex flex-col items-center justify-center p-4 shadow-inner text-black select-none"
        >
          <div className="w-5/6 h-5/6 rounded-full border-2 border-dashed border-amber-900/40 flex flex-col items-center justify-center gap-1 bg-gradient-to-br from-amber-400/40 to-yellow-600/40 shadow-inner">
            <span className="text-5xl sm:text-6xl drop-shadow-md">🪙</span>
            <span className="font-black text-sm sm:text-base tracking-widest uppercase text-amber-950">
              TAILS
            </span>
          </div>
        </div>
      </motion.div>

      {/* Ground Shadow */}
      <motion.div
        animate={
          isFlipping
            ? { scale: [1, 0.6, 0.8, 1], opacity: [0.6, 0.2, 0.4, 0.6] }
            : { scale: 1, opacity: 0.6 }
        }
        transition={{ duration: 1.1 }}
        className="absolute -bottom-6 w-36 h-4 bg-black/50 rounded-full filter blur-md pointer-events-none"
      />
    </div>
  )
}
