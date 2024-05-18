import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { MatDialogContent } from '@angular/material/dialog';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { EventService } from '../../../../core/service/event.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-event',
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
  templateUrl: './add-event.component.html',
  styleUrl: './add-event.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class AddEventComponent {
  selectedFile: any;
  constructor(
    private builder: FormBuilder,
    private eventService: EventService
  ) {}

  eventForm = this.builder.group({
    event_name: ['', Validators.required],
    event_description: ['', Validators.required],
    event_location: ['', Validators.required],
    event_start_date: [null, Validators.required],
    event_end_date: [null, Validators.required],
    event_registration_start: [null, Validators.required],
    event_registration_end: [null, Validators.required],
    session: ['', Validators.required],
  });

  addEvent() {
    if (this.eventForm.valid) {
      this.eventService.addEvent(this.eventForm.value).subscribe((res) => {
        Swal.fire('Success', 'Event Successfully Added', 'success');
      });
    }
  }
}
