import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChipStackComponent } from './chip-stack.component';

describe('ChipStackComponent', () => {
  let component: ChipStackComponent;
  let fixture: ComponentFixture<ChipStackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChipStackComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChipStackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
