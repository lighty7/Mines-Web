import React from 'react'

export type BadgeVariant =
  | 'primary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'gold'
  | 'cyan'
  | 'muted'
  | 'neutral'

export interface BadgeProps {
  variant?: BadgeVariant
  size?: 'sm' | 'md'
  dot?: boolean
  pulseDot?: boolean
  className?: string
  children: React.ReactNode
}

const variantStyles: Record<BadgeVariant, { container: string; dot: string }> = {
  primary: {
    container: 'bg-primary/15 text-primary border-primary/30',
    dot: 'bg-primary',
  },
  success: {
    container: 'bg-success/15 text-success border-success/30',
    dot: 'bg-success',
  },
  danger: {
    container: 'bg-danger/15 text-danger border-danger/30',
    dot: 'bg-danger',
  },
  warning: {
    container: 'bg-warning/15 text-warning border-warning/30',
    dot: 'bg-warning',
  },
  info: {
    container: 'bg-info/15 text-info border-info/30',
    dot: 'bg-info',
  },
  gold: {
    container: 'bg-accent-gold/15 text-accent-gold border-accent-gold/30',
    dot: 'bg-accent-gold',
  },
  cyan: {
    container: 'bg-accent-cyan/15 text-accent-cyan border-accent-cyan/30',
    dot: 'bg-accent-cyan',
  },
  muted: {
    container: 'bg-surface-3 text-text-secondary border-border-default',
    dot: 'bg-text-secondary',
  },
  neutral: {
    container: 'bg-surface-3 text-text-secondary border-border-default',
    dot: 'bg-text-secondary',
  },
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  size = 'md',
  dot = false,
  pulseDot = false,
  className = '',
  children,
}) => {
  const styles = variantStyles[variant]
  const sizeStyle = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2.5 py-1'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-mono font-bold uppercase tracking-wider border ${styles.container} ${sizeStyle} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${styles.dot} ${
            pulseDot ? 'animate-pulse' : ''
          }`}
        />
      )}
      <span>{children}</span>
    </span>
  )
}
