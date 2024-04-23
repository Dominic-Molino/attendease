import { Routes } from '@angular/router';
import { SidebarComponent } from './shared/component/sidebar/sidebar.component';
import { LoginComponent } from './auth/pages/login/login.component';
import { SignupComponent } from './auth/pages/signup/signup.component';
import { AttendanceComponent } from './modules/layouts/user/pages/attendance/attendance.component';
import { DashboardComponent } from './modules/layouts/user/pages/dashboard/dashboard.component';
import { EventsComponent } from './modules/layouts/user/pages/events/events.component';
import { FeedbackComponent } from './modules/layouts/user/pages/feedback/feedback.component';
import { UserComponent } from './modules/layouts/user/pages/user/user.component';
import { LayoutCompComponent } from './modules/layouts/user/layout-comp.component';

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
    path: 'user',
    component: LayoutCompComponent,
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
        component: UserComponent,
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
