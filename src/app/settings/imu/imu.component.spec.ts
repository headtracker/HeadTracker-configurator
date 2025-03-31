import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImuComponent } from './imu.component';

describe('ImuComponent', () => {
  let component: ImuComponent;
  let fixture: ComponentFixture<ImuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
