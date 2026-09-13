import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { WHEEL_NUMBERS, getNumberColor } from '../../engine/rouletteEngine'
import { RouletteColor } from '../../types/roulette'

interface RouletteWheelProps {
  isSpinning: boolean
  winningNumber: number | null
  winningColor: RouletteColor | null
}

export const RouletteWheel: React.FC<RouletteWheelProps> = ({
  isSpinning,
  winningNumber,
  winningColor,
}) => {
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    if (isSpinning) {
      // Rotate 5 full revolutions + random offset during spin
      setRotation((prev) => prev + 1800 + Math.floor(Math.random() * 360))
    }
  }, [isSpinning])

  return (
    <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full flex items-center justify-center p-2 shadow-[0_15px_45px_rgba(0,0,0,0.8)] border-4 border-[#3a3f4b] bg-gradient-to-tr from-[#161920] to-[#252a36]">
      {/* Outer Wheel Rim */}
      <motion.div
        animate={{ rotate: rotation }}
        transition={
          isSpinning
            ? { duration: 3.5, ease: [0.2, 0.8, 0.2, 1] }
            : { duration: 0.5 }
        }
        className="relative w-full h-full rounded-full border-4 border-amber-600/40 shadow-inner flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#1c2028] to-[#111317]"
      >
        {/* Render 37 Spokes / Number Pockets */}
        {WHEEL_NUMBERS.map((num, idx) => {
          const angle = (idx * 360) / 37
          const color = getNumberColor(num)

          return (
            <div
              key={num}
              style={{
                transform: `rotate(${angle}deg)`,
                transformOrigin: '50% 50%',
              }}
              className="absolute w-full h-full flex flex-col items-center pt-1.5 pointer-events-none"
            >
              <div
                className={`w-5 h-7 rounded-sm flex items-center justify-center text-[10px] font-mono font-black select-none ${
                  color === 'GREEN'
                    ? 'bg-emerald-600 text-white'
                    : color === 'RED'
                    ? 'bg-rose-600 text-white'
                    : 'bg-zinc-900 text-white border border-white/20'
                }`}
              >
                {num}
              </div>
            </div>
          )
        })}

        {/* Center Turret Cone */}
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-amber-700 via-amber-400 to-yellow-200 border-4 border-yellow-300 shadow-2xl flex items-center justify-center text-black z-10" />
      </motion.div>

      {/* Center Fixed Result Display */}
      <div className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#14171e] border-2 border-tile-border shadow-2xl flex flex-col items-center justify-center z-20">
        {winningNumber !== null && !isSpinning ? (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center"
          >
            <span
              className={`text-2xl sm:text-3xl font-black font-mono leading-none ${
                winningColor === 'GREEN'
                  ? 'text-emerald-400'
                  : winningColor === 'RED'
                  ? 'text-rose-400'
                  : 'text-white'
              }`}
            >
              {winningNumber}
            </span>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${
                winningColor === 'GREEN'
                  ? 'text-emerald-400'
                  : winningColor === 'RED'
                  ? 'text-rose-400'
                  : 'text-zinc-400'
              }`}
            >
              {winningColor}
            </span>
          </motion.div>
        ) : isSpinning ? (
          <div className="flex flex-col items-center gap-1">
            <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] font-bold text-text-secondary">SPINNING</span>
          </div>
        ) : (
          <span className="text-xs font-bold text-text-secondary text-center px-2">
            PLACE BETS
          </span>
        )}
      </div>
    </div>
  )
}
