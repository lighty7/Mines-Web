import React, { useCallback } from 'react'
import confetti from 'canvas-confetti'
import { Coin } from './Coin'
import { StreakLadder } from './StreakLadder'
import { CoinFlipControls } from './CoinFlipControls'
import { useCoinFlipStore } from '../../store/coinflipStore'
import { useAuthStore } from '../../store/authStore'
import { useAudio } from '../../hooks/useAudio'
import { CoinSide } from '../../types/coinflip'
import { History } from 'lucide-react'
import { GameLayout } from '../layout/GameLayout'
import { Alert } from '../ui/Alert'
import { TIMING, confettiPresets } from '../../lib/motion'

export const CoinFlipView: React.FC = () => {
  const {
    status,
    streak,
    isFlipping,
    lastOutcome,
    lastGuess,
    flips,
    errorMessage,
    clearError,
    startGame,
    flip,
    cashout,
    reset,
  } = useCoinFlipStore()

  const { user } = useAuthStore()
  const { playCoinFlick, playCoinCatch, playStreakWin, playExplosion } = useAudio()

  const handleStart = async () => {
    await startGame()
  }

  const handleFlip = useCallback(
    async (guess: CoinSide) => {
      playCoinFlick()
      const res = await flip(guess)
      // Synchronized audio timing exactly matching 1100ms coin flight
      setTimeout(() => {
        playCoinCatch()
        if (res?.won) {
          playStreakWin(res ? streak + 1 : 1)
        } else {
          playExplosion()
        }
      }, TIMING.COIN_FLIP_DURATION)
    },
    [flip, playCoinFlick, playCoinCatch, playStreakWin, playExplosion, streak]
  )

  const handleCashout = async () => {
    const payout = await cashout()
    if (payout) {
      confetti(confettiPresets.bigWin)
      setTimeout(() => {
        reset()
      }, 2500)
    }
  }

  return (
    <div className="w-full">
      {errorMessage && (
        <div className="mb-4">
          <Alert variant="error" onDismiss={clearError}>
            {errorMessage}
          </Alert>
        </div>
      )}

      {/* Streak Ladder Multiplier Bar */}
      <div className="mb-5 p-3.5 bg-surface-2/80 border border-border-default rounded-2xl shadow-md backdrop-blur-md">
        <StreakLadder currentStreak={streak} />
      </div>

      <GameLayout
        icon="🪙"
        title="Coin Flip"
        subtitle="Streak Multiplier Ladder · Choose Heads or Tails & Multiply"
        rtp="98.0% RTP"
        isGuest={user.isGuest}
        accentColor="#F5C451"
        controls={
          <CoinFlipControls
            onStart={handleStart}
            onFlip={handleFlip}
            onCashout={handleCashout}
          />
        }
        playArea={
          <div className="w-full flex flex-col items-center justify-center min-h-[460px] p-6 bg-surface-2/70 border border-border-default rounded-3xl shadow-2xl relative overflow-hidden backdrop-blur-md">
            {/* Status Message */}
            <div className="mb-6 text-center">
              {status === 'ACTIVE' ? (
                <span className="text-sm font-bold text-accent-gold tracking-wider uppercase font-mono">
                  Pick Heads or Tails to Advance Streak!
                </span>
              ) : status === 'WON' ? (
                <span className="text-sm font-bold text-primary tracking-wider uppercase font-mono">
                  Victory! Payout Credited to Wallet 🏆
                </span>
              ) : status === 'LOST' ? (
                <span className="text-sm font-bold text-danger tracking-wider uppercase font-mono">
                  Flip Mismatch! Streak Reset.
                </span>
              ) : (
                <span className="text-sm font-bold text-text-secondary tracking-wider uppercase font-mono">
                  Place wager to launch the streak ladder!
                </span>
              )}
            </div>

            {/* 3D Animated Coin */}
            <Coin isFlipping={isFlipping} outcome={lastOutcome} />

            {/* Last Flip Outcome Ribbon */}
            {lastOutcome && !isFlipping && (
              <div className="mt-8 flex items-center gap-3 px-4 py-2 bg-surface-3/80 border border-border-default rounded-2xl shadow-sm">
                <span className="text-xs text-text-secondary font-medium">Outcome:</span>
                <span className="text-sm font-black font-mono text-white flex items-center gap-1.5">
                  <span>{lastOutcome === 'HEADS' ? '👑' : '🪙'}</span>
                  <span>{lastOutcome}</span>
                </span>
                {lastGuess && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${
                      lastGuess === lastOutcome
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'bg-danger/20 text-danger border border-danger/30'
                    }`}
                  >
                    {lastGuess === lastOutcome ? 'WIN' : 'MISS'}
                  </span>
                )}
              </div>
            )}

            {/* Recent Flips In This Round */}
            {flips.length > 0 && (
              <div className="mt-6 flex items-center gap-2 overflow-x-auto max-w-full no-scrollbar">
                <div className="flex items-center gap-1 text-[11px] text-text-muted mr-1 font-mono">
                  <History className="w-3.5 h-3.5" />
                  <span>Flips:</span>
                </div>
                {flips.map((f, i) => (
                  <div
                    key={i}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1 border ${
                      f.won
                        ? 'bg-primary/15 border-primary/30 text-primary'
                        : 'bg-danger/15 border-danger/30 text-danger'
                    }`}
                  >
                    <span>{f.outcome === 'HEADS' ? '👑' : '🪙'}</span>
                    <span>{f.outcome[0]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        }
      />
    </div>
  )
}
