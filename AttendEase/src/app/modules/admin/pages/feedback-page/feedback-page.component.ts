import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { Subscription, map, catchError, of, finalize } from 'rxjs';
import Swal from 'sweetalert2';
import { AuthserviceService } from '../../../../core/service/authservice.service';
import { EventService } from '../../../../core/service/event.service';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxPaginationModule } from 'ngx-pagination';
import { FeedbackListComponent } from '../../../../shared/components/feedback-list/feedback-list.component';

interface Event {
  event_id: number;
  event_name: string;
  event_description: string;
  event_start_date: Date;
  event_end_date: Date;
  status: 'upcoming' | 'ongoing' | 'done';
}

@Component({
  selector: 'app-feedback-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterOutlet,
    FeedbackListComponent,
    NgxPaginationModule,
    MatTooltipModule,
  ],
  templateUrl: './feedback-page.component.html',
  styleUrl: './feedback-page.component.css',
})
export class FeedbackPageComponent implements OnInit, OnDestroy {
  eventList: Event[] = [];
  maxDescriptionLength: number = 100;
  currentUser: any;
  loading = false;
  currentFilter: string = 'all';
  filteredEventList: any[] = [];
  isDropdownOpen: boolean = false;
  private subscription?: Subscription;

  p: number = 1;
  itemsPerPage: number = 12;
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
        this.eventList.sort((a, b) => {
          const statusOrder = ['done', 'ongoing', 'upcoming'];
          return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
        });
        console.log(this.eventList);
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
