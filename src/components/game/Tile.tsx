import React from 'react'
import { motion } from 'framer-motion'
import { Tile as TileType, GameState } from '../../types'

interface TileProps {
  tile: TileType
  gameState: GameState
  disabled: boolean
  onClick: () => void
}

export const Tile: React.FC<TileProps> = ({ tile, gameState, disabled, onClick }) => {
  const isHidden = tile.state === 'HIDDEN'
  const isRevealing = tile.state === 'REVEALING'
  const isSafe = tile.state === 'SAFE'
  const isMine = tile.state === 'MINE'

  const isGameOver = gameState === 'WON' || gameState === 'LOST'

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled || !isHidden}
      whileHover={isHidden && !disabled ? { scale: 1.03, y: -2 } : {}}
      whileTap={isHidden && !disabled ? { scale: 0.95 } : {}}
      className={`relative w-full aspect-square rounded-xl transition-all select-none p-1 perspective-1000 ${
        disabled && isHidden ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      <div
        className={`w-full h-full rounded-xl flex items-center justify-center transition-all duration-300 transform-style-3d shadow-md ${
          isSafe
            ? 'bg-gradient-to-br from-emerald-950/80 to-emerald-900/60 border-2 border-primary shadow-primary/20 shadow-lg'
            : isMine
            ? 'bg-gradient-to-br from-red-950/90 to-red-900/70 border-2 border-accent-red shadow-accent-red/30 shadow-lg animate-shake'
            : isRevealing
            ? 'bg-tile-hover border border-primary/50 animate-pulse'
            : 'bg-gradient-to-b from-tile to-[#1e2229] border border-tile-border hover:border-tile-hover hover:from-tile-hover hover:to-tile shadow-inner'
        }`}
      >
        {/* SAFE GEM (DIAMOND) */}
        {isSafe && (
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="flex items-center justify-center relative"
          >
            {/* Ambient Diamond Glow */}
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-md" />
            <svg
              className="w-7 h-7 sm:w-8 sm:h-8 drop-shadow-[0_0_12px_rgba(24,201,100,0.8)]"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 3H18L22 9L12 21L2 9L6 3Z"
                fill="url(#gemGradient)"
                stroke="#20E875"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 21L8.5 9M12 21L15.5 9M12 21V9M2 9H22M6 3L8.5 9M18 3L15.5 9"
                stroke="#63E6FF"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <defs>
                <linearGradient id="gemGradient" x1="2" y1="3" x2="22" y2="21" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#63E6FF" />
                  <stop offset="0.5" stopColor="#18C964" />
                  <stop offset="1" stopColor="#0D823E" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
        )}

        {/* MINE EXPLOSION (BOMB) */}
        {isMine && (
          <motion.div
            initial={{ scale: 0, rotate: 90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 12 }}
            className="flex items-center justify-center relative"
          >
            <div className="absolute inset-0 bg-accent-red/40 rounded-full blur-md animate-pulse" />
            <span className="text-2xl sm:text-3xl select-none filter drop-shadow-[0_0_8px_rgba(240,68,68,0.9)]">
              💥
            </span>
          </motion.div>
        )}

        {/* HIDDEN DEFAULT TILE EMBOSS */}
        {isHidden && !isGameOver && (
          <div className="w-2.5 h-2.5 rounded-full bg-tile-border/40 transition-transform group-hover:scale-125" />
        )}
      </div>
    </motion.button>
  )
}
