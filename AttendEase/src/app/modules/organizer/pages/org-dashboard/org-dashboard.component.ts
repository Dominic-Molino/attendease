import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Router } from '@angular/router';
import { EventService } from '../../../../core/service/event.service';
import { CardsComponent } from '../../components/cards/cards.component';
import { MonitoredEventComponent } from '../../../../shared/components/monitored-event/monitored-event.component';
import { OrganizerCalendarComponent } from '../../../../shared/components/organizer-calendar/organizer-calendar.component';
import { FeedbackComponent } from '../../components/feedback/feedback.component';
import { ReportComponent } from '../../components/report/report.component';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import { StyleClassModule } from 'primeng/styleclass';

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
    ReportComponent,
    OverlayPanelModule,
    ButtonModule,
    SidebarModule,
    StyleClassModule,
  ],
  encapsulation: ViewEncapsulation.None,
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
