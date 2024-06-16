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
  @Output() attendanceSubmitted = new EventEmitter<void>(); // Add an EventEmitter

  file: any;
  userId: any;
  imagePreview?: string | ArrayBuffer | null = null; // Variable to store image preview URL

  constructor(
    private service: AuthserviceService,
    private builder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialogRef<SubmitAttendanceComponent>
  ) {
    this.userId = this.service.getCurrentUserId();
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
          .uploadAttendanceImage(
            this.data.eventId.event_id,
            this.userId,
            this.file
          )
          .subscribe(
            (data: any) => {
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
              this.dialog.close();
            },
            (error) => {
              const errorMessage =
                error.error?.status?.message ||
                'An error occurred during registration';
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
      this.imagePreview = null; // Reset image preview
    }
  }

  closeDialog() {
    this.dialog.close();
    document.body.classList.remove('cdk-global-scrollblock');
  }
}
