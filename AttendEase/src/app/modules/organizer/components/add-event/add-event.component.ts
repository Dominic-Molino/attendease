import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidatorFn,
  ValidationErrors,
  FormGroup,
  FormControl,
  FormArray,
  FormGroupDirective,
  NgForm,
} from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { EventService } from '../../../../core/service/event.service';
import Swal from 'sweetalert2';
import { TagInputModule } from 'ngx-chips';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted = form && form.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}

@Component({
  selector: 'app-add-event',
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    MatDialogContent,
    FormsModule,
    ReactiveFormsModule,
    JsonPipe,
    TagInputModule,
  ],
  templateUrl: './add-event.component.html',
  styleUrl: './add-event.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class AddEventComponent implements OnInit {
  minDate: Date;
  eventForm!: FormGroup;
  file: any;
  imagePreview?: string | ArrayBuffer | null = null;
  matcher = new MyErrorStateMatcher();
  departments: string[] = ['BSEMC', 'BSIT', 'BSCS', 'ACT']; // Example options
  year_levels: string[] = ['Year 1', 'Year 2', 'Year 3', 'Year 4'];

  constructor(
    private builder: FormBuilder,
    private eventService: EventService,
    private dialogRef: MatDialogRef<AddEventComponent>
  ) {
    this.minDate = new Date();
    this.eventForm = this.builder.group({
      event_name: ['', Validators.required],
      event_description: ['', Validators.required],
      event_location: ['', Validators.required],
      event_start_date: [
        null,
        [Validators.required, this.futureDateValidator()],
      ],
      event_end_date: [null, [Validators.required, this.futureDateValidator()]],
      event_registration_start: [
        null,
        [Validators.required, this.futureDateValidator()],
      ],
      event_registration_end: [
        null,
        [Validators.required, this.futureDateValidator()],
      ],
      event_type: ['', Validators.required],
      max_attendees: ['', Validators.required],
      categories: [''],
      organizer_name: ['', Validators.required],
      participation_type: ['open', Validators.required],
      target_participants: this.builder.group({
        departments: this.builder.array([]),
        year_levels: this.builder.array([]),
      }),
    });
  }

  ngOnInit(): void {}

  onParticipationTypeChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;

    if (value === 'open') {
      this.eventForm.get('target_participants')?.disable();
      this.clearFormArray(this.departmentsArray);
      this.clearFormArray(this.yearLevelsArray);
    } else {
      this.eventForm.get('target_participants')?.enable();
    }

    this.eventForm.get('target_participants')?.updateValueAndValidity();
  }

  get departmentsArray() {
    return this.eventForm.get('target_participants.departments') as FormArray;
  }

  get yearLevelsArray() {
    return this.eventForm.get('target_participants.year_levels') as FormArray;
  }

  clearFormArray(formArray: FormArray) {
    while (formArray.length) {
      formArray.removeAt(0);
    }
  }

  onCheckboxChange(event: Event, formArray: FormArray) {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      formArray.push(new FormControl(checkbox.value));
    } else {
      const index = formArray.controls.findIndex(
        (x) => x.value === checkbox.value
      );
      if (index >= 0) {
        formArray.removeAt(index);
      }
    }
  }

  isDepartmentChecked(department: string): boolean {
    return this.departmentsArray.controls.some(
      (control) => control.value === department
    );
  }

  isYearLevelChecked(yearLevel: string): boolean {
    return this.yearLevelsArray.controls.some(
      (control) => control.value === yearLevel
    );
  }

  onSelectChange(event: Event, formArray: FormArray) {
    const selectedOptions = (event.target as HTMLSelectElement).selectedOptions;
    const values = Array.from(selectedOptions).map(
      (option) => (option as HTMLOptionElement).value
    );
    this.clearFormArray(formArray);
    values.forEach((value) => formArray.push(new FormControl(value)));
  }

  onFileChange(event: any) {
    const files = event.target.files as FileList;
    if (files.length > 0) {
      this.file = files[0];
      this.previewImage(); // Call method to preview image
    }
  }

  previewImage() {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagePreview = e.target?.result;
    };
    reader.readAsDataURL(this.file);
  }

  addEvent() {
    if (this.eventForm.valid) {
      const formData = this.eventForm.value;

      if (this.file) {
        formData.file = this.file;
      }

      if (formData.participation_type === 'open') {
        formData.target_participants = null; // or any other representation for empty
      } else {
        // Check if both departments and year_levels are empty arrays
        if (
          formData.target_participants.departments.length === 0 &&
          formData.target_participants.year_levels.length === 0
        ) {
          formData.target_participants = null; // or any other representation for empty
        } else {
          formData.target_participants = {
            departments: formData.target_participants.departments,
            year_levels: formData.target_participants.year_levels,
          };
        }
      }

      console.log(formData);

      this.eventService.addEvent(formData).subscribe(
        (res) => {
          const eventId = res.payload.event_id;
          if (this.file) {
            this.eventService.uploadEvent(eventId, this.file).subscribe(
              (uploadRes) => {
                this.handleSuccessResponse();
              },
              (error) => {
                Swal.fire(
                  'Warning',
                  `${error.error.status.message}`,
                  'warning'
                );
              }
            );
          } else {
            this.handleSuccessResponse();
          }
        },
        (error) => {
          Swal.fire('Warning', `${error.error.status.message}`, 'warning');
        }
      );
    } else {
      Swal.fire('Incomplete Form', 'Please fill in all fields', 'warning');
    }
  }

  private handleSuccessResponse() {
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
      title: 'Event added successfully',
    });
    this.dialogRef.close();
  }

  private handleError(errorMessage: string) {
    Swal.fire('Error', errorMessage, 'error');
  }

  futureDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      const selectedDate = new Date(control.value);
      selectedDate.setHours(0, 0, 0, 0);

      if (control.value && selectedDate < currentDate) {
        Swal.fire({
          icon: 'warning',
          title: 'Invalid Date',
          text: "You've enter a past date!",
        }).then(() => {
          control.reset();
        });
        return { pastDate: true };
      }
      return null;
    };
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
