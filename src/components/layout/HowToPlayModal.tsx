import React from 'react'
import { motion } from 'framer-motion'
import { X, HelpCircle, ShieldCheck, Sparkles, AlertTriangle } from 'lucide-react'

interface HowToPlayModalProps {
  isOpen: boolean
  onClose: () => void
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-panel border border-tile-border rounded-2xl shadow-2xl p-6 relative overflow-hidden flex flex-col gap-4 text-xs text-text-secondary"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-secondary hover:text-text-primary p-1.5 rounded-lg hover:bg-tile-hover transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary">How to Play Mines</h3>
            <p className="text-[11px] text-text-secondary">Game rules, odds, and keyboard hotkeys</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="p-3.5 bg-tile border border-tile-border rounded-xl flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-text-primary font-bold">
              <Sparkles className="w-4 h-4 text-primary" />
              1. Choose Bet & Mines
            </div>
            <p>
              Select your bet in mineCoin and configure the number of hidden mines (1 to 24). More mines equal exponentially higher multipliers per revealed diamond!
            </p>
          </div>

          <div className="p-3.5 bg-tile border border-tile-border rounded-xl flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-text-primary font-bold">
              <span className="text-sm">💎</span>
              2. Reveal Safe Gems
            </div>
            <p>
              Click any hidden tile on the grid. If it reveals a Diamond, your multiplier increases and you can cash out at any time!
            </p>
          </div>

          <div className="p-3.5 bg-tile border border-tile-border rounded-xl flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-text-primary font-bold">
              <AlertTriangle className="w-4 h-4 text-accent-red" />
              3. Avoid the Bombs
            </div>
            <p>
              If you tap a tile containing a Mine, it explodes and the round ends. Cash out whenever you are satisfied with your accumulated profit!
            </p>
          </div>

          <div className="p-3.5 bg-tile border border-tile-border rounded-xl flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-text-primary font-bold">
              <ShieldCheck className="w-4 h-4 text-accent-gold" />
              4. Fair Play & Multipliers
            </div>
            <p>
              Every game round is calculated with a transparent 99% Return-to-Player (RTP) rate based on standard combinatorial probability.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl font-bold bg-tile hover:bg-tile-hover border border-tile-border text-text-primary transition-all text-xs mt-1"
        >
          Got It, Let's Play!
        </button>
      </motion.div>
    </div>
  )
}
