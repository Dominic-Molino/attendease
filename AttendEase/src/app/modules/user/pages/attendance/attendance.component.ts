import { Component } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { SubmitAttendanceComponent } from '../../components/submit-attendance/submit-attendance.component';
import { EventService } from '../../../../core/service/event.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { AuthserviceService } from '../../../../core/service/authservice.service';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, CommonModule],
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.css',
})
export class AttendanceComponent {
  events: any[] = [];
  userId?: any;
  attendanceRemarks: { [key: number]: number } = {};

  constructor(
    private eventService: EventService,
    private dialog: MatDialog,
    private service: AuthserviceService
  ) {
    this.userId = this.service.getCurrentUserId();
  }

  ngOnInit(): void {
    this.getUserEvents();
  }

  getUserEvents(): void {
    this.eventService.getUserEvent().subscribe(
      (res) => {
        if (res) {
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

          this.events.forEach((event) => {
            this.getUserAttendanceRemark(event.event_id);
          });
        } else {
          console.error(
            'Failed to retrieve user events:',
            res ? res.message : 'Unknown error'
          );
        }
      },
      (error) => {
        console.error('Error:', error);
      }
    );
  }

  getUserAttendanceRemark(eventId: number) {
    this.service.getAttendanceByUser(this.userId, eventId).subscribe(
      (res: any) => {
        if (res && res.payload && res.payload.length > 0) {
          const attendance = res.payload[0];
          this.attendanceRemarks[eventId] = attendance.remarks;
        } else {
          this.attendanceRemarks[eventId] = -1; // Default message if no remarks
        }
      },
      (error) => {
        console.error('Error fetching attendance remark:', error);
        this.attendanceRemarks[eventId] = -1; // Error message
      }
    );
  }

  openFile(eventState: string, event: number) {
    if (eventState === 'done') {
      const dialogRef = this.dialog.open(SubmitAttendanceComponent, {
        data: { eventId: event },
      });
    } else if (eventState === 'ongoing') {
      Swal.fire('Event is ongoing', 'Please wait for the event to end', 'info');
    } else {
      Swal.fire(
        'Event is upcoming',
        'Please wait for the event to start',
        'info'
      );
    }
  }
}
