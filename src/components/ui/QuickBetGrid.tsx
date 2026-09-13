import React from 'react'

export interface QuickBetGridProps {
  currentBet: number
  balance: number
  onBetChange: (amount: number) => void
  presets?: number[]
  disabled?: boolean
  className?: string
}

export const QuickBetGrid: React.FC<QuickBetGridProps> = ({
  currentBet,
  balance,
  onBetChange,
  presets = [5, 10, 25, 50, 100],
  disabled = false,
  className = '',
}) => {
  const handleHalf = () => {
    onBetChange(Math.max(1, Math.floor(currentBet / 2)))
  }

  const handleDouble = () => {
    onBetChange(Math.min(balance, Math.floor(currentBet * 2)))
  }

  const handleMax = () => {
    onBetChange(balance)
  }

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {/* Preset values row */}
      {presets.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {presets.map((amt) => {
            const isSelected = currentBet === amt

            return (
              <button
                key={amt}
                type="button"
                disabled={disabled || amt > balance}
                onClick={() => onBetChange(amt)}
                className={`flex-1 py-1.5 px-2 rounded-lg font-mono font-bold text-xs border transition-all select-none cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-black border-primary shadow-sm shadow-primary/20'
                    : 'bg-surface-3 hover:bg-surface-hover border-border-default text-text-secondary hover:text-text-primary'
                } ${disabled || amt > balance ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}`}
              >
                {amt}
              </button>
            )
          })}
        </div>
      )}

      {/* Arithmetic multipliers row */}
      <div className="grid grid-cols-3 gap-1.5">
        <button
          type="button"
          disabled={disabled || currentBet <= 1}
          onClick={handleHalf}
          className="py-1 px-2 text-xs font-mono font-bold rounded-lg bg-surface-3 hover:bg-surface-hover border border-border-default text-text-secondary hover:text-text-primary transition-all disabled:opacity-40 cursor-pointer"
        >
          ½
        </button>

        <button
          type="button"
          disabled={disabled || currentBet >= balance}
          onClick={handleDouble}
          className="py-1 px-2 text-xs font-mono font-bold rounded-lg bg-surface-3 hover:bg-surface-hover border border-border-default text-text-secondary hover:text-text-primary transition-all disabled:opacity-40 cursor-pointer"
        >
          2×
        </button>

        <button
          type="button"
          disabled={disabled || balance <= 0 || currentBet === balance}
          onClick={handleMax}
          className="py-1 px-2 text-xs font-mono font-bold rounded-lg bg-surface-3 hover:bg-surface-hover border border-border-default text-text-secondary hover:text-text-primary transition-all disabled:opacity-40 cursor-pointer"
        >
          MAX
        </button>
      </div>
    </div>
  )
}
