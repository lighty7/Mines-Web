import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export const RouletteView: React.FC = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[460px] p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl p-8 bg-panel border border-tile-border rounded-3xl shadow-2xl flex flex-col items-center gap-6"
      >
        <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/30 flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(24,201,100,0.2)]">
          🎡
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>EUROPEAN SINGLE-ZERO (37 POCKETS)</span>
          </div>
          <h2 className="text-2xl font-black text-white">European Roulette</h2>
          <p className="text-sm text-text-secondary mt-2">
            Classic 97.3% RTP table gaming with interactive chip betting felt, 35:1 straight-up payouts, and smooth animated physics wheel spinning.
          </p>
        </div>

        <div className="w-full grid grid-cols-3 gap-3 text-left">
          <div className="p-3 bg-tile/40 border border-tile-border/40 rounded-2xl">
            <span className="text-xs text-text-secondary block">Straight Up</span>
            <span className="text-base font-extrabold text-primary font-mono">35:1 Payout</span>
          </div>
          <div className="p-3 bg-tile/40 border border-tile-border/40 rounded-2xl">
            <span className="text-xs text-text-secondary block">Red / Black</span>
            <span className="text-base font-extrabold text-white font-mono">1:1 Even</span>
          </div>
          <div className="p-3 bg-tile/40 border border-tile-border/40 rounded-2xl">
            <span className="text-xs text-text-secondary block">Dozens / Cols</span>
            <span className="text-base font-extrabold text-yellow-400 font-mono">2:1 Payout</span>
          </div>
        </div>

        <div className="p-3 bg-tile/20 border border-tile-border/40 rounded-xl text-xs text-text-secondary">
          Database schema & Aiven PostgreSQL integration prepared. Ready for Next Step activation!
        </div>
      </motion.div>
    </div>
  )
}
