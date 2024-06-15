import { Component } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { SubmitAttendanceComponent } from '../../components/submit-attendance/submit-attendance.component';
import { EventService } from '../../../../core/service/event.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { AuthserviceService } from '../../../../core/service/authservice.service';
import { NgxPaginationModule } from 'ngx-pagination';
import {
  Observable,
  Subscription,
  catchError,
  finalize,
  interval,
  map,
  of,
  switchMap,
} from 'rxjs';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogModule,
    CommonModule,
    NgxPaginationModule,
  ],
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.css',
})
export class AttendanceComponent {
  events: any[] = [];
  userId?: any;
  attendanceRemarks: { [key: number]: number } = {};
  loading: boolean = false;

  //pagination variables
  p: number = 1;
  itemsPerPage: number = 10;
  maxSize = 5;

  private updateSubscription?: Subscription;

  constructor(
    private eventService: EventService,
    private dialog: MatDialog,
    private service: AuthserviceService
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

  getUserEvents(): Observable<any> {
    this.loading = true;
    return this.eventService.getUserEvent().pipe(
      map((res) => {
        if (res && res.payload) {
          this.events = res.payload.map((event: any) => {
            const currentDate = new Date();
            const endDate = new Date(event.event_end_date);
            const eventStartDate = new Date(event.event_start_date);
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

          // Retrieve attendance remarks after fetching events
          this.events.forEach((event) => {
            this.getUserAttendanceRemark(event.event_id);
          });
        }
        return res;
      }),
      catchError((error) => {
        const errorMessage =
          error.error?.status?.message || 'An error occurred';
        Swal.fire('', errorMessage, 'warning');
        return of(null);
      }),
      finalize(() => {
        this.loading = false;
      })
    );
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
    this.updateSubscription = interval(5000) // Poll every 5 seconds
      .pipe(
        switchMap(() => this.getUserEvents()) // Use the refactored getUserEvents method
      )
      .subscribe();
  }

  openFile(eventState: string, event: number): void {
    if (eventState === 'done') {
      const dialogRef = this.dialog.open(SubmitAttendanceComponent, {
        data: { eventId: event },
        disableClose: true,
        width: '50%',
      });
      document.body.classList.add('cdk-global-scrollblock');
    }
  }
}
