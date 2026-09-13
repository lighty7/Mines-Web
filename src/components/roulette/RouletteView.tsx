import React, { useCallback } from 'react'
import confetti from 'canvas-confetti'
import { RouletteWheel } from './RouletteWheel'
import { BettingTable } from './BettingTable'
import { ChipSelector } from './ChipSelector'
import { useRouletteStore } from '../../store/rouletteStore'
import { useAudio } from '../../hooks/useAudio'
import { RouletteBetType } from '../../types/roulette'
import { AlertCircle, Trophy, History } from 'lucide-react'

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
  } = useRouletteStore()

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

    // Staggered ball drop
    setTimeout(() => {
      playBallDrop()
      if (res.payout > 0) {
        playSlotWin(res.multiplier)
        if (res.multiplier >= 5) {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.55 },
          })
        }
      }
      useRouletteStore.setState({ isSpinning: false })
    }, 3500)
  }

  return (
    <div className="w-full flex flex-col items-center gap-6">
      {/* Error notification */}
      {errorMessage && (
        <div className="w-full max-w-4xl p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-between text-xs text-red-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={clearError} className="text-xs font-bold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Top Recent History Bar */}
      <div className="w-full max-w-4xl px-4 py-2 bg-panel/70 border border-tile-border/60 rounded-2xl flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <History className="w-3.5 h-3.5" />
          <span className="font-bold">RECENT NUMBERS:</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {history.map((h, idx) => (
            <div
              key={idx}
              className={`w-7 h-7 rounded-lg font-mono font-black text-xs flex items-center justify-center text-white border ${
                h.color === 'GREEN'
                  ? 'bg-emerald-600 border-emerald-400'
                  : h.color === 'RED'
                  ? 'bg-rose-600 border-rose-400'
                  : 'bg-zinc-900 border-zinc-700'
              }`}
            >
              {h.number}
            </div>
          ))}
        </div>
      </div>

      {/* Main Roulette Layout: Left Wheel + Right Status / Win Banner */}
      <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-center gap-8 py-2">
        <RouletteWheel
          isSpinning={isSpinning}
          winningNumber={winningNumber}
          winningColor={winningColor}
        />

        {/* Win Banner / Instructions */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2 max-w-xs">
          {lastPayout > 0 && !isSpinning ? (
            <div className="p-4 bg-primary/10 border border-primary/40 rounded-2xl flex flex-col gap-1 w-full">
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase">
                <Trophy className="w-4 h-4" />
                <span>WINNER! Payout Credited</span>
              </div>
              <span className="text-2xl font-black font-mono text-primary">
                +{lastPayout.toFixed(2)} mineCoins
              </span>
              <span className="text-xs text-text-secondary">
                {lastMultiplier}× Return on winning bets
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                European Single-Zero
              </span>
              <h3 className="text-lg font-extrabold text-white">Select Chips & Place Bets</h3>
              <p className="text-xs text-text-secondary">
                Click on numbers (35:1), dozens (2:1), columns, or red/black (1:1), then click SPIN!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Betting Felt Table */}
      <div className="w-full max-w-4xl">
        <BettingTable
          placedBets={placedBets}
          onPlaceBet={handlePlaceBet}
          disabled={isSpinning}
        />
      </div>

      {/* Chips Palette & Controls */}
      <div className="w-full max-w-4xl">
        <ChipSelector onSpin={handleSpin} />
      </div>
    </div>
  )
}
