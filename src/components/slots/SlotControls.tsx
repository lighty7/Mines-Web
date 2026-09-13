import React from 'react'
import { motion } from 'framer-motion'
import {
  Coins,
  Sparkles,
  Zap,
  Repeat,
  Info,
  Layers,
  Play,
} from 'lucide-react'
import { useSlotStore } from '../../store/slotStore'
import { useAuthStore } from '../../store/authStore'
import { useAudio } from '../../hooks/useAudio'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { CurrencyDisplay } from '../ui/CurrencyDisplay'
import { Badge } from '../ui/Badge'

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
    <div className="bg-surface-2/90 border border-border-default rounded-3xl p-5 shadow-2xl flex flex-col gap-4 text-text-primary backdrop-blur-md">
      {/* Top Header: Free Spins or Win Banner */}
      {isFreeSpin ? (
        <motion.div
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="p-3 bg-game-slots/15 border border-game-slots/30 rounded-2xl flex items-center justify-between"
        >
          <div className="flex items-center gap-2 text-game-slots font-bold text-xs">
            <Sparkles className="w-4 h-4 animate-spin text-game-slots" />
            <span>FREE SPINS ACTIVE</span>
          </div>
          <Badge variant="gold" size="sm">
            {freeSpinsRemaining} LEFT
          </Badge>
        </motion.div>
      ) : totalPayout > 0 ? (
        <div className="p-3 bg-primary/10 border border-primary/30 rounded-2xl flex items-center justify-between">
          <span className="text-xs text-text-secondary font-medium">LAST WIN</span>
          <div className="flex items-center gap-2">
            <Badge variant="primary" size="sm">
              {totalMultiplier}×
            </Badge>
            <CurrencyDisplay amount={totalPayout} size="sm" showSign className="text-primary" />
          </div>
        </div>
      ) : null}

      {/* Bet Per Line Section */}
      <div className="flex flex-col gap-1.5">
        <Input
          label="Bet Per Line"
          labelRight={
            <div className="flex items-center gap-1 text-[11px] text-text-muted">
              <span>Balance:</span>
              <CurrencyDisplay amount={user.balance} size="xs" />
            </div>
          }
          type="number"
          step="0.05"
          min="0.05"
          max="100"
          disabled={isSpinning || isFreeSpin}
          value={betPerLine}
          onChange={(e) => setBetPerLine(parseFloat(e.target.value) || 0.05)}
          leftIcon={<Coins className="w-4 h-4 text-accent-gold" />}
          suffix="MC"
        />

        {/* Quick Bet Pills */}
        <div className="grid grid-cols-6 gap-1 mt-1">
          {quickBets.map((b) => (
            <button
              key={b}
              type="button"
              disabled={isSpinning || isFreeSpin}
              onClick={() => handleBetChange(b)}
              className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                betPerLine === b
                  ? 'bg-primary text-black font-extrabold shadow-sm'
                  : 'bg-surface-3 hover:bg-surface-hover border border-border-default text-text-secondary hover:text-text-primary'
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
              type="button"
              disabled={isSpinning || isFreeSpin}
              onClick={() => handleLinesChange(l)}
              className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                lines === l
                  ? 'bg-primary/20 border-primary text-primary shadow-sm'
                  : 'bg-surface-3 border-border-default hover:border-border-strong text-text-secondary hover:text-text-primary'
              }`}
            >
              {l} {l === 1 ? 'Line' : 'Lines'}
            </button>
          ))}
        </div>
      </div>

      {/* Total Bet Summary Pill */}
      <div className="p-3 bg-surface-3 border border-border-default rounded-2xl flex items-center justify-between">
        <span className="text-xs text-text-secondary font-medium">TOTAL WAGER</span>
        <div className="flex items-center gap-1.5">
          <Coins className="w-4 h-4 text-accent-gold" />
          {isFreeSpin ? (
            <span className="text-sm font-bold text-accent-gold font-mono">0.00 MC (FREE)</span>
          ) : (
            <CurrencyDisplay amount={totalBet} size="sm" />
          )}
        </div>
      </div>

      {/* Toggles: Turbo, Auto, Paytable */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => {
            playClick()
            toggleTurboMode()
          }}
          disabled={isSpinning}
          className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            turboMode
              ? 'bg-accent-gold/20 border-accent-gold text-accent-gold shadow-sm'
              : 'bg-surface-3 border-border-default text-text-secondary hover:text-text-primary'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Turbo</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playClick()
            toggleAutoSpin()
          }}
          className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            autoSpin
              ? 'bg-primary/20 border-primary text-primary animate-pulse shadow-sm'
              : 'bg-surface-3 border-border-default text-text-secondary hover:text-text-primary'
          }`}
        >
          <Repeat className="w-3.5 h-3.5" />
          <span>{autoSpin ? 'Stop' : 'Auto'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playClick()
            onOpenPaytable()
          }}
          className="py-2 px-2.5 bg-surface-3 hover:bg-surface-hover border border-border-default rounded-xl text-xs font-bold text-text-secondary hover:text-text-primary flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <Info className="w-3.5 h-3.5 text-primary" />
          <span>Paytable</span>
        </button>
      </div>

      {/* Main Big Neon SPIN Button */}
      <Button
        variant={isFreeSpin ? 'gold' : 'primary'}
        size="xl"
        fullWidth
        disabled={isSpinning || (!isFreeSpin && user.balance < totalBet)}
        onClick={() => {
          playClick()
          onSpin()
        }}
        isLoading={isSpinning}
        leftIcon={<Play className="w-5 h-5 fill-current" />}
      >
        {isSpinning ? (
          <span>SPINNING...</span>
        ) : isFreeSpin ? (
          <span>FREE SPIN ({freeSpinsRemaining})</span>
        ) : !canSpin ? (
          <span>INSUFFICIENT BALANCE</span>
        ) : (
          <span>SPIN ({totalBet.toFixed(2)} MC)</span>
        )}
      </Button>
    </div>
  )
}
