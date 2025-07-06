import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { GameService } from '../../services/game.service';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { GameState, Player } from '../../interfaces/game';
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
    selector: 'app-lobby-settings',
    standalone: true,
    imports: [CommonModule, DragDropModule, FormsModule, MatFormFieldModule, MatInputModule],
    templateUrl: './lobby-settings.component.html',
    styleUrls: ['./lobby-settings.component.css']
})
export class LobbySettingsComponent implements OnInit, OnChanges {
    @Input() lobby: GameState | null = null;

    pot: number = 0;
    smallBlind: number = 0;
    bigBlind: number = 0;

    lobbyId: string | null = null;
    players$: Observable<Player[]>;
    isHost: boolean = false;
    startingChips$: Observable<number>;
    smallBlind$: Observable<number>;
    bigBlind$: Observable<number>;

    constructor(
        private route: ActivatedRoute,
        public gameService: GameService
    ) {
        const gameState$ = this.gameService.gameState$.pipe(filter(state => state !== null));
        this.players$ = gameState$.pipe(map(state => state!.players));
        this.startingChips$ = gameState$.pipe(map(state => state!.startingChips));
        this.smallBlind$ = gameState$.pipe(map(state => state!.smallBlind));
        this.bigBlind$ = gameState$.pipe(map(state => state!.bigBlind));
    }

    ngOnInit(): void {
        this.lobbyId = this.route.snapshot.paramMap.get('id');
        this.gameService.gameState$.subscribe(lobby => {
            this.lobby = lobby;
            this.updateHostStatus();
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['lobby']) {
            this.updateHostStatus();
        }
    }

    private updateHostStatus(): void {
        this.isHost = this.lobby?.hostId === this.gameService.deviceId;
        console.log('Host Check - Lobby Host ID:', this.lobby?.hostId);
        console.log('Host Check - Local Device ID:', this.gameService.deviceId);
        console.log('Host Check - Is Host?:', this.isHost);
    }

    drop(event: CdkDragDrop<Player[]>) {
        this.players$.subscribe(players => {
            const newPlayerArray = [...players];
            moveItemInArray(newPlayerArray, event.previousIndex, event.currentIndex);
            if (this.lobbyId) {
                this.gameService.updatePlayerOrder(this.lobbyId, newPlayerArray);
            }
        }).unsubscribe();
    }

    updateSettings(): void {
        console.log(`Updating settings: Starting Chips: ${this.pot}, Small Blind: ${this.smallBlind}, Big Blind: ${this.bigBlind}`);

        if (this.lobbyId) {
            this.gameService.updateSettings(this.lobbyId, this.pot, this.smallBlind, this.bigBlind);
        }
    }

    startGame(): void {
        if (this.lobbyId) {
            this.gameService.startGame(this.lobbyId, this.pot, this.smallBlind, this.bigBlind);
        }
    }

}
