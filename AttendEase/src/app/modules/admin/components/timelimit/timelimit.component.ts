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

  constructor(
    private dialogRef: MatDialogRef<TimelimitComponent>,
    private builder: FormBuilder,
    private service: EventService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.event_id = this.data.event_id;
    this.form = this.builder.group({
      event_id: [this.event_id],
      submission_deadline: [
        '',
        [Validators.required, this.futureDateValidator()],
      ],
    });
  }

  addDeadline() {
    console.log(this.form.value);
    if (this.form.valid) {
      const formData = {
        event_id: this.event_id,
        submission_deadline: new Date(
          this.form.value.submission_deadline
        ).toISOString(),
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
