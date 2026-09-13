import React from 'react'
import {
  Activity,
  Coins,
  TrendingUp,
  AlertTriangle,
  StopCircle,
  Clock,
  RefreshCw,
  DollarSign,
  Ban,
} from 'lucide-react'
import { UnifiedActiveRound } from '../../../api/admin.api'
import { CurrencyDisplay } from '../../ui/CurrencyDisplay'
import { Button } from '../../ui/Button'
import { Badge } from '../../ui/Badge'

interface LiveRoundsTabProps {
  activeRounds: UnifiedActiveRound[]
  activeRoundsFilter: 'ALL' | 'mines' | 'coinflip' | 'blackjack'
  setActiveRoundsFilter: (filter: 'ALL' | 'mines' | 'coinflip' | 'blackjack') => void
  autoRefreshSecs: number
  setAutoRefreshSecs: (secs: number) => void
  fetchActiveRounds: () => void
  onSelectRoundForStop: (round: UnifiedActiveRound, action: 'REFUND' | 'CASHOUT') => void
  onTriggerEmergencyStop: () => void
  isStoppingRound: boolean
}

export const LiveRoundsTab: React.FC<LiveRoundsTabProps> = ({
  activeRounds,
  activeRoundsFilter,
  setActiveRoundsFilter,
  autoRefreshSecs,
  setAutoRefreshSecs,
  fetchActiveRounds,
  onSelectRoundForStop,
  onTriggerEmergencyStop,
  isStoppingRound,
}) => {
  const totalStakes = activeRounds.reduce((acc, r) => acc + (r.bet || 0), 0)
  const totalExposure = activeRounds.reduce((acc, r) => acc + (r.potentialWin || 0), 0)

  return (
    <div className="flex flex-col gap-6">
      {/* Metrics and Emergency Actions Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Total Active Sessions */}
        <div className="p-4 rounded-2xl bg-surface-2 border border-border-default flex items-center justify-between shadow-md">
          <div>
            <span className="text-xs text-text-secondary font-semibold block">Active Sessions</span>
            <span className="text-xl font-black text-text-primary font-mono mt-0.5 block">
              {activeRounds.length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        {/* Stat 2: Active Stakes at Risk */}
        <div className="p-4 rounded-2xl bg-surface-2 border border-border-default flex items-center justify-between shadow-md">
          <div>
            <span className="text-xs text-text-secondary font-semibold block">Live Stakes at Risk</span>
            <div className="mt-0.5">
              <CurrencyDisplay amount={totalStakes} size="lg" className="text-accent-gold" />
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center text-accent-gold">
            <Coins className="w-5 h-5" />
          </div>
        </div>

        {/* Stat 3: Max Potential Exposure */}
        <div className="p-4 rounded-2xl bg-surface-2 border border-border-default flex items-center justify-between shadow-md">
          <div>
            <span className="text-xs text-text-secondary font-semibold block">Potential Exposure</span>
            <div className="mt-0.5">
              <CurrencyDisplay amount={totalExposure} size="lg" className="text-primary" />
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Emergency Stop All Action */}
        <div className="p-4 rounded-2xl bg-danger/10 border border-danger/40 flex flex-col justify-between gap-2 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-danger font-bold uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-danger" />
              Panic Switch
            </span>
            <span className="text-[10px] text-text-muted font-mono">{activeRounds.length} live</span>
          </div>
          <Button
            type="button"
            variant="danger"
            size="sm"
            fullWidth
            onClick={onTriggerEmergencyStop}
            disabled={activeRounds.length === 0 || isStoppingRound}
            leftIcon={<StopCircle className="w-4 h-4" />}
          >
            Stop All Live Rounds
          </Button>
        </div>
      </div>

      {/* Filter & Stream Controls Container */}
      <div className="p-5 rounded-2xl bg-surface-2 border border-border-default shadow-xl flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle pb-3">
          {/* Game filter tabs */}
          <div className="flex items-center gap-1.5 bg-surface-3 p-1 rounded-xl border border-border-default text-xs font-semibold">
            {[
              { id: 'ALL', label: 'All Games' },
              { id: 'mines', label: '💣 Mines' },
              { id: 'coinflip', label: '🪙 Coin Flip' },
              { id: 'blackjack', label: '🃏 Blackjack' },
            ].map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveRoundsFilter(filter.id as any)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeRoundsFilter === filter.id
                    ? 'bg-primary text-black font-bold shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Auto-Refresh Timer Selector */}
          <div className="flex items-center gap-2 text-xs">
            <Clock className="w-3.5 h-3.5 text-text-secondary" />
            <span className="text-text-secondary font-semibold">Stream Poll:</span>
            <div className="flex items-center gap-1 bg-surface-3 p-1 rounded-lg border border-border-default font-mono text-[11px]">
              {[
                { s: 3, l: '3s' },
                { s: 5, l: '5s' },
                { s: 10, l: '10s' },
                { s: 0, l: 'Off' },
              ].map((rate) => (
                <button
                  key={rate.l}
                  type="button"
                  onClick={() => setAutoRefreshSecs(rate.s)}
                  className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                    autoRefreshSecs === rate.s
                      ? 'bg-surface-1 text-primary font-bold shadow-xs'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {rate.l}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={fetchActiveRounds}
              title="Refresh Stream Now"
              className="p-1.5 rounded-lg bg-surface-3 border border-border-default text-text-secondary hover:text-text-primary ml-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Live Rounds Table */}
        {activeRounds && activeRounds.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border-default text-text-secondary font-semibold">
                  <th className="py-2.5 px-3">Game</th>
                  <th className="py-2.5 px-3">Player</th>
                  <th className="py-2.5 px-3">Wager</th>
                  <th className="py-2.5 px-3">Live Progress</th>
                  <th className="py-2.5 px-3">Multiplier</th>
                  <th className="py-2.5 px-3">Potential Win</th>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3 text-right">Intervention</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle font-mono">
                {activeRounds.map((round) => {
                  const gameIcon =
                    round.gameType === 'coinflip' ? '🪙' : round.gameType === 'blackjack' ? '🃏' : '💣'
                  const badgeVariant =
                    round.gameType === 'coinflip' ? 'gold' : round.gameType === 'blackjack' ? 'cyan' : 'danger'

                  const canForceCashout =
                    (round.gameType === 'mines' && (round.revealedCount || 0) > 0) ||
                    (round.gameType === 'coinflip' && (round.streak || 0) > 0)

                  return (
                    <tr key={`${round.gameType}-${round.id}`} className="hover:bg-surface-3/50 transition-colors">
                      <td className="py-3 px-3">
                        <Badge variant={badgeVariant as any} size="sm">
                          <span>{gameIcon}</span>
                          <span>{round.gameType}</span>
                        </Badge>
                      </td>

                      <td className="py-3 px-3 font-sans">
                        <div className="font-bold text-text-primary">{round.username}</div>
                        <div className="text-[10px] text-text-muted truncate max-w-[140px]">
                          {round.email}
                        </div>
                      </td>

                      <td className="py-3 px-3 font-bold text-accent-gold">
                        <CurrencyDisplay amount={round.bet} size="xs" />
                      </td>

                      <td className="py-3 px-3 font-sans text-xs text-text-secondary">
                        <span className="bg-surface-3 px-2 py-1 rounded-md border border-border-default">
                          {round.stateSummary}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-bold text-primary">
                        {round.multiplier.toFixed(2)}x
                      </td>

                      <td className="py-3 px-3 font-bold text-primary">
                        <CurrencyDisplay amount={round.potentialWin} size="xs" />
                      </td>

                      <td className="py-3 px-3 text-text-muted text-[11px]">
                        {new Date(round.createdAt).toLocaleTimeString()}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {canForceCashout && (
                            <button
                              type="button"
                              onClick={() => onSelectRoundForStop(round, 'CASHOUT')}
                              className="px-2.5 py-1 rounded-lg bg-primary/15 border border-primary/40 hover:bg-primary/30 text-primary text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                              title="Force Cashout at Current Value"
                            >
                              <DollarSign className="w-3 h-3" />
                              <span>Cashout</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => onSelectRoundForStop(round, 'REFUND')}
                            className="px-2.5 py-1 rounded-lg bg-danger/15 border border-danger/40 hover:bg-danger/30 text-danger text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                            title="Stop and Refund Wager"
                          >
                            <Ban className="w-3 h-3" />
                            <span>Stop & Refund</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-text-muted text-xs">
            No live active rounds found for current filter.
          </div>
        )}
      </div>
    </div>
  )
}
