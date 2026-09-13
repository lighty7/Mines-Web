import React from 'react'
import { Search, Ban, CheckCircle2, Trash2, Edit3 } from 'lucide-react'
import { AdminPlayer } from '../../../api/admin.api'
import { CurrencyDisplay } from '../../ui/CurrencyDisplay'
import { Button } from '../../ui/Button'
import { Badge } from '../../ui/Badge'
import { Input } from '../../ui/Input'

interface PlayersTabProps {
  users: AdminPlayer[]
  totalUsers: number
  currentPage: number
  totalPages: number
  searchTerm: string
  statusFilter: 'ALL' | 'ACTIVE' | 'BANNED'
  onSearchChange: (term: string) => void
  onStatusFilterChange: (filter: 'ALL' | 'ACTIVE' | 'BANNED') => void
  onPageChange: (page: number) => void
  onToggleBan: (player: AdminPlayer) => void
  onAdjustBalance: (player: AdminPlayer) => void
  onDeleteUser: (player: AdminPlayer) => void
}

export const PlayersTab: React.FC<PlayersTabProps> = ({
  users,
  totalUsers,
  currentPage,
  totalPages,
  searchTerm,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
  onPageChange,
  onToggleBan,
  onAdjustBalance,
  onDeleteUser,
}) => {
  return (
    <div className="flex flex-col gap-5">
      {/* Search and Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface-2 p-4 rounded-2xl border border-border-default shadow-md">
        {/* Search input */}
        <div className="w-full sm:w-80">
          <Input
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by username or email..."
            leftIcon={<Search className="w-4 h-4 text-text-muted" />}
          />
        </div>

        {/* Status Filter tabs */}
        <div className="flex items-center gap-1.5 bg-surface-3 p-1 rounded-xl border border-border-default self-stretch sm:self-auto">
          {(['ALL', 'ACTIVE', 'BANNED'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => onStatusFilterChange(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === filter
                  ? 'bg-surface-1 text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {filter === 'ALL' ? 'All Players' : filter}
            </button>
          ))}
        </div>
      </div>

      {/* Players Table Container */}
      <div className="bg-surface-2 rounded-2xl border border-border-default overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-3 border-b border-border-default text-text-secondary font-semibold">
                <th className="py-3.5 px-4">Player</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Balance</th>
                <th className="py-3.5 px-4">Activity</th>
                <th className="py-3.5 px-4">Joined</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-text-muted">
                    No players found matching current query.
                  </td>
                </tr>
              ) : (
                users.map((player) => (
                  <tr key={player.id} className="hover:bg-surface-3/50 transition-colors">
                    {/* User Profile */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-surface-3 border border-border-default flex items-center justify-center text-primary font-bold text-xs">
                          {player.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-text-primary leading-tight">
                            {player.username}
                          </span>
                          <span className="text-[11px] text-text-muted">{player.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3 px-4">
                      <Badge variant={player.role === 'ADMIN' ? 'danger' : 'neutral'}>
                        {player.role}
                      </Badge>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      {player.isBanned ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-danger/15 text-danger border border-danger/30">
                          <Ban className="w-3 h-3" />
                          BANNED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/15 text-primary border border-primary/30">
                          <CheckCircle2 className="w-3 h-3" />
                          ACTIVE
                        </span>
                      )}
                    </td>

                    {/* Balance */}
                    <td className="py-3 px-4">
                      <CurrencyDisplay amount={player.balance} size="sm" className="text-primary font-bold" />
                    </td>

                    {/* Games Count */}
                    <td className="py-3 px-4 font-mono text-text-secondary">
                      {player.gamesCount} rounds
                    </td>

                    {/* Joined Date */}
                    <td className="py-3 px-4 text-text-muted text-[11px]">
                      {new Date(player.createdAt).toLocaleDateString()}
                    </td>

                    {/* Action Controls */}
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {/* Ban / Unban Toggle */}
                        <button
                          type="button"
                          onClick={() => onToggleBan(player)}
                          title={player.isBanned ? 'Unban Player' : 'Ban Player'}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            player.isBanned
                              ? 'bg-primary/15 border-primary/40 text-primary hover:bg-primary/25'
                              : 'bg-danger/15 border-danger/40 text-danger hover:bg-danger/25'
                          }`}
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>

                        {/* Adjust Balance */}
                        <button
                          type="button"
                          onClick={() => onAdjustBalance(player)}
                          title="Adjust Balance"
                          className="p-1.5 rounded-lg bg-surface-3 border border-border-default text-accent-gold hover:bg-surface-1 transition-all cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete User */}
                        <button
                          type="button"
                          onClick={() => onDeleteUser(player)}
                          title="Delete Account"
                          className="p-1.5 rounded-lg bg-surface-3 border border-border-default text-text-secondary hover:text-danger hover:bg-surface-1 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border-default text-xs text-text-secondary">
            <span>
              Page {currentPage} of {totalPages} ({totalUsers} total players)
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
