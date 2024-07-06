import { TestBed } from '@angular/core/testing';

import { RefreshsubService } from './refreshsub.service';

describe('RefreshsubService', () => {
  let service: RefreshsubService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RefreshsubService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
