import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card } from '../../interfaces/game';

@Component({
    selector: 'app-community-cards',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './community-cards.component.html',
    styleUrls: ['./community-cards.component.css']
})
export class CommunityCardsComponent {
    @Input() cards: Card[] = [];
}
