import { Component, OnInit } from '@angular/core';
import { EventService } from '../../../core/service/event.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { FeedbackListComponent } from '../feedback-list/feedback-list.component';
import { AuthserviceService } from '../../../core/service/authservice.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { Theme } from '@fullcalendar/core/internal';

interface Event {
  event_id: number;
  event_name: string;
  event_description: string;
  event_start_date: Date;
  event_end_date: Date;
  status: string;
}

@Component({
  selector: 'app-event-list',
  standalone: true,
  templateUrl: './event-list.component.html',
  styleUrl: './event-list.component.css',
  imports: [
    CommonModule,
    RouterLink,
    RouterOutlet,
    FeedbackListComponent,
    NgxPaginationModule,
  ],
})
export class EventListComponent implements OnInit {
  eventList: Event[] = [];
  maxChar: number = 100;
  currUser: any;

  p: number = 1;
  itemsPerPage: number = 9;
  maxSize = 5;

  constructor(
    private eventService: EventService,
    private router: Router,
    private service: AuthserviceService
  ) {
    this.currUser = this.service.getCurrentUserId();
  }

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents() {
    this.eventService.getAllEvents().subscribe((res) => {
      this.eventList = res.payload.map((data: any): Event => {
        const eventStartDate = new Date(data.event_start_date);
        const eventEndDate = new Date(data.event_end_date);
        const currentDate = new Date();

        let status: 'upcoming' | 'ongoing' | 'done';

        if (currentDate < eventStartDate) {
          status = 'upcoming';
        } else if (
          currentDate >= eventStartDate &&
          currentDate <= eventEndDate
        ) {
          status = 'ongoing';
        } else {
          status = 'done';
        }

        return {
          event_id: data.event_id,
          event_name: data.event_name,
          event_description: data.event_description,
          event_start_date: data.event_start_date,
          event_end_date: data.event_end_date,
          status: status,
        };
      });

      this.eventList.sort((a, b) => {
        if (
          a.status === 'done' &&
          (b.status === 'ongoing' || b.status === 'upcoming')
        ) {
          return -1;
        } else if (a.status === 'ongoing' && b.status === 'upcoming') {
          return -1;
        } else if (
          a.status === 'upcoming' &&
          (b.status === 'done' || b.status === 'ongoing')
        ) {
          return 1;
        } else {
          return 0;
        }
      });
    });
  }

  truncateDescription(text: string, maxLength: number): string {
    if (text && text.length > maxLength) {
      return text.substring(0, maxLength) + ' ...';
    } else {
      return text;
    }
  }

  viewFeedback(eventId: number) {
    const currentUserRole = this.service.getCurrentUserRole();
    let routePrefix = '';

    if (currentUserRole === 1) {
      routePrefix = '/admin/admin-per-feedback';
    } else if (currentUserRole === 2) {
      routePrefix = '/organizer/org-per-feedback';
    }

    if (routePrefix) {
      this.router.navigate([`${routePrefix}/${eventId}`]);
    }
  }
}
