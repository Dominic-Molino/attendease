import { Component, OnInit } from '@angular/core';
import { EventService } from '../../../core/service/event.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthserviceService } from '../../../core/service/authservice.service';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { NgxPaginationModule } from 'ngx-pagination';
import { FeedbackListComponent } from '../feedback-list/feedback-list.component';

interface Event {
  event_id: number;
  event_name: string;
  event_description: string;
  event_start_date: Date;
  event_end_date: Date;
  status: 'upcoming' | 'ongoing' | 'done';
}

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterOutlet,
    FeedbackListComponent,
    NgxPaginationModule,
  ],
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.css'],
})
export class EventListComponent implements OnInit {
  eventList: Event[] = [];
  maxDescriptionLength: number = 100;
  currentUser: any;
  loading = false;

  p: number = 1;
  itemsPerPage: number = 9;
  maxSize = 5;

  constructor(
    private eventService: EventService,
    private router: Router,
    private authService: AuthserviceService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUserId();
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading = true;
    this.eventService
      .getAllEvents()
      .pipe(
        map((res) =>
          res.payload.map(
            (data: any): Event => ({
              event_id: data.event_id,
              event_name: data.event_name,
              event_description: data.event_description,
              event_start_date: new Date(data.event_start_date),
              event_end_date: new Date(data.event_end_date),
              status: this.getEventStatus(
                new Date(data.event_start_date),
                new Date(data.event_end_date)
              ),
            })
          )
        ),
        switchMap((events) => {
          this.eventList = events;

          // Sorting events
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

          return events;
        }),
        catchError((error) => {
          const errorMessage =
            error.error?.status?.message || 'An error occurred';
          Swal.fire('', errorMessage, 'warning');
          return [];
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe();
  }

  getEventStatus(
    startDate: Date,
    endDate: Date
  ): 'upcoming' | 'ongoing' | 'done' {
    const currentDate = new Date();

    if (currentDate < startDate) {
      return 'upcoming';
    } else if (currentDate >= startDate && currentDate <= endDate) {
      return 'ongoing';
    } else {
      return 'done';
    }
  }

  truncateDescription(text: string, maxLength: number): string {
    if (text && text.length > maxLength) {
      return text.substring(0, maxLength) + ' ...';
    } else {
      return text;
    }
  }

  viewFeedback(eventId: number): void {
    const currentUserRole = this.authService.getCurrentUserRole();
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
