import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react'
import { motionPresets } from '../../lib/motion'

export type AlertVariant = 'error' | 'success' | 'warning' | 'info'

export interface AlertProps {
  variant?: AlertVariant
  title?: string
  children: React.ReactNode
  onDismiss?: () => void
  className?: string
}

const variantConfig: Record<
  AlertVariant,
  { container: string; text: string; icon: React.ReactElement }
> = {
  error: {
    container: 'bg-danger/10 border-danger/30',
    text: 'text-danger',
    icon: <AlertCircle className="w-4 h-4 flex-shrink-0 text-danger" />,
  },
  success: {
    container: 'bg-primary/10 border-primary/30',
    text: 'text-primary',
    icon: <CheckCircle className="w-4 h-4 flex-shrink-0 text-primary" />,
  },
  warning: {
    container: 'bg-warning/10 border-warning/30',
    text: 'text-warning',
    icon: <AlertTriangle className="w-4 h-4 flex-shrink-0 text-warning" />,
  },
  info: {
    container: 'bg-info/10 border-info/30',
    text: 'text-info',
    icon: <Info className="w-4 h-4 flex-shrink-0 text-info" />,
  },
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'error',
  title,
  children,
  onDismiss,
  className = '',
}) => {
  const config = variantConfig[variant]

  return (
    <AnimatePresence>
      <motion.div
        initial={motionPresets.slideDownInitial}
        animate={motionPresets.slideDownAnimate}
        exit={motionPresets.slideDownExit}
        className={`w-full p-3 rounded-xl border flex items-start gap-2.5 text-xs shadow-sm ${config.container} ${className}`}
      >
        <span className="mt-0.5">{config.icon}</span>

        <div className="flex-1 flex flex-col gap-0.5">
          {title && <span className={`font-bold ${config.text}`}>{title}</span>}
          <div className={`${config.text} font-medium leading-relaxed`}>
            {children}
          </div>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss alert"
            className="text-text-secondary hover:text-text-primary p-0.5 rounded hover:bg-white/10 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
