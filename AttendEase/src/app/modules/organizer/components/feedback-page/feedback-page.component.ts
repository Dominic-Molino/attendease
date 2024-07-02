import { Component, OnInit } from '@angular/core';
import { EventService } from '../../../../core/service/event.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-feedback-page',
  standalone: true,
  imports: [NgxPaginationModule, CommonModule],
  templateUrl: './feedback-page.component.html',
  styleUrl: './feedback-page.component.css',
})
export class FeedbackPageComponent implements OnInit {
  eventList: any[] = [];
  currId: any;
  p: number = 1;
  itemsPerPage: number = 9;
  maxSize = 5;
  constructor(private service: EventService, private router: Router) {}

  ngOnInit(): void {
    this.currId = this.service.getCurrentUserId();
    this.loadEvent(this.currId);
  }

  loadEvent(id: any): void {
    this.service.getApprovedOrganizerEvents(id).subscribe((res) => {
      if (res && res.payload && Array.isArray(res.payload)) {
        this.eventList = res.payload.map((event: any) => ({
          ...event,
          status: this.getEventStatus(event),
        }));
        this.sortEvents();
      } else {
        console.error('Invalid response format or payload missing');
      }
    });
  }

  getEventStatus(event: any): string {
    const now = new Date();
    const startDate = new Date(event.event_start_date);
    const endDate = new Date(event.event_end_date);

    if (endDate < now) {
      return 'done';
    } else if (startDate <= now && endDate >= now) {
      return 'ongoing';
    } else {
      return 'upcoming';
    }
  }

  sortEvents(): void {
    const statusOrder: { [key: string]: number } = {
      done: 0,
      ongoing: 1,
      upcoming: 2,
    };
    this.eventList.sort((a, b) => {
      return statusOrder[a.status!] - statusOrder[b.status!];
    });
  }

  viewFeedback(eventId: number): void {
    let routePrefix = '';
    routePrefix = '/organizer/org-per-feedback';
    if (routePrefix) {
      this.router.navigate([`${routePrefix}/${eventId}`]);
    }
  }
}
