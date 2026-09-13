import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CardComponent } from './CardComponent'
import { Card, HandScore } from '../../types/blackjack'

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
    <div className="relative w-full max-w-4xl min-h-[500px] rounded-3xl border-4 border-emerald-950/60 bg-gradient-to-b from-emerald-950 via-[#0d2a1c] to-[#081b11] shadow-[inset_0_0_80px_rgba(0,0,0,0.8),0_15px_40px_rgba(0,0,0,0.6)] p-6 sm:p-8 flex flex-col justify-between overflow-hidden">
      {/* Felt Text Inscriptions */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none opacity-25 select-none gap-2">
        <span className="text-xs sm:text-sm font-extrabold tracking-[0.3em] text-yellow-200 uppercase font-mono">
          Blackjack Pays 3 to 2
        </span>
        <div className="w-64 sm:w-96 h-[1px] bg-yellow-200/40" />
        <span className="text-[10px] sm:text-xs font-semibold tracking-widest text-white/80 uppercase">
          Dealer Must Stand on 17 and Draw to 16
        </span>
      </div>

      {/* Dealer Section */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase font-mono">Dealer</span>
          {dealerCards.length > 0 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-black ${
                dealerScore.isBust
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : dealerScore.isBlackjack
                  ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {dealerScore.isBust ? 'BUST' : dealerScore.score}
            </motion.div>
          )}
        </div>

        {/* Dealer Cards Hand */}
        <div className="flex items-center justify-center -space-x-8 sm:-space-x-10 min-h-[144px]">
          {dealerCards.length === 0 ? (
            <div className="w-20 h-28 sm:w-24 sm:h-36 rounded-xl border-2 border-dashed border-emerald-600/30 flex items-center justify-center text-emerald-600/40 font-mono text-xs">
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
              <div className="px-6 py-2 rounded-2xl bg-gradient-to-r from-yellow-500/30 via-emerald-500/30 to-yellow-500/30 border border-yellow-400/40 shadow-[0_0_30px_rgba(250,204,21,0.3)] text-center">
                <span className="text-xl sm:text-2xl font-black text-yellow-300 block tracking-wider">
                  {playerScore.isBlackjack ? '⭐ BLACKJACK! ⭐' : '🎉 YOU WON!'}
                </span>
                <span className="text-sm font-bold text-white font-mono">
                  +${payout.toFixed(2)}
                </span>
              </div>
            )}

            {status === 'PUSH' && (
              <div className="px-6 py-2 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 shadow-[0_0_30px_rgba(34,211,238,0.2)] text-center">
                <span className="text-xl sm:text-2xl font-black text-cyan-300 block tracking-wider">
                  PUSH
                </span>
                <span className="text-xs font-semibold text-cyan-200">
                  Bet refunded (${payout.toFixed(2)})
                </span>
              </div>
            )}

            {status === 'LOST' && (
              <div className="px-6 py-2 rounded-2xl bg-red-500/20 border border-red-400/40 shadow-[0_0_30px_rgba(239,68,68,0.2)] text-center">
                <span className="text-xl sm:text-2xl font-black text-red-400 block tracking-wider">
                  {playerScore.isBust ? '💥 BUST!' : 'DEALER WINS'}
                </span>
                <span className="text-xs font-semibold text-red-300">
                  -${bet.toFixed(2)}
                </span>
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
            <div className="w-20 h-28 sm:w-24 sm:h-36 rounded-xl border-2 border-dashed border-emerald-600/30 flex items-center justify-center text-emerald-600/40 font-mono text-xs">
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
          <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase font-mono">Your Hand</span>
          {playerCards.length > 0 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-black ${
                playerScore.isBust
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : playerScore.isBlackjack
                  ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
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
