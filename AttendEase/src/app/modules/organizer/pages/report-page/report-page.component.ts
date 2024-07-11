import { Component, OnInit } from '@angular/core';
import { EventService } from '../../../../core/service/event.service';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import {
  ActivatedRoute,
  Router,
  RouterOutlet,
  NavigationEnd,
} from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-report-page',
  standalone: true,
  imports: [CommonModule, ChartModule, RouterOutlet],
  templateUrl: './report-page.component.html',
  styleUrl: './report-page.component.css',
})
export class ReportPageComponent implements OnInit {
  events: any[] = [];
  currId: any;
  showReportMessage = false;

  constructor(
    private service: EventService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.currId = this.service.getCurrentUserId();
    this.loadEvents(this.currId);

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.showReportMessage = this.shouldShowMessage(this.router.url);
      });

    // Initial check to handle the case when the component is loaded directly at a specific route
    this.showReportMessage = this.shouldShowMessage(this.router.url);
  }

  loadEvents(id: any) {
    this.service.getDoneEventsOfOrg(id).subscribe((res) => {
      this.events = res.payload;
    });
  }

  goToReport(eventId: any) {
    this.router.navigate([`organizer/events-report/report/${eventId}`]);
  }

  private shouldShowMessage(url: string): boolean {
    // Show the message only if the URL is exactly '/organizer/events-report'
    return url === '/organizer/events-report';
  }
}
