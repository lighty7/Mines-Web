import React from 'react'
import { motion } from 'framer-motion'
import { Card, Suit } from '../../types/blackjack'

interface CardProps {
  card: Card
  index?: number
  isHoleCard?: boolean
}

const SUIT_SYMBOLS: Record<Suit, string> = {
  SPADES: '♠',
  HEARTS: '♥',
  DIAMONDS: '♦',
  CLUBS: '♣',
}

// Authentic casino deck suit colors (standard 2-color red & dark slate)
const SUIT_COLORS: Record<Suit, { text: string; bg: string }> = {
  HEARTS: { text: 'text-red-500', bg: 'bg-red-500/10' },
  DIAMONDS: { text: 'text-red-500', bg: 'bg-red-500/10' },
  SPADES: { text: 'text-slate-200', bg: 'bg-slate-200/10' },
  CLUBS: { text: 'text-slate-200', bg: 'bg-slate-200/10' },
}

export const CardComponent: React.FC<CardProps> = ({ card, index = 0, isHoleCard = false }) => {
  const isHidden = card.rank === '?' || isHoleCard

  if (isHidden) {
    return (
      <motion.div
        initial={{ y: -50, opacity: 0, rotate: -10 }}
        animate={{ y: 0, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.35, delay: index * 0.1, ease: 'easeOut' }}
        className="relative w-20 h-28 sm:w-24 sm:h-36 rounded-xl border-2 border-primary/40 bg-gradient-to-br from-slate-900 via-surface-1 to-slate-900 shadow-xl flex items-center justify-center overflow-hidden select-none"
      >
        {/* Card back authentic geometric pattern */}
        <div className="absolute inset-1.5 rounded-lg border border-primary/20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent flex items-center justify-center">
          <div className="w-10 h-14 rounded-md border border-primary/30 flex items-center justify-center rotate-45 bg-primary/5 shadow-inner">
            <span className="text-xl -rotate-45 font-bold text-primary/70">♠</span>
          </div>
        </div>
      </motion.div>
    )
  }

  const color = SUIT_COLORS[card.suit] || SUIT_COLORS.SPADES
  const symbol = SUIT_SYMBOLS[card.suit] || '♠'

  return (
    <motion.div
      initial={{ y: -50, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, delay: index * 0.08, ease: 'easeOut' }}
      className="relative w-20 h-28 sm:w-24 sm:h-36 rounded-xl border-2 border-white/15 bg-gradient-to-b from-slate-800 to-slate-900 shadow-2xl flex flex-col justify-between p-2 select-none hover:-translate-y-1 transition-transform"
    >
      {/* Top Left Rank & Suit */}
      <div className="flex flex-col items-start leading-tight">
        <span className={`text-base sm:text-lg font-black font-mono ${color.text}`}>{card.rank}</span>
        <span className={`text-xs sm:text-sm leading-none ${color.text}`}>{symbol}</span>
      </div>

      {/* Center Watermark Large Suit Icon */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className={`text-3xl sm:text-4xl font-bold opacity-20 ${color.text}`}>
          {symbol}
        </span>
      </div>

      {/* Bottom Right Rank & Suit (Inverted) */}
      <div className="flex flex-col items-end leading-tight rotate-180">
        <span className={`text-base sm:text-lg font-black font-mono ${color.text}`}>{card.rank}</span>
        <span className={`text-xs sm:text-sm leading-none ${color.text}`}>{symbol}</span>
      </div>
    </motion.div>
  )
}
