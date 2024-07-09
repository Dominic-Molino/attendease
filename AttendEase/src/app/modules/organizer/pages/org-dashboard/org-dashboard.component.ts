import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { EventService } from '../../../../core/service/event.service';
import { CardsComponent } from '../../components/cards/cards.component';
import { MonitoredEventComponent } from '../../../../shared/components/monitored-event/monitored-event.component';
import { OrganizerCalendarComponent } from '../../../../shared/components/organizer-calendar/organizer-calendar.component';
import { FeedbackComponent } from '../../components/feedback/feedback.component';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import { OngoingreportComponent } from '../../components/ongoingreport/ongoingreport.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UpcomingReportComponent } from '../../components/upcoming-report/upcoming-report.component';

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
    UpcomingReportComponent,
    MatDialogModule,
  ],
  encapsulation: ViewEncapsulation.None,
})
export class OrgDashboardComponent implements OnInit {
  eventList: any[] = [];
  currID: any;

  constructor(private service: EventService, private router: Router) {}

  ngOnInit(): void {}
}
