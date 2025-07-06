import { Component } from '@angular/core';
import { GameService } from '../../services/game.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-action-buttons',
  templateUrl: './action-buttons.component.html',
  styleUrls: ['./action-buttons.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class ActionButtonsComponent {
  raiseAmount: number = 0;

  constructor(private gameService: GameService) { }

  onCall() {
    this.gameService.call();
  }

  onCheck() {
    this.gameService.check();
  }

  onFold() {
    this.gameService.fold();
  }

  onRaise() {
    this.gameService.raise(this.raiseAmount);
  }
}
