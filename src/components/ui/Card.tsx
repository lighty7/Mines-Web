import React from 'react'

export interface CardProps {
  title?: React.ReactNode
  subtitle?: React.ReactNode
  action?: React.ReactNode
  footer?: React.ReactNode
  variant?: 'default' | 'elevated' | 'glass'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  className?: string
  children: React.ReactNode
}

const variantStyles: Record<NonNullable<CardProps['variant']>, string> = {
  default: 'bg-surface-2 border-border-default shadow-lg shadow-black/20',
  elevated: 'bg-surface-3 border-border-strong shadow-xl shadow-black/40',
  glass: 'bg-surface-2/70 backdrop-blur-md border-border-default/80 shadow-xl shadow-black/30',
}

const paddingStyles: Record<NonNullable<CardProps['padding']>, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4 sm:p-5',
  lg: 'p-5 sm:p-6',
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  action,
  footer,
  variant = 'default',
  padding = 'md',
  className = '',
  children,
}) => {
  return (
    <div
      className={`rounded-2xl border flex flex-col transition-all ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
    >
      {(title || subtitle || action) && (
        <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-border-subtle/80">
          <div>
            {title && (
              <h3 className="text-sm sm:text-base font-bold text-text-primary tracking-wide">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-text-secondary mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}

      <div className="flex-1">{children}</div>

      {footer && (
        <div className="mt-4 pt-3 border-t border-border-subtle/80">
          {footer}
        </div>
      )}
    </div>
  )
}
