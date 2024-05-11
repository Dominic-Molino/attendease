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
  styleUrl: './delete-event.component.css',
})
export class DeleteEventComponent {
  @Output() eventDeleted: EventEmitter<void> = new EventEmitter<void>();
  @Input() event_id: any;
  constructor(private service: EventService) {}

  deleteEvent() {
    if (!this.event_id || !this.event_id.event_id) {
      Swal.fire({
        title: 'Error!',
        text: 'Invalid event.',
        icon: 'error',
      });
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.deleteEvent(this.event_id.event_id).subscribe(
          (res) => {
            Swal.fire({
              title: 'Deleted!',
              text: 'Your file has been deleted.',
              icon: 'success',
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
