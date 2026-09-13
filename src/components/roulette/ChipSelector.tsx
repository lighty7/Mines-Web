import React from 'react'
import { motion } from 'framer-motion'
import { RotateCcw, Trash2, Play } from 'lucide-react'
import { useRouletteStore } from '../../store/rouletteStore'
import { useAuthStore } from '../../store/authStore'
import { useAudio } from '../../hooks/useAudio'

interface ChipSelectorProps {
  onSpin: () => void
}

const CHIPS = [
  { value: 1, color: 'bg-zinc-100 text-zinc-900 border-zinc-300' },
  { value: 5, color: 'bg-rose-600 text-white border-rose-400' },
  { value: 25, color: 'bg-emerald-600 text-white border-emerald-400' },
  { value: 100, color: 'bg-zinc-900 text-yellow-400 border-yellow-500' },
  { value: 500, color: 'bg-purple-600 text-white border-purple-400' },
]

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
    <div className="w-full bg-panel border border-tile-border rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Chips Selection Palette */}
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="text-xs text-text-secondary font-medium mr-1 hidden md:inline">CHIPS:</span>
        {CHIPS.map((c) => (
          <motion.button
            key={c.value}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            disabled={isSpinning}
            onClick={() => {
              playChipPlace()
              setSelectedChip(c.value)
            }}
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 font-mono font-black text-xs sm:text-sm flex items-center justify-center shadow-md transition-all ${
              c.color
            } ${
              selectedChip === c.value
                ? 'ring-4 ring-primary ring-offset-2 ring-offset-background scale-105'
                : 'opacity-85 hover:opacity-100'
            }`}
          >
            {c.value}
          </motion.button>
        ))}
      </div>

      {/* Action Controls: Undo, Double, Clear */}
      <div className="flex items-center gap-2">
        <button
          disabled={isSpinning || placedBets.length === 0}
          onClick={() => {
            playClick()
            undoBet()
          }}
          className="p-2.5 bg-tile hover:bg-tile-hover border border-tile-border rounded-xl text-xs font-bold text-text-secondary hover:text-white transition-all disabled:opacity-50"
          title="Undo last chip"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          disabled={isSpinning || placedBets.length === 0}
          onClick={() => {
            playChipPlace()
            doubleBets()
          }}
          className="px-3 py-2 bg-tile hover:bg-tile-hover border border-tile-border rounded-xl text-xs font-bold text-text-secondary hover:text-white transition-all disabled:opacity-50"
        >
          2× Double
        </button>

        <button
          disabled={isSpinning || placedBets.length === 0}
          onClick={() => {
            playClick()
            clearBets()
          }}
          className="p-2.5 bg-tile hover:bg-tile-hover border border-tile-border rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 transition-all disabled:opacity-50"
          title="Clear all bets"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Total Bet & Big Spin Button */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        <div className="flex flex-col text-right">
          <span className="text-[10px] text-text-secondary font-medium">TOTAL BET</span>
          <span className="text-base font-extrabold text-white font-mono leading-none">
            {totalBet.toFixed(2)}
          </span>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          disabled={!canSpin}
          onClick={() => {
            playClick()
            onSpin()
          }}
          className={`px-6 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-lg flex items-center gap-2 ${
            canSpin
              ? 'bg-primary hover:bg-primary-hover text-black shadow-primary/25'
              : 'bg-tile border border-tile-border text-text-secondary opacity-50 cursor-not-allowed'
          }`}
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{isSpinning ? 'SPINNING...' : 'SPIN'}</span>
        </motion.button>
      </div>
    </div>
  )
}
