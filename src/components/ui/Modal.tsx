import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { motionPresets } from '../../lib/motion'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'danger'
  showCloseButton?: boolean
  closeOnBackdrop?: boolean
  children: React.ReactNode
}

const sizeClasses: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-xl',
  xl: 'max-w-3xl',
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  size = 'md',
  variant = 'default',
  showCloseButton = true,
  closeOnBackdrop = true,
  children,
}) => {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          {/* Backdrop click listener */}
          <div
            className="fixed inset-0"
            onClick={closeOnBackdrop ? onClose : undefined}
            aria-hidden="true"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
            initial={motionPresets.modalInitial}
            animate={motionPresets.modalAnimate}
            exit={motionPresets.modalExit}
            transition={motionPresets.modalTransition}
            className={`relative w-full ${sizeClasses[size]} bg-surface-2 border ${
              variant === 'danger'
                ? 'border-danger/40 shadow-2xl shadow-danger/10'
                : 'border-border-default shadow-2xl shadow-black/60'
            } rounded-2xl p-5 sm:p-6 my-8 z-10 max-h-[90vh] flex flex-col`}
          >
            {/* Modal Header */}
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between gap-4 mb-4 flex-shrink-0">
                <div>
                  {title && (
                    <h3
                      id="modal-title"
                      className="text-lg sm:text-xl font-black text-text-primary tracking-wide leading-tight"
                    >
                      {title}
                    </h3>
                  )}
                  {subtitle && (
                    <p className="text-xs text-text-secondary mt-1">
                      {subtitle}
                    </p>
                  )}
                </div>

                {showCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close dialog"
                    className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-3 transition-colors cursor-pointer flex-shrink-0 -mr-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto pr-0.5 no-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
