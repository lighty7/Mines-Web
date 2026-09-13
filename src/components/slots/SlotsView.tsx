import React, { useState, useEffect, useCallback } from 'react'
import { SlotMachine } from './SlotMachine'
import { SlotControls } from './SlotControls'
import { PaytableModal } from './PaytableModal'
import { useSlotStore } from '../../store/slotStore'
import { Keyboard } from 'lucide-react'

export const SlotsView: React.FC = () => {
  const { spin, isSpinning } = useSlotStore()
  const [paytableOpen, setPaytableOpen] = useState(false)

  const handleSpinRequest = useCallback(async () => {
    return await spin()
  }, [spin])

  // Spacebar to spin when not focused in input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        const target = e.target as HTMLElement | null
        const tag = target?.tagName?.toLowerCase()
        if (tag === 'input' || tag === 'textarea' || target?.isContentEditable) return

        e.preventDefault()
        if (!isSpinning) {
          handleSpinRequest()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSpinning, handleSpinRequest])

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel: Slot Betting Controls */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4">
          <SlotControls
            onSpin={handleSpinRequest}
            onOpenPaytable={() => setPaytableOpen(true)}
          />

          {/* Quick Keyboard Hotkey Pill */}
          <div className="hidden sm:flex items-center justify-between px-4 py-2.5 bg-panel/50 border border-tile-border/50 rounded-xl text-xs text-text-secondary">
            <div className="flex items-center gap-2">
              <Keyboard className="w-3.5 h-3.5 text-primary" />
              <span>Hotkey:</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="px-2 py-0.5 bg-tile border border-tile-border rounded text-[10px] font-mono text-text-primary font-bold shadow-sm">
                Space
              </kbd>
              <span className="text-[11px]">Spin Reels</span>
            </div>
          </div>
        </div>

        {/* Right Panel: Slot Machine 5-Reels */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col items-center justify-center min-h-[460px]">
          <SlotMachine onSpinRequest={handleSpinRequest} />
        </div>
      </div>

      <PaytableModal isOpen={paytableOpen} onClose={() => setPaytableOpen(false)} />
    </div>
  )
}
