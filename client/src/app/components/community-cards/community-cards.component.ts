import { Component, Input } from '@angular/core';
import { GameRound } from '../../enums/game-round';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-community-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './community-cards.component.html',
  styleUrls: ['./community-cards.component.css']
})
export class CommunityCardsComponent {
  @Input() currentRound: GameRound = GameRound.PreFlop;
  GameRound = GameRound; // Make enum available to template

  get cardsToShow(): number[] {
    let count = 0;
    switch (this.currentRound) {
      case GameRound.Flop:
        count = 3;
        break;
      case GameRound.Turn:
        count = 4;
        break;
      case GameRound.River:
        count = 5;
        break;
    }
    return new Array(count);
  }
}
