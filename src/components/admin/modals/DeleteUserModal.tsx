import React from 'react'
import { AlertTriangle } from 'lucide-react'
import { AdminPlayer } from '../../../api/admin.api'
import { Modal } from '../../ui/Modal'
import { Button } from '../../ui/Button'

interface DeleteUserModalProps {
  user: AdminPlayer | null
  onClose: () => void
  onConfirm: () => Promise<void>
  isLoading: boolean
}

export const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
  user,
  onClose,
  onConfirm,
  isLoading,
}) => {
  if (!user) return null

  return (
    <Modal
      isOpen={!!user}
      onClose={onClose}
      title="Delete Player Account"
      size="sm"
      variant="danger"
    >
      <div className="flex flex-col gap-4 py-2 text-xs">
        <div className="flex items-center gap-2.5 text-danger font-bold">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>Permanent Deletion Warning</span>
        </div>

        <p className="text-text-secondary leading-relaxed">
          Are you sure you want to permanently delete player{' '}
          <span className="font-bold text-text-primary">{user.username}</span>? This will wipe
          all associated game records and ledger transactions. This action cannot be undone.
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button type="button" variant="ghost" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            size="md"
            disabled={isLoading}
            isLoading={isLoading}
            onClick={onConfirm}
          >
            Delete Permanently
          </Button>
        </div>
      </div>
    </Modal>
  )
}
