import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CalendarComponent } from '../../../../shared/components/calendar/calendar.component';
import { Router } from '@angular/router';
import { EventService } from '../../../../core/service/event.service';
import { CardModule } from 'primeng/card';
import { AnalyticComponent } from '../../../../shared/components/analytic/analytic.component';

@Component({
  selector: 'app-org-dashboard',
  standalone: true,
  templateUrl: './org-dashboard.component.html',
  styleUrl: './org-dashboard.component.css',
  imports: [CommonModule, CardModule, AnalyticComponent],
})
export class OrgDashboardComponent implements OnInit {
  eventData: any;
  latestEvent: any;
  otherEvents: any[] = [];

  constructor(private routes: Router, private service: EventService) {}

  ngOnInit(): void {
    this.service.getAllEvents().subscribe((result) => {
      this.eventData = result;
      if (this.eventData && this.eventData.payload) {
        const eventsArray = this.eventData.payload;
        eventsArray.sort(
          (a: any, b: any) =>
            new Date(b.event_start_date).getTime() -
            new Date(a.event_start_date).getTime()
        );
        this.latestEvent = eventsArray[0];
        this.otherEvents = eventsArray.slice(1);
      }
    });
  }

  onClickBtn() {
    this.routes.navigate(['organizer/events']);
  }
}
