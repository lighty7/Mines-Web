import React, { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Modal } from '../../ui/Modal'
import { Input } from '../../ui/Input'
import { Button } from '../../ui/Button'
import { Alert } from '../../ui/Alert'
import { CurrencyDisplay } from '../../ui/CurrencyDisplay'

interface EmergencyStopModalProps {
  isOpen: boolean
  onClose: () => void
  scope: string
  activeCount: number
  totalRefund: number
  onConfirm: (reason: string) => Promise<void>
  isLoading: boolean
}

export const EmergencyStopModal: React.FC<EmergencyStopModalProps> = ({
  isOpen,
  onClose,
  scope,
  activeCount,
  totalRefund,
  onConfirm,
  isLoading,
}) => {
  const [reason, setReason] = useState<string>('Emergency Platform Maintenance - Bets Refunded')

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Emergency Panic Switch"
      subtitle={`Immediate platform stop for: ${scope.toUpperCase()}`}
      size="md"
      variant="danger"
    >
      <div className="flex flex-col gap-4 py-2 text-xs">
        <Alert variant="error" title="CRITICAL ADMIN ACTION">
          This will immediately cancel all in-flight wagers for the selected game(s), abort active client rounds, and atomically refund all players&apos; initial bets back to their balance.
        </Alert>

        <div className="p-3.5 rounded-2xl bg-surface-3 border border-border-default flex items-center justify-between font-mono">
          <span className="text-text-secondary font-sans">Active Sessions to Cancel:</span>
          <span className="text-text-primary font-bold text-sm">{activeCount} rounds</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-surface-3 border border-border-default flex items-center justify-between font-mono">
          <span className="text-text-secondary font-sans">Total Refund Liability:</span>
          <CurrencyDisplay amount={totalRefund} size="md" className="text-danger" />
        </div>

        <Input
          label="Intervention Reason"
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button type="button" variant="ghost" size="md" onClick={onClose}>
            Abort
          </Button>
          <Button
            type="button"
            variant="danger"
            size="md"
            disabled={isLoading || activeCount === 0}
            isLoading={isLoading}
            onClick={() => onConfirm(reason)}
            leftIcon={<AlertTriangle className="w-4 h-4" />}
          >
            Execute Emergency Stop
          </Button>
        </div>
      </div>
    </Modal>
  )
}
