import { CommonModule, JsonPipe } from '@angular/common';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogContent,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { EventService } from '../../../../core/service/event.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-event',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogContent,
    MatFormFieldModule,
    MatDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
    JsonPipe,
  ],
  templateUrl: './edit-event.component.html',
  styleUrl: './edit-event.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class EditEventComponent implements OnInit {
  eventId = this.data.event_id.event_id;
  eventVal = this.data.event_id;

  constructor(
    private service: EventService,
    private builder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialogRef<EditEventComponent>
  ) {}

  eventForm = this.builder.group({
    event_name: this.builder.control(''),
    event_description: this.builder.control(''),
    event_location: this.builder.control(''),
    event_start_date: this.builder.control(''),
    event_end_date: this.builder.control(''),
    event_registration_start: this.builder.control(''),
    event_registration_end: this.builder.control(''),
    session: this.builder.control(''),
    max_attendees: this.builder.control(''),
  });

  ngOnInit(): void {
    if (this.eventId) {
      this.eventForm.patchValue({
        event_name: this.eventVal.event_name,
        event_description: this.eventVal.event_description,
        event_location: this.eventVal.event_location,
        event_start_date: this.eventVal.event_start_date,
        event_end_date: this.eventVal.event_end_date,
        event_registration_start: this.eventVal.event_registration_start,
        event_registration_end: this.eventVal.event_registration_end,
        session: this.eventVal.session,
        max_attendees: this.eventVal.max_attendees,
      });
    }
  }

  updateEvent() {
    if (this.eventForm.valid) {
      this.service
        .editEvent(this.eventId, this.eventForm.value)
        .subscribe((res) => {
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
            title: 'Event updated.',
          });
          this.dialog.close();
        });
    } else {
      Swal.fire('Failed', 'Failed to update event!', 'error');
    }
  }

  closeDialog() {
    this.dialog.close();
  }
}
