import React from 'react'
import { RotateCcw, Trash2, Play } from 'lucide-react'
import { useRouletteStore } from '../../store/rouletteStore'
import { useAuthStore } from '../../store/authStore'
import { useAudio } from '../../hooks/useAudio'
import { Chip } from '../ui/Chip'
import { Button } from '../ui/Button'
import { CurrencyDisplay } from '../ui/CurrencyDisplay'

interface ChipSelectorProps {
  onSpin: () => void
}

const CHIP_VALUES = [1, 5, 25, 100, 500]

export const ChipSelector: React.FC<ChipSelectorProps> = ({ onSpin }) => {
  const {
    selectedChip,
    placedBets,
    isSpinning,
    setSelectedChip,
    clearBets,
    undoBet,
    doubleBets,
  } = useRouletteStore()

  const { user } = useAuthStore()
  const { playClick, playChipPlace } = useAudio()

  const totalBet = placedBets.reduce((sum, b) => sum + b.amount, 0)
  const canSpin = totalBet > 0 && user.balance >= totalBet && !isSpinning

  return (
    <div className="w-full bg-surface-2/90 border border-border-default rounded-3xl p-5 shadow-2xl flex flex-col gap-4 backdrop-blur-md">
      {/* 1. Chips Selection Palette */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-text-secondary">
          Select Chip Value
        </label>
        <div className="flex items-center justify-between gap-1 sm:gap-2">
          {CHIP_VALUES.map((val) => (
            <Chip
              key={val}
              value={val}
              isSelected={selectedChip === val}
              disabled={isSpinning}
              onClick={() => {
                playChipPlace()
                setSelectedChip(val)
              }}
              size="md"
            />
          ))}
        </div>
      </div>

      {/* 2. Action Controls: Undo, Double, Clear */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={isSpinning || placedBets.length === 0}
          onClick={() => {
            playClick()
            undoBet()
          }}
          className="flex-1 py-2 bg-surface-3 hover:bg-surface-hover border border-border-default rounded-xl text-xs font-bold text-text-secondary hover:text-text-primary transition-all disabled:opacity-40 flex items-center justify-center gap-1 cursor-pointer"
          title="Undo last placed chip"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Undo</span>
        </button>

        <button
          type="button"
          disabled={isSpinning || placedBets.length === 0}
          onClick={() => {
            playChipPlace()
            doubleBets()
          }}
          className="flex-1 py-2 bg-surface-3 hover:bg-surface-hover border border-border-default rounded-xl text-xs font-bold text-text-secondary hover:text-text-primary transition-all disabled:opacity-40 cursor-pointer"
        >
          2× Double
        </button>

        <button
          type="button"
          disabled={isSpinning || placedBets.length === 0}
          onClick={() => {
            playClick()
            clearBets()
          }}
          className="py-2 px-3 bg-surface-3 hover:bg-surface-hover border border-border-default rounded-xl text-xs font-bold text-danger hover:brightness-110 transition-all disabled:opacity-40 flex items-center justify-center cursor-pointer"
          title="Clear all chips"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3. Total Bet Status */}
      <div className="p-3 bg-surface-3 border border-border-default rounded-2xl flex items-center justify-between">
        <span className="text-xs text-text-secondary font-medium">TOTAL WAGER</span>
        <CurrencyDisplay amount={totalBet} size="sm" />
      </div>

      {/* 4. Main SPIN Button */}
      <Button
        variant="primary"
        size="xl"
        fullWidth
        disabled={!canSpin}
        onClick={() => {
          playClick()
          onSpin()
        }}
        isLoading={isSpinning}
        leftIcon={<Play className="w-5 h-5 fill-current" />}
      >
        {isSpinning ? (
          <span>SPINNING...</span>
        ) : !canSpin && totalBet > 0 && user.balance < totalBet ? (
          <span>INSUFFICIENT BALANCE</span>
        ) : totalBet === 0 ? (
          <span>PLACE A BET TO SPIN</span>
        ) : (
          <span>SPIN ({totalBet.toFixed(2)} MC)</span>
        )}
      </Button>
    </div>
  )
}
