export type CardColor = 'red' | 'blue' | 'green' | 'yellow';
export type CardValue = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12' | 'wild' | 'skip';

export interface Card {
  id: string;
  value: CardValue;
  color?: CardColor;
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  currentPhase: number;
  score: number;
  hasCompletedPhase: boolean;
  hasLaidDown: boolean;
}

export interface Phase {
  id: number;
  name: string;
  description: string;
  requirements: PhaseRequirement[];
}

export interface PhaseRequirement {
  type: 'set' | 'run' | 'color' | 'even' | 'odd';
  count: number;
}

export interface GameState {
  id: string;
  players: Player[];
  deck: Card[];
  discardPile: Card[];
  currentPlayerIndex: number;
  phase: number;
  status: 'waiting' | 'active' | 'completed';
  winner?: string;
  createdAt: string;
  shareCode: string;
}

export interface LayedDownCards {
  playerId: string;
  groups: Card[][];
}
