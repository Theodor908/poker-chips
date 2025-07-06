import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-pot-display',
  templateUrl: './pot-display.component.html',
  styleUrls: ['./pot-display.component.css'],
  standalone: true
})
export class PotDisplayComponent {
  @Input() pot: number = 0;
}
