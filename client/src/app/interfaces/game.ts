export interface Card {
  suit: string;
  rank: string;
}

export interface Player {
  id: string;
  name: string;
  chips: number;
  hand: Card[];
  isMainPlayer: boolean;
  isActive: boolean; // Is it this player's turn?
  isHost: boolean;
  currentBet: number;
  hasActed: boolean;
  pot: number;
  isSmallBlind: boolean;
  isBigBlind: boolean;
  isTurn: boolean;
}

export interface GameState {
  id: string;
  hostId: string;
  players: Player[];
  communityCards: Card[];
  pot: number;
  currentPlayerId: string | null;
  smallBlind: number;
  bigBlind: number;
  currentRound: number;
  startingChips: number;
  smallBlindIndex: number;
  bigBlindIndex: number;
  currentBet: number;
}
