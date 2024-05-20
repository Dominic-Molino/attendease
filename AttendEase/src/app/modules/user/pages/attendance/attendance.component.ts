import { Component } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { SubmitAttendanceComponent } from '../../components/submit-attendance/submit-attendance.component';
import { EventService } from '../../../../core/service/event.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, CommonModule],
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.css',
})
export class AttendanceComponent {
  events: any[] = [];

  constructor(private eventService: EventService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.getUserEvents();
  }

  getUserEvents(): void {
    this.eventService.getUserEvent().subscribe(
      (res) => {
        console.log('User events:', res);
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
