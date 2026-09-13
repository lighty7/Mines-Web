import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Trophy, Layers } from 'lucide-react'
import { SYMBOLS, PAYLINES } from '../../engine/slotsEngine'

interface PaytableModalProps {
  isOpen: boolean
  onClose: () => void
}

export const PaytableModal: React.FC<PaytableModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-2xl max-h-[85vh] bg-panel border border-tile-border rounded-3xl p-6 shadow-2xl overflow-y-auto flex flex-col gap-6 text-text-primary custom-scrollbar"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-tile-border/60 pb-4">
            <div className="flex items-center gap-2.5">
              <Trophy className="w-6 h-6 text-primary" />
              <div>
                <h3 className="text-xl font-extrabold text-white">Neon Rush Paytable</h3>
                <p className="text-xs text-text-secondary">96.5% RTP · 20 Fixed Paylines · 5 Reels</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-tile rounded-xl text-text-secondary hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Special Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Wild Feature */}
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl flex items-start gap-3">
              <span className="text-3xl">⚡</span>
              <div>
                <h4 className="text-sm font-extrabold text-yellow-400">WILD SYMBOL</h4>
                <p className="text-xs text-text-secondary mt-1">
                  Substitutes for any standard symbol to form the highest paying combination on an active payline.
                </p>
                <p className="text-[11px] font-mono text-yellow-300 font-bold mt-1.5">
                  5 Wilds = 750× Line Bet!
                </p>
              </div>
            </div>

            {/* Scatter Feature */}
            <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-2xl flex items-start gap-3">
              <span className="text-3xl">⭐</span>
              <div>
                <h4 className="text-sm font-extrabold text-orange-400">SCATTER & FREE SPINS</h4>
                <p className="text-xs text-text-secondary mt-1">
                  Land 3 or more anywhere on the reels to trigger Free Spins with automatic multiplier boost:
                </p>
                <div className="text-[11px] font-mono text-orange-300 font-bold mt-1.5 flex flex-col gap-0.5">
                  <span>• 3 Stars = 10 Free Spins + 2×</span>
                  <span>• 4 Stars = 15 Free Spins + 10×</span>
                  <span>• 5 Stars = 25 Free Spins + 50×</span>
                </div>
              </div>
            </div>
          </div>

          {/* Regular Symbols Grid */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Standard Symbol Payouts (Multiplier × Line Bet)</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.values(SYMBOLS).map((sym) => (
                <div
                  key={sym.id}
                  className="p-3 bg-tile/40 border border-tile-border/50 rounded-2xl flex flex-col items-center gap-1.5 hover:border-primary/40 transition-all"
                >
                  <span className="text-3xl">{sym.char}</span>
                  <span className="text-xs font-bold text-white uppercase">{sym.name}</span>
                  <div className="w-full text-[11px] font-mono text-text-secondary flex flex-col gap-0.5 mt-1 pt-1 border-t border-tile-border/40">
                    <div className="flex justify-between">
                      <span>5 Match:</span>
                      <span className="text-primary font-bold">{sym.payouts[5]}×</span>
                    </div>
                    <div className="flex justify-between">
                      <span>4 Match:</span>
                      <span className="text-white font-bold">{sym.payouts[4]}×</span>
                    </div>
                    <div className="flex justify-between">
                      <span>3 Match:</span>
                      <span className="text-text-secondary">{sym.payouts[3]}×</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Paylines Explanation */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              <span>20 Winning Paylines</span>
            </h4>
            <p className="text-xs text-text-secondary">
              Winning combinations pay from left-to-right starting from the leftmost reel on active paylines.
            </p>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {PAYLINES.map((_, idx) => (
                <div
                  key={idx}
                  className="p-2 bg-tile/30 border border-tile-border/40 rounded-xl flex flex-col items-center justify-center text-center"
                >
                  <span className="text-xs font-mono font-bold text-primary">#{idx + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
