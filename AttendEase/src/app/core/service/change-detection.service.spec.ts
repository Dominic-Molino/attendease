import { TestBed } from '@angular/core/testing';

import { ChangeDetectionService } from './change-detection.service';

describe('ChangeDetectionService', () => {
  let service: ChangeDetectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChangeDetectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
