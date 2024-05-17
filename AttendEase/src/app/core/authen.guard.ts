import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authenGuard: CanActivateFn = (route, state) => {
  
  const router = inject(Router);
  

  const sessionData = sessionStorage.getItem('token');
    if(sessionData != null) {
      return true;
    } else{
      router.navigateByUrl('/login');
      return false;
    }

};
