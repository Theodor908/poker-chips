import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from '../../services/game.service';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { Player } from '../../interfaces/game';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Component({
  selector: 'app-lobby-settings',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './lobby-settings.component.html',
  styleUrls: ['./lobby-settings.component.css']
})
export class LobbySettingsComponent implements OnInit {
  @ViewChild('startingChipsInput') startingChipsInput!: ElementRef<HTMLInputElement>;
  @ViewChild('smallBlindInput') smallBlindInput!: ElementRef<HTMLInputElement>;
  @ViewChild('bigBlindInput') bigBlindInput!: ElementRef<HTMLInputElement>;

  lobbyId: string | null = null;
  players$: Observable<Player[]>;
  isHost$: Observable<boolean>;
  startingChips$: Observable<number>;
  smallBlind$: Observable<number>;
  bigBlind$: Observable<number>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public gameService: GameService
  ) {
    this.players$ = this.gameService.gameState$.pipe(map(state => state.players));
    this.isHost$ = this.players$.pipe(
      map(players => players.find(p => p.isMainPlayer)?.isHost === true)
    );
    this.startingChips$ = this.gameService.gameState$.pipe(map(state => state.players[0]?.chips ?? 1000));
    this.smallBlind$ = this.gameService.gameState$.pipe(map(state => state.smallBlind));
    this.bigBlind$ = this.gameService.gameState$.pipe(map(state => state.bigBlind));
  }

  ngOnInit(): void {
    this.lobbyId = this.route.snapshot.paramMap.get('id');
    const navigation = this.router.getCurrentNavigation();
    const playerName = navigation?.extras.state?.['playerName'];

    if (this.lobbyId && playerName) {
      this.gameService.initializeLobby(this.lobbyId, playerName);
    }
  }

  drop(event: CdkDragDrop<Player[]>) {
    this.players$.pipe(take(1)).subscribe(players => {
      const newPlayerArray = [...players];
      moveItemInArray(newPlayerArray, event.previousIndex, event.currentIndex);
      if (this.lobbyId) {
        this.gameService.updatePlayerOrder(this.lobbyId, newPlayerArray);
      }
    });
  }

  startGame(): void {
    if (this.lobbyId) {
      this.players$.pipe(take(1)).subscribe(players => {
        const settings = {
          StartingChips: parseInt(this.startingChipsInput.nativeElement.value, 10),
          SmallBlind: parseInt(this.smallBlindInput.nativeElement.value, 10),
          BigBlind: parseInt(this.bigBlindInput.nativeElement.value, 10),
          Players: players
        };
        if (this.lobbyId) {
          this.gameService.startGame(this.lobbyId, settings);
        }
      });
    }
  }

  onSettingsChange(): void {
    if (this.lobbyId) {
      const settings = {
        StartingChips: parseInt(this.startingChipsInput.nativeElement.value, 10),
        SmallBlind: parseInt(this.smallBlindInput.nativeElement.value, 10),
        BigBlind: parseInt(this.bigBlindInput.nativeElement.value, 10),
        Players: [] // Not needed for live update
      };
      this.gameService.updateSettings(this.lobbyId, settings);
    }
  }
}
