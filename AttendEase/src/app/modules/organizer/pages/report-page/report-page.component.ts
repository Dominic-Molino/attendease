import { Component, OnInit } from '@angular/core';
import { EventService } from '../../../../core/service/event.service';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { Router, RouterOutlet } from '@angular/router';

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

  constructor(private service: EventService, private router: Router) {}

  ngOnInit(): void {
    this.currId = this.service.getCurrentUserId();
    this.loadEvents(this.currId);
  }

  loadEvents(id: any) {
    this.service.getDoneEventsOfOrg(id).subscribe((res) => {
      this.events = res.payload;
    });
  }

  goToReport(eventId: any) {
    this.router.navigate([`organizer/events-report/report/${eventId}`]);
  }
}
