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
    selectedFile: [''],
    requirement: this.builder.control(null),
  });

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    this.eventForm.patchValue({ selectedFile: this.selectedFile });
    console.log(this.selectedFile);
  }

  addEvent() {
    const formData = new FormData();
    formData.append('event_name', this.eventForm.value.event_name!);
    formData.append(
      'event_description',
      this.eventForm.value.event_description!
    );
    formData.append('event_location', this.eventForm.value.event_location!);
    formData.append('event_start_date', this.eventForm.value.event_start_date!);
    formData.append('event_end_date', this.eventForm.value.event_end_date!);
    formData.append(
      'event_registration_start',
      this.eventForm.value.event_registration_start!
    );
    formData.append(
      'event_registration_end',
      this.eventForm.value.event_registration_end!
    );
    formData.append('session', this.eventForm.value.session!);

    formData.append(
      'selectedFile',
      this.selectedFile!,
      this.selectedFile!.name
    );
    formData.append('requirement', this.eventForm.value.requirement!);

    //test if formdata has values
    formData.forEach((value, key) => {
      console.log(key + ': ' + value);
    });

    this.eventService.addEvent(formData).subscribe(
      (res: any) => {
        console.log('Event Added', res);
      },
      (error) => {
        console.error('Failed to add event', error);
      }
    );
  }
}
