import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CardComponent } from './CardComponent'
import { Card, HandScore } from '../../types/blackjack'
import { CurrencyDisplay } from '../ui/CurrencyDisplay'

interface BlackjackTableProps {
  dealerCards: Card[]
  dealerScore: HandScore
  playerCards: Card[]
  playerScore: HandScore
  status: 'IDLE' | 'ACTIVE' | 'WON' | 'LOST' | 'PUSH'
  payout: number
  bet: number
}

export const BlackjackTable: React.FC<BlackjackTableProps> = ({
  dealerCards,
  dealerScore,
  playerCards,
  playerScore,
  status,
  payout,
  bet,
}) => {
  const isGameOver = status !== 'IDLE' && status !== 'ACTIVE'

  return (
    <div className="relative w-full min-h-[480px] rounded-3xl border-4 border-emerald-950/70 bg-gradient-to-b from-emerald-950/90 via-surface-1 to-[#0a1810] shadow-[inset_0_0_80px_rgba(0,0,0,0.8),0_15px_40px_rgba(0,0,0,0.6)] p-6 sm:p-8 flex flex-col justify-between overflow-hidden">
      {/* Felt Text Inscriptions */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none opacity-20 select-none gap-2">
        <span className="text-xs sm:text-sm font-extrabold tracking-[0.3em] text-accent-gold uppercase font-mono">
          Blackjack Pays 3 to 2
        </span>
        <div className="w-64 sm:w-96 h-[1px] bg-accent-gold/40" />
        <span className="text-[10px] sm:text-xs font-semibold tracking-widest text-text-secondary uppercase">
          Dealer Must Stand on 17 and Draw to 16
        </span>
      </div>

      {/* Dealer Section */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase">
            Dealer
          </span>
          {dealerCards.length > 0 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-black border ${
                dealerScore.isBust
                  ? 'bg-danger/20 text-danger border-danger/30'
                  : dealerScore.isBlackjack
                  ? 'bg-accent-gold/20 text-accent-gold border-accent-gold/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}
            >
              {dealerScore.isBust ? 'BUST' : dealerScore.score}
            </motion.div>
          )}
        </div>

        {/* Dealer Cards Hand */}
        <div className="flex items-center justify-center -space-x-8 sm:-space-x-10 min-h-[144px]">
          {dealerCards.length === 0 ? (
            <div className="w-20 h-28 sm:w-24 sm:h-36 rounded-xl border-2 border-dashed border-emerald-600/30 flex items-center justify-center text-emerald-600/40 font-mono text-xs select-none">
              DEALER
            </div>
          ) : (
            dealerCards.map((card, idx) => (
              <CardComponent
                key={`dealer-${idx}-${card.rank}-${card.suit}`}
                card={card}
                index={idx}
                isHoleCard={card.rank === '?'}
              />
            ))
          )}
        </div>
      </div>

      {/* Game Outcome Overlay Banner */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="my-2 z-20 flex flex-col items-center justify-center"
          >
            {status === 'WON' && (
              <div className="px-6 py-2.5 rounded-2xl bg-surface-2/95 border border-accent-gold/50 shadow-[0_0_30px_rgba(245,196,81,0.25)] text-center backdrop-blur-md">
                <span className="text-lg sm:text-xl font-black text-accent-gold block tracking-wider">
                  {playerScore.isBlackjack ? '⭐ NATURAL BLACKJACK! ⭐' : '🎉 YOU WON!'}
                </span>
                <CurrencyDisplay amount={payout} size="sm" showSign className="text-primary mt-0.5" />
              </div>
            )}

            {status === 'PUSH' && (
              <div className="px-6 py-2.5 rounded-2xl bg-surface-2/95 border border-border-strong shadow-xl text-center backdrop-blur-md">
                <span className="text-lg sm:text-xl font-black text-accent-cyan block tracking-wider">
                  PUSH
                </span>
                <span className="text-xs font-semibold text-text-secondary">
                  Stake refunded ({payout.toFixed(2)} MC)
                </span>
              </div>
            )}

            {status === 'LOST' && (
              <div className="px-6 py-2.5 rounded-2xl bg-surface-2/95 border border-danger/50 shadow-[0_0_30px_rgba(239,68,68,0.2)] text-center backdrop-blur-md">
                <span className="text-lg sm:text-xl font-black text-danger block tracking-wider">
                  {playerScore.isBust ? '💥 BUST!' : 'DEALER WINS'}
                </span>
                <CurrencyDisplay amount={-bet} size="sm" showSign className="text-danger mt-0.5" />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Player Section */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Player Cards Hand */}
        <div className="flex items-center justify-center -space-x-8 sm:-space-x-10 min-h-[144px] mb-3">
          {playerCards.length === 0 ? (
            <div className="w-20 h-28 sm:w-24 sm:h-36 rounded-xl border-2 border-dashed border-emerald-600/30 flex items-center justify-center text-emerald-600/40 font-mono text-xs select-none">
              PLAYER
            </div>
          ) : (
            playerCards.map((card, idx) => (
              <CardComponent
                key={`player-${idx}-${card.rank}-${card.suit}`}
                card={card}
                index={idx}
              />
            ))
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase">
            Your Hand
          </span>
          {playerCards.length > 0 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-black border ${
                playerScore.isBust
                  ? 'bg-danger/20 text-danger border-danger/30'
                  : playerScore.isBlackjack
                  ? 'bg-accent-gold/20 text-accent-gold border-accent-gold/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}
            >
              {playerScore.isBust
                ? 'BUST'
                : playerScore.isBlackjack
                ? 'BLACKJACK 21'
                : playerScore.isSoft
                ? `Soft ${playerScore.score}`
                : playerScore.score}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
