import React from 'react'
import { motion } from 'framer-motion'
import {
  Coins,
  Sparkles,
  Zap,
  Repeat,
  Info,
  Layers,
} from 'lucide-react'
import { useSlotStore } from '../../store/slotStore'
import { useAuthStore } from '../../store/authStore'
import { useAudio } from '../../hooks/useAudio'

interface SlotControlsProps {
  onSpin: () => void
  onOpenPaytable: () => void
}

export const SlotControls: React.FC<SlotControlsProps> = ({ onSpin, onOpenPaytable }) => {
  const {
    betPerLine,
    lines,
    isSpinning,
    freeSpinsRemaining,
    autoSpin,
    turboMode,
    totalPayout,
    totalMultiplier,
    setBetPerLine,
    setLines,
    toggleAutoSpin,
    toggleTurboMode,
  } = useSlotStore()

  const { user } = useAuthStore()
  const { playClick } = useAudio()

  const totalBet = Math.round(betPerLine * lines * 100) / 100
  const isFreeSpin = freeSpinsRemaining > 0
  const canSpin = isFreeSpin || user.balance >= totalBet

  const quickBets = [0.1, 0.25, 0.5, 1.0, 2.5, 5.0]

  const handleBetChange = (newBet: number) => {
    playClick()
    setBetPerLine(Math.max(0.05, Math.round(newBet * 100) / 100))
  }

  const handleLinesChange = (newLines: number) => {
    playClick()
    setLines(newLines)
  }

  return (
    <div className="bg-panel border border-tile-border rounded-3xl p-5 shadow-2xl flex flex-col gap-4 text-text-primary">
      {/* Top Header: Free Spins or Win Banner */}
      {isFreeSpin ? (
        <motion.div
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="p-3 bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/40 rounded-2xl flex items-center justify-between"
        >
          <div className="flex items-center gap-2 text-orange-300 font-bold text-sm">
            <Sparkles className="w-5 h-5 text-orange-400 animate-spin" />
            <span>FREE SPINS ACTIVE</span>
          </div>
          <span className="px-3 py-1 bg-orange-500 text-black font-extrabold text-sm rounded-full">
            {freeSpinsRemaining} REMAINING
          </span>
        </motion.div>
      ) : totalPayout > 0 ? (
        <div className="p-3 bg-primary/10 border border-primary/30 rounded-2xl flex items-center justify-between">
          <span className="text-xs text-text-secondary">LAST WIN</span>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary font-bold rounded">
              {totalMultiplier}x
            </span>
            <span className="text-base font-extrabold text-primary font-mono">
              +{totalPayout.toFixed(2)}
            </span>
          </div>
        </div>
      ) : null}

      {/* Bet Per Line Section */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs text-text-secondary font-medium">
          <span>Bet Per Line</span>
          <span>Max: 100.00</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary">
              <Coins className="w-4 h-4 text-yellow-400" />
            </div>
            <input
              type="number"
              step="0.05"
              min="0.05"
              max="100"
              disabled={isSpinning || isFreeSpin}
              value={betPerLine}
              onChange={(e) => setBetPerLine(parseFloat(e.target.value) || 0.05)}
              className="w-full pl-9 pr-3 py-2.5 bg-tile/70 border border-tile-border rounded-xl text-sm font-bold text-text-primary focus:outline-none focus:border-primary disabled:opacity-50"
            />
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handleBetChange(betPerLine / 2)}
              disabled={isSpinning || isFreeSpin}
              className="px-2.5 py-2.5 bg-tile border border-tile-border hover:border-text-secondary/50 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            >
              ½
            </button>
            <button
              onClick={() => handleBetChange(betPerLine * 2)}
              disabled={isSpinning || isFreeSpin}
              className="px-2.5 py-2.5 bg-tile border border-tile-border hover:border-text-secondary/50 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            >
              2×
            </button>
          </div>
        </div>

        {/* Quick Bet Pills */}
        <div className="grid grid-cols-6 gap-1 mt-1">
          {quickBets.map((b) => (
            <button
              key={b}
              disabled={isSpinning || isFreeSpin}
              onClick={() => handleBetChange(b)}
              className={`py-1 rounded-lg text-[11px] font-bold transition-all ${
                betPerLine === b
                  ? 'bg-primary text-black font-extrabold'
                  : 'bg-tile/40 hover:bg-tile border border-tile-border/50 text-text-secondary'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Paylines Selector */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs text-text-secondary font-medium">
          <div className="flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span>Active Paylines</span>
          </div>
          <span className="font-mono text-text-primary font-bold">{lines} Lines</span>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {[1, 5, 10, 20].map((l) => (
            <button
              key={l}
              disabled={isSpinning || isFreeSpin}
              onClick={() => handleLinesChange(l)}
              className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                lines === l
                  ? 'bg-primary/20 border-primary text-primary shadow-sm'
                  : 'bg-tile/40 border-tile-border/60 hover:border-text-secondary/50 text-text-secondary'
              }`}
            >
              {l} {l === 1 ? 'Line' : 'Lines'}
            </button>
          ))}
        </div>
      </div>

      {/* Total Bet Summary Pill */}
      <div className="p-3 bg-tile/40 border border-tile-border/50 rounded-2xl flex items-center justify-between">
        <span className="text-xs text-text-secondary font-medium">TOTAL WAGER</span>
        <div className="flex items-center gap-1.5">
          <Coins className="w-4 h-4 text-yellow-400" />
          <span className="text-base font-extrabold text-white font-mono">
            {isFreeSpin ? '0.00 (FREE)' : totalBet.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Toggles: Turbo, Auto, Paytable */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => {
            playClick()
            toggleTurboMode()
          }}
          disabled={isSpinning}
          className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            turboMode
              ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
              : 'bg-tile/40 border-tile-border/60 text-text-secondary hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Turbo</span>
        </button>

        <button
          onClick={() => {
            playClick()
            toggleAutoSpin()
          }}
          className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            autoSpin
              ? 'bg-primary/20 border-primary text-primary animate-pulse'
              : 'bg-tile/40 border-tile-border/60 text-text-secondary hover:text-white'
          }`}
        >
          <Repeat className="w-3.5 h-3.5" />
          <span>{autoSpin ? 'Stop Auto' : 'Auto'}</span>
        </button>

        <button
          onClick={() => {
            playClick()
            onOpenPaytable()
          }}
          className="py-2 px-2.5 bg-tile/40 hover:bg-tile border border-tile-border/60 rounded-xl text-xs font-bold text-text-secondary hover:text-white flex items-center justify-center gap-1.5 transition-all"
        >
          <Info className="w-3.5 h-3.5 text-primary" />
          <span>Paytable</span>
        </button>
      </div>

      {/* Main Big Neon SPIN Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={isSpinning || (!isFreeSpin && user.balance < totalBet)}
        onClick={() => {
          playClick()
          onSpin()
        }}
        className={`w-full py-4 rounded-2xl font-black text-lg tracking-wider uppercase transition-all shadow-xl flex items-center justify-center gap-2 ${
          isSpinning
            ? 'bg-tile text-text-secondary border border-tile-border cursor-not-allowed'
            : isFreeSpin
            ? 'bg-gradient-to-r from-orange-500 to-amber-400 text-black shadow-orange-500/30'
            : canSpin
            ? 'bg-primary hover:bg-primary-hover text-black shadow-primary/30'
            : 'bg-tile text-text-secondary border border-tile-border opacity-60'
        }`}
      >
        {isSpinning ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-text-secondary border-t-white rounded-full animate-spin" />
            SPINNING...
          </span>
        ) : isFreeSpin ? (
          <span>FREE SPIN ({freeSpinsRemaining})</span>
        ) : !canSpin ? (
          <span>INSUFFICIENT BALANCE</span>
        ) : (
          <span>SPIN ({totalBet.toFixed(2)})</span>
        )}
      </motion.button>
    </div>
  )
}
