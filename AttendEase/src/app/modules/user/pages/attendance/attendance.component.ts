import { Component } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { SubmitAttendanceComponent } from '../../components/submit-attendance/submit-attendance.component';
import { EventService } from '../../../../core/service/event.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { AuthserviceService } from '../../../../core/service/authservice.service';
import { NgxPaginationModule } from 'ngx-pagination';

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

  //pagination variables
  p: number = 1;
  itemsPerPage: number = 10;
  maxSize = 5;

  constructor(
    private eventService: EventService,
    private dialog: MatDialog,
    private service: AuthserviceService
  ) {}

  ngOnInit(): void {
    this.userId = this.service.getCurrentUserId();
    this.getUserEvents();
  }

  getUserEvents(): void {
    this.eventService.getUserEvent().subscribe(
      (res) => {
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

          this.events = this.events.filter(
            (event) => event.eventState === 'done'
          );

          // Retrieve attendance remarks after fetching events
          this.events.forEach((event) => {
            this.getUserAttendanceRemark(event.event_id);
          });
        }
      },
      (error) => {
        console.error('Error fetching user events:', error);
      }
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
