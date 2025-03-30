import { TestBed } from '@angular/core/testing';

import { HeadTrackerService } from './head-tracker.service';

describe('HeadtrackerService', () => {
  let service: HeadTrackerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeadTrackerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
