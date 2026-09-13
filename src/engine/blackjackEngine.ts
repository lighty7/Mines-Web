import { Card, HandScore, Rank, Suit } from '../types/blackjack'

export const SUITS: Suit[] = ['SPADES', 'HEARTS', 'DIAMONDS', 'CLUBS']
export const RANKS: Rank[] = [
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'J',
  'Q',
  'K',
  'A',
]

export function createDeck(): Card[] {
  const deck: Card[] = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit })
    }
  }
  return deck
}

export function createShoe(deckCount: number = 6): Card[] {
  const shoe: Card[] = []
  for (let i = 0; i < deckCount; i++) {
    shoe.push(...createDeck())
  }
  // Standard in-place Fisher-Yates shuffle
  for (let i = shoe.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = shoe[i]
    shoe[i] = shoe[j]
    shoe[j] = temp
  }
  return shoe
}

export function calculateHandScore(cards: Card[]): HandScore {
  let score = 0
  let aces = 0

  for (const card of cards) {
    if (card.rank === '?') continue
    if (card.rank === 'A') {
      aces++
      score += 11
    } else if (['K', 'Q', 'J', '10'].includes(card.rank)) {
      score += 10
    } else {
      score += Number.parseInt(card.rank, 10)
    }
  }

  let isSoft = false
  while (score > 21 && aces > 0) {
    score -= 10
    aces--
  }

  if (aces > 0 && score <= 21) {
    isSoft = true
  }

  const isBust = score > 21
  const isBlackjack = cards.length === 2 && score === 21

  return {
    score,
    isSoft,
    isBust,
    isBlackjack,
  }
}

export function playDealerTurn(
  dealerCards: Card[],
  shoe: Card[]
): { finalCards: Card[]; finalScore: HandScore; remainingShoe: Card[] } {
  const cards = [...dealerCards]
  const currentShoe = [...shoe]

  let score = calculateHandScore(cards)
  while (score.score < 17) {
    const nextCard = currentShoe.shift()
    if (!nextCard) break
    cards.push(nextCard)
    score = calculateHandScore(cards)
  }

  return {
    finalCards: cards,
    finalScore: score,
    remainingShoe: currentShoe,
  }
}
