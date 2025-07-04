import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GameState, Player } from '../interfaces/game';
import { SignalrService } from './signalr.service';
import { Router } from '@angular/router';
import { GameStartedEvent } from '../interfaces/game-started-event';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private readonly _gameState = new BehaviorSubject<GameState>({
    players: [],
    pot: 0,
    currentPlayerId: null,
    smallBlind: 0,
    bigBlind: 0,
    currentRound: 0,
  });

  readonly gameState$: Observable<GameState> = this._gameState.asObservable();

  constructor(private signalrService: SignalrService, private router: Router) {
    this.registerGameEvents();
  }

  private registerGameEvents(): void {
    this.signalrService.lobbyStateChanged.subscribe((lobbyState: any) => {
      const currentState = this._gameState.getValue();
      this._gameState.next({
        ...currentState,
        players: lobbyState.players.map((p: any) => ({
          ...p,
          isMainPlayer: p.id === this.signalrService.connectionId
        }))
      });
    });

    this.signalrService.lobbySettingsChanged.subscribe((settings: any) => {
      const currentState = this._gameState.getValue();
      this._gameState.next({
        ...currentState,
        smallBlind: settings.smallBlind,
        bigBlind: settings.bigBlind,
        players: currentState.players.map(p => ({ ...p, chips: settings.startingChips }))
      });
    });

    this.signalrService.gameStarted.subscribe((event: any) => {
      const { id, lobby } = event;
      const initialState: GameState = {
        players: lobby.players.map((p: any) => ({
          ...p,
          isMainPlayer: p.id === this.signalrService.connectionId,
          chips: lobby.settings.startingChips
        })),
        pot: 0,
        currentPlayerId: lobby.players[0].id,
        smallBlind: lobby.settings.smallBlind,
        bigBlind: lobby.settings.bigBlind,
        currentRound: lobby.currentRound,
      };

      this._gameState.next(initialState);
      this.router.navigate(['/game', id]);
    });
  }

  public initializeLobby(lobbyId: string, playerName: string, isHost: boolean = false): void {
    const initialize = () => {
      if (isHost) {
        const hostPlayer: Player = {
          id: '', // Will be replaced by server
          name: playerName,
          chips: 0,
          isMainPlayer: true,
          isActive: false,
          isHost: true
        };
        this._gameState.next({ ...this._gameState.getValue(), players: [hostPlayer] });
      }
      this.signalrService.joinLobby(lobbyId, playerName);
    };

    if (this.signalrService.hubConnection.state === 'Connected') {
      initialize();
    } else {
      this.signalrService.startConnection().then(initialize);
    }
  }

  public startGame(lobbyId: string, settings: any): void {
    this.signalrService.startGame(lobbyId, settings);
  }

  public updateSettings(lobbyId: string, settings: any): void {
    this.signalrService.updateSettings(lobbyId, settings);
  }

  public updatePlayerOrder(lobbyId: string, players: any[]): void {
    this.signalrService.updatePlayerOrder(lobbyId, players);
  }

  public leaveLobby(lobbyId: string): void {
    this.signalrService.leaveLobby(lobbyId);
  }

  private generatePlayerId(name: string): string {
    return `${name.toLowerCase().replace(/\s/g, '-')}-${Math.random().toString(36).substring(2, 6)}`;
  }

  public call(): void {
    const lobbyId = this._gameState.getValue().players[0]?.id.split('-')[0];
    // In a real app, you'd send more context, like the amount to call
    this.signalrService.hubConnection.invoke('Call', lobbyId);
  }

  public check(): void {
    const lobbyId = this._gameState.getValue().players[0]?.id.split('-')[0];
    this.signalrService.hubConnection.invoke('Check', lobbyId);
  }

  public fold(): void {
    const lobbyId = this._gameState.getValue().players[0]?.id.split('-')[0];
    this.signalrService.hubConnection.invoke('Fold', lobbyId);
  }
}
