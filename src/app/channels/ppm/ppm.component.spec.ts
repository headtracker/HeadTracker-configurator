import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PpmComponent } from './ppm.component';

describe('OutputsComponent', () => {
  let component: PpmComponent;
  let fixture: ComponentFixture<PpmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PpmComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PpmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
