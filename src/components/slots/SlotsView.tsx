import React, { useState, useEffect, useCallback } from 'react'
import { SlotMachine } from './SlotMachine'
import { SlotControls } from './SlotControls'
import { PaytableModal } from './PaytableModal'
import { useSlotStore } from '../../store/slotStore'
import { useAuthStore } from '../../store/authStore'
import { GameLayout } from '../layout/GameLayout'

export const SlotsView: React.FC = () => {
  const { spin, isSpinning } = useSlotStore()
  const { user } = useAuthStore()
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
      <GameLayout
        icon="🎰"
        title="Neon Rush Slots"
        subtitle="5x3 Video Slot · 20 Fixed Paylines · Wilds & Free Spins"
        rtp="96.5% RTP"
        isGuest={user.isGuest}
        hotkeyHint="Space: Spin Reels"
        accentColor="#F59E0B"
        controls={
          <SlotControls
            onSpin={handleSpinRequest}
            onOpenPaytable={() => setPaytableOpen(true)}
          />
        }
        playArea={<SlotMachine onSpinRequest={handleSpinRequest} />}
      />

      <PaytableModal isOpen={paytableOpen} onClose={() => setPaytableOpen(false)} />
    </div>
  )
}
