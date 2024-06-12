import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { AuthserviceService } from './service/authservice.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthserviceService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const currentUserRole = this.authService.getCurrentUserRole();

    if (currentUserRole === 1) {
      // Assuming admin role ID is 1, modify this according to your actual roles
      return true; // Allow access for admin
    } else if (currentUserRole === 2) {
      // Assuming organizer role ID is 2, modify this according to your actual roles
      return true; // Allow access for organizer
    } else {
      // Redirect unauthorized users to login or any other route
      return this.router.parseUrl('/login');
    }
  }
}
