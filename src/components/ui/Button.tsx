import React from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { motionPresets } from '../../lib/motion'

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'gold'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  fullWidth?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  children?: React.ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary hover:bg-primary-hover text-black font-extrabold shadow-md shadow-primary/20 border border-primary/30',
  secondary:
    'bg-surface-3 hover:bg-surface-hover text-text-primary border border-border-default hover:border-border-strong',
  danger:
    'bg-danger hover:brightness-110 text-white font-bold shadow-md shadow-danger/20 border border-danger/30',
  ghost:
    'bg-transparent hover:bg-surface-3 text-text-secondary hover:text-text-primary border border-transparent',
  gold:
    'bg-gradient-to-r from-accent-gold via-amber-400 to-accent-gold hover:brightness-105 text-black font-black shadow-lg shadow-accent-gold/25',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs rounded-lg gap-1.5',
  md: 'h-10 px-4 text-sm rounded-xl gap-2',
  lg: 'h-12 px-6 text-base rounded-xl gap-2.5',
  xl: 'h-14 px-8 text-base rounded-2xl gap-3',
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  children,
  ...props
}) => {
  const isDisabled = disabled || isLoading

  return (
    <motion.button
      whileHover={isDisabled ? undefined : motionPresets.buttonHover}
      whileTap={isDisabled ? undefined : motionPresets.buttonTap}
      disabled={isDisabled}
      className={`relative inline-flex items-center justify-center font-sans tracking-wide transition-all select-none cursor-pointer ${
        variantStyles[variant]
      } ${sizeStyles[size]} ${fullWidth ? 'w-full' : ''} ${
        isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
      } ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children && <span>{children}</span>}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  )
}
