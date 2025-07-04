import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '../../services/game.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent {
  createdLobbyId: string | null = null;

  constructor(private router: Router, private gameService: GameService) { }

  createLobby(name: string): void {
    const playerName = name || this.generateRandomName();
    this.createdLobbyId = this.generateLobbyId();
    this.gameService.initializeLobby(this.createdLobbyId, playerName, true);
    this.router.navigate(['/settings', this.createdLobbyId], { state: { playerName } });
  }

  joinLobby(name: string, lobbyId: string): void {
    if (!lobbyId) return;
    const playerName = name || this.generateRandomName();
    this.gameService.initializeLobby(lobbyId, playerName, false);
    this.router.navigate(['/settings', lobbyId], { state: { playerName } });
  }

  private generateRandomName(): string {
    return `Player${Math.floor(Math.random() * 1000)}`;
  }

  private generateLobbyId(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}
