import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { EventService } from '../../../../core/service/event.service';
import { AuthserviceService } from '../../../../core/service/authservice.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [DatePipe, TitleCasePipe],
  templateUrl: './preview.component.html',
  styleUrl: './preview.component.css',
})
export class PreviewComponent implements OnInit {
  userId = this.userService.getCurrentUserId();
  eventWithStatus: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private service: EventService,
    private userService: AuthserviceService,
    private dialog: MatDialogRef<PreviewComponent>
  ) {}

  ngOnInit(): void {
    this.eventWithStatus = {
      ...this.data.event,
      status: this.getEventStatus(this.data.event),
    };
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

  registerForEvent(eventId: number) {
    Swal.fire({
      title: 'Register to this event?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.registerForEvent(eventId, this.userId).subscribe(
          (response) => {
            const Toast = Swal.mixin({
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 1500,
              timerProgressBar: true,
              didOpen: (toast) => {
                toast.onmouseenter = Swal.stopTimer;
                toast.onmouseleave = Swal.resumeTimer;
              },
            });
            Toast.fire({
              icon: 'success',
              title: 'Successfully registered',
            });
          },
          (error) => {
            Swal.fire('Warning', `${error.error.status.message}`, 'warning');
          }
        );
      }
    });
  }

  unregister(eventId: number) {
    Swal.fire({
      title: 'Unregister to this event?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.unregisterForEvent(eventId, this.userId).subscribe(
          (response) => {
            const Toast = Swal.mixin({
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 1500,
              timerProgressBar: true,
              didOpen: (toast) => {
                toast.onmouseenter = Swal.stopTimer;
                toast.onmouseleave = Swal.resumeTimer;
              },
            });
            Toast.fire({
              icon: 'success',
              title: 'Successfully unregistered',
            });
          },
          (error) => {
            Swal.fire('Warning', `${error.error.status.message}`, 'warning');
          }
        );
      }
    });
  }

  closeDialog() {
    this.dialog.close();
  }
}
