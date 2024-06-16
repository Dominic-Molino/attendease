import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { AuthserviceService } from '../../../../core/service/authservice.service';
import { SubmitAttendanceComponent } from '../../../user/components/submit-attendance/submit-attendance.component';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { EventService } from '../../../../core/service/event.service';

@Component({
  selector: 'app-updateimage',
  standalone: true,
  imports: [MatDialogModule, CommonModule],
  templateUrl: './updateimage.component.html',
  styleUrl: './updateimage.component.css',
})
export class UpdateimageComponent {
  @Output() attendanceSubmitted = new EventEmitter<void>(); // Add an EventEmitter

  file: any;
  eventId: any;
  imagePreview?: string | ArrayBuffer | null = null;

  constructor(
    private service: EventService,
    private builder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialogRef<UpdateimageComponent>
  ) {
    this.eventId = data.eventId.event_id;
    console.log(this.eventId);
  }

  updateImage() {
    Swal.fire({
      text: 'Upload this photo?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.uploadEvent(this.eventId, this.file).subscribe(
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

  onFileChange(event: any) {
    const files = event.target.files as FileList;
    if (files.length > 0) {
      this.file = files[0];
      this.previewImage();
    }
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

  previewImage() {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagePreview = e.target?.result;
    };
    reader.readAsDataURL(this.file);
  }

  closeDialog() {
    this.dialog.close();
    document.body.classList.remove('cdk-global-scrollblock');
  }
}
