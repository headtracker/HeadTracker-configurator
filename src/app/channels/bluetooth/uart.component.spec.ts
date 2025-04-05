import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UartComponent } from './uart.component';

describe('OutputsComponent', () => {
  let component: UartComponent;
  let fixture: ComponentFixture<UartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
