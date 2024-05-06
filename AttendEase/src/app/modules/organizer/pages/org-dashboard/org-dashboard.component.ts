import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CalendarComponent } from '../../../../shared/components/calendar/calendar.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-org-dashboard',
  standalone: true,
  imports: [CommonModule, CalendarComponent],
  templateUrl: './org-dashboard.component.html',
  styleUrl: './org-dashboard.component.css',
})
export class OrgDashboardComponent {
  constructor(private routes: Router) {}

  onClickBtn() {
    this.routes.navigate(['organizer/events']);
  }
}
