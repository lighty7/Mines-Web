import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, AlertCircle, RefreshCw } from 'lucide-react'
import { useBlackjackStore } from '../../store/blackjackStore'
import { useAuthStore } from '../../store/authStore'
import { useAudio } from '../../hooks/useAudio'
import { BlackjackTable } from './BlackjackTable'
import { BlackjackControls } from './BlackjackControls'

export const BlackjackView: React.FC = () => {
  const {
    bet,
    status,
    playerCards,
    playerScore,
    dealerCards,
    dealerScore,
    payout,
    isDealing,
    serverSeedHash,
    serverSeed,
    errorMessage,
    setBet,
    clearError,
    deal,
    hit,
    stand,
    double,
    reset,
  } = useBlackjackStore()

  const { user } = useAuthStore()
  const audio = useAudio()

  // Audio reactions on game state change
  useEffect(() => {
    if (status === 'WON') {
      audio.playBlackjackWin(playerScore.isBlackjack)
    } else if (status === 'LOST' && playerScore.isBust) {
      audio.playBust()
    }
  }, [status, playerScore.isBlackjack, playerScore.isBust])

  const handleDeal = async () => {
    audio.playCardSlide()
    const ok = await deal()
    if (ok) {
      // Dealt cards slide sound
      setTimeout(() => audio.playCardSlide(), 150)
      setTimeout(() => audio.playCardSlide(), 300)
    }
  }

  const handleHit = async () => {
    audio.playCardSlide()
    await hit()
  }

  const handleStand = async () => {
    audio.playCardFlip()
    await stand()
  }

  const handleDouble = async () => {
    audio.playCardSlide()
    await double()
  }

  return (
    <div className="w-full flex flex-col items-center gap-6 py-4 px-3 sm:px-6">
      {/* Header Info Banner */}
      <div className="w-full max-w-4xl flex flex-wrap items-center justify-between gap-3 bg-panel/70 backdrop-blur border border-tile-border px-5 py-3 rounded-2xl shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(85,214,255,0.2)]">
            🃏
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white">Blackjack 21</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                99.5% RTP
              </span>
            </div>
            <p className="text-xs text-text-secondary">
              Vegas Strip Rules · 6-Deck Shoe · Dealer stands on 17
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user.isGuest ? (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Guest Demo Mode
            </span>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
              <Shield className="w-3.5 h-3.5" />
              <span>Provably Fair</span>
            </div>
          )}

          {status !== 'IDLE' && status !== 'ACTIVE' && (
            <button
              onClick={reset}
              className="p-1.5 rounded-lg bg-tile border border-tile-border hover:border-text-secondary text-text-secondary hover:text-white transition-colors cursor-pointer"
              title="New Round"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-4xl p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-between text-xs text-red-400"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={clearError}
              className="px-2 py-0.5 rounded bg-red-500/20 hover:bg-red-500/40 text-red-300 font-bold"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Felt Casino Table */}
      <BlackjackTable
        dealerCards={dealerCards}
        dealerScore={dealerScore}
        playerCards={playerCards}
        playerScore={playerScore}
        status={status}
        payout={payout}
        bet={bet}
      />

      {/* Controls & Betting Bar */}
      <BlackjackControls
        bet={bet}
        balance={user.balance}
        status={status}
        playerCardsCount={playerCards.length}
        isDealing={isDealing}
        onBetChange={setBet}
        onDeal={handleDeal}
        onHit={handleHit}
        onStand={handleStand}
        onDouble={handleDouble}
      />

      {/* Provably Fair Commitment Footer */}
      {(serverSeedHash || serverSeed) && (
        <div className="w-full max-w-4xl p-3 bg-panel/40 border border-tile-border/40 rounded-xl flex flex-col sm:flex-row items-center justify-between text-[11px] text-text-secondary gap-2 font-mono">
          <div className="flex items-center gap-2 truncate max-w-full">
            <span className="text-emerald-400 font-bold">SHA256:</span>
            <span className="truncate">{serverSeedHash || serverSeed}</span>
          </div>
          {serverSeed && (
            <span className="text-emerald-400/80 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Verified
            </span>
          )}
        </div>
      )}
    </div>
  )
}
