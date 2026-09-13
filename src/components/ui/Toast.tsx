import React, { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react'
import { TIMING, motionPresets } from '../../lib/motion'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastItem {
  id: string
  type: ToastType
  message: string
  title?: string
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, title?: string) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (message: string, type: ToastType = 'info', title?: string) => {
      const id = Math.random().toString(36).substring(2, 9)
      const newToast: ToastItem = { id, type, message, title }

      setToasts((prev) => [...prev.slice(-2), newToast]) // Max 3 visible

      setTimeout(() => {
        dismiss(id)
      }, TIMING.TOAST_DURATION)
    },
    [dismiss]
  )

  const icons: Record<ToastType, React.ReactElement> = {
    success: <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-danger flex-shrink-0" />,
    info: <Info className="w-4 h-4 text-info flex-shrink-0" />,
  }

  const borders: Record<ToastType, string> = {
    success: 'border-primary/40 bg-surface-2 shadow-primary/10',
    error: 'border-danger/40 bg-surface-2 shadow-danger/10',
    info: 'border-info/40 bg-surface-2 shadow-info/10',
  }

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}

      {/* Toast Render Area */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none p-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={motionPresets.slideDownInitial}
              animate={motionPresets.slideDownAnimate}
              exit={motionPresets.slideDownExit}
              className={`pointer-events-auto p-3.5 rounded-2xl border shadow-xl flex items-start gap-3 backdrop-blur-md ${borders[t.type]}`}
            >
              <div className="mt-0.5">{icons[t.type]}</div>
              <div className="flex-1 flex flex-col">
                {t.title && (
                  <span className="text-xs font-bold text-text-primary">
                    {t.title}
                  </span>
                )}
                <span className="text-xs text-text-secondary font-medium">
                  {t.message}
                </span>
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Close notification"
                className="text-text-secondary hover:text-text-primary p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return ctx
}
