import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../environments/environment';
import { Subject } from 'rxjs';
import { GameState } from '../interfaces/game';

@Injectable({
    providedIn: 'root'
})
export class SignalrService {
    public hubConnection: signalR.HubConnection;
    public connectionId: string | null = null;
    public deviceId: string = '';

    public lobbyStateChanged = new Subject<GameState>();
    public gameStarted = new Subject<GameState>();
    public lobbySettingsChanged = new Subject<GameState>();

    constructor(@Inject(PLATFORM_ID) private platformId: Object) {
        if (isPlatformBrowser(this.platformId)) {
            this.deviceId = this.getOrSetDeviceId();
        }
        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(environment.hubUrl)
            .withAutomaticReconnect()
            .build();
    }

    public startConnection(): Promise<void> {
        return this.hubConnection
            .start()
            .then(() => {
                console.log('SignalR Connection started');
                this.connectionId = this.hubConnection.connectionId;
                this.registerServerEvents();
            })
            .catch(err => console.error('Error while starting connection: ' + err));
    }

    private registerServerEvents(): void {
        this.hubConnection.on('LobbyStateChanged', (lobbyState: GameState) => {
            this.lobbyStateChanged.next(lobbyState);
        });

        this.hubConnection.on('GameStarted', (lobby: GameState) => {
            this.gameStarted.next(lobby);
        });

        this.hubConnection.on('LobbySettingsChanged', (lobby: GameState) => {
            this.lobbySettingsChanged.next(lobby);
        });
    }

    public joinLobby(lobbyId: string, playerName: string): Promise<void> {
        return this.hubConnection.invoke('JoinLobby', lobbyId, playerName, this.deviceId);
    }

    public startGame(lobbyId: string, pot: number, smallBlind: number, bigBlind: number): Promise<void> {
        return this.hubConnection.invoke('StartGame', lobbyId, pot, smallBlind, bigBlind);
    }

    public updateSettings(lobbyId: string, startingChips: number, smallBlind: number, bigBlind: number): Promise<void> {
        return this.hubConnection.invoke('UpdateSettings', lobbyId, startingChips, smallBlind, bigBlind);
    }

    public updatePlayerOrder(lobbyId: string, players: any[]): Promise<void> {
        return this.hubConnection.invoke('UpdatePlayerOrder', lobbyId, players);
    }

    public leaveLobby(lobbyId: string): Promise<void> {
        return this.hubConnection.invoke('LeaveLobby', lobbyId);
    }

    private getOrSetDeviceId(): string {
        let deviceId = localStorage.getItem('deviceId');
        if (!deviceId) {
            deviceId = this.generateGuid();
            localStorage.setItem('deviceId', deviceId);
        }
        return deviceId;
    }

    private generateGuid(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}
