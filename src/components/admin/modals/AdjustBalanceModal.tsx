import React, { useState } from 'react'
import { AdminPlayer } from '../../../api/admin.api'
import { Modal } from '../../ui/Modal'
import { Input } from '../../ui/Input'
import { Button } from '../../ui/Button'
import { CurrencyDisplay } from '../../ui/CurrencyDisplay'

interface AdjustBalanceModalProps {
  user: AdminPlayer | null
  onClose: () => void
  onConfirm: (amount: number, operation: 'CREDIT' | 'DEBIT' | 'SET', reason: string) => Promise<void>
  isLoading: boolean
}

export const AdjustBalanceModal: React.FC<AdjustBalanceModalProps> = ({
  user,
  onClose,
  onConfirm,
  isLoading,
}) => {
  const [adjustAmount, setAdjustAmount] = useState<number>(100)
  const [adjustOperation, setAdjustOperation] = useState<'CREDIT' | 'DEBIT' | 'SET'>('CREDIT')
  const [adjustReason, setAdjustReason] = useState<string>('Manual Admin Credit')

  if (!user) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (adjustAmount <= 0 && adjustOperation !== 'SET') return
    await onConfirm(adjustAmount, adjustOperation, adjustReason)
  }

  return (
    <Modal
      isOpen={!!user}
      onClose={onClose}
      title="Adjust Player Balance"
      subtitle={`Modify wallet funds for ${user.username}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2 text-xs">
        {/* Current Balance */}
        <div className="p-3.5 rounded-2xl bg-surface-3 border border-border-default flex items-center justify-between">
          <span className="text-text-secondary font-medium">Current Balance</span>
          <CurrencyDisplay amount={user.balance} size="md" className="text-primary" />
        </div>

        {/* Operation Selection */}
        <div className="flex flex-col gap-1.5">
          <label className="text-text-secondary font-semibold">Operation</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'CREDIT', label: '+ Credit', color: 'text-primary' },
              { id: 'DEBIT', label: '- Debit', color: 'text-danger' },
              { id: 'SET', label: 'Set To', color: 'text-accent-cyan' },
            ].map((op) => (
              <button
                key={op.id}
                type="button"
                onClick={() => setAdjustOperation(op.id as any)}
                className={`py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  adjustOperation === op.id
                    ? 'bg-surface-1 border-primary text-text-primary shadow-sm'
                    : 'bg-surface-3 border-border-default text-text-secondary hover:text-text-primary'
                }`}
              >
                <span className={op.color}>{op.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Amount Input */}
        <Input
          label="Amount (MC)"
          type="number"
          min="1"
          step="1"
          required
          value={adjustAmount}
          onChange={(e) => setAdjustAmount(parseFloat(e.target.value) || 0)}
          suffix="MC"
        />

        {/* Reason Input */}
        <Input
          label="Audit / Justification Reason"
          type="text"
          required
          value={adjustReason}
          onChange={(e) => setAdjustReason(e.target.value)}
        />

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button type="button" variant="ghost" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isLoading}
            isLoading={isLoading}
          >
            Confirm Adjustment
          </Button>
        </div>
      </form>
    </Modal>
  )
}
