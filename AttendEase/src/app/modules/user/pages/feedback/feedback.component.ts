import {
  Component,
  OnInit,
  OnDestroy,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { AuthserviceService } from '../../../../core/service/authservice.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EventService } from '../../../../core/service/event.service';
import { MatDialog } from '@angular/material/dialog';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { Observable, interval, Subscription, of, timer } from 'rxjs';
import { switchMap, catchError, map, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    MatTooltipModule,
  ],
  templateUrl: './feedback.component.html',
  styleUrl: './feedback.component.css',
})
export class FeedbackComponent implements OnInit, OnDestroy {
  @Input() feed: Event | undefined;
  @Output() viewEventClicked = new EventEmitter();

  events: any[] = [];
  userId?: any;
  feedback: any[] = [];
  loading: boolean = false;
  feedbackSubmitted: { [key: number]: boolean } = {};

  // Pagination variables
  p: number = 1;
  itemsPerPage: number = 10;
  maxSize = 5;

  private updateSubscription?: Subscription;

  constructor(
    private eventService: EventService,
    private service: AuthserviceService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userId = this.service.getCurrentUserId();
    this.getUserEvents().subscribe();
    this.startPolling();
  }

  ngOnDestroy(): void {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  }

  getUserEvents(): Observable<any> {
    this.loading = true;
    return this.eventService.getUserEvent().pipe(
      map((res) => {
        if (res && res.payload) {
          this.events = res.payload.map((event: any) => {
            const currentDate = new Date();
            const eventStartDate = new Date(event.event_start_date);
            const endDate = new Date(event.event_end_date);
            event.eventState = '';

            if (endDate < currentDate) {
              event.eventState = 'done';
            } else if (eventStartDate <= currentDate) {
              event.eventState = 'ongoing';
            } else {
              event.eventState = 'upcoming';
            }
            return event;
          });

          this.events.sort((a, b) => {
            if (
              a.eventState === 'done' &&
              (b.eventState === 'ongoing' || b.eventState === 'upcoming')
            ) {
              return -1;
            } else if (
              a.eventState === 'ongoing' &&
              b.eventState === 'upcoming'
            ) {
              return -1;
            } else if (
              a.eventState === 'upcoming' &&
              (b.eventState === 'done' || b.eventState === 'ongoing')
            ) {
              return 1;
            } else {
              return 0;
            }
          });

          this.getFeedback().subscribe();
        }
        return res;
      }),
      catchError((error) => {
        return of(null);
      }),
      finalize(() => {
        this.loading = false;
      })
    );
  }

  getFeedback(): Observable<any> {
    if (this.userId) {
      return this.service.getUserFeedback(this.userId).pipe(
        map((res) => {
          if (res && res.payload) {
            this.feedback = res.payload;
            this.mapFeedbackToEvents();
          }
          return res;
        }),
        catchError((error) => {
          const errorMessage =
            error.error?.status?.message || 'An error occurred';
          return of(null);
        })
      );
    } else {
      return of(null);
    }
  }

  mapFeedbackToEvents(): void {
    this.events.forEach((event) => {
      const eventFeedback = this.feedback.find(
        (feedback) => feedback.event_id === event.event_id
      );
      event.remarks = eventFeedback ? eventFeedback.remarks : 'No Submission';
      event.feedbackSubmitted = !!eventFeedback;
    });
  }

  startPolling(): void {
    this.updateSubscription = timer(10000, 60000)
      .pipe(switchMap(() => this.getUserEvents()))
      .subscribe();
  }

  openDialog(eventState: any, eventId: number): void {
    if (eventState === 'done') {
      const event = this.events.find((event) => event.event_id === eventId);
      if (!event || event.feedbackSubmitted) {
        Swal.fire('', 'Feedback already submitted for this event', 'warning');
        return;
      }

      let routePrefix = '/student/questionnaire';
      if (routePrefix) {
        this.router.navigate([`${routePrefix}/${eventId}`]);
      }
    }
  }
}
