import { Routes } from '@angular/router';
import { UserComponent } from './modules/user/user.component';
import { OrganizerComponent } from './modules/organizer/organizer.component';
import { authenGuard } from './core/authen.guard';
import { AdminDashboardComponent } from './modules/admin/pages/admin-dashboard/admin-dashboard.component';
import { AdminComponent } from './modules/admin/admin.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./auth/pages/login/login.component').then(
        (c) => c.LoginComponent
      ),
  },

  {
    path: 'signup',
    loadComponent: () =>
      import('./auth/pages/signup/signup.component').then(
        (c) => c.SignupComponent
      ),
  },

  {
    path: 'admin',
    component: AdminComponent,
    children: [
      {
        path: '',
        redirectTo: 'admin-dashboard',
        pathMatch: 'full',
      },

      {
        path: 'admin-dashboard',
        loadComponent: () =>
          import(
            './modules/admin/pages/admin-dashboard/admin-dashboard.component'
          ).then((c) => c.AdminDashboardComponent),
        canActivate: [authenGuard],
      },

      {
        path: 'attendance',
        loadComponent: () =>
          import(
            './modules/organizer/pages/attendance/attendance.component'
          ).then((c) => c.AttendanceComponent),
        canActivate: [authenGuard],
      },
    ],
  },

  {
    path: 'student',
    component: UserComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },

      {
        path: 'dashboard',
        loadComponent: () =>
          import('./modules/user/pages/dashboard/dashboard.component').then(
            (c) => c.DashboardComponent
          ),

        canActivate: [authenGuard],
      },

      {
        path: 'events',
        loadComponent: () =>
          import('./modules/user/pages/events/events.component').then(
            (c) => c.EventsComponent
          ),

        canActivate: [authenGuard],
      },

      {
        path: 'profile',
        loadComponent: () =>
          import('./modules/user/pages/profile/profile.component').then(
            (c) => c.ProfileComponent
          ),

        canActivate: [authenGuard],
      },

      {
        path: 'attendance',
        loadComponent: () =>
          import('./modules/user/pages/attendance/attendance.component').then(
            (c) => c.AttendanceComponent
          ),
        canActivate: [authenGuard],
      },

      {
        path: 'feedback',
        loadComponent: () =>
          import('./modules/user/pages/feedback/feedback.component').then(
            (c) => c.FeedbackComponent
          ),
        canActivate: [authenGuard],
      },
    ],
  },

  {
    path: 'organizer',
    component: OrganizerComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },

      {
        path: 'dashboard',
        loadComponent: () =>
          import(
            './modules/organizer/pages/org-dashboard/org-dashboard.component'
          ).then((c) => c.OrgDashboardComponent),
        canActivate: [authenGuard],
      },

      {
        path: 'events',
        loadComponent: () =>
          import(
            './modules/organizer/pages/org-event/org-event.component'
          ).then((c) => c.OrgEventComponent),
        canActivate: [authenGuard],
      },
    ],
  },
];
