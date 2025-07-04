import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../environments/environment';
import { Subject } from 'rxjs';
import { GameStartedEvent } from '../interfaces/game-started-event';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  public hubConnection: signalR.HubConnection;
  public connectionId: string | null = null;

  // Subjects to broadcast received data
  public playerJoined = new Subject<string>();
  public gameStarted = new Subject<GameStartedEvent>();
  public playerLeft = new Subject<string>();
  public lobbyStateChanged = new Subject<any>();
  public lobbySettingsChanged = new Subject<any>();

  constructor() {
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
    this.hubConnection.on('PlayerJoined', (playerName: string) => {
      this.playerJoined.next(playerName);
    });

    this.hubConnection.on('GameStarted', (lobby: any) => {
      this.gameStarted.next(lobby);
    });

    this.hubConnection.on('PlayerLeft', (playerName: string) => {
      this.playerLeft.next(playerName);
    });

    this.hubConnection.on('LobbyStateChanged', (lobbyState: any) => {
      this.lobbyStateChanged.next(lobbyState);
    });

    this.hubConnection.on('LobbySettingsChanged', (settings: any) => {
      this.lobbySettingsChanged.next(settings);
    });
  }

  public updateSettings(lobbyId: string, settings: any): Promise<void> {
    return this.hubConnection.invoke('UpdateSettings', lobbyId, settings);
  }

  public updatePlayerOrder(lobbyId: string, players: any[]): Promise<void> {
    return this.hubConnection.invoke('UpdatePlayerOrder', lobbyId, players);
  }

  public joinLobby(lobbyId: string, playerName: string): Promise<void> {
    return this.hubConnection.invoke('JoinLobby', lobbyId, playerName);
  }

  public startGame(lobbyId: string, settings: any): Promise<void> {
    return this.hubConnection.invoke('StartGame', lobbyId, settings);
  }

  public leaveLobby(lobbyId: string): Promise<void> {
    return this.hubConnection.invoke('LeaveLobby', lobbyId);
  }
}
