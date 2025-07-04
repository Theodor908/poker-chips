import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PotDisplayComponent } from './pot-display.component';

describe('PotDisplayComponent', () => {
  let component: PotDisplayComponent;
  let fixture: ComponentFixture<PotDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PotDisplayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PotDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
