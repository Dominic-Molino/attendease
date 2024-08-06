import { CommonModule, JsonPipe } from '@angular/common';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogContent,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { EventService } from '../../../../core/service/event.service';
import Swal from 'sweetalert2';
import { TagComponent, TagInputModule } from 'ngx-chips';

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
    TagInputModule,
  ],
  templateUrl: './edit-event.component.html',
  styleUrls: ['./edit-event.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class EditEventComponent implements OnInit {
  eventId?: number;
  eventVal: any;
  eventForm: FormGroup;
  categoryControls: FormArray | undefined;
  departments: string[] = ['BSEMC', 'BSIT', 'BSCS', 'ACT'];
  year_levels: string[] = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

  constructor(
    private service: EventService,
    private builder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<EditEventComponent>
  ) {
    this.eventVal = data[0];
    console.log(this.eventVal);

    this.eventForm = this.builder.group({
      event_name: [this.eventVal.event_name, Validators.required],
      event_description: [this.eventVal.event_description, Validators.required],
      event_location: [this.eventVal.event_location, Validators.required],
      event_start_date: [this.eventVal.event_start_date, [Validators.required]],
      event_end_date: [this.eventVal.event_end_date, [Validators.required]],
      event_registration_start: [
        this.eventVal.event_registration_start,
        Validators.required,
      ],
      event_registration_end: [
        this.eventVal.event_registration_end,
        Validators.required,
      ],
      event_type: [this.eventVal.event_type, Validators.required],
      max_attendees: [this.eventVal.max_attendees, Validators.required],
      categories: [
        this.eventVal.categories ? JSON.parse(this.eventVal.categories) : [],
      ],
      participation_type: [
        this.eventVal.participation_type,
        Validators.required,
      ],
      target_participants: this.builder.group({}),
      organizer_name: [this.eventVal.organizer_name, Validators.required],
      organizer_organization: [
        this.eventVal.organizer_organization,
        Validators.required,
      ],
    });

    const targetParticipantsGroup = this.eventForm.get(
      'target_participants'
    ) as FormGroup;
    if (targetParticipantsGroup) {
      this.departments.forEach((dep) => {
        targetParticipantsGroup.addControl(dep, this.builder.array([]));
      });
    }

    if (this.eventVal.target_participants) {
      const targetParticipants = JSON.parse(this.eventVal.target_participants);
      targetParticipants.forEach((participant: any) => {
        const formArray = this.getTargetParticipantsArray(
          participant.department
        );
        formArray.push(new FormControl(participant.year_levels));
      });
    }
  }

  ngOnInit(): void {
    if (this.eventVal) {
      this.eventForm.patchValue({
        event_name: this.eventVal.event_name,
        event_description: this.eventVal.event_description,
        event_location: this.eventVal.event_location,
        event_start_date: this.eventVal.event_start_date,
        event_end_date: this.eventVal.event_end_date,
        event_registration_start: this.eventVal.event_registration_start,
        event_registration_end: this.eventVal.event_registration_end,
        event_type: this.eventVal.event_type,
        max_attendees: this.eventVal.max_attendees,
        categories: this.eventVal.categories
          ? JSON.parse(this.eventVal.categories)
          : null,
        participation_type: this.eventVal.participation_type,
        target_participants: this.eventVal.target_participants
          ? JSON.parse(this.eventVal.target_participants)
          : null,
        organizer_organization: this.eventVal.organizer_organization,
        organizer_name: `${this.eventVal.first_name} ${this.eventVal.last_name}`,
      });
      console.log(this.eventVal.event_type);
    }
  }

  updateEvent() {
    if (this.eventForm.valid) {
      const formData = this.eventForm.value;

      this.service.editEvent(this.eventVal.event_id, formData).subscribe(
        (res) => {
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
          this.dialogRef.close();
        },
        (error) => {
          Swal.fire('Warning', `${error.error.status.message}`, 'warning');
        }
      );
    } else {
      Swal.fire('Failed', 'Invalid Form!', 'error');
    }
  }

  closeDialog() {
    this.dialogRef.close();
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
          text: "You've entered a past date!",
        });
        return { pastDate: true };
      }
      return null;
    };
  }

  onParticipationTypeChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    if (value === 'open') {
      this.eventForm.get('target_participants')?.disable();
    } else {
      this.eventForm.get('target_participants')?.enable();
    }
  }

  getTargetParticipantsArray(department: string): FormArray {
    return this.eventForm.get(`target_participants.${department}`) as FormArray;
  }

  onCheckboxChange(event: Event, department: string) {
    const checkbox = event.target as HTMLInputElement;
    const formArray = this.getTargetParticipantsArray(department);
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

  isCheckboxChecked(department: string, year: string): boolean {
    const formArray = this.getTargetParticipantsArray(department);
    return formArray.controls.some((control) => control.value === year);
  }
}
