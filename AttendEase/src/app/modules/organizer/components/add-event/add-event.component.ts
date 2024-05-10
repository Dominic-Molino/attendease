import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { MatDialogContent } from '@angular/material/dialog';
import {
  FormGroup,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  NonNullableFormBuilder,
} from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { EventService } from '../../../../core/service/event.service';

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
    event_name: this.builder.control('', Validators.required),
    event_description: this.builder.control('', Validators.required),
    event_location: this.builder.control('', Validators.required),
    event_start_date: this.builder.control(null),
    event_end_date: this.builder.control(null),
    event_registration_start: this.builder.control(null),
    event_registration_end: this.builder.control(null),
    session: this.builder.control('', Validators.required),
    requirement: this.builder.control('', Validators.required),
  });

  addEvent() {
    if (this.eventForm.valid) {
      this.eventService.addEvent(this.eventForm.value).subscribe((res) => {
        console.log('sucsess', res);
      });
    }
  }
}
