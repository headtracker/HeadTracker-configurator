import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BluetoothComponent } from './bluetooth.component';

describe('BluetoothComponent', () => {
  let component: BluetoothComponent;
  let fixture: ComponentFixture<BluetoothComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BluetoothComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BluetoothComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
