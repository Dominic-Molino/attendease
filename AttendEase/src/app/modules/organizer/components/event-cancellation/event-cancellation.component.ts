import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EventService } from '../../../../core/service/event.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-event-cancellation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './event-cancellation.component.html',
  styleUrl: './event-cancellation.component.css',
})
export class EventCancellationComponent implements OnInit {
  constructor(
    private service: EventService,
    private builder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<EventCancellationComponent>
  ) {}

  cancelForm = this.builder.group({
    event_id: this.builder.control(''),
    cancellation_reason: this.builder.control('', Validators.required),
  });

  ngOnInit(): void {
    this.cancelForm.patchValue({
      event_id: this.data.id,
    });
  }

  cancelEvent() {
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
        this.service
          .cancelEvent(this.data.id, this.cancelForm.value.cancellation_reason!)
          .subscribe((res) => {
            console.log(res);
          });
        Swal.fire({
          text: 'Event has been cancelled.',
          icon: 'success',
        });
      }
    });
  }
}
