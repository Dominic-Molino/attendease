import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { AuthserviceService } from '../../../../core/service/authservice.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-submit-attendance',
  standalone: true,
  imports: [MatDialogModule, CommonModule],
  templateUrl: './submit-attendance.component.html',
  styleUrl: './submit-attendance.component.css',
})
export class SubmitAttendanceComponent {
  file: any;
  userId: any;

  constructor(
    private service: AuthserviceService,
    private builder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialogRef<SubmitAttendanceComponent>
  ) {
    console.log(data.eventId.event_id);
    this.userId = this.service.getCurrentUserId();
  }

  onFileChange(event: any) {
    const files = event.target.files as FileList;
    if (files.length > 0) {
      this.file = files[0];
      console.log(this.file);
      this.service
        .uploadAttendanceImage(
          this.data.eventId.event_id,
          this.userId,
          this.file
        )
        .subscribe((data: any) => {
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
            title: 'Successfully uploaded photo',
          });
          this.resetInput();
        });
    }
  }

  resetInput() {
    const input = document.getElementById(
      'avatar-input-file'
    ) as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  }
}
