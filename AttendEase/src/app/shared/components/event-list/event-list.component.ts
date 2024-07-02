import { Component, OnDestroy, OnInit } from '@angular/core';
import { EventService } from '../../../core/service/event.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthserviceService } from '../../../core/service/authservice.service';
import { catchError, finalize, map } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { NgxPaginationModule } from 'ngx-pagination';
import { FeedbackListComponent } from '../feedback-list/feedback-list.component';
import { of, Subscription } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';

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
    MatTooltipModule,
  ],
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.css'],
})
export class EventListComponent implements OnInit, OnDestroy {
  eventList: Event[] = [];
  maxDescriptionLength: number = 100;
  currentUser: any;
  loading = false;
  currentFilter: string = 'all';
  filteredEventList: any[] = [];
  isDropdownOpen: boolean = false;
  private subscription?: Subscription;

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

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadEvents(): void {
    this.loading = true;
    this.eventService
      .getAllEvents()
      .pipe(
        map((res) =>
          res.map(
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
        catchError((error) => {
          const errorMessage =
            error.error?.status?.message || 'An error occurred';
          Swal.fire('', errorMessage, 'warning');
          return of([]);
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe((events) => {
        this.eventList = events;

        // Sorting events
        this.eventList.sort((a, b) => {
          const statusOrder = ['done', 'ongoing', 'upcoming'];
          return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
        });
        this.applyFilter(this.currentFilter);
      });
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

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  applyFilter(status: string) {
    this.currentFilter = status;
    this.isDropdownOpen = false;
    if (status === 'all') {
      this.filteredEventList = this.eventList;
    } else {
      this.filteredEventList = this.eventList.filter(
        (event) => event.status === status
      );
    }
  }

  viewFeedback(eventId: number): void {
    let routePrefix = '';

    routePrefix = '/admin/admin-per-feedback';

    if (routePrefix) {
      this.router.navigate([`${routePrefix}/${eventId}`]);
    }
  }
}
