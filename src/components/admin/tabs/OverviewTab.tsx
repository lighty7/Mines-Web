import React from 'react'
import {
  Coins,
  TrendingUp,
  Users,
  Activity,
  BarChart3,
  Layers,
  Trophy,
  Sparkles,
  Flame,
  History,
} from 'lucide-react'
import { AdminStats, AdminDashboardData } from '../../../api/admin.api'
import { CurrencyDisplay } from '../../ui/CurrencyDisplay'
import { Badge } from '../../ui/Badge'

interface OverviewTabProps {
  stats: AdminStats | null
  dashboard: AdminDashboardData | null
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ stats, dashboard }) => {
  const overview = dashboard?.overview || {
    mainPot: stats?.mainPot || 0,
    totalWagered: stats?.totalWagered || 0,
    totalPayout: stats?.totalPayout || 0,
    houseProfit: stats?.houseProfit || 0,
    todayWagered: 0,
    todayProfit: 0,
    realizedRtp: 99.0,
    totalRounds: stats?.totalRounds || 0,
    wonRounds: stats?.wonRounds || 0,
    lostRounds: stats?.lostRounds || 0,
    winRate: 0,
    averageBet: 0,
    activePlayersCount: stats?.activePlayersCount || 0,
    totalUsersCount: stats?.totalUsersCount || 0,
    bannedUsersCount: stats?.bannedUsersCount || 0,
    newUsersLast7Days: 0,
  }

  const chartData = dashboard?.chart7Days || []
  const maxWageredInChart = Math.max(10, ...chartData.map((d) => d.wagered))

  const gridDist = dashboard?.gridDistribution || { '4x4': 0, '5x5': 0, '6x6': 0 }
  const totalGridGames = (gridDist['4x4'] || 0) + (gridDist['5x5'] || 0) + (gridDist['6x6'] || 0) || 1
  const pct4 = Math.round(((gridDist['4x4'] || 0) / totalGridGames) * 100)
  const pct5 = Math.round(((gridDist['5x5'] || 0) / totalGridGames) * 100)
  const pct6 = Math.round(((gridDist['6x6'] || 0) / totalGridGames) * 100)

  return (
    <div className="flex flex-col gap-6">
      {/* 4 KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Main Pot */}
        <div className="p-5 rounded-2xl bg-surface-2 border border-border-default shadow-xl flex flex-col gap-2">
          <div className="flex items-center justify-between text-text-secondary text-xs">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-accent-gold" />
              The Main Pot
            </span>
            <span className="text-[10px] font-mono text-text-muted">Circulating</span>
          </div>
          <div className="mt-1">
            <CurrencyDisplay amount={overview.mainPot} size="xl" className="text-accent-gold" />
          </div>
          <div className="flex items-center justify-between text-[11px] text-text-muted">
            <span>Platform backing:</span>
            <span className="font-mono font-bold text-primary">100% Reserve</span>
          </div>
        </div>

        {/* Card 2: 24h Volume & Net */}
        <div className="p-5 rounded-2xl bg-surface-2 border border-border-default shadow-xl flex flex-col gap-2">
          <div className="flex items-center justify-between text-text-secondary text-xs">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-primary" />
              24h Volume & Net
            </span>
            <span
              className={`text-[10px] font-mono font-bold ${
                overview.todayProfit >= 0 ? 'text-primary' : 'text-danger'
              }`}
            >
              {overview.todayProfit >= 0 ? `+${overview.todayProfit.toFixed(0)} MC` : `${overview.todayProfit.toFixed(0)} MC`}
            </span>
          </div>
          <div className="mt-1">
            <CurrencyDisplay amount={overview.todayWagered} size="xl" />
          </div>
          <div className="flex items-center justify-between text-[11px] text-text-muted">
            <span>House Net Profit:</span>
            <span
              className={`font-mono font-bold ${
                overview.todayProfit >= 0 ? 'text-primary' : 'text-danger'
              }`}
            >
              {overview.todayProfit >= 0 ? '+' : ''}{overview.todayProfit.toFixed(2)} MC
            </span>
          </div>
        </div>

        {/* Card 3: Total GGR & RTP */}
        <div className="p-5 rounded-2xl bg-surface-2 border border-border-default shadow-xl flex flex-col gap-2">
          <div className="flex items-center justify-between text-text-secondary text-xs">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-primary" />
              Gross Revenue & RTP
            </span>
            <Badge variant="primary" size="sm">
              {overview.realizedRtp}% RTP
            </Badge>
          </div>
          <div className="mt-1">
            <CurrencyDisplay amount={overview.houseProfit} size="xl" className="text-primary" />
          </div>
          <div className="flex items-center justify-between text-[11px] text-text-muted">
            <span>Win Rate:</span>
            <span className="font-mono font-bold text-text-primary">
              {overview.winRate}% ({overview.wonRounds}W / {overview.lostRounds}L)
            </span>
          </div>
        </div>

        {/* Card 4: Player Base */}
        <div className="p-5 rounded-2xl bg-surface-2 border border-border-default shadow-xl flex flex-col gap-2">
          <div className="flex items-center justify-between text-text-secondary text-xs">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-accent-cyan" />
              Player Base
            </span>
            <span className="text-[10px] font-mono text-text-secondary">
              +{overview.newUsersLast7Days} this week
            </span>
          </div>
          <div className="text-3xl font-black font-mono text-text-primary mt-1">
            {overview.totalUsersCount}
            <span className="text-xs font-sans font-normal text-text-secondary ml-1.5">accounts</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-text-muted">
            <span>Active now:</span>
            <span className="font-mono font-bold text-primary flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
              {overview.activePlayersCount} live sessions
            </span>
          </div>
        </div>
      </div>

      {/* 7-Day Performance & Trends Bar Chart */}
      <div className="p-5 rounded-2xl bg-surface-2 border border-border-default shadow-xl flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-text-primary">
              7-Day Volume & House Profit Trends
            </h3>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-text-secondary">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-primary/80" />
              <span>Wagered Volume</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-accent-gold/80" />
              <span>House Profit</span>
            </div>
          </div>
        </div>

        {chartData.length > 0 ? (
          <div className="flex items-end justify-between gap-2 pt-8 pb-2 h-48 border-b border-border-subtle">
            {chartData.map((d) => {
              const wagerHeight = Math.max(10, Math.min(100, Math.round((d.wagered / maxWageredInChart) * 100)))
              const profitHeight = Math.max(6, Math.min(100, Math.round((Math.max(0, d.profit) / maxWageredInChart) * 100)))
              const dateFormatted = new Date(d.date).toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'numeric',
                day: 'numeric',
              })

              return (
                <div key={d.date} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 z-20 pointer-events-none bg-black/90 border border-border-default px-2.5 py-1.5 rounded-xl shadow-xl text-[10px] font-mono text-center whitespace-nowrap">
                    <div className="font-bold text-text-primary">{dateFormatted}</div>
                    <div className="text-primary font-bold">Wager: {d.wagered.toFixed(2)} MC</div>
                    <div className="text-accent-gold font-bold">Profit: {d.profit.toFixed(2)} MC</div>
                    <div className="text-text-muted">{d.rounds} rounds</div>
                  </div>

                  {/* Bars Container */}
                  <div className="w-full max-w-[42px] flex items-end justify-center gap-1 h-full">
                    <div
                      style={{ height: `${wagerHeight}%` }}
                      className="w-1/2 bg-gradient-to-t from-primary/40 to-primary rounded-t-md transition-all duration-500 group-hover:brightness-125"
                    />
                    <div
                      style={{ height: `${profitHeight}%` }}
                      className="w-1/2 bg-gradient-to-t from-accent-gold/40 to-accent-gold rounded-t-md transition-all duration-500 group-hover:brightness-125"
                    />
                  </div>

                  <span className="text-[10px] font-mono text-text-secondary mt-2 truncate w-full text-center">
                    {dateFormatted}
                  </span>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-text-muted text-xs">
            Gathering 7-day trend metrics...
          </div>
        )}
      </div>

      {/* Grid Size Distribution & Jackpot of All Time & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grid Distribution */}
        <div className="p-5 rounded-2xl bg-surface-2 border border-border-default shadow-xl flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-accent-cyan" />
            <h3 className="text-sm font-bold text-text-primary">Grid Size Popularity</h3>
          </div>

          <div className="flex flex-col gap-3 text-xs">
            {/* 4x4 */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between font-mono">
                <span className="text-text-secondary font-semibold">4x4 Quick Grid (16 Tiles)</span>
                <span className="font-bold text-purple-400">{gridDist['4x4']} rounds ({pct4}%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-3 overflow-hidden">
                <div style={{ width: `${pct4}%` }} className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" />
              </div>
            </div>

            {/* 5x5 */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between font-mono">
                <span className="text-text-secondary font-semibold">5x5 Classic Standard (25 Tiles)</span>
                <span className="font-bold text-primary">{gridDist['5x5']} rounds ({pct5}%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-3 overflow-hidden">
                <div style={{ width: `${pct5}%` }} className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full" />
              </div>
            </div>

            {/* 6x6 */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between font-mono">
                <span className="text-text-secondary font-semibold">6x6 High Stakes (36 Tiles)</span>
                <span className="font-bold text-accent-gold">{gridDist['6x6']} rounds ({pct6}%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-3 overflow-hidden">
                <div style={{ width: `${pct6}%` }} className="h-full bg-gradient-to-r from-accent-gold to-amber-500 rounded-full" />
              </div>
            </div>
          </div>

          <p className="text-[11px] text-text-muted mt-auto pt-2 border-t border-border-subtle">
            Calculated across {totalGridGames} total recorded player rounds.
          </p>
        </div>

        {/* Highest Win Jackpot Showcase */}
        <div className="p-5 rounded-2xl bg-surface-2 border-2 border-accent-gold/40 shadow-xl flex flex-col justify-between gap-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-accent-gold" />
              <h3 className="text-sm font-bold text-accent-gold uppercase tracking-wider">
                Jackpot of All Time
              </h3>
            </div>
            <Sparkles className="w-4 h-4 text-accent-gold animate-pulse" />
          </div>

          {dashboard?.highestWin ? (
            <div className="flex flex-col gap-2 my-auto">
              <span className="text-xs text-text-secondary font-semibold">All-Time Record Winner</span>
              <div className="text-xl font-black text-text-primary flex items-center gap-2">
                <span>{dashboard.highestWin.username}</span>
                <span className="px-2 py-0.5 rounded-full bg-accent-gold/20 text-accent-gold text-xs font-mono font-bold border border-accent-gold/30">
                  {dashboard.highestWin.multiplier.toFixed(2)}x
                </span>
              </div>
              <div className="mt-1">
                <CurrencyDisplay amount={dashboard.highestWin.amount} size="xl" className="text-accent-gold" />
              </div>
              <span className="text-[11px] text-text-muted font-mono">
                Won on {new Date(dashboard.highestWin.createdAt).toLocaleDateString()}
              </span>
            </div>
          ) : (
            <div className="py-6 text-center text-text-muted text-xs my-auto">
              No recorded wins yet.
            </div>
          )}

          <div className="flex items-center gap-1.5 text-[11px] text-accent-gold/80 bg-accent-gold/10 p-2.5 rounded-xl border border-accent-gold/20">
            <Flame className="w-3.5 h-3.5 flex-shrink-0 text-accent-gold" />
            <span>Fairness backed by SHA-256 verifiable seed hashes.</span>
          </div>
        </div>

        {/* Top Winners High-Roller Board */}
        <div className="p-5 rounded-2xl bg-surface-2 border border-border-default shadow-xl flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-text-primary">Top Winners Leaderboard</h3>
          </div>

          {dashboard?.topWinners && dashboard.topWinners.length > 0 ? (
            <div className="flex flex-col gap-2 divide-y divide-border-subtle">
              {dashboard.topWinners.map((w: any, idx: number) => (
                <div key={w.id} className="pt-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[10px] ${
                        idx === 0
                          ? 'bg-accent-gold text-black'
                          : idx === 1
                          ? 'bg-slate-300 text-black'
                          : idx === 2
                          ? 'bg-amber-600 text-white'
                          : 'bg-surface-3 text-text-secondary'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="font-bold text-text-primary">{w.username}</span>
                  </div>
                  <div className="font-mono text-right">
                    <div className="font-bold text-primary">{w.balance.toFixed(2)} MC</div>
                    <div className="text-[10px] text-text-muted">
                      {w.totalProfit >= 0 ? `+${w.totalProfit.toFixed(0)} MC profit` : `${w.totalProfit.toFixed(0)} MC`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-text-muted text-xs">
              No leaderboard data available yet.
            </div>
          )}
        </div>
      </div>

      {/* Platform Activity Audit Log (Last 15 Events) */}
      <div className="p-5 rounded-2xl bg-surface-2 border border-border-default shadow-xl flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-text-primary">Platform Activity Audit Log</h3>
          </div>
          <span className="text-xs text-text-secondary font-mono">Last 15 Live Transactions</span>
        </div>

        {dashboard?.recentActivity && dashboard.recentActivity.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border-default text-text-secondary font-semibold">
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Player</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle font-mono">
                {dashboard.recentActivity.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-surface-3/50 transition-colors">
                    <td className="py-2.5 px-3">
                      <Badge
                        variant={
                          tx.type === 'WIN'
                            ? 'success'
                            : tx.type === 'BET'
                            ? 'gold'
                            : tx.type === 'ADMIN_ADJUST'
                            ? 'cyan'
                            : 'muted'
                        }
                        size="sm"
                      >
                        {tx.type}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 font-sans font-bold text-text-primary">
                      {tx.username}
                    </td>
                    <td className="py-2.5 px-3 font-bold">
                      <CurrencyDisplay
                        amount={tx.amount}
                        size="xs"
                        showSign
                        coloring
                      />
                    </td>
                    <td className="py-2.5 px-3 text-right text-text-muted text-[11px]">
                      {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-text-muted text-xs">
            No activity transactions recorded yet.
          </div>
        )}
      </div>
    </div>
  )
}
