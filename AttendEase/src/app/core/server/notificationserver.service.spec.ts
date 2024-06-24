import { TestBed } from '@angular/core/testing';

import { NotificationserverService } from './notificationserver.service';

describe('NotificationserverService', () => {
  let service: NotificationserverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationserverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
