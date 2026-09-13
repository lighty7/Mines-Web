import React from 'react'
import { motion } from 'framer-motion'
import { Layers, ArrowUpCircle, Hand, Sparkles } from 'lucide-react'

interface BlackjackControlsProps {
  bet: number
  balance: number
  status: 'IDLE' | 'ACTIVE' | 'WON' | 'LOST' | 'PUSH'
  playerCardsCount: number
  isDealing: boolean
  onBetChange: (amount: number) => void
  onDeal: () => void
  onHit: () => void
  onStand: () => void
  onDouble: () => void
}

const CHIP_PRESETS = [1, 5, 25, 100, 500]

export const BlackjackControls: React.FC<BlackjackControlsProps> = ({
  bet,
  balance,
  status,
  playerCardsCount,
  isDealing,
  onBetChange,
  onDeal,
  onHit,
  onStand,
  onDouble,
}) => {
  const isPlaying = status === 'ACTIVE'
  const canDouble = isPlaying && playerCardsCount === 2 && balance >= bet

  const adjustBet = (multiplier: number) => {
    if (isPlaying || isDealing) return
    if (multiplier === 0.5) onBetChange(Math.max(1, Math.floor(bet / 2)))
    else if (multiplier === 2) onBetChange(Math.min(balance, Math.floor(bet * 2)))
    else if (multiplier === -1) onBetChange(balance)
  }

  return (
    <div className="w-full max-w-4xl p-5 bg-panel border border-tile-border rounded-3xl shadow-xl flex flex-col gap-4">
      {/* Active In-Game Actions */}
      {isPlaying ? (
        <div className="grid grid-cols-3 gap-3">
          {/* HIT */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onHit}
            disabled={isDealing}
            className="h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(16,185,129,0.35)] hover:brightness-110 active:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
          >
            <ArrowUpCircle className="w-5 h-5" />
            <span>HIT</span>
          </motion.button>

          {/* STAND */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStand}
            disabled={isDealing}
            className="h-14 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(245,158,11,0.35)] hover:brightness-110 active:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
          >
            <Hand className="w-5 h-5" />
            <span>STAND</span>
          </motion.button>

          {/* DOUBLE DOWN */}
          <motion.button
            whileHover={{ scale: canDouble ? 1.02 : 1 }}
            whileTap={{ scale: canDouble ? 0.98 : 1 }}
            onClick={onDouble}
            disabled={!canDouble || isDealing}
            className="h-14 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(99,102,241,0.35)] hover:brightness-110 active:opacity-90 disabled:opacity-35 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <Layers className="w-5 h-5" />
            <span>DOUBLE (2x)</span>
          </motion.button>
        </div>
      ) : (
        /* Betting & Deal Layout */
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Bet Input & Presets */}
          <div className="flex-1 w-full flex flex-col sm:flex-row items-center gap-3">
            {/* Bet Input Box */}
            <div className="w-full sm:w-48 relative">
              <label className="text-[10px] uppercase font-bold text-text-secondary tracking-wider block mb-1">
                Bet Amount ($)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={balance}
                  value={bet}
                  onChange={(e) => onBetChange(Number(e.target.value))}
                  disabled={isDealing}
                  className="w-full h-11 px-3 bg-tile border border-tile-border rounded-xl font-mono text-base font-bold text-white focus:outline-none focus:border-cyan-500 transition-colors"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    onClick={() => adjustBet(0.5)}
                    className="px-1.5 py-0.5 text-[10px] font-bold bg-tile-border/50 hover:bg-tile-border rounded text-text-secondary hover:text-white"
                  >
                    ½
                  </button>
                  <button
                    onClick={() => adjustBet(2)}
                    className="px-1.5 py-0.5 text-[10px] font-bold bg-tile-border/50 hover:bg-tile-border rounded text-text-secondary hover:text-white"
                  >
                    2×
                  </button>
                  <button
                    onClick={() => adjustBet(-1)}
                    className="px-1.5 py-0.5 text-[10px] font-bold bg-tile-border/50 hover:bg-tile-border rounded text-text-secondary hover:text-white"
                  >
                    MAX
                  </button>
                </div>
              </div>
            </div>

            {/* Chip Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {CHIP_PRESETS.map((amt) => (
                <button
                  key={amt}
                  onClick={() => onBetChange(amt)}
                  disabled={isDealing}
                  className={`h-9 px-3 rounded-xl font-mono text-xs font-bold border transition-all ${
                    bet === amt
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_12px_rgba(85,214,255,0.3)]'
                      : 'bg-tile/60 border-tile-border text-text-secondary hover:text-white hover:border-text-secondary'
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>
          </div>

          {/* Deal Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onDeal}
            disabled={isDealing || balance < bet}
            className="w-full md:w-56 h-13 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-[0_4px_25px_rgba(85,214,255,0.4)] hover:brightness-110 active:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <Sparkles className="w-5 h-5" />
            <span>{isDealing ? 'DEALING...' : 'DEAL HAND'}</span>
          </motion.button>
        </div>
      )}
    </div>
  )
}
