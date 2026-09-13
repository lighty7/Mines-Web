import React, { useState } from 'react'
import { StopCircle } from 'lucide-react'
import { UnifiedActiveRound } from '../../../api/admin.api'
import { Modal } from '../../ui/Modal'
import { Input } from '../../ui/Input'
import { Button } from '../../ui/Button'
import { CurrencyDisplay } from '../../ui/CurrencyDisplay'

interface StopRoundModalProps {
  round: UnifiedActiveRound | null
  onClose: () => void
  onConfirm: (action: 'REFUND' | 'CASHOUT', reason: string) => Promise<void>
  isLoading: boolean
}

export const StopRoundModal: React.FC<StopRoundModalProps> = ({
  round,
  onClose,
  onConfirm,
  isLoading,
}) => {
  const [actionType, setActionType] = useState<'REFUND' | 'CASHOUT'>('REFUND')
  const [reason, setReason] = useState<string>('Live session cancelled by Administrator')

  if (!round) return null

  const handleConfirm = async () => {
    await onConfirm(actionType, reason)
  }

  return (
    <Modal
      isOpen={!!round}
      onClose={onClose}
      title="Intervene in Live Active Round"
      subtitle={`Session ID: ${round.id} · ${round.gameType.toUpperCase()}`}
      size="md"
      variant="danger"
    >
      <div className="flex flex-col gap-4 py-2 text-xs">
        {/* Round Details Card */}
        <div className="p-3.5 rounded-2xl bg-surface-3 border border-border-default flex flex-col gap-2 font-mono">
          <div className="flex items-center justify-between">
            <span className="text-text-secondary font-sans">Player:</span>
            <span className="text-text-primary font-bold">{round.username}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary font-sans">Wager Placed:</span>
            <CurrencyDisplay amount={round.bet} size="xs" className="text-accent-gold" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary font-sans">Current State:</span>
            <span className="text-text-primary">{round.stateSummary}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary font-sans">Multiplier:</span>
            <span className="text-primary font-bold">{round.multiplier.toFixed(2)}x</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary font-sans">Accumulated Win:</span>
            <CurrencyDisplay amount={round.potentialWin} size="xs" className="text-primary" />
          </div>
        </div>

        {/* Action Selection */}
        <div className="flex flex-col gap-1.5">
          <label className="text-text-secondary font-semibold">Resolution Action</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setActionType('REFUND')}
              className={`p-3 rounded-xl border text-left flex flex-col gap-0.5 transition-all cursor-pointer ${
                actionType === 'REFUND'
                  ? 'bg-danger/20 border-danger text-text-primary shadow-sm'
                  : 'bg-surface-3 border-border-default text-text-secondary hover:text-text-primary'
              }`}
            >
              <span className="font-bold text-xs">Refund Wager</span>
              <span className="text-[10px] text-text-muted">
                Returns {round.bet.toFixed(2)} MC
              </span>
            </button>

            <button
              type="button"
              disabled={round.gameType === 'blackjack' || round.multiplier <= 1}
              onClick={() => setActionType('CASHOUT')}
              className={`p-3 rounded-xl border text-left flex flex-col gap-0.5 transition-all cursor-pointer ${
                actionType === 'CASHOUT'
                  ? 'bg-primary/20 border-primary text-text-primary shadow-sm'
                  : 'bg-surface-3 border-border-default text-text-secondary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
            >
              <span className="font-bold text-xs">Force Cashout</span>
              <span className="text-[10px] text-text-muted">
                Awards {round.potentialWin.toFixed(2)} MC
              </span>
            </button>
          </div>
        </div>

        {/* Reason Input */}
        <Input
          label="Audit / Customer Reason"
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button type="button" variant="ghost" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={actionType === 'REFUND' ? 'danger' : 'primary'}
            size="md"
            disabled={isLoading}
            isLoading={isLoading}
            onClick={handleConfirm}
            leftIcon={<StopCircle className="w-4 h-4" />}
          >
            {actionType === 'REFUND' ? 'Confirm Stop & Refund' : 'Confirm Force Cashout'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
