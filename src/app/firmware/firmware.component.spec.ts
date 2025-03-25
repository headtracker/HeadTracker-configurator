import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirmwareComponent } from './firmware.component';

describe('FirmwareComponent', () => {
  let component: FirmwareComponent;
  let fixture: ComponentFixture<FirmwareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FirmwareComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FirmwareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
