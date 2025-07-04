import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ChipStackComponent } from '../chip-stack/chip-stack.component';
import { CommunityCardsComponent } from '../community-cards/community-cards.component';
import { ActionButtonsComponent } from '../action-buttons/action-buttons.component';
import { PotDisplayComponent } from '../pot-display/pot-display.component';
import { GameService } from '../../services/game.service';
import { GameState, Player } from '../../interfaces/game';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Component({
  selector: 'app-game-table',
  standalone: true,
  imports: [
    CommonModule,
    ChipStackComponent,
    CommunityCardsComponent,
    ActionButtonsComponent,
    PotDisplayComponent
  ],
  templateUrl: './game-table.component.html',
  styleUrls: ['./game-table.component.css']
})
export class GameTableComponent implements OnInit {
  gameState$: Observable<GameState>;
  mainPlayer$: Observable<Player | undefined>;
  otherPlayers$: Observable<Player[]>;

  constructor(
    public gameService: GameService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.gameState$ = this.gameService.gameState$;
    this.mainPlayer$ = this.gameState$.pipe(
      map(state => state.players.find(p => p.isMainPlayer))
    );
    this.otherPlayers$ = this.gameState$.pipe(
      map(state => state.players.filter(p => !p.isMainPlayer))
    );
  }

  ngOnInit(): void {
    // Game is now initialized by the LobbySettingsComponent
  }

  leaveLobby(): void {
    this.mainPlayer$.pipe(take(1)).subscribe(player => {
      if (player && player.id) {
        const lobbyId = player.id.split('-')[0];
        this.gameService.leaveLobby(lobbyId);
        this.router.navigate(['/']);
      }
    });
  }
}
