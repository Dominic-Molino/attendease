import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { authenGuard } from './authen.guard';

describe('authenGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => authenGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
