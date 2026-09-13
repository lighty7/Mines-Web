import React from 'react'
import { motion } from 'framer-motion'
import { Trophy, Zap } from 'lucide-react'
import { FLIP_MULTIPLIER_STEP } from '../../engine/coinflipEngine'

interface StreakLadderProps {
  currentStreak: number
}

export const StreakLadder: React.FC<StreakLadderProps> = ({ currentStreak }) => {
  const steps = [1, 2, 3, 4, 5, 6, 7, 8]

  return (
    <div className="w-full flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto py-1 px-0.5 no-scrollbar select-none">
      {steps.map((step) => {
        const mult = Math.round(Math.pow(FLIP_MULTIPLIER_STEP, step) * 100) / 100
        const isCurrent = currentStreak === step
        const isPast = currentStreak > step
        const isNext = currentStreak + 1 === step

        return (
          <motion.div
            key={step}
            animate={
              isCurrent
                ? { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 1.5 } }
                : {}
            }
            className={`flex-1 min-w-[68px] sm:min-w-[80px] p-2 rounded-xl flex flex-col items-center justify-center border text-center transition-all ${
              isCurrent
                ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(24,201,100,0.3)]'
                : isPast
                ? 'bg-surface-3/40 border-border-subtle text-text-muted opacity-60'
                : isNext
                ? 'bg-accent-gold/15 border-accent-gold/40 text-accent-gold shadow-sm'
                : 'bg-surface-3/30 border-border-subtle text-text-secondary'
            }`}
          >
            <div className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider">
              {isCurrent ? (
                <Trophy className="w-3 h-3 text-primary" />
              ) : isNext ? (
                <Zap className="w-3 h-3 text-accent-gold" />
              ) : null}
              <span>Streak {step}</span>
            </div>
            <span
              className={`text-xs sm:text-sm font-black font-mono mt-0.5 ${
                isCurrent
                  ? 'text-primary'
                  : isNext
                  ? 'text-accent-gold'
                  : isPast
                  ? 'text-text-muted'
                  : 'text-text-primary'
              }`}
            >
              {mult}×
            </span>
          </motion.div>
        )
      })}
    </div>
  )
}
