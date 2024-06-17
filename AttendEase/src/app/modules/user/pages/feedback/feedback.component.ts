import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthserviceService } from '../../../../core/service/authservice.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EventService } from '../../../../core/service/event.service';
import { MatDialog } from '@angular/material/dialog';
import { FeedbackSubmissionComponent } from '../../components/feedback-submission/feedback-submission.component';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { Observable, interval, Subscription, of, timer } from 'rxjs';
import { switchMap, catchError, map, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxPaginationModule],
  templateUrl: './feedback.component.html',
  styleUrl: './feedback.component.css',
})
export class FeedbackComponent implements OnInit, OnDestroy {
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
    private dialog: MatDialog
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

          // Fetch feedback after retrieving events
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
          return of(null); // Return a null observable in case of error
        })
      );
    } else {
      return of(null); // Return a null observable if no userId
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
    this.updateSubscription = timer(2000, 30000)
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

      this.dialog.open(FeedbackSubmissionComponent, {
        data: {
          curr_event_id: eventId,
          curr_user_id: this.userId,
        },
        width: '75%',
        disableClose: true,
      });
      document.body.classList.add('cdk-global-scrollblock');
    }
  }
}
