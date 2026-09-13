import React from 'react'
import { motion } from 'framer-motion'

export interface TabItem<T extends string = string> {
  id: T
  label: string
  icon?: React.ReactNode
  badge?: string | number
}

export interface TabsProps<T extends string = string> {
  items: TabItem<T>[]
  activeTab: T
  onChange: (tabId: T) => void
  size?: 'sm' | 'md'
  fullWidth?: boolean
  className?: string
}

export function Tabs<T extends string = string>({
  items,
  activeTab,
  onChange,
  size = 'md',
  fullWidth = true,
  className = '',
}: TabsProps<T>) {
  const sizeClasses = size === 'sm' ? 'py-1.5 px-2.5 text-xs' : 'py-2 px-3.5 text-xs sm:text-sm'

  return (
    <div
      role="tablist"
      className={`relative flex items-center p-1 bg-surface-3 rounded-xl border border-border-default gap-1 ${
        fullWidth ? 'w-full' : 'inline-flex'
      } ${className}`}
    >
      {items.map((tab) => {
        const isActive = activeTab === tab.id

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`relative ${
              fullWidth ? 'flex-1' : ''
            } ${sizeClasses} rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors select-none z-10 ${
              isActive
                ? 'text-black'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover/50'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeTabPill"
                transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                className="absolute inset-0 bg-primary rounded-lg shadow-sm shadow-primary/20 -z-10"
              />
            )}

            {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
            <span className="truncate">{tab.label}</span>

            {tab.badge !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  isActive ? 'bg-black/30 text-black' : 'bg-surface-2 text-text-secondary'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
