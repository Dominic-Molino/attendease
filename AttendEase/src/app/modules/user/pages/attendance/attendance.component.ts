import { Component } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { SubmitAttendanceComponent } from '../../components/submit-attendance/submit-attendance.component';
import { EventService } from '../../../../core/service/event.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { AuthserviceService } from '../../../../core/service/authservice.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxPaginationModule } from 'ngx-pagination';
import {
  Observable,
  Subscription,
  catchError,
  finalize,
  interval,
  map,
  switchMap,
} from 'rxjs';
import { Event } from '../../../../interfaces/EventInterface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogModule,
    CommonModule,
    NgxPaginationModule,
    MatTooltipModule,
  ],
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.css',
})
export class AttendanceComponent {
  events: Event[] = [];
  userId?: any;
  attendanceRemarks: { [key: number]: number } = {};
  loading: boolean = false;

  // Pagination variables
  p: number = 1;
  itemsPerPage: number = 10;
  maxSize = 5;

  private updateSubscription?: Subscription;

  constructor(
    private eventService: EventService,
    private dialog: MatDialog,
    private service: AuthserviceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userId = this.service.getCurrentUserId();
    this.getUserEvents();
    this.startPolling();
  }

  ngOnDestroy(): void {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  }

  getUserEvents(): void {
    this.loading = true;
    this.eventService
      .getUserEvent()
      .pipe(
        map((res) => {
          if (res && res.payload) {
            this.events = res.payload.map((event: any) => ({
              ...event,
              event_start_date: new Date(event.event_start_date),
              event_end_date: new Date(event.event_end_date),
              event_registration_start: new Date(
                event.event_registration_start
              ),
              event_registration_end: new Date(event.event_registration_end),
              categories: JSON.parse(event.categories),
              status: this.getEventStatus(event),
            }));

            this.events.forEach((event) => {
              this.getUserAttendanceRemark(event.event_id);
            });

            this.events.sort((a, b) => {
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
          } else {
            console.error('Expected an array but got:', res);
          }
          this.loading = false;
        }),
        catchError((error) => {
          console.error('Error fetching events:', error);
          this.loading = false;
          return [];
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe();
  }

  getEventStatus(event: any): string {
    const currentDate = new Date();
    const startDate = new Date(event.event_start_date);
    const endDate = new Date(event.event_end_date);

    if (endDate < currentDate) {
      return 'done';
    } else if (startDate <= currentDate && endDate >= currentDate) {
      return 'ongoing';
    } else {
      return 'upcoming';
    }
  }

  getUserAttendanceRemark(eventId: number): void {
    if (this.userId) {
      this.service.getAttendanceByUser(this.userId, eventId).subscribe(
        (res: any) => {
          if (res && res.payload && res.payload.length > 0) {
            const attendance = res.payload[0];
            this.attendanceRemarks[eventId] = attendance.remarks;
          } else {
            this.attendanceRemarks[eventId] = -1;
          }
        },
        (error) => {
          console.error('Error fetching attendance remark:', error);
          this.attendanceRemarks[eventId] = -1;
        }
      );
    }
  }

  startPolling(): void {
    this.updateSubscription = interval(5000) // Poll every 1 minute
      .pipe(
        switchMap(() => this.eventService.getUserEvent()),
        catchError((error) => {
          console.error('Error polling for events:', error);
          return [];
        })
      )
      .subscribe((res) => {
        if (res && res.payload) {
          this.events = res.payload.map((event: any) => ({
            ...event,
            event_start_date: new Date(event.event_start_date),
            event_end_date: new Date(event.event_end_date),
            event_registration_start: new Date(event.event_registration_start),
            event_registration_end: new Date(event.event_registration_end),
            categories: JSON.parse(event.categories),
            status: this.getEventStatus(event),
          }));

          this.events.forEach((event) => {
            this.getUserAttendanceRemark(event.event_id);
          });

          this.events.sort((a, b) => {
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
        }
      });
  }

  openFile(eventState: string, eventId: number) {
    if (eventState === 'done') {
      const dialogRef = this.dialog.open(SubmitAttendanceComponent, {
        data: { eventId: eventId },
        disableClose: true,
        width: '70%',
      });
      dialogRef.componentInstance.attendanceSubmitted.subscribe(() => {
        this.getUserEvents();
      });
      dialogRef.afterClosed().subscribe(() => {
        document.body.classList.remove('cdk-global-scrollblock');
      });
    }
  }

  isSubmissionAvailable(deadline: any): boolean {
    if (!deadline) {
      return false; // No deadline set, submission not available
    }

    const currDate = new Date();
    const submission_deadline = new Date(deadline);
    return currDate > submission_deadline;
  }

  openEvaluation(eventState: any, eventId: number): void {
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
