import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogContent,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidatorFn,
  ValidationErrors,
  FormGroup,
  FormArray,
  FormControl,
} from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { EventService } from '../../../../core/service/event.service';
import Swal from 'sweetalert2';
import { TagInputModule } from 'ngx-chips';

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
    TagInputModule,
  ],
  templateUrl: './add-event.component.html',
  styleUrl: './add-event.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class AddEventComponent implements OnInit {
  minDate: Date;
  eventForm: FormGroup;
  categoryControls: FormArray | undefined;
  visibleCategories: string[] = [];
  showAllCategories: boolean = false;
  file: any;
  imagePreview?: string | ArrayBuffer | null = null;

  constructor(
    private builder: FormBuilder,
    private eventService: EventService,
    @Inject(MAT_DIALOG_DATA) public data: any,
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
      session: ['', Validators.required],
      max_attendees: ['', Validators.required],
      categories: [''],
      organizer_name: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    if (this.data && this.data.start_date) {
      this.eventForm.patchValue({ event_start_date: this.data.start_date });
    }
  }

  onFileChange(event: any) {
    const files = event.target.files as FileList;
    if (files.length > 0) {
      this.file = files[0];
      this.previewImage(); // Call method to preview image
    }
  }

  // Method to preview selected image
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
      // formData.categories = this.getSelectedCategories(); // Ensure categories are set

      if (this.file) {
        formData.file = this.file; // Attach the file to formData
      }

      this.eventService.addEvent(formData).subscribe(
        (res) => {
          const eventId = res.payload.event_id; // Assuming the backend returns the event ID

          if (this.file) {
            this.eventService.uploadEvent(eventId, this.file).subscribe(
              (uploadRes) => {
                this.handleSuccessResponse();
              },
              (uploadError) => {
                this.handleError(
                  uploadError.error?.message || 'Image upload failed'
                );
              }
            );
          } else {
            this.handleSuccessResponse();
          }
        },
        (error) => {
          this.handleError(error.error?.message || 'Something went wrong');
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
      title: 'Event and image uploaded successfully',
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
