import React, { useCallback } from 'react'
import confetti from 'canvas-confetti'
import { RouletteWheel } from './RouletteWheel'
import { BettingTable } from './BettingTable'
import { ChipSelector } from './ChipSelector'
import { useRouletteStore } from '../../store/rouletteStore'
import { useAuthStore } from '../../store/authStore'
import { useAudio } from '../../hooks/useAudio'
import { RouletteBetType } from '../../types/roulette'
import { Trophy, History } from 'lucide-react'
import { GameLayout } from '../layout/GameLayout'
import { Alert } from '../ui/Alert'
import { CurrencyDisplay } from '../ui/CurrencyDisplay'
import { confettiPresets, TIMING } from '../../lib/motion'

export const RouletteView: React.FC = () => {
  const {
    placedBets,
    isSpinning,
    winningNumber,
    winningColor,
    lastPayout,
    lastMultiplier,
    history,
    errorMessage,
    clearError,
    placeBet,
    spin,
    setIsSpinning,
  } = useRouletteStore()

  const { user } = useAuthStore()
  const { playWheelSpin, playBallDrop, playSlotWin, playChipPlace } = useAudio()

  const handlePlaceBet = useCallback(
    (type: RouletteBetType, numbers: number[]) => {
      playChipPlace()
      placeBet(type, numbers)
    },
    [placeBet, playChipPlace]
  )

  const handleSpin = async () => {
    playWheelSpin()
    const res = await spin()
    if (!res) return

    // Staggered ball drop & outcome revelation
    setTimeout(() => {
      playBallDrop()
      if (res.payout > 0) {
        playSlotWin(res.multiplier)
        if (res.multiplier >= 5) {
          confetti(confettiPresets.bigWin)
        }
      }
      setIsSpinning(false)
    }, TIMING.ROULETTE_SPIN_DURATION)
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

      <GameLayout
        icon="🎡"
        title="European Roulette"
        subtitle="Single-Zero 37-Pocket Wheel · Straight, Column & Outside Bets"
        rtp="97.3% RTP"
        isGuest={user.isGuest}
        accentColor="#EF4444"
        controls={
          <div className="flex flex-col gap-4">
            {/* Win Banner Notification */}
            {lastPayout > 0 && !isSpinning ? (
              <div className="p-4 bg-primary/10 border border-primary/40 rounded-2xl flex flex-col gap-1 w-full shadow-lg">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                  <Trophy className="w-4 h-4" />
                  <span>WINNER! Payout Credited</span>
                </div>
                <div>
                  <CurrencyDisplay
                    amount={lastPayout}
                    size="lg"
                    showSign
                    className="text-primary"
                  />
                </div>
                <span className="text-xs text-text-secondary">
                  {lastMultiplier}× Return on winning combinations
                </span>
              </div>
            ) : null}

            {/* Chips & Controls Panel */}
            <ChipSelector onSpin={handleSpin} />
          </div>
        }
        playArea={
          <div className="w-full flex flex-col items-center gap-5">
            {/* Recent History Bar */}
            <div className="w-full px-4 py-2 bg-surface-2/80 border border-border-default rounded-2xl flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2 text-xs text-text-secondary font-mono">
                <History className="w-3.5 h-3.5" />
                <span className="font-bold text-text-primary">RECENT:</span>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {history.map((h, idx) => (
                  <div
                    key={idx}
                    className={`w-7 h-7 rounded-lg font-mono font-black text-xs flex items-center justify-center text-white border shadow-xs ${
                      h.color === 'GREEN'
                        ? 'bg-emerald-600 border-emerald-400'
                        : h.color === 'RED'
                        ? 'bg-rose-600 border-rose-400'
                        : 'bg-zinc-900 border-border-default'
                    }`}
                  >
                    {h.number}
                  </div>
                ))}
              </div>
            </div>

            {/* Realistic Rotating Roulette Wheel */}
            <RouletteWheel
              isSpinning={isSpinning}
              winningNumber={winningNumber}
              winningColor={winningColor}
            />

            {/* Interactive Betting Table Felt */}
            <BettingTable
              placedBets={placedBets}
              onPlaceBet={handlePlaceBet}
              disabled={isSpinning}
            />
          </div>
        }
      />
    </div>
  )
}
