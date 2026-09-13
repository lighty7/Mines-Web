import React from 'react'
import { formatCurrency } from '../../lib/currency'

export interface CurrencyDisplayProps {
  amount: number
  showSign?: boolean
  coloring?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg sm:text-xl font-extrabold',
  xl: 'text-2xl sm:text-3xl font-black',
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  amount,
  showSign = false,
  coloring = false,
  size = 'md',
  className = '',
}) => {
  const formatted = formatCurrency(amount, { showSign })

  const colorClass = coloring
    ? amount > 0
      ? 'text-primary'
      : amount < 0
      ? 'text-danger'
      : 'text-text-primary'
    : 'text-text-primary'

  return (
    <span
      className={`font-mono font-bold tracking-tight inline-flex items-baseline ${sizeClasses[size]} ${colorClass} ${className}`}
    >
      {formatted}
    </span>
  )
}
