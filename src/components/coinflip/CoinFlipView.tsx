import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export const CoinFlipView: React.FC = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[460px] p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl p-8 bg-panel border border-tile-border rounded-3xl shadow-2xl flex flex-col items-center gap-6"
      >
        <motion.div
          animate={{ rotateY: [0, 180, 360] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-600 via-amber-400 to-yellow-200 border-2 border-yellow-300 flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(245,196,81,0.3)]"
        >
          👑
        </motion.div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>98.0% RTP · COMPOUNDING STREAK LADDER</span>
          </div>
          <h2 className="text-2xl font-black text-white">Coin Flip</h2>
          <p className="text-sm text-text-secondary mt-2">
            High-velocity Heads or Tails streak ladder with stepwise cashout. Pick your side, flip the 3D coin, build up your multiplier, and cash out at any point!
          </p>
        </div>

        <div className="w-full grid grid-cols-3 gap-3 text-left">
          <div className="p-3 bg-tile/40 border border-tile-border/40 rounded-2xl">
            <span className="text-xs text-text-secondary block">1st Flip</span>
            <span className="text-base font-extrabold text-yellow-400 font-mono">1.96× Multiplier</span>
          </div>
          <div className="p-3 bg-tile/40 border border-tile-border/40 rounded-2xl">
            <span className="text-xs text-text-secondary block">3 Flips</span>
            <span className="text-base font-extrabold text-white font-mono">7.53× Multiplier</span>
          </div>
          <div className="p-3 bg-tile/40 border border-tile-border/40 rounded-2xl">
            <span className="text-xs text-text-secondary block">5 Flips</span>
            <span className="text-base font-extrabold text-primary font-mono">28.93× Cashout</span>
          </div>
        </div>

        <div className="p-3 bg-tile/20 border border-tile-border/40 rounded-xl text-xs text-text-secondary">
          Database schema & Aiven PostgreSQL integration prepared. Ready for Next Step activation!
        </div>
      </motion.div>
    </div>
  )
}
