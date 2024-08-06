import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { EventService } from '../../../../core/service/event.service';
import th from '@mobiscroll/angular/dist/js/i18n/th';

@Component({
  selector: 'app-timelimit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './timelimit.component.html',
  styleUrl: './timelimit.component.css',
})
export class TimelimitComponent implements OnInit {
  form: any;
  event_id: any;
  eventStartDate: Date | undefined;

  constructor(
    private dialogRef: MatDialogRef<TimelimitComponent>,
    private builder: FormBuilder,
    private service: EventService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.event_id = this.data.event_id;
    this.eventStartDate = new Date(this.data.event_start_date);
    console.log(this.data);
    this.form = this.builder.group({
      event_id: [this.event_id],
      submission_deadline: [
        null,
        [Validators.required, this.futureDateValidator()],
      ],
    });
  }

  addDeadline() {
    console.log(this.form.value);
    if (this.form.valid) {
      const formData = {
        event_id: this.event_id,
        submission_deadline: this.form.value.submission_deadline,
      };
      this.service.addDeadline(this.event_id, formData).subscribe(
        (res) => {
          Swal.fire('Successfully added deadline', '', 'success');
          this.dialogRef.close();
        },
        (error) => {
          console.error('Error adding deadline:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to add deadline. Please try again later.',
          });
        }
      );
    }
  }

  futureDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!this.eventStartDate) {
        return null;
      }

      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      const selectedDate = new Date(control.value);
      selectedDate.setHours(0, 0, 0, 0);

      if (
        control.value &&
        (selectedDate < currentDate || selectedDate > this.eventStartDate)
      ) {
        Swal.fire({
          icon: 'warning',
          title: 'Invalid Date',
          text: 'Submission deadline must be after the event start date!',
        }).then(() => {
          control.reset();
        });
        return { invalidDate: true };
      }
      return null;
    };
  }
}
