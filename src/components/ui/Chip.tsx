import React from 'react'
import { motion } from 'framer-motion'
import { motionPresets } from '../../lib/motion'

export interface ChipProps {
  value: number
  isSelected?: boolean
  onClick?: () => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const chipColors: Record<number, { bg: string; border: string; text: string; ring: string }> = {
  1: {
    bg: 'bg-zinc-100',
    border: 'border-zinc-300',
    text: 'text-zinc-900',
    ring: 'border-zinc-400',
  },
  5: {
    bg: 'bg-rose-600',
    border: 'border-rose-400',
    text: 'text-white',
    ring: 'border-rose-300',
  },
  25: {
    bg: 'bg-emerald-600',
    border: 'border-emerald-400',
    text: 'text-white',
    ring: 'border-emerald-300',
  },
  100: {
    bg: 'bg-zinc-900',
    border: 'border-accent-gold',
    text: 'text-accent-gold',
    ring: 'border-accent-gold/60',
  },
  500: {
    bg: 'bg-purple-600',
    border: 'border-purple-400',
    text: 'text-white',
    ring: 'border-purple-300',
  },
}

const defaultChipColor = {
  bg: 'bg-surface-3',
  border: 'border-border-default',
  text: 'text-text-primary',
  ring: 'border-border-strong',
}

const sizeClasses = {
  sm: 'w-8 h-8 text-[10px]',
  md: 'w-10 h-10 sm:w-11 sm:h-11 text-xs',
  lg: 'w-12 h-12 sm:w-14 sm:h-14 text-sm font-black',
}

export const Chip: React.FC<ChipProps> = ({
  value,
  isSelected = false,
  onClick,
  disabled = false,
  size = 'md',
  className = '',
}) => {
  const colors = chipColors[value] || defaultChipColor

  return (
    <motion.button
      type="button"
      whileHover={disabled ? undefined : motionPresets.chipHover}
      whileTap={disabled ? undefined : motionPresets.chipTap}
      onClick={onClick}
      disabled={disabled}
      className={`relative rounded-full font-mono font-black flex items-center justify-center select-none shadow-md transition-all cursor-pointer border-2 ${
        sizeClasses[size]
      } ${colors.bg} ${colors.border} ${colors.text} ${
        isSelected
          ? 'ring-4 ring-primary ring-offset-2 ring-offset-base scale-105 shadow-primary/30'
          : 'opacity-90 hover:opacity-100'
      } ${disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''} ${className}`}
    >
      {/* Inner dashed ring for authentic casino chip appearance */}
      <span
        className={`absolute inset-1 rounded-full border border-dashed ${colors.ring} pointer-events-none opacity-60`}
      />
      <span className="relative z-10">{value}</span>
    </motion.button>
  )
}
