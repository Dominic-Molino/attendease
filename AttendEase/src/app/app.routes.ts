import { Routes } from '@angular/router';
import { LoginComponent } from './auth/pages/login/login.component';
import { SignupComponent } from './auth/pages/signup/signup.component';
import { UserComponent } from './modules/user/user.component';
import { DashboardComponent } from './modules/user/pages/dashboard/dashboard.component';
import { EventsComponent } from './modules/user/pages/events/events.component';
import { AttendanceComponent } from './modules/user/pages/attendance/attendance.component';
import { FeedbackComponent } from './modules/user/pages/feedback/feedback.component';
import { ProfileComponent } from './modules/user/pages/profile/profile.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  {
    path: 'login',
    component: LoginComponent,
  },

  {
    path: 'signup',
    component: SignupComponent,
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
        component: DashboardComponent,
      },
      {
        path: 'events',
        component: EventsComponent,
      },

      {
        path: 'profile',
        component: ProfileComponent,
      },

      {
        path: 'attendance',
        component: AttendanceComponent,
      },

      {
        path: 'feedback',
        component: FeedbackComponent,
      },
    ],
  },
];
