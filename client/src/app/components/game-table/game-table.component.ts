import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ChipStackComponent } from '../chip-stack/chip-stack.component';
import { CommunityCardsComponent } from '../community-cards/community-cards.component';
import { ActionButtonsComponent } from '../action-buttons/action-buttons.component';
import { PotDisplayComponent } from '../pot-display/pot-display.component';
import { GameService } from '../../services/game.service';
import { GameState, Player } from '../../interfaces/game';
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';

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
export class GameTableComponent {
    gameState$: Observable<GameState | null>;

    constructor(
        public gameService: GameService,
        private router: Router
    ) {
        this.gameState$ = this.gameService.gameState$;
    }

    leaveLobby(): void {
        this.gameState$.subscribe(state => {
            if (state) {
                this.gameService.leaveLobby(state.id);
            }
        }).unsubscribe();
    }
}
