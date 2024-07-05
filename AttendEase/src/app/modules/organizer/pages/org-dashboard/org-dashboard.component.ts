import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { EventService } from '../../../../core/service/event.service';
import { CardsComponent } from '../../components/cards/cards.component';
import { MonitoredEventComponent } from '../../../../shared/components/monitored-event/monitored-event.component';
import { OrganizerCalendarComponent } from '../../../../shared/components/organizer-calendar/organizer-calendar.component';
import { FeedbackComponent } from '../../components/feedback/feedback.component';
import { ReportComponent } from '../../components/report/report.component';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import { OngoingreportComponent } from '../../components/ongoingreport/ongoingreport.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-org-dashboard',
  standalone: true,
  templateUrl: './org-dashboard.component.html',
  styleUrl: './org-dashboard.component.css',
  imports: [
    CommonModule,
    CardsComponent,
    MonitoredEventComponent,
    OrganizerCalendarComponent,
    FeedbackComponent,
    OverlayPanelModule,
    ButtonModule,
    SidebarModule,
    OngoingreportComponent,
    MatDialogModule,
  ],
  encapsulation: ViewEncapsulation.None,
})
export class OrgDashboardComponent implements OnInit {
  eventList: any[] = [];
  currID: any;

  constructor(private service: EventService, private router: Router) {}

  ngOnInit(): void {
    this.currID = this.service.getCurrentUserId();
    this.loadReport(this.currID);
  }

  loadReport(id: any) {
    this.service.getApprovedOrganizerEvents(id).subscribe((res) => {
      this.eventList = this.filterDoneEvents(res.payload);
      console.log(this.eventList);
    });
  }

  getEventState(event: any): string {
    const currentDate = new Date();
    const startDate = new Date(event.event_start_date);
    const endDate = new Date(event.event_end_date);

    if (endDate < currentDate) {
      return 'done';
    } else if (startDate <= currentDate && endDate >= currentDate) {
      return 'ongoing';
    } else {
      return 'upcoming';
    }
  }

  filterDoneEvents(events: any[]): any[] {
    return events.filter((event) => this.getEventState(event) === 'done');
  }

  generateReport(event_id: number) {
    console.log(event_id);
    let routePrefix = 'organizer/event-report';
    if (routePrefix) {
      this.router.navigate([`${routePrefix}/${event_id}`]);
    }
  }
}
