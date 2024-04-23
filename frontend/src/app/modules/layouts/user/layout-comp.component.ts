import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { SidebarComponent } from '../../../shared/component/sidebar/sidebar.component';
import { AttendanceComponent } from './pages/attendance/attendance.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { EventsComponent } from './pages/events/events.component';
import { FeedbackComponent } from './pages/feedback/feedback.component';
import { userInfo } from 'os';
import { UserComponent } from './pages/user/user.component';

@Component({
  selector: 'app-layout-comp',
  standalone: true,
  imports: [
    RouterOutlet,
    SidebarComponent,
    AttendanceComponent,
    DashboardComponent,
    EventsComponent,
    FeedbackComponent,
    UserComponent,
  ],
  templateUrl: './layout-comp.component.html',
  styleUrl: './layout-comp.component.css',
})
export class LayoutCompComponent {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) initFlowbite();
  }
}
