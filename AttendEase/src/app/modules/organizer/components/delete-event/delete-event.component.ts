import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { EventService } from '../../../../core/service/event.service';

@Component({
  selector: 'app-delete-event',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './delete-event.component.html',
  styleUrls: ['./delete-event.component.css'],
})
export class DeleteEventComponent {
  @Output() eventDeleted: EventEmitter<void> = new EventEmitter<void>();
  @Input() event_id: any;

  constructor(private service: EventService) {}

  deleteEvent() {
    if (this.event_id) {
      Swal.fire({
        title: 'Are you sure you want to delete this event?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
      }).then((result) => {
        if (result.isConfirmed) {
          this.service.deleteEvent(this.event_id).subscribe(
            (res) => {
              const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
              });
              Toast.fire({
                icon: 'success',
                title: 'Event has been deleted.',
              });
              this.eventDeleted.emit();
            },
            (error) => {
              Swal.fire({
                title: 'Error!',
                text: 'Failed to delete event.',
                icon: 'error',
              });
            }
          );
        }
      });
    }
  }
}
