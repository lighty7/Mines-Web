import React, { useCallback } from 'react'
import confetti from 'canvas-confetti'
import { Coin } from './Coin'
import { StreakLadder } from './StreakLadder'
import { CoinFlipControls } from './CoinFlipControls'
import { useCoinFlipStore } from '../../store/coinflipStore'
import { useAudio } from '../../hooks/useAudio'
import { CoinSide } from '../../types/coinflip'
import { AlertCircle, History } from 'lucide-react'

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

  const { playCoinFlick, playCoinCatch, playStreakWin, playExplosion } = useAudio()

  const handleStart = async () => {
    await startGame()
  }

  const handleFlip = useCallback(
    async (guess: CoinSide) => {
      playCoinFlick()
      const res = await flip(guess)
      setTimeout(() => {
        playCoinCatch()
        if (res?.won) {
          playStreakWin(res ? streak + 1 : 1)
        } else {
          playExplosion()
        }
      }, 1000)
    },
    [flip, playCoinFlick, playCoinCatch, playStreakWin, playExplosion, streak]
  )

  const handleCashout = async () => {
    const payout = await cashout()
    if (payout) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
      setTimeout(() => {
        reset()
      }, 2500)
    }
  }

  return (
    <div className="w-full">
      {/* Error notification */}
      {errorMessage && (
        <div className="mb-4 p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-between text-xs text-red-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={clearError} className="text-xs font-bold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Streak Ladder Multiplier Bar */}
      <div className="mb-6 p-3 bg-panel/70 border border-tile-border/60 rounded-2xl shadow-md">
        <StreakLadder currentStreak={streak} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Betting Controls */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4">
          <CoinFlipControls
            onStart={handleStart}
            onFlip={handleFlip}
            onCashout={handleCashout}
          />
        </div>

        {/* Right: 3D Coin Arena */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col items-center justify-center min-h-[460px] p-6 bg-gradient-to-b from-[#181c24] to-[#0f1217] border border-tile-border rounded-3xl shadow-2xl relative overflow-hidden">
          {/* Status Message Overlay */}
          <div className="mb-6 text-center">
            {status === 'ACTIVE' ? (
              <span className="text-sm font-bold text-yellow-400 tracking-wider uppercase">
                Choose Heads or Tails to Continue Streak!
              </span>
            ) : status === 'WON' ? (
              <span className="text-sm font-bold text-primary tracking-wider uppercase">
                Victory! Payout Credited to Wallet 🏆
              </span>
            ) : status === 'LOST' ? (
              <span className="text-sm font-bold text-red-400 tracking-wider uppercase">
                Flip Mismatched! Streak Reset.
              </span>
            ) : (
              <span className="text-sm font-bold text-text-secondary tracking-wider uppercase">
                Place your bet to start the coin ladder!
              </span>
            )}
          </div>

          {/* 3D Animated Coin */}
          <Coin isFlipping={isFlipping} outcome={lastOutcome} />

          {/* Last Flip Outcome Ribbon */}
          {lastOutcome && !isFlipping && (
            <div className="mt-8 flex items-center gap-3 px-4 py-2 bg-tile/60 border border-tile-border/50 rounded-2xl">
              <span className="text-xs text-text-secondary">Outcome:</span>
              <span className="text-sm font-extrabold font-mono text-white flex items-center gap-1.5">
                <span>{lastOutcome === 'HEADS' ? '👑' : '🪙'}</span>
                <span>{lastOutcome}</span>
              </span>
              {lastGuess && (
                <span
                  className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${
                    lastGuess === lastOutcome
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
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
              <div className="flex items-center gap-1 text-[11px] text-text-secondary mr-1">
                <History className="w-3.5 h-3.5" />
                <span>Flips:</span>
              </div>
              {flips.map((f, i) => (
                <div
                  key={i}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1 border ${
                    f.won
                      ? 'bg-primary/15 border-primary/30 text-primary'
                      : 'bg-red-500/15 border-red-500/30 text-red-400'
                  }`}
                >
                  <span>{f.outcome === 'HEADS' ? '👑' : '🪙'}</span>
                  <span>{f.outcome[0]}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
