import React, { useEffect } from 'react'
import { RefreshCw } from 'lucide-react'
import { useBlackjackStore } from '../../store/blackjackStore'
import { useAuthStore } from '../../store/authStore'
import { useAudio } from '../../hooks/useAudio'
import { BlackjackTable } from './BlackjackTable'
import { BlackjackControls } from './BlackjackControls'
import { GameLayout } from '../layout/GameLayout'
import { Alert } from '../ui/Alert'

export const BlackjackView: React.FC = () => {
  const {
    bet,
    status,
    playerCards,
    playerScore,
    dealerCards,
    dealerScore,
    payout,
    isDealing,
    serverSeedHash,
    serverSeed,
    errorMessage,
    setBet,
    clearError,
    deal,
    hit,
    stand,
    double,
    reset,
  } = useBlackjackStore()

  const { user } = useAuthStore()
  const audio = useAudio()

  // Audio reactions on game state change
  useEffect(() => {
    if (status === 'WON') {
      audio.playBlackjackWin(playerScore.isBlackjack)
    } else if (status === 'LOST' && playerScore.isBust) {
      audio.playBust()
    }
  }, [status, playerScore.isBlackjack, playerScore.isBust, audio])

  const handleDeal = async () => {
    audio.playCardSlide()
    const ok = await deal()
    if (ok) {
      setTimeout(() => audio.playCardSlide(), 150)
      setTimeout(() => audio.playCardSlide(), 300)
    }
  }

  const handleHit = async () => {
    audio.playCardSlide()
    await hit()
  }

  const handleStand = async () => {
    audio.playCardFlip()
    await stand()
  }

  const handleDouble = async () => {
    audio.playCardSlide()
    await double()
  }

  return (
    <div className="w-full">
      {errorMessage && (
        <div className="mb-4">
          <Alert variant="error" onDismiss={clearError}>
            {errorMessage}
          </Alert>
        </div>
      )}

      <GameLayout
        icon="🃏"
        title="Blackjack 21"
        subtitle="Vegas Strip Rules · 6-Deck Shoe · Dealer stands on 17"
        rtp="99.5% RTP"
        isGuest={user.isGuest}
        accentColor="#22D3EE"
        serverSeedHash={serverSeedHash}
        serverSeed={serverSeed}
        headerRight={
          status !== 'IDLE' && status !== 'ACTIVE' ? (
            <button
              type="button"
              onClick={reset}
              className="p-1.5 rounded-lg bg-surface-3 border border-border-default hover:border-border-strong text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              title="Reset Table / New Deal"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          ) : undefined
        }
        controls={
          <BlackjackControls
            bet={bet}
            balance={user.balance}
            status={status}
            playerCardsCount={playerCards.length}
            isDealing={isDealing}
            onBetChange={setBet}
            onDeal={handleDeal}
            onHit={handleHit}
            onStand={handleStand}
            onDouble={handleDouble}
          />
        }
        playArea={
          <BlackjackTable
            dealerCards={dealerCards}
            dealerScore={dealerScore}
            playerCards={playerCards}
            playerScore={playerScore}
            status={status}
            payout={payout}
            bet={bet}
          />
        }
      />
    </div>
  )
}
