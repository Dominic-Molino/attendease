import { TestBed } from '@angular/core/testing';

import { DataAnalyticsService } from './data-analytics.service';

describe('DataAnalyticsService', () => {
  let service: DataAnalyticsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataAnalyticsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
