export interface Player {
  id: string;
  name: string;
  chips: number;
  isMainPlayer: boolean;
  isActive: boolean; // Is it this player's turn?
  isHost: boolean;
}

export interface GameState {
  players: Player[];
  pot: number;
  currentPlayerId: string | null;
  smallBlind: number;
  bigBlind: number;
  currentRound: number;
}
