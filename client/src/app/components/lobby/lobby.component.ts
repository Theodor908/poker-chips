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
    constructor(private router: Router, private gameService: GameService) { }

    async createLobby(name: string): Promise<void> {
        const playerName = name || this.generateRandomName();
        const lobbyId = this.generateLobbyId();
        await this.gameService.initializeLobby(lobbyId, playerName);
        this.router.navigate(['/settings', lobbyId]);
    }

    async joinLobby(name: string, lobbyId: string): Promise<void> {
        if (!lobbyId) return;
        const playerName = name || this.generateRandomName();
        await this.gameService.initializeLobby(lobbyId, playerName);
        this.router.navigate(['/settings', lobbyId]);
    }

    private generateRandomName(): string {
        return `Player${Math.floor(Math.random() * 1000)}`;
    }

    private generateLobbyId(): string {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }
}
