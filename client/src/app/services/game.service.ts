import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GameState, Player } from '../interfaces/game';
import { SignalrService } from './signalr.service';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class GameService {
    private readonly _gameState = new BehaviorSubject<GameState | null>(null);
    readonly gameState$: Observable<GameState | null> = this._gameState.asObservable();
    public deviceId: string = '';
 
     constructor(private signalrService: SignalrService, private router: Router) {
        this.deviceId = this.signalrService.deviceId;
        this.registerGameEvents();
    }

    private registerGameEvents(): void {
        this.signalrService.lobbyStateChanged.subscribe((lobbyState: GameState) => {
            this.updateGameState(lobbyState);
        });

        this.signalrService.gameStarted.subscribe((lobby: GameState) => {
            this.updateGameState(lobby);
            this.router.navigate(['/game', lobby.id]);
        });

        this.signalrService.lobbySettingsChanged.subscribe((lobby: GameState) => {
            this.updateGameState(lobby);
        });
    }

    public async initializeLobby(lobbyId: string, playerName: string): Promise<void> {
        if (this.signalrService.hubConnection.state !== 'Connected') {
            await this.signalrService.startConnection();
        }
        await this.signalrService.joinLobby(lobbyId, playerName);
    }

    public startGame(lobbyId: string, pot: number, smallBlind: number, bigBlind: number): void {
        this.signalrService.startGame(lobbyId, pot, smallBlind, bigBlind);
    }

    public updateSettings(lobbyId: string, startingChips: number, smallBlind: number, bigBlind: number): void {
        this.signalrService.updateSettings(lobbyId, startingChips, smallBlind, bigBlind);
    }

    public updatePlayerOrder(lobbyId: string, players: Player[]): void {
        this.signalrService.updatePlayerOrder(lobbyId, players);
    }

    public leaveLobby(lobbyId: string): void {
        this.signalrService.leaveLobby(lobbyId);
        this._gameState.next(null);
        this.router.navigate(['/']);
    }

    public check(): void {
        const lobbyId = this._gameState.getValue()?.id;
        if (lobbyId) {
            this.signalrService.hubConnection.invoke('Check', lobbyId);
        }
    }

    public fold(): void {
        const lobbyId = this._gameState.getValue()?.id;
        if (lobbyId) {
            this.signalrService.hubConnection.invoke('Fold', lobbyId);
        }
    }

    public call(): void {
        const lobbyId = this._gameState.getValue()?.id;
        if (lobbyId) {
            this.signalrService.hubConnection.invoke('Call', lobbyId);
        }
    }

    public raise(amount: number): void {
        const lobbyId = this._gameState.getValue()?.id;
        if (lobbyId) {
            this.signalrService.hubConnection.invoke('Raise', lobbyId, amount);
        }
    }

    private updateGameState(lobbyState: GameState): void {
        const mainPlayer = lobbyState.players.find(p => p.id === this.deviceId);
        if (mainPlayer) {
            mainPlayer.isMainPlayer = true;
        }
        this._gameState.next(lobbyState);
    }
}
