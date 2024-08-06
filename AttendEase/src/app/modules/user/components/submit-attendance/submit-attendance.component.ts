import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Inject, Output } from '@angular/core';
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
  styleUrls: ['./submit-attendance.component.css'],
})
export class SubmitAttendanceComponent {
  @Output() attendanceSubmitted = new EventEmitter<void>();

  file: any;
  userId: any;
  imagePreview?: string | ArrayBuffer | null = null;
  eventId: any;

  constructor(
    private service: AuthserviceService,
    private builder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialogRef<SubmitAttendanceComponent>
  ) {
    this.userId = this.service.getCurrentUserId();
    this.eventId = data.eventId;
    console.log(this.eventId);
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

  submitAttendance() {
    Swal.fire({
      text: 'Submit this photo?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
    }).then((result) => {
      if (result.isConfirmed) {
        this.service
          .uploadAttendanceImage(this.eventId, this.userId, this.file)
          .subscribe(
            (data: any) => {
              const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
              });
              Toast.fire({
                icon: 'success',
                title: 'Successfully uploaded photo',
              });
              this.resetInput();
              this.attendanceSubmitted.emit();
              this.dialog.close();
            },
            (error) => {
              const errorMessage =
                error.error?.status?.message || 'An error occurred';
              Swal.fire('', errorMessage, 'warning');
            }
          );
      }
    });
  }

  resetInput() {
    const input = document.getElementById(
      'avatar-input-file'
    ) as HTMLInputElement;
    if (input) {
      input.value = '';
      this.imagePreview = null;
    }
  }

  closeDialog() {
    this.dialog.close();
    document.body.classList.remove('cdk-global-scrollblock');
  }
}
