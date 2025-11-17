import { Card, CardColor, CardValue, Phase, Player, GameState } from './types';
import { v4 as uuidv4 } from 'uuid';

// Phase 10 definitions
export const PHASES: Phase[] = [
  { id: 1, name: 'Phase 1', description: '2 sets of 3', requirements: [{ type: 'set', count: 3 }, { type: 'set', count: 3 }] },
  { id: 2, name: 'Phase 2', description: '1 set of 3 + 1 run of 4', requirements: [{ type: 'set', count: 3 }, { type: 'run', count: 4 }] },
  { id: 3, name: 'Phase 3', description: '1 set of 4 + 1 run of 4', requirements: [{ type: 'set', count: 4 }, { type: 'run', count: 4 }] },
  { id: 4, name: 'Phase 4', description: '1 run of 7', requirements: [{ type: 'run', count: 7 }] },
  { id: 5, name: 'Phase 5', description: '1 run of 8', requirements: [{ type: 'run', count: 8 }] },
  { id: 6, name: 'Phase 6', description: '1 run of 9', requirements: [{ type: 'run', count: 9 }] },
  { id: 7, name: 'Phase 7', description: '2 sets of 4', requirements: [{ type: 'set', count: 4 }, { type: 'set', count: 4 }] },
  { id: 8, name: 'Phase 8', description: '7 cards of one color', requirements: [{ type: 'color', count: 7 }] },
  { id: 9, name: 'Phase 9', description: '1 set of 5 + 1 set of 2', requirements: [{ type: 'set', count: 5 }, { type: 'set', count: 2 }] },
  { id: 10, name: 'Phase 10', description: '1 set of 5 + 1 set of 3', requirements: [{ type: 'set', count: 5 }, { type: 'set', count: 3 }] },
];

// Create a standard Phase 10 deck
export function createDeck(): Card[] {
  const deck: Card[] = [];
  const colors: CardColor[] = ['red', 'blue', 'green', 'yellow'];
  const values: CardValue[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

  // Two copies of each numbered card per color
  for (let copy = 0; copy < 2; copy++) {
    for (const color of colors) {
      for (const value of values) {
        deck.push({
          id: uuidv4(),
          value,
          color,
        });
      }
    }
  }

  // Add 8 Wild cards
  for (let i = 0; i < 8; i++) {
    deck.push({
      id: uuidv4(),
      value: 'wild',
    });
  }

  // Add 4 Skip cards
  for (let i = 0; i < 4; i++) {
    deck.push({
      id: uuidv4(),
      value: 'skip',
    });
  }

  return shuffleDeck(deck);
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function dealInitialHands(deck: Card[], playerCount: number): { hands: Card[][], remainingDeck: Card[] } {
  const hands: Card[][] = [];
  const deckCopy = [...deck];

  for (let i = 0; i < playerCount; i++) {
    hands.push(deckCopy.splice(0, 10));
  }

  return { hands, remainingDeck: deckCopy };
}

export function drawCard(deck: Card[], discardPile: Card[]): { card: Card | null, newDeck: Card[], newDiscardPile: Card[] } {
  const deckCopy = [...deck];
  const discardCopy = [...discardPile];

  if (deckCopy.length === 0) {
    // Reshuffle discard pile into deck (keep top card)
    if (discardCopy.length > 1) {
      const topCard = discardCopy.pop()!;
      deckCopy.push(...shuffleDeck(discardCopy));
      discardCopy.length = 0;
      discardCopy.push(topCard);
    } else {
      return { card: null, newDeck: deckCopy, newDiscardPile: discardCopy };
    }
  }

  const card = deckCopy.pop() || null;
  return { card, newDeck: deckCopy, newDiscardPile: discardCopy };
}

export function isValidSet(cards: Card[]): boolean {
  if (cards.length < 2) return false;

  const nonWildCards = cards.filter(c => c.value !== 'wild');
  if (nonWildCards.length === 0) return false;

  const baseValue = nonWildCards[0].value;
  return nonWildCards.every(c => c.value === baseValue);
}

export function isValidRun(cards: Card[]): boolean {
  if (cards.length < 3) return false;

  const cardValues = cards.map(c => {
    if (c.value === 'wild') return null;
    if (c.value === 'skip') return null;
    return parseInt(c.value);
  });

  // Count wilds
  const wildCount = cardValues.filter(v => v === null).length;
  const numbers = cardValues.filter(v => v !== null).sort((a, b) => a! - b!) as number[];

  if (numbers.length === 0) return false;

  let usedWilds = 0;
  for (let i = 0; i < numbers.length - 1; i++) {
    const gap = numbers[i + 1] - numbers[i] - 1;
    if (gap < 0) return false; // Duplicate numbers
    usedWilds += gap;
    if (usedWilds > wildCount) return false;
  }

  return usedWilds <= wildCount;
}

export function isValidColor(cards: Card[]): boolean {
  if (cards.length === 0) return false;

  const nonWildCards = cards.filter(c => c.value !== 'wild' && c.value !== 'skip');
  if (nonWildCards.length === 0) return false;

  const baseColor = nonWildCards[0].color;
  return nonWildCards.every(c => c.color === baseColor);
}

export function validatePhaseCompletion(phase: Phase, groups: Card[][]): boolean {
  if (groups.length !== phase.requirements.length) return false;

  for (let i = 0; i < phase.requirements.length; i++) {
    const requirement = phase.requirements[i];
    const group = groups[i];

    if (group.length < requirement.count) return false;

    switch (requirement.type) {
      case 'set':
        if (!isValidSet(group)) return false;
        break;
      case 'run':
        if (!isValidRun(group)) return false;
        break;
      case 'color':
        if (!isValidColor(group)) return false;
        break;
    }
  }

  return true;
}

export function calculateScore(hand: Card[]): number {
  return hand.reduce((total, card) => {
    if (card.value === 'wild' || card.value === 'skip') return total + 25;
    if (parseInt(card.value) >= 10) return total + 10;
    return total + 5;
  }, 0);
}

export function canAddToGroup(card: Card, group: Card[], groupType: 'set' | 'run' | 'color'): boolean {
  const testGroup = [...group, card];

  switch (groupType) {
    case 'set':
      return isValidSet(testGroup);
    case 'run':
      return isValidRun(testGroup);
    case 'color':
      return isValidColor(testGroup);
    default:
      return false;
  }
}

export function generateShareCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function initializeGame(playerNames: string[]): GameState {
  const deck = createDeck();
  const { hands, remainingDeck } = dealInitialHands(deck, playerNames.length);

  const players: Player[] = playerNames.map((name, index) => ({
    id: uuidv4(),
    name,
    hand: hands[index],
    currentPhase: 1,
    score: 0,
    hasCompletedPhase: false,
    hasLaidDown: false,
  }));

  // Initialize discard pile with one card
  const discardPile = [remainingDeck.pop()!];

  return {
    id: uuidv4(),
    players,
    deck: remainingDeck,
    discardPile,
    currentPlayerIndex: 0,
    phase: 1,
    status: 'active',
    createdAt: new Date().toISOString(),
    shareCode: generateShareCode(),
  };
}
