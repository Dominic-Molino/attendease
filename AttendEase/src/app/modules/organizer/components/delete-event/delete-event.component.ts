import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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
  event_id: any;
  constructor(private dialog: MatDialog, private service: EventService) {}

  deleteEvent(event_id: any) {
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
        this.service.deleteEvent(event_id).subscribe(
          (res) => {
            Swal.fire({
              title: 'Deleted!',
              text: 'Your file has been deleted.',
              icon: 'success',
            });
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
