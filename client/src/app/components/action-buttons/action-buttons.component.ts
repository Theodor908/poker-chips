import { Component } from '@angular/core';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-action-buttons',
  templateUrl: './action-buttons.component.html',
  styleUrls: ['./action-buttons.component.css']
})
export class ActionButtonsComponent {

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
}
