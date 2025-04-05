import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalogauxComponent } from './analogaux.component';

describe('AnalogauxComponent', () => {
  let component: AnalogauxComponent;
  let fixture: ComponentFixture<AnalogauxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalogauxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalogauxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
